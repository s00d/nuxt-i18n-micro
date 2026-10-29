/**
 * Generated routing configurations shared by the build-spec and runtime-parity tests.
 *
 * Nuxt names `pages/about-team.vue`, `pages/about/team.vue` as a child of `pages/about.vue`,
 * and `pages/about/team.vue` beside `pages/about/index.vue` all `about-team`. Every config
 * combines one of those page shapes with globalLocaleRoutes written under the different key
 * forms and value kinds users write, so the tests see the cases one-off fixtures miss.
 */
import type { Locale } from '@i18n-micro/types'
import { RouteGenerator } from '@i18n-micro/route-strategy'
import type { NuxtPage } from '@nuxt/schema'
import { createMemoryHistory, createRouter, type Router, type RouteRecordRaw } from 'vue-router'

export type Strategy = 'prefix' | 'prefix_except_default' | 'prefix_and_default' | 'no_prefix'
export type Rules = Record<string, Record<string, string>>

export const STRATEGIES: Strategy[] = ['prefix', 'prefix_except_default', 'prefix_and_default', 'no_prefix']
export const LOCALES: Locale[] = [
  { code: 'en', iso: 'en-US' },
  { code: 'de', iso: 'de-DE' },
  { code: 'fr', iso: 'fr-FR' },
]
export const DEFAULT_LOCALE = 'en'
export const LOCALE_CODES = LOCALES.map((l) => l.code)

export const SHAPES: Record<string, () => NuxtPage[]> = {
  sibling: () => [
    { path: '/about', name: 'about', file: 'pages/about.vue' },
    { path: '/about-team', name: 'about-team', file: 'pages/about-team.vue' },
  ],
  child: () => [
    { path: '/about', name: 'about', file: 'pages/about.vue', children: [{ path: 'team', name: 'about-team', file: 'pages/about/team.vue' }] },
  ],
  flat: () => [
    { path: '/about', name: 'about', file: 'pages/about/index.vue' },
    { path: '/about/team', name: 'about-team', file: 'pages/about/team.vue' },
  ],
}

/** Same shapes with an alias on the page that owns `about-team` (on its parent for the child shape). */
export const ALIAS_SHAPES: Record<string, () => NuxtPage[]> = {
  sibling: () => [
    { path: '/about', name: 'about', file: 'pages/about.vue' },
    { path: '/about-team', name: 'about-team', file: 'pages/about-team.vue', alias: ['/team-info'] },
  ],
  child: () => [
    {
      path: '/about',
      name: 'about',
      file: 'pages/about.vue',
      alias: ['/info'],
      children: [{ path: 'team', name: 'about-team', file: 'pages/about/team.vue' }],
    },
  ],
}
/** Alias URL (without locale prefix) under which `about-team` is served, given its main URL without prefix. */
export function aliasPathFor(shape: string, mainPath: string, parentPath: string): string {
  return shape === 'sibling' ? '/team-info' : `/info${mainPath.slice(parentPath.length)}`
}

const KEYS = ['about-team', '/about-team', 'about/team', '/about/team']
// `tag` keeps two rules of one config distinguishable in the URLs they produce.
const VALUE_KINDS: Record<string, (loc: string, tag: string) => string | undefined> = {
  abs: (loc, tag) => `/${tag}-${loc}`,
  rel: (loc, tag) => `${tag}-${loc}`,
  nested: (loc, tag) => `/x/${tag}-${loc}`,
  full: (loc, tag) => `/about/${tag}-${loc}`,
  fullOther: (loc, tag) => `/ueber-uns/${tag}-${loc}`,
  dashed: () => '/about-team',
  slashed: () => '/about/team',
  none: () => undefined,
}
const PARENTS: Record<string, Rules> = {
  noParentRule: {},
  parentRule: { about: { en: '/about-en', de: '/ueber-uns', fr: '/a-propos' } },
  parentRuleDeOnly: { about: { de: '/ueber-uns' } },
}

