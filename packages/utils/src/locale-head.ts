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

/** Where a URL's path ends. As in `@i18n-micro/core`, which utils does not depend on. */
function pathEnd(url: string): number {
  const query = url.indexOf('?')
  const hash = url.indexOf('#')
  return query === -1 ? hash : hash === -1 || query < hash ? query : hash
}

/** Keeps the `whitelist` query params of a path or URL and drops its hash. */
export function filterQuery(url: string, whitelist: readonly string[]): string {
  const cut = pathEnd(url)
  if (cut === -1) return url
  const pathname = url.slice(0, cut) || '/'
  const hash = url.indexOf('#', cut)
  const search = url.slice(cut + 1, hash === -1 ? undefined : hash)
  const found = new Map<string, string[]>()
  for (const pair of search.split('&')) {
    const [entry] = new URLSearchParams(pair)
    if (!entry || !whitelist.includes(entry[0])) continue
    const text = new URLSearchParams([entry]).toString()
    const kept = pair.includes('=') ? text : text.slice(0, -1)
    const list = found.get(entry[0])
    if (list) list.push(kept)
    else found.set(entry[0], [kept])
  }
  const query = [...new Set(whitelist)].flatMap((key) => found.get(key) ?? []).join('&')
  return query ? `${pathname}?${query}` : pathname
}

/** `?a=1&a=2` of a route's query: arrays repeat the key, `null` is a key with no value, `undefined` is left out. */
export function queryString(query?: object | null): string {
  const pairs: string[] = []
  for (const [key, value] of Object.entries(query ?? {})) {
    for (const item of [value].flat()) {
      if (item === undefined) continue
      const pair = new URLSearchParams([[key, item === null ? '' : String(item)]]).toString()
      pairs.push(item === null ? pair.slice(0, -1) : pair)
    }
  }
  return pairs.length ? `?${pairs.join('&')}` : ''
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

/** The scripts written right to left. */
const RTL_SCRIPTS = new Set(
  'Adlm Arab Armi Avst Chrs Cprt Elym Hatr Hebr Hung Khar Lydi Mand Mani Mend Merc Mero Narb Nbat Nkoo Orkh Ougr Palm Phli Phlp Phnx Prti Rohg Samr Sarb Sogd Sogo Syrc Thaa Yezi'.split(
    ' ',
  ),
)

/**
 * The likely script of a tag decides, which no table of languages can do: `az-IR` is Arabic and `az` Latin,
 * `sd-IN` is Devanagari, and an extension (`ar-u-nu-latn`) names no script. A tag `Intl` refuses is `ltr`, as a browser's default.
 */
function readsRtl(tag: string): boolean {
  const [language, ...rest] = tag.split('_').join('-').split('-')
  // `Intl` refuses an extlang (`ar-aao`), and three letters after the language are nothing else
  while (rest[0]?.length === 3 && Number.isNaN(Number(rest[0]))) rest.shift()
  try {
    return RTL_SCRIPTS.has(new Intl.Locale([language, ...rest].join('-')).maximize().script ?? '')
  } catch {
    return false
  }
}

/** By tag. A tag is the `iso` or `code` of a configured locale, never request input, so this holds one entry per locale and cannot grow. */
const rtlByTag = new Map<string, boolean>()

function isRtlTag(tag: string): boolean {
  let rtl = rtlByTag.get(tag)
  if (rtl === undefined) rtlByTag.set(tag, (rtl = readsRtl(tag)))
  return rtl
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
