import type { Locale } from '@i18n-micro/types'
import { inject, ref } from 'vue'
import { I18nDefaultLocaleKey, I18nRouterKey } from '../injection'
import type { I18nRoutingStrategy } from '../router/types'
import { useI18n } from '../use-i18n'

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

export interface UseLocaleHeadOptions {
  addDirAttribute?: boolean
  identifierAttribute?: string
  addSeoAttributes?: boolean
  baseUrl?: string | (() => string)
}

export function useLocaleHead(options: UseLocaleHeadOptions = {}) {
  const { addDirAttribute = true, identifierAttribute = 'id', addSeoAttributes = true, baseUrl = '/' } = options

  const { getLocale, getLocales, localeRoute: i18nLocaleRoute } = useI18n()
  const routerStrategy = inject<I18nRoutingStrategy | undefined>(I18nRouterKey, undefined)

  const metaObject = ref<MetaObject>({
    htmlAttrs: {},
    link: [],
    meta: [],
  })

  function filterQuery(fullPath: string, whitelist: string[]): string {
    const url = new URL(fullPath, 'http://localhost')
    const params = new URLSearchParams(url.search)
    const filtered: Record<string, string> = {}
    for (const key of whitelist) {
      if (params.has(key)) {
        filtered[key] = params.get(key) as string
      }
    }
    const filteredParams = new URLSearchParams(filtered)
    return filteredParams.toString() ? `${url.pathname}?${filteredParams.toString()}` : url.pathname
  }

  function updateMeta(canonicalQueryWhitelist: string[] = []) {
    if (!routerStrategy) {
      metaObject.value = { htmlAttrs: {}, link: [], meta: [] }
      return
    }

    const locale = getLocale()
    const allLocales = getLocales()
    const currentLocaleObj = allLocales.find((loc: Locale) => loc.code === locale)

    if (!currentLocaleObj) {
      return
    }

    const currentIso = currentLocaleObj.iso || locale
    const currentDir = currentLocaleObj.dir || 'auto'

    let fullPath = routerStrategy.getCurrentPath()
    if (!fullPath.startsWith('/')) {
      fullPath = `/${fullPath}`
    }

    const pathSegments = fullPath.split('/').filter(Boolean)
    const matchedLocale = allLocales.find((localeItem: Locale) => pathSegments[0] === localeItem.code)

    let localizedPath = fullPath
    let canonicalPath: string

    if (matchedLocale) {
      localizedPath = fullPath.slice(matchedLocale.code.length + 1) || '/'
      canonicalPath = filterQuery(localizedPath, canonicalQueryWhitelist)
    } else {
      canonicalPath = filterQuery(fullPath, canonicalQueryWhitelist)
    }

    const baseUrlValue = typeof baseUrl === 'function' ? baseUrl() : baseUrl
    const ogUrl = `${baseUrlValue}${canonicalPath.startsWith('/') ? '' : '/'}${canonicalPath}`

    metaObject.value = {
      htmlAttrs: {
        lang: currentIso,
        ...(addDirAttribute ? { dir: currentDir } : {}),
      },
      link: [],
      meta: [],
    }

    if (!addSeoAttributes) {
      return
    }

    const alternateLocales = allLocales

    const ogLocaleMeta: MetaTag = {
      [identifierAttribute]: 'i18n-og',
      property: 'og:locale',
      content: currentIso,
    }

    const ogUrlMeta: MetaTag = {
      [identifierAttribute]: 'i18n-og-url',
      property: 'og:url',
      content: ogUrl,
    }

    const alternateOgLocalesMeta = alternateLocales.map((loc: Locale) => ({
      [identifierAttribute]: `i18n-og-alt-${loc.iso || loc.code}`,
      property: 'og:locale:alternate',
      content: loc.iso || loc.code,
    }))

    const canonicalLink: MetaLink = {
      [identifierAttribute]: 'i18n-can',
      rel: 'canonical',
      href: ogUrl,
    }

    const alternateLinks: MetaLink[] = alternateLocales.flatMap((loc: Locale) => {
      if (!i18nLocaleRoute || !routerStrategy) {
        return []
      }

      const currentPath = routerStrategy.getCurrentPath()
      // Use i18n's localeRoute which delegates to router strategy
      const switchedPathResult = i18nLocaleRoute(currentPath, loc.code)
      const switchedPath = typeof switchedPathResult === 'string' ? switchedPathResult : switchedPathResult?.path || '/'
      if (!switchedPath) {
        return []
      }

      let href: string
      if (switchedPath.startsWith('http://') || switchedPath.startsWith('https://')) {
        href = switchedPath
      } else {
        const baseUrlValue = typeof baseUrl === 'function' ? baseUrl() : baseUrl
        href = `${baseUrlValue}${switchedPath.startsWith('/') ? '' : '/'}${switchedPath}`
      }

      const links: MetaLink[] = [
        {
          [identifierAttribute]: `i18n-alternate-${loc.code}`,
          rel: 'alternate',
          href,
          hreflang: loc.code,
        },
      ]

      if (loc.iso && loc.iso !== loc.code) {
        links.push({
          [identifierAttribute]: `i18n-alternate-${loc.iso}`,
          rel: 'alternate',
          href,
          hreflang: loc.iso,
        })
      }

      return links
    })

    // Generate x-default hreflang link pointing to the default locale's URL.
    // x-default tells search engines which URL to show when none of the
    // specified languages match the user's browser settings.
    const injectedDefaultLocale = inject<string | undefined>(I18nDefaultLocaleKey, undefined)
    let xDefaultLink: MetaLink | null = null
    if (i18nLocaleRoute && routerStrategy && injectedDefaultLocale) {
      const currentPath = routerStrategy.getCurrentPath()
      const defaultPathResult = i18nLocaleRoute(currentPath, injectedDefaultLocale)
      const defaultPath = typeof defaultPathResult === 'string' ? defaultPathResult : defaultPathResult?.path || '/'
      if (defaultPath) {
        let xDefaultHref: string
        if (defaultPath.startsWith('http://') || defaultPath.startsWith('https://')) {
          xDefaultHref = defaultPath
        } else {
          const baseUrlValue = typeof baseUrl === 'function' ? baseUrl() : baseUrl
          xDefaultHref = `${baseUrlValue}${defaultPath.startsWith('/') ? '' : '/'}${defaultPath}`
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

  return {
    metaObject,
    updateMeta,
  }
}
