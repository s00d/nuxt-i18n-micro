import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '../use-i18n'
import type { Locale } from '@i18n-micro/types'

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
  const {
    addDirAttribute = true,
    identifierAttribute = 'id',
    addSeoAttributes = true,
    baseUrl = '/',
  } = options

  const route = useRoute()
  const { getLocale, getLocales, switchLocalePath } = useI18n()

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
    // On 404 pages, route.matched will be empty.
    // We should not generate SEO tags for pages that don't exist.
    if (route.matched.length === 0) {
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

    let fullPath = route.fullPath
    if (!fullPath.startsWith('/')) {
      fullPath = `/${fullPath}`
    }

    const pathSegments = fullPath.split('/').filter(Boolean)
    const matchedLocale = allLocales.find(localeItem => pathSegments[0] === localeItem.code)

    let localizedPath = fullPath
    let canonicalPath: string

    if (matchedLocale) {
      localizedPath = fullPath.slice(matchedLocale.code.length + 1) || '/'
      canonicalPath = filterQuery(localizedPath, canonicalQueryWhitelist)
    }
    else {
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
      if (!switchLocalePath) {
        return []
      }

      const switchedPath = switchLocalePath(loc.code)
      if (!switchedPath) {
        return []
      }

      let href: string
      if (switchedPath.startsWith('http://') || switchedPath.startsWith('https://')) {
        href = switchedPath
      }
      else {
        const baseUrlValue = typeof baseUrl === 'function' ? baseUrl() : baseUrl
        href = `${baseUrlValue}${switchedPath.startsWith('/') ? '' : '/'}${switchedPath}`
      }

      const links: MetaLink[] = [{
        [identifierAttribute]: `i18n-alternate-${loc.code}`,
        rel: 'alternate',
        href,
        hreflang: loc.code,
      }]

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

    metaObject.value.meta = [ogLocaleMeta, ogUrlMeta, ...alternateOgLocalesMeta]
    metaObject.value.link = [canonicalLink, ...alternateLinks]
  }

  return {
    metaObject,
    updateMeta,
  }
}
