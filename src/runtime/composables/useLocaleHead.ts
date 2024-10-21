import { joinURL } from 'ufo'
import type { ModuleOptionsExtend } from '../../types'
import type { PluginsInjections } from '../plugins/01.plugin'
import { unref, useRoute, useRuntimeConfig, watch, onUnmounted, ref, useNuxtApp } from '#imports'

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

  function updateMeta() {
    const { defaultLocale, includeDefaultLocaleRoute } = useRuntimeConfig().public.i18nConfig as ModuleOptionsExtend
    const { $getLocales, $getLocale } = useNuxtApp().$i18n as PluginsInjections

    const route = useRoute()
    const locale = unref($getLocale())
    const routeName = (route.name ?? '').toString()
    const currentLocale = unref($getLocales().find(l => l.code === locale))
    if (!currentLocale) {
      return
    }

    const currentIso = currentLocale.iso || locale
    const currentDir = currentLocale.dir || 'auto'

    let fullPath = unref(route.fullPath)
    let ogUrl = joinURL(unref(baseUrl), fullPath)
    let indexUrl = joinURL(unref(baseUrl))

    if (!ogUrl.endsWith('/')) {
      ogUrl += '/'
    }
    if (!indexUrl.endsWith('/')) {
      indexUrl += '/'
    }

    if (routeName.startsWith('localized-') && fullPath.startsWith(`/${locale}`)) {
      fullPath = fullPath.slice(locale.length + 1)
      ogUrl = joinURL(unref(baseUrl), locale, fullPath)
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

    // const alternateLocales = locales?.filter(l => l.code !== locale) ?? []
    const alternateLocales = $getLocales() ?? []

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

    const alternateOgLocalesMeta = alternateLocales.map(loc => ({
      [identifierAttribute]: `i18n-og-alt-${loc.iso || loc.code}`,
      property: 'og:locale:alternate',
      content: unref(loc.iso || loc.code),
    }))

    const canonicalLink = {
      [identifierAttribute]: 'i18n-can',
      rel: 'canonical',
      href: ogUrl,
    }

    const alternateLinks = alternateLocales.flatMap((loc) => {
      const href = defaultLocale === loc.code && !includeDefaultLocaleRoute
        ? indexUrl
        : joinURL(unref(baseUrl), loc.code, fullPath)

      const links = [{
        [identifierAttribute]: `i18n-alternate-${loc.code}`,
        rel: 'alternate',
        href,
        hreflang: unref(loc.code),
      }]

      if (loc.iso) {
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

  if (import.meta.client) {
    const route = useRoute()
    const stop = watch(
      () => route.fullPath,
      () => updateMeta(),
      { immediate: true },
    )
    onUnmounted(() => stop())
  }
  else {
    updateMeta()
  }

  return metaObject
}
