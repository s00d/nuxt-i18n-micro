import type { Locale } from '@i18n-micro/types'
import { resolveHreflangAlternates } from '@i18n-micro/utils/resolve-hreflang'
import { resolveOgLocale, warnUnresolvedOgLocale } from '@i18n-micro/utils/resolve-og-locale'
import { createI18nRoutingFromAdapter } from '../router/i18n-routing'
import { getLocaleFromPath, stripSiteBase } from '../router/adapter'

/** VitePress `HeadConfig` tuple (tag + attrs). */
export type VitePressHeadTuple = [string, Record<string, string>]

export interface VitePressLocaleHeadObject {
  htmlAttrs: {
    lang?: string
    dir?: 'ltr' | 'rtl' | 'auto'
  }
  /** Ready for `transformHead` / `frontmatter.head`. */
  head: VitePressHeadTuple[]
}

export interface BuildVitePressLocaleHeadOptions {
  /**
   * Current page path (with or without `site.base`). Query/hash optional.
   * Example: `/docs/fr/guide/` or `/fr/guide`.
   */
  path: string
  locales: Locale[]
  defaultLocale: string
  localeKeyToCode?: Record<string, string>
  /** VitePress `site.base` (e.g. `/docs/`). */
  base?: string
  /**
   * Public site origin **without** trailing slash (e.g. `https://example.com`).
   * Required for absolute `canonical` / `hreflang` / `og:url`.
   * When omitted, only `htmlAttrs` are produced.
   */
  metaBaseUrl?: string
  /** @default false — same as Nuxt / Vue `useLocaleHead`. */
  hreflangBaseLanguage?: boolean
  /** Query keys kept on canonical / alternate URLs. @default [] */
  canonicalQueryWhitelist?: string[]
  /** @default true */
  addDirAttribute?: boolean
  /** @default true */
  addSeoAttributes?: boolean
  /** @default 'id' */
  identifierAttribute?: string
  missingWarn?: boolean
}

function filterQuery(fullPath: string, whitelist: string[]): string {
  const hashIndex = fullPath.indexOf('#')
  const queryIndex = fullPath.indexOf('?')
  let cut = fullPath.length
  if (hashIndex >= 0) cut = Math.min(cut, hashIndex)
  if (queryIndex >= 0) cut = Math.min(cut, queryIndex)
  const pathname = fullPath.slice(0, cut) || '/'
  if (queryIndex < 0 || whitelist.length === 0) return pathname

  const params = new URLSearchParams(fullPath.slice(queryIndex, hashIndex >= 0 ? hashIndex : undefined))
  const filtered = new URLSearchParams()
  for (const key of whitelist) {
    if (params.has(key)) filtered.set(key, params.get(key)!)
  }
  const q = filtered.toString()
  return q ? `${pathname}?${q}` : pathname
}

