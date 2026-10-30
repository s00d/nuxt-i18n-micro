/**
 * Builds one app the way the Nuxt module does (route-strategy at build time, path-strategy at
 * runtime on a real vue-router) and records everything the module, its plugin, middleware and
 * server ask of the two packages, as a markdown report used as a golden file.
 */
import {
  createPathStrategy,
  DomainPathStrategy,
  type PathStrategy,
  type ResolvedRouteLike,
  type RouteLike,
  type RouterAdapter,
} from '@i18n-micro/path-strategy'
import { RouteGenerator } from '@i18n-micro/route-strategy'
import type { GlobalLocaleRoutes, ModuleOptionsExtend, Strategies } from '@i18n-micro/types'
import { configForHost } from '@i18n-micro/utils/domains'
import type { NuxtPage } from '@nuxt/schema'
import type { Router } from 'vue-router'
import { createAppRouter } from '../helpers/routing-matrix'
import { pagesFromFiles } from './pages'
import { type App, appLocales, PARAMS } from './scenarios'

interface Built {
  pages: NuxtPage[]
  router: Router
  i18n: PathStrategy
  locales: string[]
  /** Disabled locales: the strategy knows them, nothing serves them. */
  disabled: string[]
  /** Locales of other domains: link targets on this host. */
  foreign: string[]
  defaultLocale: string
  strategy: Strategies
}

function applyAliases(pages: NuxtPage[], aliases: Record<string, string[]>) {
  for (const page of pages) {
    if (page.name && aliases[page.name]) page.alias = aliases[page.name]
    if (page.children) applyAliases(page.children, aliases)
  }
}

/** Same inputs module.ts hands RouteGenerator and the i18n.strategy.mjs template. */
export function build(app: App, strategy: Strategies, host?: string): Built {
  const pages = pagesFromFiles(app.files)
  if (app.aliases) applyAliases(pages, app.aliases)
  // what Nuxt adds for a `routeRules` redirect without a page: unnamed, with a stub component
  if (app.hasStub) pages.push({ _sync: true, path: '/old', file: 'component-stub' } as NuxtPage)

  const routeLocales: Record<string, string[]> = { ...app.routeLocales }
  const filesLocaleRoutes: GlobalLocaleRoutes = {}
  for (const [routePath, cfg] of Object.entries(app.pageI18n ?? {})) {
    if (cfg.locales) routeLocales[routePath] = cfg.locales
    if (cfg.localeRoutes) filesLocaleRoutes[routePath] = cfg.localeRoutes
  }
  const globalLocaleRoutes = { ...filesLocaleRoutes, ...app.globalLocaleRoutes } as GlobalLocaleRoutes
  const localizedRouteNamePrefix = app.localizedRouteNamePrefix ?? 'localized-'

  const generator = new RouteGenerator({
    locales: appLocales(app),
    defaultLocaleCode: app.defaultLocale ?? 'en',
    strategy,
    globalLocaleRoutes: structuredClone(globalLocaleRoutes),
    routeLocales,
    noPrefixRedirect: !!app.noPrefixRedirect,
    excludePatterns: app.excludePatterns,
    localizedRouteNamePrefix: app.localizedRouteNamePrefix,
    customRegexMatcher: app.customRegexMatcher,
  })
  generator.extendPages(pages)

  let router: Router
  try {
    router = createAppRouter(pages)
  } catch (e) {
    throw Object.assign(new Error(`vue-router rejects the generated routes: ${(e as Error).message}`), { pages })
  }
  const adapter: RouterAdapter = {
    hasRoute: (name) => router.hasRoute(name),
    resolve: (to) => adapterResolve(router, to),
    getRoutes: () => router.getRoutes(),
  }
  // the runtime config keeps disabled locales; only the records leave them out
  const all = appLocales(app)
  const config = { locales: all, defaultLocale: generator.defaultLocale.code } as ModuleOptionsExtend
  const hosted = host ? configForHost(config, host) : config
  const context = {
    strategy,
    defaultLocale: hosted.defaultLocale!,
    locales: hosted.locales!,
    localizedRouteNamePrefix,
    router: adapter,
    hashMode: app.hashMode,
    customRegexMatcher: app.customRegexMatcher,
    domain: hosted.domain,
    linkLocales: hosted.linkLocales,
  }
  const i18n = all.some((l) => l.baseUrl) ? new DomainPathStrategy(context) : createPathStrategy(context)
  const served = hosted.locales!.map((l) => l.code)
  const locales = generator.locales.map((l) => l.code).filter((code) => served.includes(code))
  const disabled = all.filter((l) => l.disabled).map((l) => l.code)
  const foreign = generator.locales.map((l) => l.code).filter((code) => !served.includes(code))
  return { pages, router, i18n, locales, disabled, foreign, defaultLocale: hosted.defaultLocale!, strategy }
}

