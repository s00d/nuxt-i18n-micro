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

/** Nuxt fetches the app manifest after hydration; a navigation while it loads cuts the request off. */
const isManifest = (url: string) => /\/_nuxt\/builds\/meta\/[^/]+\.json$/.test(url)
const isAborted = (errorText = '') => /abort|cancel/i.test(errorText)

/**
 * Every document >= 500, uncaught error, console error and hydration warning of a test's browser context.
 * NUXT_E5002 (manifest fetch failed) counts only when no manifest request was cut off by a navigation.
 */
function watchErrors(context: BrowserContext) {
  const issues: string[] = []
  let manifestCutOff = false
  context.on('requestfailed', (req) => {
    if (isManifest(req.url()) && isAborted(req.failure()?.errorText)) manifestCutOff = true
  })
  context.on('response', (res) => {
    if (res.request().resourceType() === 'document' && res.status() >= 500) issues.push(`document ${res.status()}: ${res.url()}`)
  })
  context.on('weberror', (err) => {
    if (!isCutOffFetch(err.error().message, err.page()?.url())) issues.push(`pageerror: ${err.error().message}`)
  })
  context.on('console', (msg) => {
    const text = msg.text()
    if (msg.type() === 'error' || (msg.type() === 'warning' && isHydrationText(text)))
      issues.push(`console ${msg.type()}: ${text} @ ${msg.location().url}`)
  })
  return () => (manifestCutOff ? issues.filter((issue) => !issue.includes('[NUXT_E5002]')) : issues)
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
    onCleanup(async () => {
      const unexpected = issuesOf().filter((issue) => !guard.patterns.some((pattern) => pattern.test(issue)))
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
