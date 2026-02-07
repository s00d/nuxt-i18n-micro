import { I18nDefaultLocaleKey, I18nLocalesKey, type I18nPlugin } from '@i18n-micro/vue'
import type { App } from 'vue'
import { defaultLocale, localesConfig } from './app-config'

/**
 * Load translations for a locale
 */
export async function loadTranslations(
  i18nInstance: ReturnType<typeof import('@i18n-micro/vue').createI18n>['global'],
  locale: string,
): Promise<void> {
  try {
    const messages = await import(`./locales/${locale}.json`)
    i18nInstance.addTranslations(locale, messages.default, false)
  } catch (error) {
    console.error(`Failed to load translations for locale: ${locale}`, error)
  }
}

/**
 * Setup app with i18n configuration
 */
export function setupApp(
  app: App,
  i18n: I18nPlugin,
  router?: { install: (app: App) => void }, // Router from vue-router, but optional to work without router
  _options?: Record<string, never>,
): void {
  console.log('[playground] setupApp called')
  console.log('[playground] router:', router)
  console.log('[playground] i18n:', i18n)
  console.log('[playground] localesConfig:', localesConfig)
  console.log('[playground] defaultLocale:', defaultLocale)

  if (router) {
    app.use(router)
    console.log('[playground] Router installed')
  }
  app.use(i18n)
  console.log('[playground] I18n plugin installed')

  // Provide locales configuration for useI18n composable
  app.provide(I18nLocalesKey, localesConfig)
  app.provide(I18nDefaultLocaleKey, defaultLocale)
  console.log('[playground] Locales and defaultLocale provided')
}

/**
 * Preload translations for all locales except the initial one
 */
export async function preloadTranslations(
  i18nInstance: ReturnType<typeof import('@i18n-micro/vue').createI18n>['global'],
  initialLocale: string = defaultLocale,
): Promise<void> {
  const otherLocales = localesConfig.map((locale) => locale.code).filter((code) => code !== initialLocale)

  await Promise.all(otherLocales.map((locale) => loadTranslations(i18nInstance, locale))).catch(() => {
    // Ignore errors for preloading
  })
}
