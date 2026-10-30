/**
 * NuxtPage[] -> localized NuxtPage[] for one strategy, in two steps:
 *
 * 1. localize: the page tree as it is served in one locale (custom paths applied, unlocalized
 *    and disallowed pages dropped). A tree with no locale is the page as written.
 * 2. emit: vue-router records. Locales whose tree equals the page as written share one record
 *    `/:locale(de|fr)/...` named `localized-<name>`; every other locale gets its own records
 *    named `localized-<name>-<locale>`. The default locale of prefix_except_default /
 *    prefix_and_default, and the base page of no_prefix, keep the page's own names unprefixed.
 *
 * Every localized record carries `meta.i18n = { name, locales }`: the page's base route name and
 * the locales it serves. The runtime (path-strategy) reads that instead of re-deriving the rules.
 */
import type { Strategies } from '@i18n-micro/types'
import { isInternalPath } from '@i18n-micro/utils/app-path'
import type { NuxtPage } from '@nuxt/schema'
import { absolute, childSegment, encodedVariant, joinChild, normalizePath, removeLeadingSlash, routeKey, staysUnderParent } from './paths'
import type { Rule, Rules } from './rules'

export interface RouteI18nMeta {
  /** Base route name of the page (its translation key and the name `localeRoute({ name })` takes). */
  name: string
  /** Locales this record serves. */
  locales: string[]
  /** `disableMeta` of the page: SEO tags off in every locale (`true`) or in the listed ones. */
  noMeta?: boolean | string[]
}

export interface GenerateOptions {
  strategy: Strategies
  locales: string[]
  defaultLocale: string
  rules: Rules
  namePrefix: string
  customRegex?: string | RegExp
  excludePatterns?: (string | RegExp)[]
  apiBaseUrl?: string
  noPrefixRedirect: boolean
  /**
   * Under prefix_except_default / prefix_and_default: locales that are the default of a domain in
   * the same build. They get unprefixed records too, and prefix_except_default keeps every prefix
   * (the default of one domain is a link target of the others, and the build default of an unknown host).
   */
  hostDefaults?: string[]
}

interface PageInfo {
  /** Full original path. */
  original: string
  key: string
  rule: Rule | undefined
  allowed: string[] | undefined
  noMeta: boolean | string[] | undefined
}

interface Variant {
  page: NuxtPage
  path: string
  children: Variant[]
  /** Unlocalized page kept as written (only in the unprefixed tree). */
  raw?: true
}

const paramNames = (routePath: string): string =>
  Array.from(routePath.matchAll(/:(\w+)/g), (m) => m[1])
    .sort()
    .join(',')

/** What Nuxt adds for a `routeRules` redirect with no page. An unnamed page of a module is a page. */
const isRouteRuleStub = (page: NuxtPage): boolean => !page.name && /(?:^|\/)component-stub(?:\.\w+)?$/.test(page.file ?? '')

/** The name Nuxt's scanner would give the path: `/a/:id()` -> `a-id`. */
export function nameOfPath(fullPath: string): string {
  const key = routeKey(fullPath)
  return key === '/' ? 'index' : key.replace(/\/|:|\(.*?\)|[?*+]/g, (s) => (s === '/' ? '-' : ''))
}

/**
 * Records are addressed by name, so a module's unnamed page gets one (or `switchLocaleRoute` and
 * `pageLocales` cannot reach it). Not the route-rule stub, a redirect, or a parent whose index child
 * owns the name. A name already taken stays with its page.
 */
function namePages(pages: NuxtPage[], taken: Set<string>, parentOriginal = '', top = true): NuxtPage[] {
  return pages.map((page) => {
    const original = top ? absolute(page.path ?? '') : joinChild(parentOriginal, page.path ?? '')
    const children = page.children && namePages(page.children, taken, original, false)
    const named = children ? { ...page, children } : page
    if (page.name || !page.file || isRouteRuleStub(page) || page.children?.some((child) => !child.path)) return named
    const name = nameOfPath(original)
    if (taken.has(name)) return named
    taken.add(name)
    return { ...named, name }
  })
}

const pageNames = (pages: NuxtPage[]): string[] => pages.flatMap((p) => [...(p.name ? [p.name] : []), ...pageNames(p.children ?? [])])

/** Localized full paths (without prefix) by page key and locale, for nitro lookups. */
export type LocalizedPaths = Map<string, Record<string, string>>

