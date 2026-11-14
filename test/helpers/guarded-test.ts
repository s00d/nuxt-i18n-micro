import type { BrowserContext } from '@playwright/test'
import { afterAll, beforeAll, describe, expect, test as base } from 'untestutils/vitest'

export { afterAll, beforeAll, describe, expect }

/** Per-test opt-out, for a journey that expects an error: `guard.allow(/pattern/)`. */
export interface BrowserGuard {
  allow: (...patterns: RegExp[]) => void
}

const isHydrationText = (text: string) => /hydration|mismatch/i.test(text)

/** WebKit words a same-origin fetch cut off by leaving the page as a CORS failure: same origin has no CORS to fail. */
const isCutOffFetch = (message: string, pageUrl = '') => {
  const host = /^\/([^/ ]+)\/\S* due to access control checks\.$/.exec(message)?.[1]
  return host !== undefined && pageUrl.includes(`//${host}/`)
}

/**
 * Nuxt logs these when a fetch of its own rejects. A navigation cuts such a fetch off: usually as a cancelled request,
 * but CI logs also show it with no request event at all (the manifest on Linux WebKit, a payload on Linux Firefox).
 * So each counts only with a real failure of its URL.
 * - NUXT_E5002: the app manifest, fetched after hydration from an idle callback.
 * - NUXT_E7002: a page payload (`_payload.json`), fetched for a link or a navigation. In production Nuxt logs it only
 *   for a rejected fetch: a 404 payload is skipped silently.
 * - `[i18n] Load error` (dev): a dictionary (`/_locales/.../data.json`), refetched on an HMR update just as the next
 *   page load starts.
 */
const CUT_OFF_FETCHES = [
  { code: '[NUXT_E5002]', matches: (url: string) => /\/_nuxt\/builds\/meta\/[^/]+\.json$/.test(url) },
  { code: '[NUXT_E7002]', matches: (url: string) => /\/_payload\.json(\?|$)/.test(url) },
  { code: '[i18n] Load error', matches: (url: string) => /\/_locales\/.+\/data\.json(\?|$)/.test(url) },
]
const isAborted = (errorText = '') => /abort|cancel/i.test(errorText)

/** The OS ran out of socket buffers (a busy Windows runner): the machine's failure, not the app's. */
const isOutOfBuffers = (text: string) => text.includes('net::ERR_NO_BUFFER_SPACE')

/**
 * Every document >= 500, uncaught error, console error and hydration warning of a test's browser context.
 * A cut-off fetch diagnostic (see CUT_OFF_FETCHES) counts only with a real failure of its URL: a response >= 400 or a
 * request that failed other than by being cancelled. A fetch a navigation cut off leaves neither.
 * A resource the OS had no buffers for is no app error; if the page needed it, the test's own checks fail.
 */
function watchErrors(context: BrowserContext) {
  const issues: string[] = []
  const failed = new Set<string>()
  const markFailed = (url: string) => CUT_OFF_FETCHES.forEach((fetch) => fetch.matches(url) && failed.add(fetch.code))
  context.on('requestfailed', (req) => {
    if (!isAborted(req.failure()?.errorText)) markFailed(req.url())
  })
  context.on('response', (res) => {
    if (res.status() >= 400) markFailed(res.url())
    if (res.request().resourceType() === 'document' && res.status() >= 500) issues.push(`document ${res.status()}: ${res.url()}`)
  })
  context.on('weberror', (err) => {
    if (!isCutOffFetch(err.error().message, err.page()?.url())) issues.push(`pageerror: ${err.error().message}`)
  })
  context.on('console', (msg) => {
    const text = msg.text()
    if ((msg.type() === 'error' && !isOutOfBuffers(text)) || (msg.type() === 'warning' && isHydrationText(text)))
      issues.push(`console ${msg.type()}: ${text} @ ${msg.location().url}`)
  })
  const cutOff = (issue: string) => CUT_OFF_FETCHES.some(({ code }) => issue.includes(code) && !failed.has(code))
  return { unexpected: () => issues.filter((issue) => !cutOff(issue)), allowed: () => issues.filter(cutOff) }
}

/**
 * The evidence a let-through cut-off diagnostic leaves, so a real bug behind one shows in the log instead of hiding:
 * every request for a CUT_OFF_FETCHES URL (start, response, service worker, end with its timing, where -1 marks a
 * phase the browser skipped, as for a cache hit, or failure), each document request (a navigation) and the console
 * line, in ms since the test started.
 */