// ---------- capture ----------

let warnings: string[] = []
/** True while the harness itself resolves a URL: its own vue-router warnings are not the packages'. */
let harness = false
export function captureWarnings(): () => void {
  const warn = console.warn
  console.warn = (...args: unknown[]) => {
    if (harness) return
    const text = args.map(String).join(' ').replace(/\s+/g, ' ')
    const discarded = /Discarded invalid param\(s\) ("[^"]*"(?:, "[^"]*")*)/.exec(text)
    warnings.push(discarded ? `vue-router discarded ${discarded[1]}` : text.slice(0, 160))
  }
  return () => {
    console.warn = warn
  }
}

/** Runs fn; the cell shows its value, a thrown error, and the warnings it caused. */
function cell(fn: () => string): string {
  warnings = []
  let out: string
  try {
    out = fn()
  } catch (e) {
    out = `THROWS ${(e as Error).message}`
  }
  const w = [...new Set(warnings)]
  return w.length ? `${out} ⚠ ${w.join(' ⚠ ')}` : out
}

const show = (v: unknown): string => (v === null ? 'null' : v === undefined ? '—' : String(v))
const esc = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ')

function table(head: string[], rows: string[][]): string {
  return [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.map(esc).join(' | ')} |`)].join('\n')
}

/** What NuxtLink / router.push would land on for a strategy result. */
function harnessResolve(router: Router, to: RouteLike | string) {
  harness = true
  try {
    return router.resolve(to as Parameters<Router['resolve']>[0])
  } finally {
    harness = false
  }
}

function landing(router: Router, result: RouteLike | string): string {
  if (typeof result === 'string') return /^https?:\/\//.test(result) ? `external ${result}` : `${result} → ${harnessResolve(router, result).fullPath}`
  const r = harnessResolve(router, result)
  return `${r.fullPath} [${show(r.name)}]`
}

function routeResult(route: RouteLike): string {
  return `${route.fullPath ?? route.path ?? '—'} [${show(route.name)}]`
}

// ---------- URLs ----------

function localeValues(pattern: string | undefined, locales: string[]): string[] {
  if (!pattern) return locales
  const alts = pattern.split('|')
  return alts.every((a) => /^[\w-]+$/.test(a)) ? alts : locales
}

/** Concrete URLs for every route record (aliases included), one per allowed locale value. */
function concreteUrls(router: Router, locales: string[]): string[] {
  const urls = new Set<string>()
  for (const record of router.getRoutes()) {
    if (record.redirect) continue
    const localeParam = /:locale(?:\(([^)]*)\))?/.exec(record.path)
    for (const locale of localeParam ? localeValues(localeParam[1], locales) : [undefined]) {
      const path = record.path.replace(/:(\w+)(\((?:[^()]|\([^)]*\))*\))?[?*+]?/g, (_, name: string) => {
        if (name === 'locale') return locale!
        const v = PARAMS[name]
        return v === undefined ? 'x' : Array.isArray(v) ? v.join('/') : v
      })
      urls.add(path.replace(/\/+/g, '/') || '/')
    }
  }
  return [...urls].sort()
}

function edgeUrls(locales: string[], disabled: string[], defaultLocale: string): string[] {
  const other = locales.find((l) => l !== defaultLocale)!
  return [
    '/',
    `/${defaultLocale}`,
    `/${defaultLocale}/`,
    `/${other}`,
    `/${other}/`,
    '/about/',
    `/${other}/about/`,
    '/missing',
    `/${other}/missing`,
    '/xx/about',
    `/${other}/${other}/about`,
    ...disabled.flatMap((code) => [`/${code}`, `/${code}/about`]),
  ]
}

// ---------- report ----------

function routesSection(pages: NuxtPage[]): string {
  const rows: string[][] = []
  const walk = (list: NuxtPage[], depth: number) => {
    for (const p of list) {
      const redirect = typeof p.redirect === 'string' ? p.redirect : p.redirect ? JSON.stringify(p.redirect) : ''
      rows.push([`${'· '.repeat(depth)}${show(p.name)}`, p.path, [p.alias ?? []].flat().join(', '), redirect])
      if (p.children) walk(p.children, depth + 1)
    }
  }
  walk(pages, 0)
  return `## Generated routes\n\n${table(['name', 'path', 'alias', 'redirect'], rows)}`
}

