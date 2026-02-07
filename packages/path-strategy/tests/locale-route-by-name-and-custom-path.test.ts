/**
 * Tests localeRoute by route name with globalLocaleRoutes (custom path per locale).
 * Reproduces: $localeRoute({ name: 'locale-test' }, 'de') → /de/locale-page-modify
 */
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { PathStrategyContext, ResolvedRouteLike, RouteLike } from '../src'
import { createPathStrategy } from '../src'
import { makePathStrategyContext, makeRouterAdapter } from './test-utils'

const baseConfig: ModuleOptionsExtend = {
  defaultLocale: 'en',
  strategy: 'prefix_except_default',
  locales: [
    { code: 'en', iso: 'en-US' },
    { code: 'de', iso: 'de-DE' },
    { code: 'ru', iso: 'ru-RU' },
  ],
  dateBuild: 0,
  hashMode: false,
  isSSG: false,
  apiBaseUrl: '',
  disablePageLocales: false,
}

function makeCtx(extra?: Partial<PathStrategyContext>): PathStrategyContext {
  return makePathStrategyContext(baseConfig, 'prefix_except_default', extra)
}

const currentRouteEn: ResolvedRouteLike = {
  name: 'locale-test',
  path: '/locale-test',
  fullPath: '/locale-test',
  params: {},
  query: {},
  hash: '',
}

type StrategyName = 'prefix_except_default' | 'prefix' | 'prefix_and_default' | 'no_prefix'

function makeCtxAny(strategy: StrategyName, extra?: Partial<PathStrategyContext>): PathStrategyContext {
  return makePathStrategyContext(baseConfig, strategy, extra)
}

