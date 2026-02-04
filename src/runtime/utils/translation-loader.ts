import type { Translations, ModuleOptionsExtend } from '@i18n-micro/types'
import type { useTranslationHelper } from '@i18n-micro/core'

export type TranslationLoaderHelper = ReturnType<typeof useTranslationHelper>

export type TranslationLoaderOptions = {
  i18nConfig: ModuleOptionsExtend
  runtimeConfig: { app: { baseURL: string } }
}

/**
 * Loads translations for a specific route and locale.
 * Pure utility — accepts all dependencies explicitly, no composable context.
 * Data flows into helper's useState caches, so SSR payload includes it automatically.
 */
export async function loadTranslations(
  locale: string,
  routeName: string | null | undefined,
  helper: TranslationLoaderHelper,
  options: TranslationLoaderOptions,
): Promise<void> {
  const { i18nConfig, runtimeConfig } = options

  if (!routeName || routeName === 'custom-fallback-route') return
  if (helper.hasPageTranslation(locale, routeName)) return

  const apiBaseUrl = i18nConfig.apiBaseUrl ?? '_locales'
  const apiBaseHost = import.meta.client ? i18nConfig.apiBaseClientHost : undefined

  let url = `/${apiBaseUrl}/${routeName}/${locale}/data.json`.replace(/\/{2,}/g, '/')
  if (apiBaseHost) {
    url = `${apiBaseHost}${url}`.replace(/([^:]\/)\/+/g, '$1')
  }

  try {
    const data: Translations = await $fetch(url, {
      baseURL: runtimeConfig.app.baseURL,
      params: { v: i18nConfig.dateBuild },
    })

    if (data && Object.keys(data).length > 0) {
      await helper.loadTranslations(locale, data)
      await helper.loadPageTranslations(locale, routeName, data)
    }
  }
  catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[i18n] Failed to load translations for ${routeName}/${locale}`, e)
    }
  }
}
