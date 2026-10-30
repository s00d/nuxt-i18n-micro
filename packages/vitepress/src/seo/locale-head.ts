import type { Locale } from '@i18n-micro/types'
import { buildLocaleHead, filterQuery } from '@i18n-micro/utils/locale-head'
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

  const switchLocalePath = createI18nRoutingFromAdapter({
    defaultLocale,
    localeCodes: locales.map((l) => l.code),
    localeKeyToCode,
    base,
  })
  const filteredPath = filterQuery(path, canonicalQueryWhitelist)
  const absoluteOf = (localeKey: string): string => joinAbsolute(metaBaseUrl ?? '', base, switchLocalePath({}, { path: filteredPath }, localeKey))
  const keyOfCode = (code: string, rootKey: string): string => {
    if (code === defaultLocale) return 'root'
    const entry = Object.entries(localeKeyToCode).find(([, mapped]) => mapped === code)
    if (!entry) return code
    return entry[0] === 'root' ? rootKey : entry[0]
  }
  const seoLocales = locales.filter((loc) => !loc.disabled && loc.seo !== false)

  const { htmlAttrs, link, meta } = buildLocaleHead({
    locale: currentLocale,
    seoLocales,
    hrefOf: (code) => absoluteOf(keyOfCode(code, code)),
    canonical: absoluteOf(keyOfCode(locale, 'root')),
    xDefault: seoLocales.some((loc) => loc.code === defaultLocale) ? absoluteOf('root') : undefined,
    addDirAttribute,
    addSeoAttributes: addSeoAttributes && Boolean(metaBaseUrl),
    identifierAttribute,
    hreflangBaseLanguage,
    missingWarn,
  })

  if (link.length === 0) return { htmlAttrs, head: [] }
  const [canonical, ...alternates] = link
  const tuples = (tag: string, tags: object[]) => tags.map((attrs): VitePressHeadTuple => [tag, attrs as Record<string, string>])
  return { htmlAttrs, head: [...tuples('link', [canonical!]), ...tuples('meta', meta), ...tuples('link', alternates)] }
}