export function generateRoutes(pages: NuxtPage[], options: GenerateOptions, localizedPaths: LocalizedPaths = new Map()): NuxtPage[] {
  const { strategy, locales, defaultLocale, rules, namePrefix, hostDefaults = [] } = options
  const regex = options.customRegex === undefined ? undefined : String(options.customRegex).replace(/^\/(.*)\/$/, '$1')
  const localePath = (codes: string[], routePath: string) => normalizePath(`/:locale(${regex ?? codes.join('|')})/${removeLeadingSlash(routePath)}`)

  /** What a page's rules say, worked out once per page: every locale's tree reads it. */
  const infos = new WeakMap<NuxtPage, PageInfo>()
  function info(page: NuxtPage, parentOriginal: string, top: boolean): PageInfo {
    let found = infos.get(page)
    if (!found) {
      const original = top ? absolute(page.path ?? '') : joinChild(parentOriginal, page.path ?? '')
      found = {
        original,
        key: routeKey(original),
        rule: rules.get(original, page.name),
        allowed: rules.allowedLocales(original, page.name),
        noMeta: rules.disableMeta(original, page.name),
      }
      infos.set(page, found)
    }
    return found
  }

  /** An unlocalized page as written: it has no meta.i18n, so its disableMeta rides on `meta.i18nNoMeta`. */
  function unlocalized(page: NuxtPage): NuxtPage {
    const noMeta = infos.get(page)?.noMeta
    return noMeta === undefined ? page : { ...page, meta: { ...page.meta, i18nNoMeta: noMeta } }
  }

  const warned = new Set<string>()
  function warnNested(key: string, locale: string, custom: string, parent: string, served: string) {
    if (warned.has(`${key}\0${locale}`)) return
    warned.add(`${key}\0${locale}`)
    console.warn(`[i18n] globalLocaleRoutes["${key}"].${locale} = "${custom}" is outside its parent "${parent}": the page is served at "${served}".`)
  }

  function localize(
    page: NuxtPage,
    locale: string | null,
    parentOriginal: string,
    parentLocalized: string,
    top: boolean,
    keepUnlocalized: boolean,
  ): Variant | null {
    const pagePath = page.path ?? ''
    const { original, key, rule, allowed } = info(page, parentOriginal, top)
    if (rule === false) return keepUnlocalized ? { page, path: pagePath, children: [], raw: true } : null
    if (locale && allowed && !allowed.includes(locale)) return null

    const custom = locale && rule ? rule[locale] : undefined
    const routePath = custom === undefined ? pagePath : top ? absolute(custom) : childSegment(parentLocalized, custom)
    const localized = top ? absolute(routePath) : joinChild(parentLocalized, routePath)
    if (custom !== undefined && !top && !staysUnderParent(parentLocalized, custom)) warnNested(key, locale!, custom, parentLocalized, localized)
    if (locale) {
      const entry = localizedPaths.get(key)
      if (entry) entry[locale] = localized
      else localizedPaths.set(key, { [locale]: localized })
    }
    const children: Variant[] = []
    for (const child of page.children ?? []) {
      const variant = localize(child, locale, original, localized, false, keepUnlocalized)
      if (variant) children.push(variant)
    }
    return { page, path: routePath, children }
  }

  const signature = (v: Variant): string => (v.raw ? '!' : `${v.path}(${v.children.map(signature).join(',')})`)

  function emit(v: Variant, codes: string[], suffix: string, rename: boolean, prefixed: boolean, top: boolean, declaredAliases = true): NuxtPage {
    if (v.raw) return unlocalized(v.page)
    const { page } = v
    const routePath = top ? (prefixed ? localePath(codes, v.path) : absolute(v.path)) : v.path
    const route: NuxtPage = { ...page, path: routePath }
    if (page.name) {
      route.name = rename ? `${namePrefix}${page.name}${suffix}` : page.name
      const noMeta = infos.get(page)?.noMeta
      route.meta = { ...page.meta, i18n: { name: page.name, locales: codes, ...(noMeta === undefined ? {} : { noMeta }) } satisfies RouteI18nMeta }
    }
    if (page.children) route.children = v.children.map((child) => emit(child, codes, suffix, rename, prefixed, false))
    if (top) {
      const aliases = topAliases(declaredAliases ? page : { path: page.path }, routePath, prefixed ? codes : null)
      route.alias = aliases
      route.meta = { ...route.meta, alias: aliases }
    }
    return route
  }

  /** Declared aliases localized like the record path, plus percent-encoded variants of non-ASCII paths. */
  function topAliases(page: NuxtPage, routePath: string, codes: string[] | null): string[] {
    const declared = page.alias ?? page.meta?.alias
    const list = (typeof declared === 'string' ? [declared] : Array.isArray(declared) ? declared : []).filter(
      (a): a is string => typeof a === 'string',
    )
    const aliases = new Set<string>()
    for (const alias of [routePath, ...list.map((a) => (codes ? localePath(codes, a) : absolute(a)))]) {
      if (alias !== routePath) aliases.add(alias)
      const encoded = encodedVariant(alias)
      if (encoded) aliases.add(encoded)
    }
    return [...aliases]
  }

  /** Records of `page` for `codes`: one shared record for plain locales, one per locale with its own tree. */
  function localeRecords(
    page: NuxtPage,
    codes: string[],
    prefixed: boolean,
    variants: Map<string, Variant | null>,
  ): { plain: string[]; records: NuxtPage[] } {
    const plainSignature = signature(localize(page, null, '', '', true, false)!)
    const plain: string[] = []
    let plainVariant: Variant | undefined
    const own: NuxtPage[] = []
    for (const code of codes) {
      const variant = variants.get(code)
      if (!variant) continue
      if (signature(variant) === plainSignature) {
        plain.push(code)
        plainVariant ??= variant
      } else {
        // unprefixed (no_prefix) copies leave the declared aliases to the base page, which serves them
        own.push(emit(variant, [code], `-${code}`, true, prefixed, true, prefixed))
      }
    }
    const records = plainVariant && prefixed ? [emit(plainVariant, plain, '', true, true, true), ...own] : own
    return { plain, records }
  }

  /** Locales of a page served unprefixed, one group per distinct tree, the build default's first. */
  function unprefixedGroups(variants: Map<string, Variant | null>): string[][] {
    const groups = new Map<string, string[]>()
    for (const code of [defaultLocale, ...hostDefaults]) {
      const variant = variants.get(code)
      if (!variant) continue
      const key = signature(variant)
      groups.set(key, [...(groups.get(key) ?? []), code])
    }
    return [...groups.values()]
  }

  const unprefixed: NuxtPage[] = []
  const localized: NuxtPage[] = []
  for (const page of namePages(pages, new Set(pageNames(pages)))) {
    const pagePath = page.path ?? ''
    if (
      (page.redirect && !page.file) ||
      isInternalPath(pagePath, options.excludePatterns, options.apiBaseUrl) ||
      info(page, '', true).rule === false
    ) {
      unprefixed.push(unlocalized(page))
      continue
    }
    if (isRouteRuleStub(page)) {
      // marked: the runtime cannot tell it from a module's unnamed page by the record alone
      unprefixed.push({ ...page, meta: { ...page.meta, i18nStub: true } })
      continue
    }
    const allowed = info(page, '', true).allowed ?? locales
    const defaultAllowed = allowed.includes(defaultLocale)
    const variants = new Map(allowed.map((code) => [code, localize(page, code, '', '', true, false)]))

    if (strategy === 'no_prefix') {
      const { plain, records } = localeRecords(page, allowed, false, variants)
      const base = emit(localize(page, null, '', '', true, true)!, plain, '', false, false, true)
      const defaultRecord = records.find((r) => (r.meta?.i18n as RouteI18nMeta | undefined)?.locales[0] === defaultLocale)
      // a string redirect cannot carry params: dynamic pages are left to the router
      if (options.noPrefixRedirect && defaultRecord && defaultRecord.path !== base.path && !defaultRecord.path.includes(':'))
        base.redirect = defaultRecord.path
      unprefixed.push(base)
      localized.push(...records)
      continue
    }

    if (strategy !== 'prefix')
      for (const group of unprefixedGroups(variants)) {
        const own = group[0] === defaultLocale
        const record = emit(localize(page, group[0]!, '', '', true, true)!, group, own ? '' : `-${group[0]}-default`, !own, false, true, own)
        // prefix_except_default: the original URL of a page with a custom default path still finds the
        // page, so the redirect middleware can send it to the custom one (`/product` -> `/our-products`)
        const original = absolute(pagePath)
        if (own && strategy === 'prefix_except_default' && record.path !== original && paramNames(record.path) === paramNames(original)) {
          record.alias = [...(record.alias ?? []), original, ...[encodedVariant(original) ?? []].flat()]
          record.meta = { ...record.meta, alias: record.alias }
        }
        unprefixed.push(record)
      }
    const codes = strategy === 'prefix_except_default' && !hostDefaults.length ? allowed.filter((code) => code !== defaultLocale) : allowed
    localized.push(...localeRecords(page, codes, true, variants).records)

    if (strategy === 'prefix' && defaultAllowed && page.name && !pagePath.includes(':')) {
      // the unprefixed original URL of a page with a custom default path goes to that path; its
      // meta lets the runtime find the page from that URL in any locale (no locale is served here)
      const target = absolute(variants.get(defaultLocale)!.path)
      if (target !== absolute(pagePath) && !target.includes(':'))
        unprefixed.push({
          path: absolute(pagePath),
          name: `redirect-${page.name}`,
          redirect: `/${defaultLocale}${target === '/' ? '' : target}`,
          meta: { i18n: { name: page.name, locales: [] } satisfies RouteI18nMeta },
        })
    }
  }
  return [...unprefixed, ...localized]
}
