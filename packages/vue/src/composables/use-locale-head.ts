import type { Locale } from '@i18n-micro/types'
import { buildLocaleHead, filterQuery, joinBase, type LocaleHead } from '@i18n-micro/utils/locale-head'
import { inject, ref } from 'vue'
import { I18nDefaultLocaleKey, I18nRouterKey } from '../injection'
import { currentFullPath, pathOf } from '../router/path'
import type { I18nRoutingStrategy } from '../router/types'
import { useI18n } from '../use-i18n'

export interface UseLocaleHeadOptions {
  addDirAttribute?: boolean
  identifierAttribute?: string
  addSeoAttributes?: boolean
  baseUrl?: string | (() => string)
  /**
   * Also emit bare-language `hreflang` tags derived from `iso` (never from routing `code`).
   * @default false
   */
  hreflangBaseLanguage?: boolean
}

const isAbsolute = (href: string): boolean => href.startsWith('http://') || href.startsWith('https://')

export function useLocaleHead(options: UseLocaleHeadOptions = {}) {
  const { addDirAttribute = true, identifierAttribute = 'id', addSeoAttributes = true, baseUrl = '/', hreflangBaseLanguage = false } = options

  const { getLocale, getLocales, localeRoute } = useI18n()
  const routing = inject<I18nRoutingStrategy | undefined>(I18nRouterKey, undefined)
  // inject() only works during setup, and updateMeta is documented to run from a watcher
  const defaultLocale = inject<string | undefined>(I18nDefaultLocaleKey, undefined)

  const metaObject = ref<LocaleHead>({ htmlAttrs: {}, link: [], meta: [] })

  function updateMeta(canonicalQueryWhitelist: string[] = []) {
    if (!routing) {
      metaObject.value = { htmlAttrs: {}, link: [], meta: [] }
      return
    }

    const allLocales = getLocales()
    const locale = allLocales.find((loc: Locale) => loc.code === getLocale())
    if (!locale) return

    const base = typeof baseUrl === 'function' ? baseUrl() : baseUrl
    // a custom strategy's path may hold the query, which `query` adds back filtered
    const here = routing.getCurrentPath().split(/[?#]/)[0] || '/'
    const kept = filterQuery(currentFullPath(routing), canonicalQueryWhitelist)
    const query = kept.slice(kept.search(/\?|$/))
    const hrefOf = (code: string): string => {
      const path = pathOf(localeRoute(here, code) as string | { path?: string })
      if (!path) return ''
      return `${isAbsolute(path) ? path : joinBase(base, path)}${query}`
    }
    const defaultLocaleObj = allLocales.find((loc: Locale) => loc.code === defaultLocale)

    metaObject.value = buildLocaleHead({
      locale,
      seoLocales: allLocales.filter((loc: Locale) => !loc.disabled && loc.seo !== false),
      hrefOf,
      canonical: hrefOf(locale.code),
      xDefault: defaultLocaleObj && defaultLocaleObj.seo !== false ? hrefOf(defaultLocaleObj.code) : undefined,
      addDirAttribute,
      addSeoAttributes,
      identifierAttribute,
      hreflangBaseLanguage,
    })
  }

  return {
    metaObject,
    updateMeta,
  }
}
