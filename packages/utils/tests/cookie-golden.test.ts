/**
 * Characterization of the locale cookie options: every call is one `call → result` line in
 * `__golden__/cookie.md`, so a change to what the module writes shows up as a one-line diff.
 */
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { getLocaleCookieOptions } from '../src/cookie'

const NOW = Date.UTC(2026, 0, 1)

const show = (value: unknown) =>
  JSON.stringify(value, (_key, entry) => (typeof entry === 'function' ? `[function]` : entry instanceof Date ? entry.toISOString() : entry))

function report(calls: [label: string, fn: () => unknown][]): string {
  const lines = calls.map(([label, fn]) => {
    const result = fn() as Record<string, unknown>
    // the Date is serialized by toJSON before the replacer sees it: show the key order and values as they are
    return `- \`${label}\` → keys ${show(Object.keys(result))} · ${show(result)}`
  })
  return `${lines.join('\n')}\n`
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
})
afterEach(() => vi.useRealTimers())

test('locale cookie options characterization', async () => {
  const calls: [string, () => unknown][] = [
    ['getLocaleCookieOptions()', () => getLocaleCookieOptions()],
    ['getLocaleCookieOptions({})', () => getLocaleCookieOptions({})],
    ['getLocaleCookieOptions({ domain: ".example.com" })', () => getLocaleCookieOptions({ domain: '.example.com' })],
    ['getLocaleCookieOptions({ domain: "" })', () => getLocaleCookieOptions({ domain: '' })],
    ['getLocaleCookieOptions({ path: "/app" })', () => getLocaleCookieOptions({ path: '/app' })],
    ['getLocaleCookieOptions({ secure: true })', () => getLocaleCookieOptions({ secure: true })],
    ['getLocaleCookieOptions({ secure: false })', () => getLocaleCookieOptions({ secure: false })],
    ['getLocaleCookieOptions({ sameSite: "strict" })', () => getLocaleCookieOptions({ sameSite: 'strict' })],
    ['getLocaleCookieOptions({ sameSite: "none", secure: true })', () => getLocaleCookieOptions({ sameSite: 'none', secure: true })],
    ['getLocaleCookieOptions({ maxAge: 3600 })', () => getLocaleCookieOptions({ maxAge: 3600 })],
    [
      'getLocaleCookieOptions(all)',
      () => getLocaleCookieOptions({ domain: '.example.com', path: '/app', secure: true, sameSite: 'none', maxAge: 60 }),
    ],
  ]
  await expect(report(calls)).toMatchFileSnapshot('./__golden__/cookie.md')
})

test('the options object is not mutated and a call does not leak into the next', () => {
  const options = Object.freeze({ domain: '.example.com', secure: true })
  expect(getLocaleCookieOptions(options).domain).toBe('.example.com')
  expect(getLocaleCookieOptions()).not.toHaveProperty('domain')
  expect(getLocaleCookieOptions()).not.toHaveProperty('secure')
})