describe('localeRoute by route name + globalLocaleRoutes (locale-test style)', () => {
  test('prefix_except_default: route name "locale-test" with globalLocaleRoutes[locale-test] returns custom path for de/ru', () => {
    const globalLocaleRoutes: Record<string, Record<string, string>> = {
      'locale-test': {
        de: '/locale-page-modify',
        ru: '/locale-page-modify-ru',
      },
    }
    const router = makeRouterAdapter([])
    const resolveOriginal = router.resolve.bind(router)
    router.resolve = (to: RouteLike | string) => {
      const r = resolveOriginal(to) as {
        name: string | null
        path: string
        fullPath: string
        params: Record<string, unknown>
        query: Record<string, unknown>
        hash: string
      }
      const name = (to as { name?: string }).name
      if (name && (r.path === '/' || !r.path)) {
        return { ...r, path: `/${name}`, fullPath: `/${name}` }
      }
      return r
    }
    const strategy = createPathStrategy(makeCtx({ globalLocaleRoutes, router }))
    const resultDe = strategy.localeRoute('de', { name: 'locale-test' }, currentRouteEn)
    const resultRu = strategy.localeRoute('ru', { name: 'locale-test' }, currentRouteEn)
    const resultEn = strategy.localeRoute('en', { name: 'locale-test' }, currentRouteEn)
    expect(resultDe.path).toBe('/de/locale-page-modify')
    expect(resultRu.path).toBe('/ru/locale-page-modify-ru')
    expect(resultEn.path ?? resultEn.fullPath).toBe('/locale-test')
  })

  test('prefix_except_default: globalLocaleRoutes key by path /locale-test also works', () => {
    const globalLocaleRoutes: Record<string, Record<string, string>> = {
      '/locale-test': {
        de: '/locale-page-modify',
        ru: '/locale-page-modify-ru',
      },
    }
    const strategy = createPathStrategy(makeCtx({ globalLocaleRoutes }))
    const resultDe = strategy.localeRoute('de', { name: 'locale-test' }, currentRouteEn)
    expect(resultDe.path).toBe('/de/locale-page-modify')
  })

  test('prefix: route name "locale-test" with globalLocaleRoutes returns custom path with locale prefix', () => {
    const globalLocaleRoutes: Record<string, Record<string, string>> = {
      'locale-test': {
        en: '/locale-test-en',
        de: '/locale-page-modify',
        ru: '/locale-page-modify-ru',
      },
    }
    const router = makeRouterAdapter([])
    router.resolve = (to: RouteLike | string) => {
      const r = (
        typeof to === 'string'
          ? { name: to, path: to, fullPath: to }
          : { name: (to as RouteLike).name, path: `/${(to as RouteLike).name}`, fullPath: `/${(to as RouteLike).name}` }
      ) as { name: string | null; path: string; fullPath: string }
      return { ...r, params: {}, query: {}, hash: '' }
    }
    const strategy = createPathStrategy(makeCtxAny('prefix', { globalLocaleRoutes, router }))
    expect(strategy.localeRoute('en', { name: 'locale-test' }, currentRouteEn).path).toBe('/en/locale-test-en')
    expect(strategy.localeRoute('de', { name: 'locale-test' }, currentRouteEn).path).toBe('/de/locale-page-modify')
    expect(strategy.localeRoute('ru', { name: 'locale-test' }, currentRouteEn).path).toBe('/ru/locale-page-modify-ru')
  })

  test('prefix_and_default: route name "locale-test" with globalLocaleRoutes returns custom path with locale prefix', () => {
    const globalLocaleRoutes: Record<string, Record<string, string>> = {
      'locale-test': {
        en: '/locale-test-en',
        de: '/locale-page-modify',
      },
    }
    const router = makeRouterAdapter([])
    router.resolve = (to: RouteLike | string) => {
      const r = (
        typeof to === 'string'
          ? { name: to, path: to, fullPath: to }
          : { name: (to as RouteLike).name, path: `/${(to as RouteLike).name}`, fullPath: `/${(to as RouteLike).name}` }
      ) as { name: string | null; path: string; fullPath: string }
      return { ...r, params: {}, query: {}, hash: '' }
    }
    const strategy = createPathStrategy(makeCtxAny('prefix_and_default', { globalLocaleRoutes, router }))
    expect(strategy.localeRoute('en', { name: 'locale-test' }, currentRouteEn).path).toBe('/en/locale-test-en')
    expect(strategy.localeRoute('de', { name: 'locale-test' }, currentRouteEn).path).toBe('/de/locale-page-modify')
  })

  test('no_prefix: route name "locale-test" with globalLocaleRoutes returns custom path without locale prefix', () => {
    const globalLocaleRoutes: Record<string, Record<string, string>> = {
      'locale-test': {
        en: '/locale-test-en',
        de: '/locale-page-modify',
      },
    }
    const router = makeRouterAdapter([])
    router.resolve = (to: RouteLike | string) => {
      const r = (
        typeof to === 'string'
          ? { name: to, path: to, fullPath: to }
          : { name: (to as RouteLike).name, path: `/${(to as RouteLike).name}`, fullPath: `/${(to as RouteLike).name}` }
      ) as { name: string | null; path: string; fullPath: string }
      return { ...r, params: {}, query: {}, hash: '' }
    }
    const strategy = createPathStrategy(makeCtxAny('no_prefix', { globalLocaleRoutes, router }))
    const result = {
      en: strategy.localeRoute('en', { name: 'locale-test' }, currentRouteEn),
      de: strategy.localeRoute('de', { name: 'locale-test' }, currentRouteEn),
    }
    expect(result).toMatchSnapshot()
  })
})

describe('snapshots (documentation: localeRoute by name with globalLocaleRoutes)', () => {
  test('prefix_except_default: locale-test with globalLocaleRoutes — result per locale', () => {
    const globalLocaleRoutes: Record<string, Record<string, string>> = {
      'locale-test': { de: '/locale-page-modify', ru: '/locale-page-modify-ru' },
    }
    const strategy = createPathStrategy(makeCtx({ globalLocaleRoutes }))
    const result = {
      en: strategy.localeRoute('en', { name: 'locale-test' }, currentRouteEn),
      de: strategy.localeRoute('de', { name: 'locale-test' }, currentRouteEn),
      ru: strategy.localeRoute('ru', { name: 'locale-test' }, currentRouteEn),
    }
    expect(result).toMatchSnapshot()
  })
})
