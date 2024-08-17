import type { PluginsInjections } from '../01.plugin'
import { useNuxtApp } from '#imports'

export function useI18n(): PluginsInjections {
  const nuxtApp = useNuxtApp()

  return {
    $getLocale: nuxtApp.$getLocale,
    $getLocales: nuxtApp.$getLocales,
    $t: nuxtApp.$t,
    $tc: nuxtApp.$tc,
    $mergeTranslations: nuxtApp.$mergeTranslations,
    $switchLocale: nuxtApp.$switchLocale,
    $localeRoute: nuxtApp.$localeRoute,
    $loadPageTranslations: nuxtApp.$loadPageTranslations,
  } as const
}