function joinAbsolute(metaBaseUrl: string, siteBase: string | undefined, path: string): string {
  const origin = metaBaseUrl.replace(/\/$/, '')
  const base = !siteBase || siteBase === '/' ? '' : siteBase.replace(/\/$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${origin}${base}${p}`
}

/**
 * Convert VitePress `pageData.relativePath` to a route path (cleanUrls-style).
 */
export function relativePathToRoutePath(relativePath: string): string {
  let path = relativePath.replace(/\\/g, '/')
  path = path.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
  if (!path.startsWith('/')) path = `/${path}`
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1)
  return path || '/'
}

/**
 * Build i18n SEO head for VitePress — same tags as Nuxt `useLocaleHead` /
 * plugin `02.meta` (canonical, hreflang, x-default, og:locale / og:url / alternates).
 *
 * Framework-agnostic pure function; wired automatically by `withI18n` when `meta` is on.
 */
export function buildVitePressLocaleHead(options: BuildVitePressLocaleHeadOptions): VitePressLocaleHeadObject {
  const {
    locales,
    defaultLocale,
    localeKeyToCode = {},
    base,
    metaBaseUrl,
    hreflangBaseLanguage = false,
    canonicalQueryWhitelist = [],
    addDirAttribute = true,
    addSeoAttributes = true,
    identifierAttribute = 'id',
    missingWarn = true,
  } = options

  const path = stripSiteBase(options.path, base)
  const locale = getLocaleFromPath(
    path,
    locales.map((l) => l.code),
    defaultLocale,
    localeKeyToCode,
    undefined,
  )
  const currentLocale = locales.find((l) => l.code === locale)
  if (!currentLocale) {
    return { htmlAttrs: {}, head: [] }
  }

  const currentIso = currentLocale.iso || locale
  const currentDir = (currentLocale.dir || 'auto') as 'ltr' | 'rtl' | 'auto'
  const htmlAttrs: VitePressLocaleHeadObject['htmlAttrs'] = {
    lang: currentIso,
    ...(addDirAttribute ? { dir: currentDir } : {}),
  }

  if (!addSeoAttributes || !metaBaseUrl) {
    return { htmlAttrs, head: [] }
  }

  const switchLocalePath = createI18nRoutingFromAdapter({
    defaultLocale,
    localeCodes: locales.map((l) => l.code),
    localeKeyToCode,
    base,
  })

  const filteredPath = filterQuery(path, canonicalQueryWhitelist)
  // VitePress locale keys for i18nRouting: root vs code
  const currentVpKey =
    locale === defaultLocale
      ? 'root'
      : (() => {
          for (const [key, code] of Object.entries(localeKeyToCode)) {
            if (code === locale) return key === 'root' ? 'root' : key
          }
          return locale
        })()
  const canonicalPath = switchLocalePath({}, { path: filteredPath }, currentVpKey)
  const ogUrl = joinAbsolute(metaBaseUrl, base, canonicalPath)

  const localesForSeo = locales.filter((loc) => !loc.disabled && loc.seo !== false)
  const currentOg = resolveOgLocale(currentLocale)
  if (!currentOg) {
    warnUnresolvedOgLocale(currentLocale, { missingWarn, tag: 'og:locale' })
  }

  const head: VitePressHeadTuple[] = []

  head.push(['link', { [identifierAttribute]: 'i18n-can', rel: 'canonical', href: ogUrl }])

  if (currentOg) {
    head.push(['meta', { [identifierAttribute]: 'i18n-og', property: 'og:locale', content: currentOg }])
  }
  head.push(['meta', { [identifierAttribute]: 'i18n-og-url', property: 'og:url', content: ogUrl }])

  for (const loc of localesForSeo) {
    if (loc.code === locale) continue
    const ogAlt = resolveOgLocale(loc)
    if (!ogAlt) {
      warnUnresolvedOgLocale(loc, { missingWarn, tag: 'og:locale:alternate' })
      continue
    }
    head.push(['meta', { [identifierAttribute]: `i18n-og-alt-${ogAlt}`, property: 'og:locale:alternate', content: ogAlt }])
  }

  const hrefByCode = new Map<string, string>()
  for (const loc of localesForSeo) {
    const vpKey =
      loc.code === defaultLocale
        ? 'root'
        : (() => {
            for (const [key, code] of Object.entries(localeKeyToCode)) {
              if (code === loc.code) return key === 'root' ? loc.code : key
            }
            return loc.code
          })()
    const switched = switchLocalePath({}, { path: filteredPath }, vpKey)
    if (!switched) continue
    hrefByCode.set(String(loc.code), joinAbsolute(metaBaseUrl, base, switched))
  }

  for (const { hreflang, localeCode } of resolveHreflangAlternates(localesForSeo, { hreflangBaseLanguage })) {
    const href = hrefByCode.get(localeCode)
    if (!href) continue
    head.push(['link', { [identifierAttribute]: `i18n-alternate-${hreflang}`, rel: 'alternate', href, hreflang }])
  }

  const defaultLocaleObj = locales.find((l) => l.code === defaultLocale)
  if (defaultLocaleObj && defaultLocaleObj.seo !== false) {
    const xHref = hrefByCode.get(defaultLocale)
    if (xHref) {
      head.push(['link', { [identifierAttribute]: 'i18n-xd', rel: 'alternate', href: xHref, hreflang: 'x-default' }])
    }
  }

  return { htmlAttrs, head }
}
