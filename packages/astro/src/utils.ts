import { getByPath, interpolate, resolveText, setTranslationAtKey, type ResolveTextOptions } from '@i18n-micro/core'
import type { CleanTranslation, Locale, Params, TranslationKey, Translations } from '@i18n-micro/types'
import { getEnabledLocaleCodes, getEnabledLocales } from '@i18n-micro/utils/active-locales'
import { withoutAppBaseURL } from '@i18n-micro/utils/app-path'
import { buildLocaleHead, joinBase, type LocaleHead } from '@i18n-micro/utils/locale-head'
import type { AstroGlobal } from 'astro'
import type { AstroI18n } from './composer'
import { localizeHref, withBase, type HrefContext } from './request'
import { createAstroRouterAdapter } from './router/adapter'
import './env.d'

/** The subset of `AstroGlobal` the helpers read. */
type Astro = Pick<AstroGlobal, 'locals' | 'url'> & Partial<Pick<AstroGlobal, 'params' | 'site'>>

/**
 * Get i18n instance from Astro context
 */
export function getI18n(astro: Pick<AstroGlobal, 'locals'>): AstroI18n {
  const i18n = astro.locals.i18n
  if (!i18n) {
    throw new Error('i18n instance not found. Make sure i18n middleware is configured.')
  }
  // @ts-ignore private property mismatch between src and dist types
  return i18n
}

/**
 * Get current locale from Astro context
 */
export function getLocale(astro: Pick<AstroGlobal, 'locals'>): string {
  return astro.locals.locale ?? getI18n(astro).getLocale()
}

/**
 * Get default locale from Astro context
 */
export function getDefaultLocale(astro: Pick<AstroGlobal, 'locals'>): string {
  return astro.locals.defaultLocale ?? getI18n(astro).getFallbackLocale()
}

/**
 * Get all locales from Astro context
 */
export function getLocales(astro: Pick<AstroGlobal, 'locals'>): Locale[] {
  return astro.locals.locales || []
}

/** How this request builds URLs. Without the middleware's strategy, the default one. */
function hrefContext(astro: Astro): HrefContext & { path: string } {
  const { locals } = astro
  const base = locals.i18nBase ?? ''
  const defaultLocale = getDefaultLocale(astro)
  const locales = getLocales(astro)
  return {
    base,
    defaultLocale,
    codes: getEnabledLocaleCodes(locales),
    strategy: locals.routingStrategy ?? createAstroRouterAdapter(locales, defaultLocale),
    path: withoutAppBaseURL((locals.currentUrl ?? astro.url).pathname, base),
  }
}

/**
 * Use i18n in Astro pages/components
 * Returns helper functions for translations
 */
export function useI18n(astro: Astro) {
  const i18n = getI18n(astro)
  const locale = getLocale(astro)
  const defaultLocale = getDefaultLocale(astro)
  const locales = getLocales(astro)
  const links = hrefContext(astro)
  const { strategy, codes, base, path: currentPath } = links
  const bare = (path: string) => withoutAppBaseURL(path, base)

  return {
    // Current locale
    locale,
    defaultLocale,
    locales,

    // Translation methods
    t: (key: TranslationKey, params?: Params, defaultValue?: string | null, routeName?: string): CleanTranslation => {
      return i18n.t(key, params, defaultValue, routeName)
    },
    ts: (key: TranslationKey, params?: Params, defaultValue?: string, routeName?: string): string => {
      return i18n.ts(key, params, defaultValue, routeName)
    },
    tc: (key: TranslationKey, count: number | Params, defaultValue?: string): string => {
      return i18n.tc(key, count, defaultValue)
    },
    tn: i18n.tn.bind(i18n),
    td: i18n.td.bind(i18n),
    tdr: i18n.tdr.bind(i18n),
    has: (key: TranslationKey, routeName?: string): boolean => {
      return i18n.has(key, routeName)
    },

    // Route management
    getRoute: (): string => {
      return i18n.getRoute()
    },
    getRouteName: (path?: string): string => (path === undefined ? i18n.getRoute() : strategy.getRouteName!(bare(path), codes)),
    getLocaleFromPath: (path?: string): string => strategy.getLocaleFromPath!(path === undefined ? currentPath : bare(path), defaultLocale, codes),

    // Path utilities: URLs of the site, `base` included
    switchLocalePath: (newLocale: string): string => withBase(strategy.switchLocalePath!(currentPath, newLocale, codes, defaultLocale), base),
    localizePath: (path: string, targetLocale?: string): string => localizeHref(path, targetLocale || locale, links),

    // Get i18n instance
    getI18n: (): AstroI18n => {
      return i18n
    },

    // Path of a URL without locale and `base`: what `Astro.rewrite` takes
    getBasePath: (url?: URL): string => strategy.removeLocaleFromPath!(url ? bare(url.pathname) : currentPath, codes),

    // Translation management
    addTranslations: (locale: string, translations: Record<string, unknown>, merge: boolean = true): void => {
      i18n.addTranslations(locale, translations, merge)
    },
    addRouteTranslations: (locale: string, routeName: string, translations: Record<string, unknown>, merge: boolean = true): void => {
      i18n.addRouteTranslations(locale, routeName, translations, merge)
    },
    mergeTranslations: (locale: string, routeName: string, translations: Record<string, unknown>): void => {
      i18n.mergeTranslations(locale, routeName, translations)
    },
    clearCache: (): void => {
      i18n.clearCache()
    },
  }
}

