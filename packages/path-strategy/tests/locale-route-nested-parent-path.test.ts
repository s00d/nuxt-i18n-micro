/**
 * TDD: for nested route (child under parent) localeRoute must return full path:
 * parent path + child path (E2E: locale-slug — href must be /change-activity/book-activity/skiing,
 * not /book-activity/skiing).
 */
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { PathStrategyContext, ResolvedRouteLike } from '../src'
import { createPathStrategy } from '../src'
import { makePathStrategyContext, makeRouterAdapter } from './test-utils'

const baseConfig: ModuleOptionsExtend = {
  defaultLocale: 'en',
  strategy: 'prefix_except_default',
  locales: [
    { code: 'en', iso: 'en-US' },
    { code: 'de', iso: 'de-DE' },
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

describe('localeRoute: nested route includes parent path', () => {
  test('activity-locale-skiing (child of activity-locale): en path must be /change-activity/book-activity/skiing', () => {
    const router = makeRouterAdapter(['activity-locale', 'activity-locale-skiing'])
    router.resolve = (to: unknown) => {
      const r = to as { name?: string, path?: string }
      if (r.name === 'activity-locale-skiing') {
        return {
          name: 'activity-locale-skiing',
          path: '/change-activity/book-activity/skiing',
          fullPath: '/change-activity/book-activity/skiing',
          params: {},
          query: {},
          hash: '',
        }
      }
      return { name: r.name ?? null, path: r.path ?? '/', fullPath: r.path ?? '/', params: {}, query: {}, hash: '' }
    }
    const globalLocaleRoutes: Record<string, Record<string, string>> = {
      'activity-locale': { en: '/change-activity', de: '/change-buchen' },
      'activity-locale/skiing': { en: '/book-activity/skiing', de: '/aktivitaet-buchen/ski-fahren' },
    }
    const strategy = createPathStrategy(makeCtx({ router, globalLocaleRoutes }))
    const currentRoute: ResolvedRouteLike = {
      name: 'activity-locale',
      path: '/change-activity',
      fullPath: '/change-activity',
      params: {},
      query: {},
      hash: '',
    }
    const result = strategy.localeRoute('en', { name: 'activity-locale-skiing' }, currentRoute)
    const pathStr = typeof result === 'string' ? result : (result && typeof result === 'object' && 'path' in result ? (result as { path: string }).path : (result as { fullPath?: string }).fullPath ?? '')
    expect(pathStr).toBe('/change-activity/book-activity/skiing')
  })

  test('activity-locale-skiing: de path must be /de/change-buchen/aktivitaet-buchen/ski-fahren', () => {
    const router = makeRouterAdapter(['activity-locale', 'activity-locale-skiing'])
    router.resolve = () => ({
      name: 'activity-locale-skiing',
      path: '/change-activity/book-activity/skiing',
      fullPath: '/change-activity/book-activity/skiing',
      params: {},
      query: {},
      hash: '',
    })
    const globalLocaleRoutes: Record<string, Record<string, string>> = {
      'activity-locale': { en: '/change-activity', de: '/change-buchen' },
      'activity-locale/skiing': { en: '/book-activity/skiing', de: '/aktivitaet-buchen/ski-fahren' },
    }
    const strategy = createPathStrategy(makeCtx({ router, globalLocaleRoutes }))
    const currentRoute: ResolvedRouteLike = {
      name: 'activity-locale',
      path: '/de/change-buchen',
      fullPath: '/de/change-buchen',
      params: {},
      query: {},
      hash: '',
    }
    const result = strategy.localeRoute('de', { name: 'activity-locale-skiing' }, currentRoute)
    const pathStr = typeof result === 'string' ? result : (result && typeof result === 'object' && 'path' in result ? (result as { path: string }).path : (result as { fullPath?: string }).fullPath ?? '')
    expect(pathStr).toBe('/de/change-buchen/aktivitaet-buchen/ski-fahren')
  })

  test('activity-locale-hiking (child with gr): when on /de/change-buchen, de path must be /de/change-buchen/hiking', () => {
    const router = makeRouterAdapter(['activity-locale', 'activity-locale-hiking'])
    router.resolve = () => ({
      name: 'activity-locale-hiking',
      path: '/change-activity/hiking',
      fullPath: '/change-activity/hiking',
      params: {},
      query: {},
      hash: '',
    })
    const globalLocaleRoutes: Record<string, Record<string, string>> = {
      'activity-locale': { en: '/change-activity', de: '/change-buchen' },
      'activity-locale/hiking': { en: '/hiking', de: '/hiking' },
    }
    const strategy = createPathStrategy(makeCtx({ router, globalLocaleRoutes }))
    const currentRoute: ResolvedRouteLike = {
      name: 'activity-locale',
      path: '/de/change-buchen',
      fullPath: '/de/change-buchen',
      params: {},
      query: {},
      hash: '',
    }
    const result = strategy.localeRoute('de', { name: 'activity-locale-hiking' }, currentRoute)
    const pathStr = typeof result === 'string' ? result : (result && typeof result === 'object' && 'path' in result ? (result as { path: string }).path : (result as { fullPath?: string }).fullPath ?? '')
    expect(pathStr).toBe('/de/change-buchen/hiking')
  })

  test('activity-locale-hiking (child WITHOUT custom path in gr): resolved path is /change-activity/hiking, de path must be /de/change-buchen/hiking', () => {
    const router = makeRouterAdapter(['activity-locale', 'activity-locale-hiking'])
    router.resolve = () => ({
      name: 'activity-locale-hiking',
      path: '/change-activity/hiking',
      fullPath: '/change-activity/hiking',
      params: {},
      query: {},
      hash: '',
    })
    const globalLocaleRoutes: Record<string, Record<string, string>> = {
      'activity-locale': { en: '/change-activity', de: '/change-buchen' },
    }
    const strategy = createPathStrategy(makeCtx({ router, globalLocaleRoutes }))
    const currentRoute: ResolvedRouteLike = {
      name: 'activity-locale',
      path: '/de/change-buchen',
      fullPath: '/de/change-buchen',
      params: {},
      query: {},
      hash: '',
    }
    const result = strategy.localeRoute('de', { name: 'activity-locale-hiking' }, currentRoute)
    const pathStr = typeof result === 'string' ? result : (result && typeof result === 'object' && 'path' in result ? (result as { path: string }).path : (result as { fullPath?: string }).fullPath ?? '')
    expect(pathStr).toBe('/de/change-buchen/hiking')
  })

  test('activity-locale-hiking: en (default locale) path must be /change-activity/hiking when currentRoute is /change-activity', () => {
    const router = makeRouterAdapter(['activity-locale', 'activity-locale-hiking'])
    router.resolve = () => ({
      name: 'activity-locale-hiking',
      path: '/change-activity/hiking',
      fullPath: '/change-activity/hiking',
      params: {},
      query: {},
      hash: '',
    })
    const globalLocaleRoutes: Record<string, Record<string, string>> = {
      'activity-locale': { en: '/change-activity', de: '/change-buchen' },
    }
    const strategy = createPathStrategy(makeCtx({ router, globalLocaleRoutes }))
    const currentRoute: ResolvedRouteLike = {
      name: 'activity-locale',
      path: '/change-activity',
      fullPath: '/change-activity',
      params: {},
      query: {},
      hash: '',
    }
    const result = strategy.localeRoute('en', { name: 'activity-locale-hiking' }, currentRoute)
    const pathStr = typeof result === 'string' ? result : (result && typeof result === 'object' && 'path' in result ? (result as { path: string }).path : (result as { fullPath?: string }).fullPath ?? '')
    expect(pathStr).toBe('/change-activity/hiking')
  })

  test('activity-locale-hiking: currentRoute fallback when on /de/change-buchen (no gr for child)', () => {
    const router = makeRouterAdapter(['activity-locale', 'activity-locale-hiking'])
    router.resolve = () => ({
      name: 'activity-locale-hiking',
      path: '/change-activity/hiking',
      fullPath: '/change-activity/hiking',
      params: {},
      query: {},
      hash: '',
    })
    const globalLocaleRoutes: Record<string, Record<string, string>> = {
      'activity-locale': { en: '/change-activity', de: '/change-buchen' },
    }
    const strategy = createPathStrategy(makeCtx({ router, globalLocaleRoutes }))
    const currentRoute: ResolvedRouteLike = {
      name: 'localized-activity-locale-de',
      path: '/de/change-buchen',
      fullPath: '/de/change-buchen',
      params: {},
      query: {},
      hash: '',
    }
    const result = strategy.localeRoute('de', { name: 'activity-locale-hiking' }, currentRoute)
    const pathStr = typeof result === 'string' ? result : (result && typeof result === 'object' && 'path' in result ? (result as { path: string }).path : (result as { fullPath?: string }).fullPath ?? '')
    expect(pathStr).toBe('/de/change-buchen/hiking')
  })

  test('non-nested route (no parent in gr): path is pathWithoutLocale', () => {
    const router = makeRouterAdapter(['about'])
    router.resolve = () => ({
      name: 'about',
      path: '/about',
      fullPath: '/about',
      params: {},
      query: {},
      hash: '',
    })
    const globalLocaleRoutes: Record<string, Record<string, string>> = {
      about: { en: '/about', de: '/ueber-uns' },
    }
    const strategy = createPathStrategy(makeCtx({ router, globalLocaleRoutes }))
    const result = strategy.localeRoute('de', { name: 'about' })
    const pathStr = typeof result === 'string' ? result : (result && typeof result === 'object' && 'path' in result ? (result as { path: string }).path : (result as { fullPath?: string }).fullPath ?? '')
    expect(pathStr).toBe('/de/ueber-uns')
  })

  test('child with custom path (activity-locale/skiing): parent path from gr, segment from gr', () => {
    const router = makeRouterAdapter(['activity-locale', 'activity-locale-skiing'])
    router.resolve = () => ({
      name: 'activity-locale-skiing',
      path: '/change-activity/book-activity/skiing',
      fullPath: '/change-activity/book-activity/skiing',
      params: {},
      query: {},
      hash: '',
    })
    const globalLocaleRoutes: Record<string, Record<string, string>> = {
      'activity-locale': { en: '/change-activity', de: '/change-buchen' },
      'activity-locale/skiing': { en: '/book-activity/skiing', de: '/aktivitaet-buchen/ski-fahren' },
    }
    const strategy = createPathStrategy(makeCtx({ router, globalLocaleRoutes }))
    const currentRoute: ResolvedRouteLike = {
      name: 'activity-locale',
      path: '/de/change-buchen',
      fullPath: '/de/change-buchen',
      params: {},
      query: {},
      hash: '',
    }
    const result = strategy.localeRoute('de', { name: 'activity-locale-skiing' }, currentRoute)
    const pathStr = typeof result === 'string' ? result : (result && typeof result === 'object' && 'path' in result ? (result as { path: string }).path : (result as { fullPath?: string }).fullPath ?? '')
    expect(pathStr).toBe('/de/change-buchen/aktivitaet-buchen/ski-fahren')
  })

  test('nested: child in gr with keyFirstSlash style (activity/locale-hiking) would use keyLast when both exist', () => {
    const router = makeRouterAdapter(['activity-locale', 'activity-locale-hiking'])
    router.resolve = () => ({
      name: 'activity-locale-hiking',
      path: '/change-activity/hiking',
      fullPath: '/change-activity/hiking',
      params: {},
      query: {},
      hash: '',
    })
    const globalLocaleRoutes: Record<string, Record<string, string>> = {
      'activity-locale': { en: '/change-activity', de: '/change-buchen' },
      'activity-locale/hiking': { en: '/hiking', de: '/hiking' },
    }
    const strategy = createPathStrategy(makeCtx({ router, globalLocaleRoutes }))
    const currentRoute: ResolvedRouteLike = {
      name: 'activity-locale',
      path: '/de/change-buchen',
      fullPath: '/de/change-buchen',
      params: {},
      query: {},
      hash: '',
    }
    const result = strategy.localeRoute('de', { name: 'activity-locale-hiking' }, currentRoute)
    const pathStr = typeof result === 'string' ? result : (result && typeof result === 'object' && 'path' in result ? (result as { path: string }).path : (result as { fullPath?: string }).fullPath ?? '')
    expect(pathStr).toBe('/de/change-buchen/hiking')
  })
})
