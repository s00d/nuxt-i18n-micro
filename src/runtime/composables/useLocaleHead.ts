import { isNoPrefixStrategy } from '@i18n-micro/core'
import type { RouteLike } from '@i18n-micro/path-strategy'
import type { Locale, ModuleOptionsExtend } from '@i18n-micro/types'
import { resolveHreflangAlternates } from '@i18n-micro/utils/resolve-hreflang'
import { resolveOgLocale, warnUnresolvedOgLocale } from '@i18n-micro/utils/resolve-og-locale'
import { joinURL, parseURL, withQuery } from 'ufo'
import { ref, unref, watch } from 'vue'
import { useNuxtApp, useRoute, useState } from '#app'
import { applyTrailingSlash } from '../utils/trailing-slash'

interface MetaLink {
  [key: string]: string | undefined
  rel: string
  href: string
  hreflang?: string
}

interface MetaTag {
  [key: string]: string
  property: string
  content: string
}

interface MetaObject {
  htmlAttrs: {
    lang?: string
    dir?: 'ltr' | 'rtl' | 'auto'
  }
  link: MetaLink[]
  meta: MetaTag[]
}

interface UseLocaleHeadOptions {
  /** Set `dir` on `<html>` from the locale's direction. */
  addDirAttribute?: boolean
  /** Attribute used to key the generated tags so they can be replaced rather than duplicated. */
  identifierAttribute?: string
  /** Emit `hreflang` alternates, `canonical` and `og:` tags. */
  addSeoAttributes?: boolean
  /** Base URL for absolute URLs in the generated tags. */
  baseUrl?: string
  /** Recompute the tags on every route change. */
  autoUpdate?: boolean
}

/**
 * The SEO head tags for the current route: `hreflang` alternates for every locale plus
 * `x-default`, a canonical link, `og:locale`, and `lang`/`dir` on `<html>`.
 *
 * Only needed when `meta` is disabled or the defaults need adjusting — with `meta: true`
 * the module registers the same tags itself.
 *
 * @returns `metaObject`, a ref holding the head object ready to pass to `useHead`; `updateMeta`
 * refreshes it; `build` computes the head object from the current route (reactive when read in
 * a getter, e.g. `useHead(() => build())`)
 * @example
 * ```ts
 * const { metaObject } = useLocaleHead({ addSeoAttributes: true })
 * useHead(metaObject)
 * ```
 */
