import type { Locale } from '@i18n-micro/types'
import { trimTrailingSlashes } from './app-path'
import { resolveHreflangAlternates } from './resolve-hreflang'
import { resolveOgLocale, warnUnresolvedOgLocale } from './resolve-og-locale'

export interface LocaleHeadCanonicalLink {
  [key: string]: string | undefined
  rel: 'canonical'
  href: string
}

export interface LocaleHeadAlternateLink {
  [key: string]: string | undefined
  rel: 'alternate'
  href: string
  hreflang: string
}

/** One type per `rel`, as in unhead: its `useHead` takes no link with a plain `rel: string`. */
export type LocaleHeadLink = LocaleHeadCanonicalLink | LocaleHeadAlternateLink

export interface LocaleHeadMeta {
  [key: string]: string
  property: string
  content: string
}

export interface LocaleHeadAttrs {
  [key: string]: string | undefined
  lang?: string
  dir?: 'ltr' | 'rtl' | 'auto'
}

export interface LocaleHead {
  htmlAttrs: LocaleHeadAttrs
  link: LocaleHeadLink[]
  meta: LocaleHeadMeta[]
}

export interface LocaleHeadInput {
  /** The current locale. */
  locale: Locale
  /** Locales listed in `hreflang` and `og:locale:alternate`. Their filtering is the caller's: it alone knows the page. */
  seoLocales: Locale[]
  /** URL of the page in `code`, `''` for none. */
  hrefOf(code: string): string
  /** `canonical` and `og:url`. */
  canonical: string
  /** The `x-default` URL, when the page has one. */
  xDefault?: string
  /** `false` for one URL per page (`no_prefix`): `og:locale:alternate` stays, `hreflang` and `x-default` go. */
  alternates?: boolean
  addDirAttribute?: boolean
  /** `false` keeps `htmlAttrs` only. */
  addSeoAttributes?: boolean
  identifierAttribute?: string
  hreflangBaseLanguage?: boolean
  missingWarn?: boolean
}

/** Keeps the `whitelist` query params of a path or URL and drops its hash. */
export function filterQuery(url: string, whitelist: readonly string[]): string {
  const cut = url.search(/[?#]/)
  if (cut === -1) return url
  const pathname = url.slice(0, cut) || '/'
  const hash = url.indexOf('#', cut)
  const params = new URLSearchParams(url.slice(cut, hash === -1 ? undefined : hash))
  const kept = new URLSearchParams()
  for (const key of whitelist) {
    if (params.has(key)) kept.set(key, params.get(key)!)
  }
  const query = kept.toString()
  return query ? `${pathname}?${query}` : pathname
}

/** `?a=1&a=2` of a route's query: arrays repeat the key, `null` is a key with no value, `undefined` is left out. */
export function queryString(query?: object | null): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    for (const item of [value].flat()) {
      if (item !== undefined) params.append(key, item === null ? '' : String(item))
    }
  }
  const serialized = params.toString()
  return serialized && `?${serialized}`
}

/**
 * `base` + `path` with one slash between them: `'/'` + `/de` or `//de` is `/de`, never the protocol-relative
 * `//de`. A browser reads `\` as `/` and drops a tab or a newline, so `/\host` is that form as well.
 */
export function joinBase(base: string, path: string): string {
  let start = 0
  for (; start < path.length; start++) {
    const c = path.charCodeAt(start)
    if (c !== 47 && c !== 92 && c !== 9 && c !== 10 && c !== 13) break
  }
  return `${trimTrailingSlashes(base)}/${path.slice(start)}`
}

/** The script subtag of a language tag: it decides over the language (`az-Arab` is RTL, `ar-Latn` is not). It follows the language and any extlangs, so the `arab` of an extension (`en-u-arab`) is none. */
const SCRIPT_SUBTAG = /^[a-z]{2,8}(?:[-_][a-z]{3})*[-_]([a-z]{4})(?=[-_]|$)/i
const RTL_SCRIPT = /^(?:adlm|arab|hebr|mand|nkoo|rohg|samr|syrc|thaa)$/i
/** Languages written right to left in their default script. */
const RTL_LANGUAGE =
  /^(?:acm|aeb|afb|apc|apd|ar|arc|arq|ars|ary|arz|ayl|ayn|ayp|azb|bal|bgn|bqi|ckb|dv|fa|glk|haz|hbo|he|iw|ji|khw|ks|lrc|mzn|nqo|pnb|prs|ps|rhg|sam|sd|sdh|shu|skr|syc|syr|ug|ur|yi)(?:[-_]|$)/i

function isRtlTag(tag: string): boolean {
  const script = SCRIPT_SUBTAG.exec(tag)?.[1]
  return script ? RTL_SCRIPT.test(script) : RTL_LANGUAGE.test(tag)
}

/**
 * The configured `dir`, or `rtl` for a language known to need it. Nothing else: a browser's default is `ltr`, and
 * `dir="auto"` on `<html>` makes its parser look for a strong character, which goes superlinear on a large page.
 */
function localeDir(locale: Locale): LocaleHeadAttrs['dir'] {
  return locale.dir || (isRtlTag(locale.iso || locale.code) ? 'rtl' : undefined)
}

/**
 * The SEO head of a page: `lang`/`dir`, canonical, `hreflang`, `x-default` and the `og:` tags.
 * Pure: every adapter says what its router knows and all of them emit the same tags.
 */
export function buildLocaleHead(input: LocaleHeadInput): LocaleHead {
  const { locale, seoLocales, hrefOf, canonical, xDefault, alternates = true, addDirAttribute = true, addSeoAttributes = true } = input
  const { identifierAttribute: id = 'id', hreflangBaseLanguage = false, missingWarn = true } = input
  const htmlAttrs: LocaleHeadAttrs = { lang: locale.iso || locale.code }
  const dir = addDirAttribute ? localeDir(locale) : undefined
  if (dir) htmlAttrs.dir = dir
  if (!addSeoAttributes) return { htmlAttrs, link: [], meta: [] }

  const meta: LocaleHeadMeta[] = []
  const og = resolveOgLocale(locale)
  if (og) meta.push({ [id]: 'i18n-og', property: 'og:locale', content: og })
  else warnUnresolvedOgLocale(locale, { missingWarn, tag: 'og:locale' })
  meta.push({ [id]: 'i18n-og-url', property: 'og:url', content: canonical })

  for (const other of seoLocales) {
    if (other.code === locale.code) continue
    const ogAlternate = resolveOgLocale(other)
    if (ogAlternate) meta.push({ [id]: `i18n-og-alt-${ogAlternate}`, property: 'og:locale:alternate', content: ogAlternate })
    else warnUnresolvedOgLocale(other, { missingWarn, tag: 'og:locale:alternate' })
  }

  const link: LocaleHeadLink[] = [{ [id]: 'i18n-can', rel: 'canonical', href: canonical }]
  if (alternates) {
    for (const { hreflang, localeCode } of resolveHreflangAlternates(seoLocales, { hreflangBaseLanguage })) {
      const href = hrefOf(localeCode)
      if (href) link.push({ [id]: `i18n-alternate-${hreflang}`, rel: 'alternate', href, hreflang })
    }
  }
  if (alternates && xDefault) link.push({ [id]: 'i18n-xd', rel: 'alternate', href: xDefault, hreflang: 'x-default' })
  return { htmlAttrs, link, meta }
}
