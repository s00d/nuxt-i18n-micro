/**
 * TDD: for nested route (child under parent) localeRoute must return full path:
 * parent path + child path (E2E: locale-slug — href must be /change-activity/book-activity/skiing,
 * not /book-activity/skiing).
 */
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { PathStrategyContext, ResolvedRouteLike } from '../src'
import { createPathStrategy } from '../src'
import { makePathStrategyContext, makeRouterAdapter } from './test-utils'
import { describe, expect, test } from 'vitest'

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
      const r = to as { name?: string; path?: string }
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
    const pathStr =
      typeof result === 'string'
        ? result
        : result && typeof result === 'object' && 'path' in result
          ? (result as { path: string }).path
          : ((result as { fullPath?: string }).fullPath ?? '')
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
    const pathStr =
      typeof result === 'string'
        ? result
        : result && typeof result === 'object' && 'path' in result
          ? (result as { path: string }).path
          : ((result as { fullPath?: string }).fullPath ?? '')
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
    const pathStr =
      typeof result === 'string'
        ? result
        : result && typeof result === 'object' && 'path' in result
          ? (result as { path: string }).path
          : ((result as { fullPath?: string }).fullPath ?? '')
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
    const pathStr =
      typeof result === 'string'
        ? result
        : result && typeof result === 'object' && 'path' in result
          ? (result as { path: string }).path
          : ((result as { fullPath?: string }).fullPath ?? '')
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
    const pathStr =
      typeof result === 'string'
        ? result
        : result && typeof result === 'object' && 'path' in result
          ? (result as { path: string }).path
          : ((result as { fullPath?: string }).fullPath ?? '')
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
    const pathStr =
      typeof result === 'string'
        ? result
        : result && typeof result === 'object' && 'path' in result
          ? (result as { path: string }).path
          : ((result as { fullPath?: string }).fullPath ?? '')
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
    const pathStr =
      typeof result === 'string'
        ? result
        : result && typeof result === 'object' && 'path' in result
          ? (result as { path: string }).path
          : ((result as { fullPath?: string }).fullPath ?? '')
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
    const pathStr =
      typeof result === 'string'
        ? result
        : result && typeof result === 'object' && 'path' in result
          ? (result as { path: string }).path
          : ((result as { fullPath?: string }).fullPath ?? '')
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
    const pathStr =
      typeof result === 'string'
        ? result
        : result && typeof result === 'object' && 'path' in result
          ? (result as { path: string }).path
          : ((result as { fullPath?: string }).fullPath ?? '')
    expect(pathStr).toBe('/de/change-buchen/hiking')
  })

  test.each([
    ['about-team', 'en', '/about-team'],
    ['about-team', 'de', '/de/team-seite'],
    ['/about-team', 'en', '/about-team'],
    ['/about-team', 'de', '/de/team-seite'],
  ])('sibling page with rules under %s: %s path must not include the other page', (ruleKey, locale, expected) => {
    const router = makeRouterAdapter(['about', 'about-team'])
    router.resolve = () => ({
      name: 'about-team',
      path: '/about-team',
      fullPath: '/about-team',
      params: {},
      query: {},
      hash: '',
    })
    // pages/about.vue and pages/about-team.vue: both top-level, keyed by file path.
    const globalLocaleRoutes: Record<string, Record<string, string>> = {
      about: { en: '/about', de: '/ueber-uns' },
      [ruleKey]: { en: '/about-team', de: '/team-seite' },
    }
    const strategy = createPathStrategy(makeCtx({ router, globalLocaleRoutes }))
    const result = strategy.localeRoute(locale, { name: 'about-team' })
    const pathStr =
      typeof result === 'string'
        ? result
        : result && typeof result === 'object' && 'path' in result
          ? (result as { path: string }).path
          : ((result as { fullPath?: string }).fullPath ?? '')
    expect(pathStr).toBe(expected)
  })

  test.each([
    ['docs-intro', 'en', '/docs/intro'],
    ['docs-intro', 'de', '/de/dokumente/einfuehrung'],
    ['/docs-intro', 'en', '/docs/intro'],
    ['/docs-intro', 'de', '/de/dokumente/einfuehrung'],
  ])('nested page with rules under %s: %s resolves absolute and relative paths', (ruleKey, locale, expected) => {
    const router = makeRouterAdapter(['docs', 'docs-intro'])
    router.resolve = () => ({
      name: 'docs-intro',
      path: '/docs/intro',
      fullPath: '/docs/intro',
      params: {},
      query: {},
      hash: '',
    })
    const globalLocaleRoutes = {
      docs: { en: '/docs', de: '/dokumente' },
      // Absolute in one locale, relative in the other: decide per target locale.
      [ruleKey]: { en: '/docs/intro', de: 'einfuehrung' },
    }
    const strategy = createPathStrategy(makeCtx({ router, globalLocaleRoutes }))
    const result = strategy.localeRoute(locale, { name: 'docs-intro' })
    const pathStr =
      typeof result === 'string'
        ? result
        : result && typeof result === 'object' && 'path' in result
          ? (result as { path: string }).path
          : ((result as { fullPath?: string }).fullPath ?? '')
    expect(pathStr).toBe(expected)
  })

  test.each([
    ['en', '/about-team'],
    ['de', '/de/about-team'],
  ])('sibling without own localeRoutes: %s must stay top-level (%s)', (locale, expected) => {
    const router = makeRouterAdapter(['about', 'about-team'])
    router.resolve = () => ({
      name: 'about-team',
      path: '/about-team',
      fullPath: '/about-team',
      params: {},
      query: {},
      hash: '',
    })
    const globalLocaleRoutes: Record<string, Record<string, string>> = {
      about: { en: '/about', de: '/ueber-uns' },
    }
    const strategy = createPathStrategy(makeCtx({ router, globalLocaleRoutes }))
    const result = strategy.localeRoute(locale, { name: 'about-team' })
    const pathStr =
      typeof result === 'string'
        ? result
        : result && typeof result === 'object' && 'path' in result
          ? (result as { path: string }).path
          : ((result as { fullPath?: string }).fullPath ?? '')
    expect(pathStr).toBe(expected)
  })

  test.each([
    ['about-team', 'en', '/about-team'],
    ['about-team', 'de', '/de/team-seite'],
    ['/about-team', 'en', '/about-team'],
    ['/about-team', 'de', '/de/team-seite'],
  ])('sibling with relative localeRoutes under %s: %s path must not join parent', (ruleKey, locale, expected) => {
    const router = makeRouterAdapter(['about', 'about-team'])
    router.resolve = () => ({
      name: 'about-team',
      path: '/about-team',
      fullPath: '/about-team',
      params: {},
      query: {},
      hash: '',
    })
    const globalLocaleRoutes: Record<string, Record<string, string>> = {
      about: { en: '/about', de: '/ueber-uns' },
      [ruleKey]: { en: 'about-team', de: 'team-seite' },
    }
    const strategy = createPathStrategy(makeCtx({ router, globalLocaleRoutes }))
    const result = strategy.localeRoute(locale, { name: 'about-team' })
    const pathStr =
      typeof result === 'string'
        ? result
        : result && typeof result === 'object' && 'path' in result
          ? (result as { path: string }).path
          : ((result as { fullPath?: string }).fullPath ?? '')
    expect(pathStr).toBe(expected)
  })

  test('true nested without child rules still joins parent (path is nested)', () => {
    const router = makeRouterAdapter(['about', 'about-team'])
    router.resolve = () => ({
      name: 'about-team',
      path: '/about/team',
      fullPath: '/about/team',
      params: {},
      query: {},
      hash: '',
    })
    const globalLocaleRoutes: Record<string, Record<string, string>> = {
      about: { en: '/about', de: '/ueber-uns' },
    }
    const strategy = createPathStrategy(makeCtx({ router, globalLocaleRoutes }))
    const result = strategy.localeRoute('de', { name: 'about-team' })
    const pathStr =
      typeof result === 'string'
        ? result
        : result && typeof result === 'object' && 'path' in result
          ? (result as { path: string }).path
          : ((result as { fullPath?: string }).fullPath ?? '')
    expect(pathStr).toBe('/de/ueber-uns/team')
  })

  test.each([
    ['en', '/about-team'],
    ['de', '/de/about-team'],
  ])('top-level /about-team ignores nested about/team rules: %s → %s', (locale, expected) => {
    const router = makeRouterAdapter(['about', 'about-team'])
    router.resolve = () => ({
      name: 'about-team',
      path: '/about-team',
      fullPath: '/about-team',
      params: {},
      query: {},
      hash: '',
    })
    const globalLocaleRoutes: Record<string, Record<string, string>> = {
      about: { en: '/about', de: '/ueber-uns' },
      'about/team': { en: 'team', de: 'team-seite' },
    }
    const strategy = createPathStrategy(makeCtx({ router, globalLocaleRoutes }))
    const result = strategy.localeRoute(locale, { name: 'about-team' })
    const pathStr =
      typeof result === 'string'
        ? result
        : result && typeof result === 'object' && 'path' in result
          ? (result as { path: string }).path
          : ((result as { fullPath?: string }).fullPath ?? '')
    expect(pathStr).toBe(expected)
  })

  test.each([
    ['en', '/about/team'],
    ['de', '/de/ueber-uns/team-seite'],
  ])('nested /about/team still uses about/team rules: %s → %s', (locale, expected) => {
    const router = makeRouterAdapter(['about', 'about-team'])
    router.resolve = () => ({
      name: 'about-team',
      path: '/about/team',
      fullPath: '/about/team',
      params: {},
      query: {},
      hash: '',
    })
    const globalLocaleRoutes: Record<string, Record<string, string>> = {
      about: { en: '/about', de: '/ueber-uns' },
      'about/team': { en: 'team', de: 'team-seite' },
    }
    const strategy = createPathStrategy(makeCtx({ router, globalLocaleRoutes }))
    const result = strategy.localeRoute(locale, { name: 'about-team' })
    const pathStr =
      typeof result === 'string'
        ? result
        : result && typeof result === 'object' && 'path' in result
          ? (result as { path: string }).path
          : ((result as { fullPath?: string }).fullPath ?? '')
    expect(pathStr).toBe(expected)
  })
})
