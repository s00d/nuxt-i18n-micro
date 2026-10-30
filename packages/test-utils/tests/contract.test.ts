/**
 * The mock must answer what the real thing answers: core's characterization inputs go through both,
 * on an instance built the way every adapter builds it, and every answer has to match.
 */
import { BaseI18n } from '@i18n-micro/core'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import { COUNTS, deAbout, deRoot, enAbout, enRoot, KEYS, PARAMS } from '../../core/tests/characterization/fixtures'
import { TestI18n } from '../../core/tests/characterization/scenarios'
import { createI18nTestContext } from '../src'

const NOW = Date.UTC(2024, 5, 15, 12, 0, 0)

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(NOW)
})
afterAll(() => {
  vi.useRealTimers()
})

function real(locale: string, route: string) {
  const i18n = new TestI18n(locale, 'en', { missingWarn: false })
  i18n.route = route
  seed(i18n)
  return i18n
}

function mock(locale: string, route: string) {
  const i18n = createI18nTestContext({ locale, defaultLocale: 'en', routeName: route })
  seed(i18n)
  return i18n
}

function seed(i18n: BaseI18n) {
  i18n.helper.setTranslations('en', enRoot() as never, 'index')
  i18n.helper.setTranslations('de', deRoot() as never, 'index')
  i18n.helper.setTranslations('en', enAbout() as never, 'about')
  i18n.helper.setTranslations('de', deAbout() as never, 'about')
}

const answer = (fn: () => unknown) => {
  try {
    return fn()
  } catch (error) {
    return `throws ${String(error)}`
  }
}

const SCENES = [
  ['en', 'index'],
  ['de', 'index'],
  ['de', 'about'],
  ['fr', 'about'],
] as const

describe.each(SCENES)('locale %s, route %s', (locale, route) => {
  const a = real(locale, route)
  const b = mock(locale, route)

  test('t, ts, has', () => {
    for (const key of KEYS) {
      expect(answer(() => b.t(key)), `t(${key})`).toEqual(answer(() => a.t(key)))
      expect(answer(() => b.t(key, undefined, '')), `t(${key}, '')`).toEqual(answer(() => a.t(key, undefined, '')))
      expect(answer(() => b.t(key, undefined, 'D')), `t(${key}, D)`).toEqual(answer(() => a.t(key, undefined, 'D')))
      expect(answer(() => b.ts(key, undefined, 'D')), `ts(${key})`).toEqual(answer(() => a.ts(key, undefined, 'D')))
      expect(answer(() => b.has(key)), `has(${key})`).toEqual(answer(() => a.has(key)))
      for (const params of PARAMS) expect(answer(() => b.t(key, params as never)), `t(${key}, params)`).toEqual(answer(() => a.t(key, params as never)))
    }
  })

  test('tc', () => {
    for (const count of COUNTS) {
      for (const key of ['apples', 'cars', 'items', 'single', 'nope']) {
        expect(answer(() => b.tc(key, count as never)), `tc(${key}, ${String(count)})`).toEqual(answer(() => a.tc(key, count as never)))
      }
    }
    expect(answer(() => b.tc('apples', { count: null } as never))).toEqual(answer(() => a.tc('apples', { count: null } as never)))
  })

  test('tn, td, tdr', () => {
    expect(b.tn(1234.5)).toBe(a.tn(1234.5))
    for (const value of ['nope', NOW + 86_400_000, NOW + 5_760_000, NOW - 3 * 86_400_000, new Date(NOW)]) {
      expect(b.td(value, { timeZone: 'UTC' })).toBe(a.td(value, { timeZone: 'UTC' }))
      expect(b.tdr(value)).toBe(a.tdr(value))
    }
  })

  test('resolveTranslations', () => {
    expect(b.resolveTranslations()).toEqual(a.resolveTranslations())
  })
})

test('nothing of the translation logic is the mock’s own', () => {
  for (const name of ['t', 'ts', 'tc', 'tn', 'td', 'tdr', 'has', 'resolveTranslations', 'setTranslation'] as const) {
    expect(createI18nTestContext()[name]).toBe(BaseI18n.prototype[name])
  }
})
