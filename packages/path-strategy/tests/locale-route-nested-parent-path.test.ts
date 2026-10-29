/**
 * TDD: for nested route (child under parent) localeRoute must return full path:
 * parent path + child path (E2E: locale-slug — href must be /change-activity/book-activity/skiing,
 * not /book-activity/skiing).
 */
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { PathStrategyContext, ResolvedRouteLike, RouteLike } from '../src'
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

function pathOf(result: RouteLike | string): string {
  return typeof result === 'string' ? result : (result.path ?? result.fullPath ?? '')
}

/** Strategy whose router resolves `name` to `routerPath` (the page's default-locale URL). */
function strategyAt(name: string, routerPath: string, globalLocaleRoutes: PathStrategyContext['globalLocaleRoutes']) {
  const router = makeRouterAdapter([name])
  router.resolve = () => ({ name, path: routerPath, fullPath: routerPath, params: {}, query: {}, hash: '' })
  return createPathStrategy(makeCtx({ router, globalLocaleRoutes }))
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
    expect(pathOf(result)).toBe('/change-activity/book-activity/skiing')
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
    expect(pathOf(result)).toBe('/de/change-buchen/aktivitaet-buchen/ski-fahren')
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
    expect(pathOf(result)).toBe('/de/change-buchen/hiking')
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
    expect(pathOf(result)).toBe('/de/change-buchen/hiking')
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
    expect(pathOf(result)).toBe('/change-activity/hiking')
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
    expect(pathOf(result)).toBe('/de/change-buchen/hiking')
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
    expect(pathOf(result)).toBe('/de/ueber-uns')
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
    expect(pathOf(result)).toBe('/de/change-buchen/aktivitaet-buchen/ski-fahren')
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
    expect(pathOf(result)).toBe('/de/change-buchen/hiking')
  })

  // Nuxt names pages/about-team.vue, pages/about/team.vue (child of pages/about.vue) and
  // pages/about/team.vue (beside pages/about/index.vue) all `about-team`. Expected values
  // are what route-strategy generates for each shape; the router path tells them apart.
  const about = { en: '/about', de: '/ueber-uns' }
  test.each([
    // top-level sibling pages/about-team.vue
    ['sibling, absolute name rule', '/about-team', { about, 'about-team': { en: '/about-team', de: '/team-seite' } }, 'en', '/about-team'],
    ['sibling, absolute name rule', '/about-team', { about, 'about-team': { en: '/about-team', de: '/team-seite' } }, 'de', '/de/team-seite'],
    ['sibling, absolute path rule', '/about-team', { about, '/about-team': { en: '/about-team', de: '/team-seite' } }, 'en', '/about-team'],
    ['sibling, absolute path rule', '/about-team', { about, '/about-team': { en: '/about-team', de: '/team-seite' } }, 'de', '/de/team-seite'],
    ['sibling, relative name rule', '/about-team', { about, 'about-team': { en: 'about-team', de: 'team-seite' } }, 'en', '/about-team'],
    ['sibling, relative name rule', '/about-team', { about, 'about-team': { en: 'about-team', de: 'team-seite' } }, 'de', '/de/team-seite'],
    ['sibling, relative path rule', '/about-team', { about, '/about-team': { en: 'about-team', de: 'team-seite' } }, 'en', '/about-team'],
    ['sibling, relative path rule', '/about-team', { about, '/about-team': { en: 'about-team', de: 'team-seite' } }, 'de', '/de/team-seite'],
    ['sibling, no own rule', '/about-team', { about }, 'en', '/about-team'],
    ['sibling, no own rule', '/about-team', { about }, 'de', '/de/about-team'],
    ['sibling, ignores about/team rule', '/about-team', { about, 'about/team': { en: 'team', de: 'team-seite' } }, 'en', '/about-team'],
    ['sibling, ignores about/team rule', '/about-team', { about, 'about/team': { en: 'team', de: 'team-seite' } }, 'de', '/de/about-team'],
    ['sibling, custom absolute', '/our-team', { about, 'about-team': { en: '/our-team', de: '/team-seite' } }, 'en', '/our-team'],
    ['sibling, custom absolute', '/our-team', { about, 'about-team': { en: '/our-team', de: '/team-seite' } }, 'de', '/de/team-seite'],
    ['sibling, custom relative', '/our-team', { about, 'about-team': { en: 'our-team', de: 'team-seite' } }, 'en', '/our-team'],
    ['sibling, custom relative', '/our-team', { about, 'about-team': { en: 'our-team', de: 'team-seite' } }, 'de', '/de/team-seite'],
    // child route: rule values are relative to the parent, whatever the key form
    ['child, no own rule', '/about/team', { about }, 'de', '/de/ueber-uns/team'],
    ['child, relative slash rule', '/about/team', { about, 'about/team': { en: 'team', de: 'team-seite' } }, 'en', '/about/team'],
    ['child, relative slash rule', '/about/team', { about, 'about/team': { en: 'team', de: 'team-seite' } }, 'de', '/de/ueber-uns/team-seite'],
    ['child, absolute name rule', '/about/team', { about, 'about-team': { en: '/team', de: '/team-seite' } }, 'en', '/about/team'],
    ['child, absolute name rule', '/about/team', { about, 'about-team': { en: '/team', de: '/team-seite' } }, 'de', '/de/ueber-uns/team-seite'],
    // flat page mapped to a top-level default-locale URL: rule values are complete paths
    [
      'flat, slash rule to /about-team',
      '/about-team',
      { about, 'about/team': { en: '/about-team', de: '/ueber-uns/team-seite' } },
      'en',
      '/about-team',
    ],
    [
      'flat, slash rule to /about-team',
      '/about-team',
      { about, 'about/team': { en: '/about-team', de: '/ueber-uns/team-seite' } },
      'de',
      '/de/ueber-uns/team-seite',
    ],
  ])('about-team: %s (router %s) %j → %s = %s', (_label, routerPath, rules, locale, expected) => {
    const strategy = strategyAt('about-team', routerPath, rules)
    expect(pathOf(strategy.localeRoute(locale, { name: 'about-team' }))).toBe(expected)
  })

  // Mixed rule (absolute in one locale, relative in another) under the dashed name.
  const docs = { en: '/docs', de: '/dokumente' }
  test.each([
    ['docs-intro', 'flat', '/docs/intro', 'en', '/docs/intro'],
    ['docs-intro', 'flat', '/docs/intro', 'de', '/de/einfuehrung'],
    ['/docs-intro', 'flat', '/docs/intro', 'en', '/docs/intro'],
    ['/docs-intro', 'flat', '/docs/intro', 'de', '/de/einfuehrung'],
    ['docs-intro', 'child', '/docs/docs/intro', 'de', '/de/dokumente/einfuehrung'],
    ['/docs-intro', 'child', '/docs/docs/intro', 'de', '/de/dokumente/einfuehrung'],
  ])('mixed rule under %s (%s page at %s): %s → %s', (ruleKey, _shape, routerPath, locale, expected) => {
    const strategy = strategyAt('docs-intro', routerPath, { docs, [ruleKey]: { en: '/docs/intro', de: 'einfuehrung' } })
    expect(pathOf(strategy.localeRoute(locale, { name: 'docs-intro' }))).toBe(expected)
  })

  test('params: complete-path check substitutes route params', () => {
    const strategy = strategyAt('blog-id', '/blog/5', { blog: { en: '/blog', de: '/magazin' }, 'blog-id': { en: '/blog/:id', de: '/artikel/:id' } })
    expect(pathOf(strategy.localeRoute('de', { name: 'blog-id', params: { id: '5' } }))).toBe('/de/artikel/5')
  })
})
