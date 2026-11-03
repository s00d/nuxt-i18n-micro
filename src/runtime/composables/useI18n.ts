import { useNuxtApp } from '#app/nuxt'
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
  // the plugin builds this object (both spellings, same functions) once per app
  return useNuxtApp().$i18n as unknown as PluginsInjectionsWithAliases
}
