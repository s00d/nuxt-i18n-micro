import { joinURL, parseURL, withQuery } from 'ufo'
import type { Locale, ModuleOptionsExtend } from '@i18n-micro/types'
import { isNoPrefixStrategy } from '@i18n-micro/core'
import { useRoute, useRuntimeConfig, useNuxtApp } from '#imports'
import { findAllowedLocalesForRoute } from '../utils/route-utils'
import { ref, unref } from 'vue'

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
    if (route.matched.length === 0 || route.matched.some(record => record.name === 'custom-fallback-route')) {
      // Clear metaObject to ensure no tags are generated for 404 pages
      metaObject.value = { htmlAttrs: {}, link: [], meta: [] }
      return
    }

    const { strategy, canonicalQueryWhitelist, routeLocales } = useRuntimeConfig().public.i18nConfig as unknown as ModuleOptionsExtend
    const { $getLocales, $getLocale, $switchLocalePath } = useNuxtApp()

    if (!$getLocale || !$getLocales) return
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

    // Сортируем локали по длине кода (от длинных к коротким), чтобы избежать
    // частичного совпадения (например, чтобы 'en' не матчилось внутри '/enGB')
    const matchedLocale = [...locales]
      .sort((a, b) => b.code.length - a.code.length)
      .find(locale => fullPath.startsWith(`/${locale.code}`))

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
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const switchedPath = $switchLocalePath(loc.code)
          if (!switchedPath) {
            return []
          }

          // $switchLocalePath returns a full URL (with baseUrl) if locale has baseUrl, otherwise just a path
          let href: string
          if (switchedPath.startsWith('http://') || switchedPath.startsWith('https://')) {
            // It's already a full URL, use it as-is
            href = switchedPath
          }
          else {
            // It's just a path, prepend baseUrl
            href = joinURL(unref(baseUrl), switchedPath.startsWith('/') ? switchedPath : `/${switchedPath}`)
          }

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
