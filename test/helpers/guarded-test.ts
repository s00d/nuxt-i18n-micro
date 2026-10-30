import type { BrowserContext } from '@playwright/test'
import { afterAll, beforeAll, describe, expect, test as base } from 'untestutils/vitest'

export { afterAll, beforeAll, describe, expect }

/** Per-test opt-out, for a journey that expects an error: `guard.allow(/pattern/)`. */
export interface BrowserGuard {
  allow: (...patterns: RegExp[]) => void
}

const isHydrationText = (text: string) => /hydration|mismatch/i.test(text)

/** Every document >= 500, uncaught error, console error and hydration warning of a test's browser context. */
function watchErrors(context: BrowserContext) {
  const issues: string[] = []
  context.on('response', (res) => {
    if (res.request().resourceType() === 'document' && res.status() >= 500) issues.push(`document ${res.status()}: ${res.url()}`)
  })
  context.on('weberror', (err) => issues.push(`pageerror: ${err.error().message}`))
  context.on('console', (msg) => {
    const text = msg.text()
    if (msg.type() === 'error' || (msg.type() === 'warning' && isHydrationText(text))) issues.push(`console ${msg.type()}: ${text} @ ${msg.location().url}`)
  })
  return issues
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
  .extend('page', ({ page, guard }, { onCleanup }) => {
    const issues = watchErrors(page.context())
    onCleanup(() => {
      expect(issues.filter((issue) => !guard.patterns.some((pattern) => pattern.test(issue)))).toEqual([])
    })
    return page
  })

// `extend` drops untestutils' `override`, which prepares the harness before the first test
test.override = base.override as typeof test.override
