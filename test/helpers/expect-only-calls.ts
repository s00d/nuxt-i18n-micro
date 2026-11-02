import { expect } from 'vitest'

/** Every call on a console spy matches one of `expected`: a warning nobody expects fails the test. */
export function expectOnlyCalls(spy: { mock: { calls: unknown[][] } }, expected: RegExp[]): void {
  const stray = spy.mock.calls.map((args) => args.map(String).join(' ')).filter((text) => !expected.some((re) => re.test(text)))
  expect(stray).toEqual([])
}
