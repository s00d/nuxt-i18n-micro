import type { Locale } from '@i18n-micro/types'

type LocaleOption = Locale | string

interface LayerWithLocales {
  config: { i18n?: { locales?: LocaleOption[] } }
}

/**
 * `locales` in layer priority: the project's, then each layer in `extends` order, then the merged list (inline module
 * options). Nuxt concatenates the layers' arrays with the project's entries last, and every consumer keeps the first
 * entry of a code, so without this a layer's `iso` or `baseUrl` would beat the project's.
 */
export function localesByLayerPriority(layers: readonly LayerWithLocales[], merged: readonly LocaleOption[] = []): LocaleOption[] {
  return [...layers.flatMap((layer) => layer.config.i18n?.locales ?? []), ...merged]
}