/** `href` of an `<I18nLink>`: relative to the page, in `locale` (default the current one). */
export function resolveLinkHref(astro: Astro, href: string, locale?: string): string {
  const links = hrefContext(astro)
  return localizeHref(href, locale || getLocale(astro), { ...links, from: links.path })
}

export interface I18nTProps extends ResolveTextOptions {
  defaultValue?: string
}

/** The text of an `<I18nT>`, `null` when `hideIfEmpty` hides it. With `html`, params arrive escaped; the translation is trusted. */
export function resolveI18nT(astro: Astro, props: I18nTProps): string | null {
  const i18n = getI18n(astro)
  const { defaultValue } = props
  // `t` with the default for `resolveText`, every other member from the instance
  const host = defaultValue
    ? (Object.create(i18n, { t: { value: (key: string, params?: Params) => i18n.t(key, params, defaultValue) } }) as AstroI18n)
    : i18n
  const text = resolveText(host, props)
  return text && interpolate(text.template, text.params)
}

/**
 * Strip locale prefix from the current URL for `Astro.rewrite()` on `/[locale]/*` routes.
 */
export function getLocaleRewritePath(astro: AstroGlobal): string {
  return useI18n(astro).getBasePath(astro.locals.currentUrl ?? astro.url)
}

/**
 * Validate `:locale`, sync i18n/locals, and return the base path for `Astro.rewrite()`.
 * Returns a `Response` when the locale param is invalid.
 */
export function prepareLocaleRewrite(astro: AstroGlobal): Response | string {
  const { locale } = astro.params

  if (!locale || !getEnabledLocaleCodes(getLocales(astro)).includes(locale)) {
    return new Response(null, { status: 404 })
  }

  const i18n = astro.locals.i18n
  if (i18n) {
    i18n.locale = locale
    astro.locals.locale = locale
  }

  return getLocaleRewritePath(astro)
}

/**
 * Generate locale head meta tags for SEO
 */
export interface LocaleHeadOptions {
  /** Origin of the absolute URLs. Default: `site` from the Astro config, else root-relative URLs. */
  baseUrl?: string
  addDirAttribute?: boolean
  addSeoAttributes?: boolean
  /**
   * Also emit bare-language `hreflang` tags derived from `iso` (never from routing `code`).
   * @default false
   */
  hreflangBaseLanguage?: boolean
}

export type LocaleHeadResult = LocaleHead

export function useLocaleHead(astro: Astro, options: LocaleHeadOptions = {}): LocaleHeadResult {
  const { addDirAttribute, addSeoAttributes, hreflangBaseLanguage } = options
  const origin = options.baseUrl ?? astro.site?.origin ?? ''
  const { base, defaultLocale, codes, strategy, path } = hrefContext(astro)
  const code = getLocale(astro)
  const enabled = getEnabledLocales(getLocales(astro))
  const locale = enabled.find((entry) => entry.code === code)
  if (!locale) return { htmlAttrs: {}, link: [], meta: [] }

  const hrefOf = (target: string) => joinBase(origin, withBase(strategy.switchLocalePath!(path, target, codes, defaultLocale), base))
  const defaultEntry = enabled.find((entry) => entry.code === defaultLocale)
  return buildLocaleHead({
    locale,
    seoLocales: enabled.filter((entry) => entry.seo !== false),
    hrefOf,
    canonical: joinBase(origin, withBase(path, base)),
    xDefault: defaultEntry?.seo === false ? undefined : hrefOf(defaultLocale),
    addDirAttribute,
    addSeoAttributes,
    hreflangBaseLanguage,
  })
}

/**
 * Props to pass to client islands (Vue, React, Svelte, Preact)
 */
export interface I18nClientProps {
  locale: string
  /** The tag plurals go by: the locale's `iso` when it has one. */
  pluralLocale?: string
  fallbackLocale: string
  translations: Record<string, Translations> // routeName -> translations
  currentRoute: string
}

/** `keys` of `tree`, nested back into objects. Only the copy is written: a value may be a stored subtree. */
function pickKeys(tree: Translations, keys: string[]): Translations {
  let picked: Translations = {}
  for (const key of keys) {
    const value = getByPath(tree, key)
    if (value !== undefined && value !== null) picked = setTranslationAtKey(picked, key, value) as Translations
  }
  return picked
}

/**
 * Props for a client island: what `t()` can answer on this page (route, root and fallback keys),
 * or only `keys` of that. Stored trees are shared, an island must not write into them.
 */
export function getI18nProps(astro: Pick<AstroGlobal, 'locals'>, keys?: string[]): I18nClientProps {
  const i18n = getI18n(astro)
  const currentRoute = i18n.getRoute()
  const all = i18n.resolveTranslations(currentRoute)
  return {
    locale: getLocale(astro),
    pluralLocale: i18n.pluralLocale(),
    fallbackLocale: i18n.getFallbackLocale(),
    currentRoute,
    translations: { [currentRoute]: keys && keys.length > 0 ? pickKeys(all, keys) : all },
  }
}
