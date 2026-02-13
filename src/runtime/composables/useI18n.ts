import { useNuxtApp } from '#imports'
import type { PluginsInjections } from '../plugins/01.plugin'

type RemoveDollarSign<T> = {
  [K in keyof T as K extends `$${infer Rest}` ? Rest : K]: T[K]
}

export type PluginsInjectionsWithAliases = PluginsInjections & RemoveDollarSign<PluginsInjections>

export function useI18n(): PluginsInjectionsWithAliases {
  const nuxtApp = useNuxtApp()

  const injections = {
    $i18nStrategy: nuxtApp.$i18nStrategy,
    $getI18nConfig: nuxtApp.$getI18nConfig,
    $defaultLocale: nuxtApp.$defaultLocale,
    $getLocale: nuxtApp.$getLocale,
    $getLocaleName: nuxtApp.$getLocaleName,
    $getLocales: nuxtApp.$getLocales,
    $getRouteName: nuxtApp.$getRouteName,
    $t: nuxtApp.$t,
    $_t: nuxtApp.$_t,
    $ts: nuxtApp.$ts,
    $_ts: nuxtApp.$_ts,
    $tn: nuxtApp.$tn,
    $td: nuxtApp.$td,
    $tdr: nuxtApp.$tdr,
    $has: nuxtApp.$has,
    $tc: nuxtApp.$tc,
    $mergeTranslations: nuxtApp.$mergeTranslations,
    $setI18nRouteParams: nuxtApp.$setI18nRouteParams,
    $switchLocaleRoute: nuxtApp.$switchLocaleRoute,
    $switchLocalePath: nuxtApp.$switchLocalePath,
    $switchLocale: nuxtApp.$switchLocale,
    $switchRoute: nuxtApp.$switchRoute,
    $localeRoute: nuxtApp.$localeRoute,
    $localePath: nuxtApp.$localePath,
    $loadPageTranslations: nuxtApp.$loadPageTranslations,
    $setMissingHandler: nuxtApp.$setMissingHandler,
    helper: nuxtApp.helper,
  } as const

  const noDollarInjections = Object.fromEntries(Object.entries(injections).map(([key, value]) => [key.slice(1), value]))

  return {
    ...injections,
    ...noDollarInjections,
  } as unknown as PluginsInjectionsWithAliases
}
