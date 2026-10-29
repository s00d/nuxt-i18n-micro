/**
 * Cost of every runtime call on a real vue-router serving a 300-page, 5-locale app built by
 * route-strategy. `pnpm test:perf` prints µs per call; the budgets are ~10x the measured cost on
 * a laptop, so only a real regression (an extra path match, a loop over the routes) fails.
 */
import { RouteGenerator } from '@i18n-micro/route-strategy'
import type { Strategies } from '@i18n-micro/types'
import type { NuxtPage } from '@nuxt/schema'
import { describe, expect, test } from 'vitest'
import { createMemoryHistory, createRouter, type RouteRecordRaw, type Router } from 'vue-router'
import { createPathStrategy, type ResolvedRouteLike } from '../src'

const locales = ['en', 'de', 'fr', 'es', 'it'].map((code) => ({ code }))
const rules: Record<string, Record<string, string>> = {}
const pages: NuxtPage[] = [
  { path: '/', name: 'index', file: 'index.vue' },
  { path: '/:slug(.*)*', name: 'slug', file: '[...slug].vue' },
]
for (let i = 0; i < 100; i++) {
  pages.push({ path: `/s${i}`, name: `s${i}`, file: `s${i}/index.vue` })
  pages.push({ path: `/s${i}/:id()`, name: `s${i}-id`, file: `s${i}/[id].vue` })
  pages.push({ path: `/s${i}/about`, name: `s${i}-about`, file: `s${i}/about.vue` })
  if (i % 3 === 0) rules[`s${i}/about`] = { de: `/s${i}/ueber`, fr: `/s${i}/a-propos` }
  if (i % 5 === 0) rules[`s${i}/[id]`] = { de: `/s${i}/eintrag/[id]` }
}

const toRecord = (page: NuxtPage): RouteRecordRaw =>
  ({
    path: page.path,
    name: page.name,
    meta: page.meta,
    ...(page.redirect ? { redirect: page.redirect } : { component: {} }),
    ...(page.alias?.length ? { alias: page.alias } : {}),
    ...(page.children?.length ? { children: page.children.map(toRecord) } : {}),
  }) as RouteRecordRaw

/** Median µs per call over 5 rounds, after a warmup. */
function measure(n: number, fn: (i: number) => unknown): number {
  for (let i = 0; i < Math.min(n, 2000); i++) fn(i)
  const rounds: number[] = []
  for (let r = 0; r < 5; r++) {
    const start = performance.now()
    for (let i = 0; i < n; i++) fn(i)
    rounds.push(((performance.now() - start) / n) * 1000)
  }
  return rounds.sort((a, b) => a - b)[2]!
}

function setup(strategy: Strategies) {
  const generator = new RouteGenerator({ locales, defaultLocaleCode: 'en', strategy, globalLocaleRoutes: rules, noPrefixRedirect: false })
  const build = () => {
    const list = structuredClone(pages)
    generator.extendPages(list)
    return list
  }
  const router: Router = createRouter({ history: createMemoryHistory(), routes: build().map(toRecord) })
  const resolve = (to: unknown): ResolvedRouteLike => {
    const r = router.resolve(to as Parameters<Router['resolve']>[0])
    return {
      name: r.name === null || r.name === undefined ? null : String(r.name),
      path: r.path,
      fullPath: r.fullPath,
      params: r.params,
      query: r.query,
      hash: r.hash,
    }
  }
  const i18n = createPathStrategy({
    strategy,
    defaultLocale: 'en',
    locales,
    router: { hasRoute: (n) => router.hasRoute(n), resolve, getRoutes: () => router.getRoutes() },
  })
  return { build, i18n, resolve }
}

/** µs budget per call. */
const BUDGET: Record<string, number> = {
  'build: extendPages (300 pages)': 20_000,
  'localeRoute({ name, params })': 10,
  'localeRoute(path string)': 10,
  switchLocaleRoute: 10,
  getCurrentLocale: 1,
  getPluginRouteName: 1,
  getRouteBaseName: 1,
  shouldReturn404: 2,
  getClientRedirect: 10,
}

describe.each(['prefix_except_default', 'prefix', 'prefix_and_default', 'no_prefix'] as const)('%s', (strategy) => {
  test('every call stays within budget', () => {
    const { build, i18n, resolve } = setup(strategy)
    const prefix = strategy === 'no_prefix' ? '' : '/de'
    const urls = Array.from({ length: 100 }, (_, i) => `${prefix}/s${i}/${i % 3 === 0 && prefix ? 'ueber' : 'about'}`)
    const routes = urls.map((url) => resolve(`${url}?q=1`))
    const targets = ['en', 'fr', 'es', 'it']
    const results: Record<string, number> = {
      'build: extendPages (300 pages)': measure(10, build),
      'localeRoute({ name, params })': measure(20_000, (i) =>
        i18n.localeRoute(targets[i % 4]!, { name: `s${i % 100}-id`, params: { id: '42' } }, routes[i % 100]),
      ),
      'localeRoute(path string)': measure(20_000, (i) => i18n.localeRoute(targets[i % 4]!, `/s${i % 100}/about?x=1`, routes[i % 100])),
      switchLocaleRoute: measure(20_000, (i) => i18n.switchLocaleRoute('de', targets[i % 4]!, routes[i % 100]!, {})),
      getCurrentLocale: measure(100_000, (i) => i18n.getCurrentLocale(routes[i % 100]!)),
      getPluginRouteName: measure(100_000, (i) => i18n.getPluginRouteName(routes[i % 100]!, 'de')),
      getRouteBaseName: measure(100_000, (i) => i18n.getRouteBaseName(routes[i % 100]!)),
      shouldReturn404: measure(20_000, (i) => i18n.shouldReturn404(urls[i % 100]!)),
      getClientRedirect: measure(20_000, (i) => i18n.getClientRedirect(`/s${i % 100}/about`, targets[i % 4]!)),
    }
    // vitest keeps console output of passing tests to itself: write the report straight to stdout
    const lines = Object.entries(results).map(([label, us]) => `  ${label.padEnd(32)} ${us.toFixed(3).padStart(10)} µs  (budget ${BUDGET[label]})`)
    process.stdout.write(`\n${strategy}\n${lines.join('\n')}\n`)
    const over = Object.entries(results).filter(([label, us]) => us >= BUDGET[label]!)
    expect(over).toEqual([])
  })
})
