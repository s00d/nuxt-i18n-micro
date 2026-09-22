import { I18n as RuntimeI18n, type I18nOptions as RuntimeI18nOptions } from '@i18n-micro/runtime'
import { mergeRouteTranslationsWithRoot } from '@i18n-micro/utils/parse-path'
import { loadTranslations } from './loader'

export interface I18nOptions extends RuntimeI18nOptions {
  translationDir?: string
  disablePageLocales?: boolean
}

export class I18n extends RuntimeI18n {
  public translationDir?: string
  private disablePageLocales: boolean

  constructor(options: I18nOptions) {
    const { translationDir, disablePageLocales, ...runtimeOptions } = options
    super(runtimeOptions)

    this.translationDir = translationDir
    this.disablePageLocales = disablePageLocales ?? false
  }

  public async loadTranslations(dir?: string): Promise<void> {
    const targetDir = dir || this.translationDir
    if (!targetDir) {
      console.warn('[i18n-node] No translation directory specified')
      return
    }

    const { root, routes } = await loadTranslations(targetDir, this.disablePageLocales)

    // Load root translations as index (base for all pages)
    for (const [locale, translations] of Object.entries(root)) {
      this.helper.mergeTranslation(locale, 'index', translations, true)
    }

    // Load page translations with index (base) baked in
    for (const [routeName, routeLocales] of Object.entries(routes)) {
      for (const [locale, translations] of Object.entries(routeLocales)) {
        const base = this.helper.getCache(locale, 'index')
        this.helper.loadPageTranslations(locale, routeName, mergeRouteTranslationsWithRoot(base, translations))
      }
    }

    this.onTranslationsChanged()
  }

  public async reload(): Promise<void> {
    const targetDir = this.translationDir
    if (!targetDir) {
      console.warn('[i18n-node] No translation directory specified')
      return
    }

    this.clearCache()
    await this.loadTranslations(targetDir)
    console.log('[i18n-node] Cache cleared and translations reloaded.')
  }
}

export function createI18n(options: I18nOptions): I18n {
  return new I18n(options)
}