export function describeApp(app: App, strategy: Strategies, host?: string): string {
  const header = `# ${app.name} · ${strategy}${host ? ` · ${host}` : ''}\n\n${app.description}`
  let built: Built
  try {
    built = build(app, strategy, host)
  } catch (e) {
    const pages = (e as { pages?: NuxtPage[] }).pages
    return `${header}\n\n**${(e as Error).message}**\n\n${pages ? routesSection(pages) : ''}\n`
  }
  const { pages, router, i18n, locales, disabled, foreign, defaultLocale } = built
  const concrete = concreteUrls(router, [...locales, ...foreign])
  const urls = [...new Set([...concrete, ...edgeUrls(locales, disabled, defaultLocale)])]
  const resolved = urls.map((url) => ({ url, route: adapterResolve(router, `${url}?q=1#top`) }))

  const readRows = resolved.map(({ url, route }) => {
    const locale = cell(() => i18n.getCurrentLocale(route))
    return [
      url,
      show(route.name),
      locale,
      cell(() => i18n.getPluginRouteName(route, locale.split(' ')[0]!)),
      cell(() => show(i18n.getRouteBaseName(route))),
      cell(() => show(i18n.getCurrentLocaleName(route))),
      cell(() => show(i18n.getLocaleFromPath(url))),
      cell(() => show(i18n.resolveLocaleFromPath(url))),
      cell(() => show(i18n.shouldReturn404(url))),
    ]
  })

  const sections = [
    `${header}\n\nlocales: ${locales.join(', ')} · default: ${defaultLocale}`,
    routesSection(pages),
    `## Reading a URL\n\nEvery URL is resolved with \`?q=1#top\`.\n\n${table(
      [
        'url',
        'router name',
        'getCurrentLocale',
        'getPluginRouteName',
        'getRouteBaseName',
        'getCurrentLocaleName',
        'getLocaleFromPath',
        'resolveLocaleFromPath',
        'shouldReturn404',
      ],
      readRows,
    )}`,
  ]

  for (const target of [...locales, ...disabled, ...foreign]) {
    const rows = resolved.map(({ url, route }) => {
      const from = i18n.getCurrentLocale(route)
      const i18nRouteParams = Object.keys(route.params ?? {}).some((k) => k !== 'locale')
        ? Object.fromEntries(
            locales.map((l) => [
              l,
              Object.fromEntries(
                Object.entries(route.params!)
                  .filter(([k, v]) => k !== 'locale' && !Array.isArray(v))
                  .map(([k, v]) => [k, `${String(v)}-${l}`]),
              ),
            ]),
          )
        : undefined
      return [
        url,
        cell(() => landing(router, i18n.switchLocaleRoute(from, target, route, {}))),
        i18nRouteParams ? cell(() => landing(router, i18n.switchLocaleRoute(from, target, route, { i18nRouteParams }))) : '',
        cell(() => routeResult(i18n.localeRoute(target, route, route))),
        cell(() => routeResult(i18n.localeRoute(target, `${url}?q=1#top`, route))),
        cell(() => show(i18n.getClientRedirect(url, target))),
        cell(() => show(i18n.getClientRedirect(url, target, { switchPrefixed: true }))),
        cell(() => show(i18n.pageLocales(route))),
      ]
    })
    sections.push(
      `## To ${target}\n\n${table(
        [
          'url',
          'switchLocaleRoute',
          'switch + i18nRouteParams',
          'localeRoute(route)',
          'localeRoute(url)',
          'getClientRedirect',
          "getClientRedirect('*')",
          'pageLocales',
        ],
        rows,
      )}`,
    )
  }

  // localeRoute by base name, as `localePath({ name })` from any page
  const baseNames = [...new Set(router.getRoutes().map((r) => (r.name ? i18n.getRouteBaseName({ name: String(r.name), path: r.path }) : null)))]
    .filter((n): n is string => !!n)
    .sort()
  // from the home page of every locale: vue-router merges the current route's params
  const homes = locales
    .map((l) => resolved.find(({ route }) => i18n.getRouteBaseName(route) === 'index' && i18n.getCurrentLocale(route) === l)?.route)
    .filter((r) => !!r)
  const nameRows = baseNames.map((name) => {
    const paths = router
      .getRoutes()
      .filter((r) => r.name && i18n.getRouteBaseName({ name: String(r.name), path: r.path }) === name)
      .map((r) => r.path)
    const params = Object.fromEntries(Object.entries(PARAMS).filter(([k]) => paths.some((p) => p.includes(`:${k}`))))
    const cells = homes.flatMap((from) =>
      locales.map((target) => cell(() => routeResult(i18n.localeRoute(target, { name, params: structuredClone(params) }, from)))),
    )
    cells.unshift(name)
    return cells
  })
  const heads = homes.flatMap((from) => locales.map((target) => `${target} from ${from.path}`))
  sections.push(
    `## localeRoute({ name, params }) from each home page\n\nparams: the PARAMS keys the route's records use.\n\n${table(['name', ...heads], nameRows)}`,
  )

  // unlocalized pages (`false` rules, excludePatterns) are served in one form only
  const unlocalized = (url: string) =>
    (app.excludePatterns ?? []).some((p) => url.startsWith(p)) ||
    Object.entries(app.globalLocaleRoutes ?? {}).some(([key, rule]) => rule === false && url.replace(/^\//, '') === key)
  sections.push(
    invariants(
      built,
      // on a host, what it answers with a 404 is no page of it
      resolved.filter(({ url }) => concrete.includes(url) && !unlocalized(url) && !(host && i18n.shouldReturn404(url))),
      homes,
      nameRows,
    ),
  )
  return `${sections.join('\n\n')}\n`
}

/**
 * Properties a correct implementation keeps for every served, localized URL; each line is one break.
 * The rewrite drives this list to empty (or explains what stays).
 */
function invariants(
  { router, i18n, locales, strategy }: Built,
  served: { url: string; route: ResolvedRouteLike }[],
  homes: ResolvedRouteLike[],
  nameRows: string[][],
): string {
  const out: string[] = []
  const land = (result: RouteLike | string): ResolvedRouteLike | null => {
    if (typeof result === 'string' && /^https?:\/\//.test(result)) return null
    const r = harnessResolve(router, result)
    return {
      name: r.name === null || r.name === undefined ? null : String(r.name),
      path: r.path,
      fullPath: r.fullPath,
      params: r.params,
      query: r.query,
      hash: r.hash,
    }
  }
  // locales each page is served in, from the records the build generated
  const pageLocales = new Map<string, Set<string>>()
  for (const record of router.getRoutes()) {
    const meta = record.meta.i18n as { name: string; locales: string[] } | undefined
    if (meta) meta.locales.forEach((l) => pageLocales.set(meta.name, (pageLocales.get(meta.name) ?? new Set()).add(l)))
  }
  const quiet = <T>(fn: () => T): { value?: T; warned: boolean; error?: string } => {
    warnings = []
    try {
      const value = fn()
      return { value, warned: warnings.length > 0 }
    } catch (e) {
      return { warned: warnings.length > 0, error: (e as Error).message }
    }
  }
  for (const { url, route } of served) {
    const from = i18n.getCurrentLocale(route)
    // the same page in its own locale: aliases and unprefixed fallbacks normalize to it
    const home = quiet(() => land(i18n.switchLocaleRoute(from, from, route, {}))).value
    const redirect = quiet(() => i18n.getClientRedirect(url, from))
    if (redirect.value && redirect.value !== home?.path)
      out.push(`${url}: getClientRedirect to its own locale ${from} gives ${redirect.value}, switch gives ${home?.path}`)
    for (const target of locales) {
      const sw = quiet(() => land(i18n.switchLocaleRoute(from, target, route, {})))
      const lr = quiet(() => i18n.localeRoute(target, route, route))
      if (sw.error) out.push(`${url} → ${target}: switchLocaleRoute throws ${sw.error}`)
      if (sw.warned) out.push(`${url} → ${target}: switchLocaleRoute warns`)
      if (lr.warned) out.push(`${url} → ${target}: localeRoute(route) warns`)
      const to = sw.value
      if (!to) continue
      // under no_prefix the URL carries no locale: only the page itself can be checked
      const landed = strategy === 'no_prefix' ? target : i18n.getCurrentLocale(to)
      // a page the build serves only in other locales cannot land in `target`
      const base = i18n.getRouteBaseName(route)
      if (landed !== target && base && !pageLocales.get(base)?.has(target)) continue
      if (landed !== target) out.push(`${url} → ${target}: switch lands on ${to.fullPath} read as ${landed}`)
      const lrLand = lr.value ? quiet(() => land(lr.value!)!.fullPath) : undefined
      if (lrLand?.error) out.push(`${url} → ${target}: localeRoute(route) gives an unknown route (${lrLand.error})`)
      const lrPath = lrLand?.value
      if (lrPath !== undefined && lrPath !== to.fullPath) out.push(`${url} → ${target}: switch ${to.fullPath} ≠ localeRoute(route) ${lrPath}`)
      if (landed === target) {
        const back = quiet(() => land(i18n.switchLocaleRoute(target, from, to, {})))
        if (back.value && home && back.value.fullPath !== home.fullPath)
          out.push(`${url} → ${target} → ${from}: round trip ends on ${back.value.fullPath}, not ${home.fullPath}`)
      }
    }
  }
  for (const [name, ...cells] of nameRows) {
    for (let t = 0; t < locales.length; t++) {
      const seen = new Set(homes.map((_, h) => cells[h * locales.length + t]))
      if (seen.size > 1) out.push(`localeRoute({ name: ${name} }) to ${locales[t]} depends on the current page: ${[...seen].join(' / ')}`)
    }
    if (cells.some((c) => c?.includes('⚠'))) out.push(`localeRoute({ name: ${name} }) warns`)
  }
  return `## Invariant breaks (${out.length})\n\n${out.length ? out.map((l) => `- ${l}`).join('\n') : 'none'}`
}

function adapterResolve(router: Router, to: RouteLike | string): ResolvedRouteLike {
  const r = router.resolve(to as Parameters<Router['resolve']>[0])
  return {
    name: r.name === null || r.name === undefined ? null : String(r.name),
    path: r.path,
    fullPath: r.fullPath,
    params: r.params || {},
    query: r.query || {},
    hash: r.hash || '',
    matched: r.matched,
  }
}