function rule(en: string, de: string, tag: string): Record<string, string> | null {
  const out: Record<string, string> = {}
  const e = VALUE_KINDS[en]!('en', tag)
  const d = VALUE_KINDS[de]!('de', tag)
  if (e !== undefined) out.en = e
  if (d !== undefined) out.de = d
  return Object.keys(out).length ? out : null
}

export interface MatrixConfig {
  label: string
  rules: Rules
}

/** Single rules under every key form x value kind, plus pairs of conflicting keys, per parent setup. */
export function matrixConfigs(): MatrixConfig[] {
  const configs: MatrixConfig[] = []
  const kinds = Object.keys(VALUE_KINDS)
  for (const [parentLabel, parent] of Object.entries(PARENTS)) {
    for (const key of KEYS)
      for (const en of kinds)
        for (const de of kinds) {
          const r = rule(en, de, 'a')
          if (r) configs.push({ label: `${parentLabel} ${key}{en:${en},de:${de}}`, rules: { ...parent, [key]: r } })
        }
    const pairKinds = ['abs', 'rel', 'dashed', 'slashed']
    for (let i = 0; i < KEYS.length; i++)
      for (let j = i + 1; j < KEYS.length; j++)
        for (const a of pairKinds)
          for (const b of pairKinds)
            configs.push({
              label: `${parentLabel} ${KEYS[i]}{en:${a}}+${KEYS[j]}{en:${b}}`,
              rules: { ...parent, [KEYS[i]!]: rule(a, 'abs', 'a')!, [KEYS[j]!]: rule(b, 'rel', 'b')! },
            })
  }
  return configs
}

export function generate(strategy: Strategy, shape: string, rules: Rules, shapes: Record<string, () => NuxtPage[]> = SHAPES): NuxtPage[] {
  const pages = shapes[shape]!()
  new RouteGenerator({
    locales: LOCALES,
    defaultLocaleCode: DEFAULT_LOCALE,
    strategy,
    globalLocaleRoutes: structuredClone(rules),
    routeLocales: {},
    noPrefixRedirect: false,
  }).extendPages(pages)
  return pages
}

const toRecord = (page: NuxtPage): RouteRecordRaw =>
  ({
    path: page.path,
    name: page.name,
    ...(page.meta ? { meta: page.meta } : {}),
    ...(page.redirect ? { redirect: page.redirect as string } : { component: {} }),
    ...(page.alias?.length ? { alias: page.alias } : {}),
    ...(page.children?.length ? { children: page.children.map(toRecord) } : {}),
  }) as RouteRecordRaw

export function createAppRouter(pages: NuxtPage[]): Router {
  return createRouter({ history: createMemoryHistory(), routes: pages.map(toRecord) })
}

export function duplicateNames(pages: NuxtPage[]): string[] {
  const seen = new Map<string, number>()
  const walk = (list: NuxtPage[]) =>
    list.forEach((page) => {
      if (page.name) seen.set(page.name, (seen.get(page.name) ?? 0) + 1)
      if (page.children) walk(page.children)
    })
  walk(pages)
  return [...seen].filter(([, n]) => n > 1).map(([name]) => name)
}

/** Route name that serves page `base` in `locale` (first one the router has). */
export function routeNameFor(strategy: Strategy, locale: string, router: Router, base = 'about-team'): string | undefined {
  const candidates =
    strategy === 'prefix_except_default' && locale === DEFAULT_LOCALE
      ? [base]
      : strategy === 'no_prefix'
        ? [`localized-${base}-${locale}`, base]
        : [`localized-${base}-${locale}`, `localized-${base}`]
  return candidates.find((name) => router.hasRoute(name))
}

/** URL of page `base` in `locale` as the router serves it (the build's answer). */
export function routerUrl(strategy: Strategy, locale: string, router: Router, base = 'about-team'): string | undefined {
  const name = routeNameFor(strategy, locale, router, base)
  if (!name) return undefined
  // only records with a `:locale` param take it (a custom-path record is `/de/...` literally)
  const takesLocale = router.getRoutes().some((record) => record.name === name && record.path.includes(':locale'))
  return router.resolve({ name, params: takesLocale ? { locale } : {} }).path
}
