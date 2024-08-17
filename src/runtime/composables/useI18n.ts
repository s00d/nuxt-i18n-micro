import { useNuxtApp } from '#imports'
import type { PluginsInjections } from '~/src/runtime/01.plugin'

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
