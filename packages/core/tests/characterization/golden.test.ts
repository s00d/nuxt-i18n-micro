/**
 * Characterization of @i18n-micro/core's public API. The golden files record what every call
 * answers; a change in behaviour shows up as a diff in them.
 */
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import { devtoolsReport, formatReport, helpersReport, i18nReport, storeReport } from './scenarios'

const NOW = Date.UTC(2024, 5, 15, 12, 0, 0)

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(NOW)
})
afterAll(() => vi.useRealTimers())

describe('core characterization', () => {
  test('helpers', async () => {
    await expect(helpersReport()).toMatchFileSnapshot('./__golden__/helpers.md')
  })
  test('i18n', async () => {
    await expect(i18nReport()).toMatchFileSnapshot('./__golden__/i18n.md')
  })
  test('format', async () => {
    await expect(formatReport(NOW)).toMatchFileSnapshot('./__golden__/format.md')
  })
  test('devtools', async () => {
    await expect(devtoolsReport()).toMatchFileSnapshot('./__golden__/devtools.md')
  })
  test('store', async () => {
    await expect(storeReport()).toMatchFileSnapshot('./__golden__/store.md')
  })
})
