import { joinURL, parseURL, withQuery } from 'ufo'
import type { Locale, ModuleOptionsExtend } from 'nuxt-i18n-micro-types'
import { isPrefixExceptDefaultStrategy, isNoPrefixStrategy } from 'nuxt-i18n-micro-core'
import { unref, useRoute, useRuntimeConfig, ref, useNuxtApp } from '#imports'
import { findAllowedLocalesForRoute } from '../utils/route-utils'

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

export const useLocaleHead = ({ addDirAttribute = true, identifierAttribute = 'id', addSeoAttributes = true, baseUrl = '/' } = {}) => {
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

  function updateMeta() {
    const { defaultLocale, strategy, canonicalQueryWhitelist, routeLocales, globalLocaleRoutes } = useRuntimeConfig().public.i18nConfig as unknown as ModuleOptionsExtend & { globalLocaleRoutes?: Record<string, Record<string, string>> }
    const { $getLocales, $getLocale, $getRouteName } = useNuxtApp()

    if (!$getLocale || !$getLocales) return

    const route = useRoute()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const locale = unref($getLocale())
    const allLocales = unref($getLocales())
    const routeName = (route.name ?? '').toString()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const currentLocale = unref($getLocales().find((loc: Locale) => loc.code === locale))
    if (!currentLocale) return

    // Find allowed locales for this route using the utility function
    const currentRouteLocales = findAllowedLocalesForRoute(route, routeLocales)

    // If there's $defineI18nRoute configuration, use only specified locales
    const locales = currentRouteLocales
      ? allLocales.filter((loc: Locale) => currentRouteLocales.includes(loc.code))
      : allLocales

    const currentIso = currentLocale.iso || locale
    const currentDir = currentLocale.dir || 'auto'

    let fullPath = unref(route.fullPath)
    if (!fullPath.startsWith('/')) {
      fullPath = `/${fullPath}`
    }

    const matchedLocale = locales.find(locale => fullPath.startsWith(`/${locale.code}`))

    // Get base route name (without localized- prefix and locale suffix)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const baseRouteName = $getRouteName ? unref($getRouteName(route, locale)) : routeName.replace(/^localized-/, '').replace(new RegExp(`-${locale}$`), '').replace(new RegExp(`-${defaultLocale}$`), '')

    // Normalize route path (remove leading slash, locale prefix if exists)
    let normalizedPath = route.path
    if (matchedLocale && normalizedPath.startsWith(`/${matchedLocale.code}`)) {
      normalizedPath = normalizedPath.slice(matchedLocale.code.length + 1)
    }
    if (!normalizedPath.startsWith('/')) {
      normalizedPath = `/${normalizedPath}`
    }
    // Remove trailing slash except for root
    if (normalizedPath !== '/' && normalizedPath.endsWith('/')) {
      normalizedPath = normalizedPath.slice(0, -1)
    }

    let localizedPath = fullPath
    let ogUrl: string
    let canonicalPath: string

    if (routeName.startsWith('localized-') && matchedLocale) {
      localizedPath = fullPath.slice(matchedLocale.code.length + 1)
      canonicalPath = filterQuery(localizedPath, canonicalQueryWhitelist ?? [])
      ogUrl = joinURL(unref(baseUrl), locale, canonicalPath)
    }
    else {
      canonicalPath = filterQuery(fullPath, canonicalQueryWhitelist ?? [])
      ogUrl = joinURL(unref(baseUrl), canonicalPath)
    }

    // Get localized paths from globalLocaleRoutes if available
    // First try by route name, then by normalized path
    let routeLocalizedPaths = globalLocaleRoutes?.[baseRouteName] || globalLocaleRoutes?.[normalizedPath] || null

    // If not found, try to find by matching current canonicalPath against localized paths
    // This handles cases where route.path is already localized (e.g., /our-products vs /products)
    if (!routeLocalizedPaths && globalLocaleRoutes) {
      for (const [, localizedPaths] of Object.entries(globalLocaleRoutes)) {
        if (typeof localizedPaths === 'object' && localizedPaths !== null) {
          // Check if current canonicalPath matches any localized path for any locale
          const normalizedCurrentPath = canonicalPath.replace(/^\/+/, '/')
          const matchingLocale = Object.entries(localizedPaths).find(([_, localizedPathValue]) => {
            const normalizedLocalizedPath = String(localizedPathValue).replace(/^\/+/, '/')
            // Match exact path or path with locale prefix removed
            return normalizedCurrentPath === normalizedLocalizedPath
              || (matchedLocale && normalizedCurrentPath === `/${matchedLocale.code}/${normalizedLocalizedPath}`)
          })
          if (matchingLocale) {
            routeLocalizedPaths = localizedPaths
            break
          }
        }
      }
    }

    metaObject.value = {
      htmlAttrs: {
        lang: currentIso,
        ...(addDirAttribute ? { dir: currentDir } : {}),
      },
      link: [],
      meta: [],
    }

    if (!addSeoAttributes) return

    // Use filtered locales instead of all
    const alternateLocales = locales

    const ogLocaleMeta = {
      [identifierAttribute]: 'i18n-og',
      property: 'og:locale',
      content: currentIso,
    }

    const ogUrlMeta = {
      [identifierAttribute]: 'i18n-og-url',
      property: 'og:url',
      content: ogUrl,
    }

    const alternateOgLocalesMeta = alternateLocales.map((loc: Locale) => ({
      [identifierAttribute]: `i18n-og-alt-${loc.iso || loc.code}`,
      property: 'og:locale:alternate',
      content: unref(loc.iso || loc.code),
    }))

    const canonicalLink = {
      [identifierAttribute]: 'i18n-can',
      rel: 'canonical',
      href: ogUrl,
    }

    const alternateLinks = isNoPrefixStrategy(strategy!)
      ? []
      : alternateLocales.flatMap((loc: Locale) => {
          // Check if there's a localized path for this locale in globalLocaleRoutes
          let pathForLocale: string
          if (routeLocalizedPaths && routeLocalizedPaths[loc.code]) {
            // Use localized path from configuration
            pathForLocale = routeLocalizedPaths[loc.code]
          }
          else {
            // Fallback to current logic
            pathForLocale = defaultLocale === loc.code && isPrefixExceptDefaultStrategy(strategy!)
              ? canonicalPath
              : canonicalPath
          }

          // Apply locale prefix if needed
          const localizedPath
          = defaultLocale === loc.code && isPrefixExceptDefaultStrategy(strategy!)
            ? pathForLocale
            : joinURL(loc.code, pathForLocale)

          const href = joinURL(unref(baseUrl), localizedPath)

          const links = [{
            [identifierAttribute]: `i18n-alternate-${loc.code}`,
            rel: 'alternate',
            href,
            hreflang: unref(loc.code),
          }]

          if (loc.iso && loc.iso !== loc.code) {
            links.push({
              [identifierAttribute]: `i18n-alternate-${loc.iso}`,
              rel: 'alternate',
              href,
              hreflang: unref(loc.iso),
            })
          }

          return links
        })

    metaObject.value.meta = [ogLocaleMeta, ogUrlMeta, ...alternateOgLocalesMeta]
    metaObject.value.link = [canonicalLink, ...alternateLinks]
  }

  return { metaObject, updateMeta }
}
