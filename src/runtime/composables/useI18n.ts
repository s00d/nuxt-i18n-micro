import type { PluginsInjections } from '../plugins/01.plugin'
import { useNuxtApp } from '#imports'

export function useI18n(): PluginsInjections {
  const nuxtApp = useNuxtApp()

  return {
    $defaultLocale: nuxtApp.$defaultLocale,
    $getLocale: nuxtApp.$getLocale,
    $getLocales: nuxtApp.$getLocales,
    $getRouteName: nuxtApp.$getRouteName,
    $t: nuxtApp.$t,
    $tn: nuxtApp.$tn,
    $td: nuxtApp.$td,
    $has: nuxtApp.$has,
    $tc: nuxtApp.$tc,
    $mergeTranslations: nuxtApp.$mergeTranslations,
    $setI18nRouteParams: nuxtApp.$setI18nRouteParams,
    $switchLocaleRoute: nuxtApp.$switchLocaleRoute,
    $switchLocalePath: nuxtApp.$switchLocalePath,
    $switchLocale: nuxtApp.$switchLocale,
    $localeRoute: nuxtApp.$localeRoute,
    $localePath: nuxtApp.$localePath,
    $loadPageTranslations: nuxtApp.$loadPageTranslations,
  } as const
}
