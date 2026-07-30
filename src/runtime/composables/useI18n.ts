import { useNuxtApp } from '#app'
import type { PluginsInjections } from '../plugins/01.plugin'

type RemoveDollarSign<T> = {
  [K in keyof T as K extends `$${infer Rest}` ? Rest : K]: T[K]
}

export type PluginsInjectionsWithAliases = PluginsInjections & RemoveDollarSign<PluginsInjections>

/**
 * Every runtime helper, as a plain object.
 *
 * The same functions the plugin injects as `$t`, `$tc` and so on, available under both
 * the dollar-prefixed name and a bare alias — so `const { t } = useI18n()` and
 * `const { $t } = useI18n()` both work.
 *
 * @returns the helpers described in the [methods reference](/api/methods)
 * @example
 * ```ts
 * const { t, tc, switchLocale, getLocale } = useI18n()
 *
 * t('welcome', { name: 'Ada' })
 * tc('items', 3)
 * switchLocale('de')
 * ```
 */
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
    $getTranslations: nuxtApp.$getTranslations,
    $setTranslation: nuxtApp.$setTranslation,
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
