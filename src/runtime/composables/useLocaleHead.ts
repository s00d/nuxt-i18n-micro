import { isNoPrefixStrategy } from '@i18n-micro/core'
import type { RouteLike } from '@i18n-micro/path-strategy'
import type { Locale, ModuleOptionsExtend } from '@i18n-micro/types'
import { buildLocaleHead, filterQuery, type LocaleHead } from '@i18n-micro/utils/locale-head'
import { joinURL } from 'ufo'
import { ref, unref, watch } from 'vue'
import { useRoute } from '#app/composables/router'
import { useState } from '#app/composables/state'
import { useNuxtApp } from '#app/nuxt'
import { applyTrailingSlash } from '../utils/trailing-slash'

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
  const metaObject = ref<LocaleHead>({
    htmlAttrs: {},
    link: [],
    meta: [],
  })

  const empty = (): LocaleHead => ({ htmlAttrs: {}, link: [], meta: [] })

  function build(): LocaleHead {
    const i18nConfig = nuxtApp.$getI18nConfig() as ModuleOptionsExtend
    const { canonicalQueryWhitelist, strategy, trailingSlash } = i18nConfig
    const { $getLocales, $getLocale, $switchLocalePath } = nuxtApp
    const i18nStrategy = nuxtApp.$i18nStrategy
    const allLocales = ($getLocales ? unref($getLocales()) : i18nConfig.locales) ?? []
    const locale = unref($getLocale()) || i18nConfig.defaultLocale || 'en'
    const currentLocale = allLocales.find((loc: Locale) => loc.code === locale)
    // disableMeta and the page's locales come from its route records (meta.i18n), custom paths included
    if (!currentLocale || i18nStrategy.isMetaDisabled(route as unknown as RouteLike, locale)) return empty()

    const pageLocales = i18nStrategy.pageLocales(route as unknown as RouteLike)
    const enabledLocales = allLocales.filter((loc: Locale) => !loc.disabled)
    // an unlocalized page has one URL: alternates would all point at it
    const locales = pageLocales ? enabledLocales.filter((loc: Locale) => pageLocales.includes(loc.code)) : []
    const whitelist = canonicalQueryWhitelist ?? []

    /**
     * Absolute SEO href from `$switchLocalePath` (path or locale `baseUrl` URL).
     * Re-apply `trailingSlash` after `joinURL`: ufo drops a lone `/` on a slashless base
     * (`joinURL('https://x.com', '/')` → `https://x.com`), which would break `append`.
     */
    const toSeoHref = (pathOrUrl: string): string => {
      if (!pathOrUrl) return ''
      const filtered = filterQuery(pathOrUrl, whitelist)
      const absolute = filtered.startsWith('http://') || filtered.startsWith('https://')
      return applyTrailingSlash(absolute ? filtered : joinURL(unref(baseUrl), filtered.startsWith('/') ? filtered : `/${filtered}`), trailingSlash)
    }

    const hrefOf = (code: string): string => toSeoHref($switchLocalePath(code))
    const defaultLocale = i18nConfig.defaultLocale || 'en'
    const defaultLocaleObj = allLocales.find((loc: Locale) => loc.code === defaultLocale)
    const noPrefix = isNoPrefixStrategy(strategy!)
    // x-default only when the page exists in the default locale (else it would point at another page)
    const hasXDefault = !noPrefix && defaultLocaleObj?.seo !== false && pageLocales?.includes(defaultLocale)

    return buildLocaleHead({
      locale: currentLocale,
      // omit `seo: false`
      seoLocales: locales.filter((loc: Locale) => loc.seo !== false),
      hrefOf,
      // canonical / og:url share `$switchLocalePath` with hreflang (incl. NuxtLink trailingSlash)
      canonical: toSeoHref($switchLocalePath(locale) || route.fullPath),
      xDefault: hasXDefault ? hrefOf(defaultLocale) : undefined,
      alternates: !noPrefix,
      addDirAttribute,
      // 404 routes keep the language, but must not emit SEO tags
      addSeoAttributes: addSeoAttributes && route.matched.length > 0,
      identifierAttribute,
      hreflangBaseLanguage: i18nConfig.hreflangBaseLanguage ?? false,
      missingWarn: i18nConfig.missingWarn ?? true,
    })
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
