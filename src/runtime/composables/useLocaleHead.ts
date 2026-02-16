import { isNoPrefixStrategy } from '@i18n-micro/core'
import type { Locale, ModuleOptionsExtend } from '@i18n-micro/types'
import { joinURL, parseURL, withQuery } from 'ufo'
import { ref, unref } from 'vue'
import { useNuxtApp, useRoute } from '#imports'
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
    const route = useRoute()

    // On 404 pages, route.matched will be empty.
    // We should not generate SEO tags for pages that don't exist.
    if (route.matched.length === 0 || route.matched.some((record) => record.name === 'custom-fallback-route')) {
      // Clear metaObject to ensure no tags are generated for 404 pages
      metaObject.value = { htmlAttrs: {}, link: [], meta: [] }
      return
    }

    const i18nConfig = useNuxtApp().$getI18nConfig() as ModuleOptionsExtend
    const { canonicalQueryWhitelist, routeLocales, localizedRouteNamePrefix } = i18nConfig
    const strategy = i18nConfig.strategy
    const localizedRouteNamePrefixResolved = localizedRouteNamePrefix || 'localized-'
    const { $getLocales, $getLocale, $switchLocalePath } = useNuxtApp()

    if (!$getLocale || !$getLocales) return
    const locale = unref($getLocale())
    const allLocales = unref($getLocales())
    const routeName = (route.name ?? '').toString()
    const currentLocale = unref($getLocales().find((loc: Locale) => loc.code === locale))
    if (!currentLocale) return

    // Find allowed locales for this route using the utility function
    const currentRouteLocales = findAllowedLocalesForRoute(route, routeLocales, localizedRouteNamePrefixResolved)

    // If there's $defineI18nRoute configuration, use only specified locales
    const locales = currentRouteLocales ? allLocales.filter((loc: Locale) => currentRouteLocales.includes(loc.code)) : allLocales

    const currentIso = currentLocale.iso || locale
    const currentDir = currentLocale.dir || 'auto'

    let fullPath = unref(route.fullPath)
    if (!fullPath.startsWith('/')) {
      fullPath = `/${fullPath}`
    }

    // Sort locales by code length (longest first) to avoid
    // partial matching (e.g. 'en' matching inside '/enGB')
    const matchedLocale = [...locales].sort((a, b) => b.code.length - a.code.length).find((locale) => fullPath.startsWith(`/${locale.code}`))

    let localizedPath = fullPath
    let ogUrl: string
    let canonicalPath: string

    if (routeName.startsWith(localizedRouteNamePrefixResolved) && matchedLocale) {
      localizedPath = fullPath.slice(matchedLocale.code.length + 1)
      canonicalPath = filterQuery(localizedPath, canonicalQueryWhitelist ?? [])
      ogUrl = joinURL(unref(baseUrl), locale, canonicalPath)
    } else {
      canonicalPath = filterQuery(fullPath, canonicalQueryWhitelist ?? [])
      ogUrl = joinURL(unref(baseUrl), canonicalPath)
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

    const defaultLocale = i18nConfig.defaultLocale || 'en'

    const alternateLinks = isNoPrefixStrategy(strategy!)
      ? []
      : alternateLocales.flatMap((loc: Locale) => {
          const switchedPath = $switchLocalePath(loc.code)
          if (!switchedPath) {
            return []
          }

          // $switchLocalePath returns a full URL (with baseUrl) if locale has baseUrl, otherwise just a path
          let href: string
          if (switchedPath.startsWith('http://') || switchedPath.startsWith('https://')) {
            // It's already a full URL, use it as-is
            href = switchedPath
          } else {
            // It's just a path, prepend baseUrl
            href = joinURL(unref(baseUrl), switchedPath.startsWith('/') ? switchedPath : `/${switchedPath}`)
          }

          const links: MetaLink[] = [
            {
              [identifierAttribute]: `i18n-alternate-${loc.code}`,
              rel: 'alternate',
              href,
              hreflang: unref(loc.code),
            },
          ]

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

    // Generate x-default hreflang link pointing to the default locale's URL.
    // x-default tells search engines which URL to show when none of the
    // specified languages match the user's browser settings.
    let xDefaultLink: MetaLink | null = null
    if (!isNoPrefixStrategy(strategy!)) {
      const defaultSwitchedPath = $switchLocalePath(defaultLocale)
      if (defaultSwitchedPath) {
        let xDefaultHref: string
        if (defaultSwitchedPath.startsWith('http://') || defaultSwitchedPath.startsWith('https://')) {
          xDefaultHref = defaultSwitchedPath
        } else {
          xDefaultHref = joinURL(unref(baseUrl), defaultSwitchedPath.startsWith('/') ? defaultSwitchedPath : `/${defaultSwitchedPath}`)
        }
        xDefaultLink = {
          [identifierAttribute]: 'i18n-xd',
          rel: 'alternate',
          href: xDefaultHref,
          hreflang: 'x-default',
        }
      }
    }

    metaObject.value.meta = [ogLocaleMeta, ogUrlMeta, ...alternateOgLocalesMeta]
    metaObject.value.link = [canonicalLink, ...alternateLinks, ...(xDefaultLink ? [xDefaultLink] : [])]
  }

  return { metaObject, updateMeta }
}