export const useLocaleHead = ({
  addDirAttribute = true,
  identifierAttribute = 'id',
  addSeoAttributes = true,
  baseUrl = '/',
  autoUpdate = true,
}: UseLocaleHeadOptions = {}) => {
  const nuxtApp = useNuxtApp()
  const route = useRoute()
  const metaObject = ref<MetaObject>({
    htmlAttrs: {},
    link: [],
    meta: [],
  })

  function filterQuery(fullPath: string, whitelist: string[]): string {
    const { pathname, search } = parseURL(fullPath)
    const params = new URLSearchParams(search)
    const filtered: Record<string, string> = {}
    for (const key of whitelist) {
      if (params.has(key)) {
        filtered[key] = params.get(key) as string
      }
    }
    return withQuery(pathname, filtered)
  }

  function filterLocalizedHref(pathOrUrl: string, whitelist: string[]): string {
    if (!pathOrUrl) return ''

    const parsed = parseURL(pathOrUrl)
    const filteredPath = filterQuery(pathOrUrl, whitelist)

    // Keep absolute locale URLs absolute (multi-domain mode).
    if (parsed.protocol && parsed.host) {
      return `${parsed.protocol}//${parsed.host}${filteredPath}`
    }

    return filteredPath
  }

  const empty = (): MetaObject => ({ htmlAttrs: {}, link: [], meta: [] })

  function build(): MetaObject {
    // 404 routes must not emit SEO tags.
    if (route.matched.length === 0) return empty()

    const i18nConfig = nuxtApp.$getI18nConfig() as ModuleOptionsExtend
    const { canonicalQueryWhitelist } = i18nConfig
    const strategy = i18nConfig.strategy
    const { $getLocales, $getLocale, $switchLocalePath } = nuxtApp
    const i18nStrategy = nuxtApp.$i18nStrategy
    const allLocales = ($getLocales ? unref($getLocales()) : i18nConfig.locales) ?? []
    const locale = unref($getLocale()) || i18nConfig.defaultLocale || 'en'
    const currentLocale = allLocales.find((loc: Locale) => loc.code === locale)
    // disableMeta and the page's locales come from its route records (meta.i18n), custom paths included
    if (!currentLocale || i18nStrategy.isMetaDisabled(route as unknown as RouteLike, locale)) return empty()
    const switchLocalePath = $switchLocalePath
    const pageLocales = i18nStrategy.pageLocales(route as unknown as RouteLike)
    const enabledLocales = allLocales.filter((loc: Locale) => !loc.disabled)
    const locales = pageLocales ? enabledLocales.filter((loc: Locale) => pageLocales.includes(loc.code)) : enabledLocales

    const currentIso = currentLocale.iso || locale
    const currentOg = resolveOgLocale(currentLocale)
    const missingWarn = i18nConfig.missingWarn ?? true
    const currentDir = currentLocale.dir || 'auto'

    const whitelist = canonicalQueryWhitelist ?? []
    const trailingSlash = i18nConfig.trailingSlash

    /**
     * Absolute SEO href from `$switchLocalePath` (path or locale `baseUrl` URL).
     * Re-apply `trailingSlash` after `joinURL`: ufo drops a lone `/` on a slashless base
     * (`joinURL('https://x.com', '/')` → `https://x.com`), which would break `append`.
     */
    const toSeoHref = (pathOrUrl: string): string => {
      if (!pathOrUrl) return ''
      let href: string
      if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
        href = filterLocalizedHref(pathOrUrl, whitelist)
      } else {
        const filteredPath = filterLocalizedHref(pathOrUrl, whitelist)
        href = joinURL(unref(baseUrl), filteredPath.startsWith('/') ? filteredPath : `/${filteredPath}`)
      }
      return applyTrailingSlash(href, trailingSlash)
    }

    // Canonical / og:url share `$switchLocalePath` with hreflang (incl. NuxtLink trailingSlash).
    const ogUrl = toSeoHref(switchLocalePath(locale) || route.fullPath)

    const htmlAttrs = {
      lang: currentIso,
      ...(addDirAttribute ? { dir: currentDir } : {}),
    }

    if (!addSeoAttributes) return { htmlAttrs, link: [], meta: [] }

    // Locales included in hreflang / og:locale:alternate (omit `seo: false`)
    const localesForSeo = locales.filter((loc: Locale) => loc.seo !== false)

    if (!currentOg) {
      warnUnresolvedOgLocale(currentLocale, { missingWarn, tag: 'og:locale' })
    }

    const ogLocaleMeta = currentOg
      ? {
          [identifierAttribute]: 'i18n-og',
          property: 'og:locale',
          content: currentOg,
        }
      : null

    const ogUrlMeta = {
      [identifierAttribute]: 'i18n-og-url',
      property: 'og:url',
      content: ogUrl,
    }

    const alternateOgLocalesMeta = localesForSeo
      .filter((loc: Locale) => loc.code !== locale)
      .map((loc: Locale) => {
        const ogAlt = resolveOgLocale(loc)
        if (!ogAlt) {
          warnUnresolvedOgLocale(loc, { missingWarn, tag: 'og:locale:alternate' })
          return null
        }
        return {
          [identifierAttribute]: `i18n-og-alt-${ogAlt}`,
          property: 'og:locale:alternate',
          content: ogAlt,
        }
      })
      .filter((meta): meta is MetaTag => meta !== null)

    const canonicalLink = {
      [identifierAttribute]: 'i18n-can',
      rel: 'canonical',
      href: ogUrl,
    }

    const defaultLocale = i18nConfig.defaultLocale || 'en'
    const defaultLocaleObj = allLocales.find((loc: Locale) => loc.code === defaultLocale)

    const alternateLinks = isNoPrefixStrategy(strategy!)
      ? []
      : (() => {
          const hrefByCode = new Map<string, string>()
          for (const loc of localesForSeo) {
            const switchedPath = switchLocalePath(loc.code)
            if (!switchedPath) continue
            hrefByCode.set(String(loc.code), toSeoHref(switchedPath))
          }

          return resolveHreflangAlternates(localesForSeo, {
            hreflangBaseLanguage: i18nConfig.hreflangBaseLanguage ?? false,
          }).flatMap(({ hreflang, localeCode }) => {
            const href = hrefByCode.get(localeCode)
            if (!href) return []
            return [
              {
                [identifierAttribute]: `i18n-alternate-${hreflang}`,
                rel: 'alternate',
                href,
                hreflang,
              } satisfies MetaLink,
            ]
          })
        })()

    // Generate x-default hreflang link pointing to the default locale's URL.
    // x-default tells search engines which URL to show when none of the
    // specified languages match the user's browser settings.
    let xDefaultLink: MetaLink | null = null
    // x-default only when the page exists in the default locale (else it would point at another page)
    if (!isNoPrefixStrategy(strategy!) && defaultLocaleObj?.seo !== false && (!pageLocales || pageLocales.includes(defaultLocale))) {
      const defaultSwitchedPath = switchLocalePath(defaultLocale)
      if (defaultSwitchedPath) {
        xDefaultLink = {
          [identifierAttribute]: 'i18n-xd',
          rel: 'alternate',
          href: toSeoHref(defaultSwitchedPath),
          hreflang: 'x-default',
        }
      }
    }

    return {
      htmlAttrs,
      meta: [...(ogLocaleMeta ? [ogLocaleMeta] : []), ogUrlMeta, ...alternateOgLocalesMeta],
      link: [canonicalLink, ...alternateLinks, ...(xDefaultLink ? [xDefaultLink] : [])],
    }
  }

  function updateMeta() {
    metaObject.value = build()
  }

  if (autoUpdate) {
    // Keep head payload in sync automatically for manual usage
    // (e.g. when 02.meta plugin is disabled with `meta: false`).
    // Locale is included: no_prefix / hashMode / setLocale can change locale without a route change.
    const localeState = useState<string | null>('i18n-locale', () => null)
    watch(
      () => [route.fullPath, route.name, route.matched.length, localeState.value] as const,
      () => updateMeta(),
      { immediate: true },
    )
  }

  return { metaObject, updateMeta, build }
}
