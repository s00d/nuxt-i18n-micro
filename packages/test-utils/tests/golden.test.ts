/** Characterization of the mock: one `call → result` line per behaviour, on a frozen clock. */
import { afterAll, beforeAll, expect, test, vi } from 'vitest'
import { Recorder } from '../../core/tests/characterization/record'
import { createI18nTestContext } from '../src'

const NOW = Date.UTC(2024, 5, 15, 12, 0, 0)
beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(NOW)
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})
afterAll(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

function report(): string {
  const rec = new Recorder()
  const ctx = createI18nTestContext({
    locale: 'de',
    defaultLocale: 'en',
    locales: [{ code: 'en' }, { code: 'de' }],
    routeName: 'about',
    messages: { en: { hi: 'Hi {name}', only: 'en only', a: 'x | y | z', o: { p: 'P' } }, de: { hi: 'Hallo {name}' } },
  })
  ctx.helper.setTranslations('de', { root: 'R' }, 'index')

  rec.section('translate')
  for (const [key, params, fallback] of [
    ['hi', { name: 'Jo' }],
    ['only'],
    ['root'],
    ['miss'],
    ['miss', undefined, ''],
    ['miss', undefined, 'D'],
    ['o'],
    ['o.p'],
    ['', undefined, 'D'],
  ] as const) {
    rec.run(`t(${key}, ${JSON.stringify(params)}, ${fallback})`, () => ctx.t(key, params, fallback))
    rec.run(`ts(${key}, ${JSON.stringify(params)}, ${fallback})`, () => ctx.ts(key, params, fallback))
  }
  rec.run('has', () => [ctx.has('hi'), ctx.has('only'), ctx.has('root'), ctx.has('miss')])
  rec.run('_t(other)', () => ctx._t('other')('hi', { name: 'Jo' }))
  rec.run('_t({name})', () => ctx._t({ name: 'about' })('hi', { name: 'Jo' }))

  rec.section('plural')
  for (const count of [0, 1, 2, 5, 1.5, -1, Number.NaN]) rec.run(`tc(a, ${count})`, () => ctx.tc('a', count))
  rec.run('tc(a, {count: null})', () => ctx.tc('a', { count: null } as never))
  rec.run('tc(a, {})', () => ctx.tc('a', {}))
  rec.run('tc(miss, 1, D)', () => ctx.tc('miss', 1, 'D'))

  rec.section('format')
  rec.run('tn', () => ctx.tn(1234.5))
  rec.run('tn currency', () => ctx.tn(1, { style: 'currency', currency: 'EUR' }))
  rec.run('td', () => ctx.td(NOW, { timeZone: 'UTC' }))
  rec.run('td(nope)', () => ctx.td('nope'))
  rec.run('tdr +1 day', () => ctx.tdr(NOW + 86_400_000))
  rec.run('tdr +1.6h', () => ctx.tdr(NOW + 5_760_000))
  rec.run('tdr -3 days', () => ctx.tdr(NOW - 3 * 86_400_000))

  rec.section('writes')
  rec.run('resolveTranslations', () => ctx.resolveTranslations())
  ctx.mergeTranslations({ added: 'A' })
  ctx.setTranslation('o.q', 'Q')
  rec.run('after writes', () => [ctx.t('added'), ctx.t('o.q'), ctx.resolveTranslations()])

  rec.section('paths')
  rec.run('localePath', () => ctx.localePath('/x'))
  rec.run('localePath de', () => ctx.localePath({ path: 'y' }, 'de'))
  rec.run('switchLocalePath', () => ctx.switchLocalePath('en'))
  rec.run('localeRoute', () => ctx.localeRoute({ name: 'home' }))
  rec.run('switchLocaleRoute', () => ctx.switchLocaleRoute('de'))
  ctx.strategy = 'prefix_except_default'
  rec.run('except default', () => [ctx.localePath('/x', 'en'), ctx.localePath('/x', 'de')])
  ctx.strategy = 'no_prefix'
  rec.run('no prefix', () => ctx.localePath('/x', 'de'))
  rec.run('strategy stub', () => [ctx.i18nStrategy.getLocaleFromPath('/de/x'), ctx.i18nStrategy.getLocaleFromPath('/x'), ctx.i18nStrategy.localeRoute('de', '/x')])

  rec.section('state')
  const fake = ctx.createFake()
  rec.value('fake keys', Object.keys(fake).sort())
  ctx.setLocale('en')
  rec.run('getLocale', () => [ctx.getLocale(), fake.$getLocale(), ctx.defaultLocale(), ctx.getRouteName()])
  const missing: string[] = []
  ctx.setMissingHandler((locale, key, route) => missing.push(`${locale}:${key}:${route}`))
  ctx.t('nope')
  rec.value('missing handler', missing)
  ctx.reset({ reseed: true })
  rec.run('after reset', () => [ctx.getLocale(), ctx.t('hi', { name: 'Jo' }), ctx.t('root')])
  return rec.toString()
}

test('test-utils characterization', async () => {
  await expect(report()).toMatchFileSnapshot('./__golden__/mock.md')
})
