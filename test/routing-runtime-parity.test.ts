/**
 * path-strategy (runtime) against the routes route-strategy generates, on a real vue-router
 * with the same thin adapter the Nuxt module uses (createI18nStrategy), over the generated
 * config matrix:
 * - localeRoute(name) from the about page in each locale returns the URL the router serves
 *   (vue-router merges the current route's params, which is how a missing `locale` leaked),
 * - switchLocaleRoute from the page itself resolves, like NuxtLink does, to that URL,
 * - vue-router never warns about discarded params.
 */
import { createPathStrategy, type PathStrategyContext, type RouteLike, type RouterAdapter } from '@i18n-micro/path-strategy'
import type { Router } from 'vue-router'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import {
  createAppRouter,
  DEFAULT_LOCALE,
  generate,
  LOCALE_CODES,
  LOCALES,
  matrixConfigs,
  routeNameFor,
  routerUrl,
  SHAPES,
  STRATEGIES,
  type Rules,
  type Strategy,
} from './helpers/routing-matrix'

function adapter(router: Router): RouterAdapter {
  return {
    hasRoute: (name) => router.hasRoute(name),
    resolve: (to) => {
      const r = router.resolve(to as Parameters<Router['resolve']>[0])
      return {
        name: r.name === null || r.name === undefined ? null : String(r.name),
        path: r.path,
        fullPath: r.fullPath,
        params: r.params || {},
        query: r.query || {},
        hash: r.hash || '',
      }
    },
  }
}

function strategyFor(strategy: Strategy, router: Router, rules: Rules) {
  const ctx: PathStrategyContext = {
    strategy,
    defaultLocale: DEFAULT_LOCALE,
    locales: LOCALES,
    localeCodes: LOCALE_CODES,
    localizedRouteNamePrefix: 'localized-',
    router: adapter(router),
    globalLocaleRoutes: rules,
  }
  return createPathStrategy(ctx)
}

const pathOf = (route: RouteLike | string) => (typeof route === 'string' ? route : (route.path ?? ''))
const configs = matrixConfigs()

describe('path-strategy runtime matches the generated routes', () => {
  let warnings: string[]
  beforeEach(() => {
    warnings = []
    vi.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
      warnings.push(args.map(String).join(' '))
    })
  })
  afterEach(() => vi.restoreAllMocks())

  for (const strategy of STRATEGIES) {
    test(`${strategy}: ${configs.length * Object.keys(SHAPES).length} configs`, async () => {
      const problems: string[] = []
      for (const shape of Object.keys(SHAPES)) {
        for (const { label, rules } of configs) {
          const router = createAppRouter(generate(strategy, shape, rules))
          const i18n = strategyFor(strategy, router, rules)
          for (const locale of LOCALE_CODES) {
            const expected = routerUrl(strategy, locale, router)
            if (!expected) continue
            const id = `${shape} | ${label} | ${locale}`
            for (const from of LOCALE_CODES) {
              const aboutUrl = routerUrl(strategy, from, router, 'about')
              if (!aboutUrl) continue
              await router.push(aboutUrl)
              warnings.length = 0
              const actual = pathOf(i18n.localeRoute(locale, { name: 'about-team' }))
              if (actual !== expected) problems.push(`${id} | localeRoute from ${from}: ${actual}, expected ${expected}`)
              if (warnings.length) problems.push(`${id} | localeRoute from ${from}: ${warnings[0]}`)
            }
            for (const from of LOCALE_CODES.filter((l) => l !== locale)) {
              const fromUrl = routerUrl(strategy, from, router)
              if (!fromUrl || routeNameFor(strategy, from, router) === undefined) continue
              await router.push(fromUrl)
              warnings.length = 0
              const switched = i18n.switchLocaleRoute(from, locale, router.currentRoute.value as never, {})
              const actual = typeof switched === 'string' ? switched : switched.path || router.resolve(switched as never).path
              if (actual !== expected) problems.push(`${id} | switch from ${from}: ${actual}, expected ${expected}`)
              if (warnings.length) problems.push(`${id} | switch from ${from}: ${warnings[0]}`)
            }
          }
        }
      }
      expect(problems.slice(0, 20)).toEqual([])
    })
  }
})