function watchCutOffTimeline(context: BrowserContext, keep = 80) {
  const t0 = Date.now()
  const lines: string[] = []
  const log = (line: string) => lines.push(`+${Date.now() - t0}ms ${line}`) > keep && lines.shift()
  const watched = (url: string) => CUT_OFF_FETCHES.some((fetch) => fetch.matches(url))
  context.on('request', (req) => {
    if (watched(req.url())) log(`request ${req.method()} ${req.url()} (${req.resourceType()})`)
    else if (req.isNavigationRequest()) log(`navigation ${req.method()} ${req.url()}`)
  })
  context.on('response', (res) => {
    if (watched(res.url())) log(`response ${res.status()} ${res.url()}${res.fromServiceWorker() ? ' (service worker)' : ''}`)
  })
  context.on('requestfinished', (req) => {
    if (!watched(req.url())) return
    const { requestStart, responseStart, responseEnd } = req.timing()
    log(`finished ${req.url()} requestStart=${requestStart} responseStart=${responseStart} responseEnd=${responseEnd}`)
  })
  context.on('requestfailed', (req) => {
    if (watched(req.url())) log(`failed (${req.failure()?.errorText}) ${req.url()}`)
  })
  context.on('console', (msg) => {
    const text = msg.text()
    if (CUT_OFF_FETCHES.some(({ code }) => text.includes(code))) log(`console ${msg.type()}: ${text} @ ${msg.location().url}`)
  })
  return lines
}

/** The last console messages and the failed or non-2xx requests, for the report of a failed test. */
function watchTrail(context: BrowserContext, keep = 30) {
  const consoleLines: string[] = []
  const requests: string[] = []
  const push = (list: string[], line: string) => list.push(line) > keep && list.shift()
  context.on('console', (msg) => push(consoleLines, `${msg.type()}: ${msg.text()}`))
  context.on('response', (res) => {
    if (res.status() < 200 || res.status() >= 300) push(requests, `${res.status()} ${res.request().method()} ${res.url()}`)
  })
  context.on('requestfailed', (req) => push(requests, `failed (${req.failure()?.errorText}) ${req.method()} ${req.url()}`))
  return { consoleLines, requests }
}

/**
 * The journeys' `test`: a browser error fails the test even when its own assertions pass
 * (a 500 page still hydrates, and `not.toBeAttached` passes on it).
 * `test.override({ guardAllow: [...] })` allows patterns for a whole describe (HMR journeys).
 */
export const test = base
  .extend('guardAllow', [] as RegExp[])
  .extend('guard', ({ guardAllow }): BrowserGuard & { patterns: RegExp[] } => {
    const patterns = [...guardAllow]
    return { patterns, allow: (...more) => patterns.push(...more) }
  })
  .extend('page', ({ page, guard, task }, { onCleanup }) => {
    const issuesOf = watchErrors(page.context())
    const trail = watchTrail(page.context())
    const timeline = watchCutOffTimeline(page.context())
    onCleanup(async () => {
      const allowed = issuesOf.allowed()
      if (allowed.length) {
        // an annotation on the run page: the evidence below would sink in thousands of log lines
        if (process.env.GITHUB_ACTIONS)
          console.log(`::warning title=cut-off evidence::${task.name}: ${allowed.length} let through, see [cut-off evidence] in the log`)
        console.warn(
          [
            `[cut-off evidence] ${task.name}`,
            ...allowed.map((issue) => `allowed: ${issue}`),
            `timeline (last ${timeline.length}):`,
            ...timeline.map((line) => `  ${line}`),
          ].join('\n'),
        )
      }
      const unexpected = issuesOf.unexpected().filter((issue) => !guard.patterns.some((pattern) => pattern.test(issue)))
      // runs before the page closes, and only when the test failed: a passing test prints nothing
      if (task.result?.state === 'fail' || unexpected.length) {
        const locale = page.isClosed()
          ? null
          : await page
              .locator('#locale')
              .first()
              .textContent({ timeout: 500 })
              .catch(() => null)
        console.error(
          [
            `[journey failed] ${task.name}`,
            `url: ${page.url()}`,
            `#locale: ${locale ?? '(absent)'}`,
            `requests failed or non-2xx (last ${trail.requests.length}):`,
            ...trail.requests.map((line) => `  ${line}`),
            `console (last ${trail.consoleLines.length}):`,
            ...trail.consoleLines.map((line) => `  ${line}`),
          ].join('\n'),
        )
      }
      expect(unexpected).toEqual([])
    })
    return page
  })

// `extend` drops untestutils' `override`, which prepares the harness before the first test
test.override = base.override as typeof test.override
