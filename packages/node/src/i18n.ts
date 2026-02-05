import { BaseI18n, type TranslationStorage } from '@i18n-micro/core'
import type { Translations, PluralFunc, TranslationKey } from '@i18n-micro/types'
import { loadTranslations } from './loader'

export interface I18nOptions {
  locale: string
  fallbackLocale?: string
  translationDir?: string
  plural?: PluralFunc
  missingWarn?: boolean
  missingHandler?: (locale: string, key: string, routeName: string) => void
  disablePageLocales?: boolean
}

export class I18n extends BaseI18n {
  public locale: string
  public fallbackLocale: string
  public translationDir?: string
  private disablePageLocales: boolean

  public currentRoute: string = 'general'

  constructor(options: I18nOptions) {
    const storage: TranslationStorage = {
      translations: new Map<string, Translations>(),
    }

    super({
      storage,
      plural: options.plural,
      missingWarn: options.missingWarn,
      missingHandler: options.missingHandler,
    })

    this.locale = options.locale
    this.fallbackLocale = options.fallbackLocale || options.locale
    this.translationDir = options.translationDir
    this.disablePageLocales = options.disablePageLocales ?? false
  }

  public setRoute(routeName: string) {
    this.currentRoute = routeName
  }

  public getLocale(): string {
    return this.locale
  }

  public getFallbackLocale(): string {
    return this.fallbackLocale
  }

  public getRoute(): string {
    return this.currentRoute
  }

  public async loadTranslations(dir?: string): Promise<void> {
    const targetDir = dir || this.translationDir
    if (!targetDir) {
      console.warn('[i18n-node] No translation directory specified')
      return
    }

    const { global, routes } = await loadTranslations(targetDir, this.disablePageLocales)

    for (const [locale, translations] of Object.entries(global)) {
      this.helper.mergeGlobalTranslation(locale, translations, true)
    }

    for (const [routeName, routeLocales] of Object.entries(routes)) {
      for (const [locale, translations] of Object.entries(routeLocales)) {
        this.helper.loadPageTranslations(locale, routeName, translations)
      }
    }
  }

  public async reload(): Promise<void> {
    this.helper.clearCache()
    await this.loadTranslations()
    console.log('[i18n-node] Cache cleared and translations reloaded.')
  }

  public addTranslations(locale: string, translations: Translations, merge = true): void {
    super.loadTranslationsCore(locale, translations, merge)
  }

  public addRouteTranslations(
    locale: string,
    routeName: string,
    translations: Translations,
    merge = true,
  ): void {
    super.loadRouteTranslationsCore(locale, routeName, translations, merge)
  }

  public hasTranslation(key: TranslationKey): boolean {
    return this.helper.hasTranslation(this.locale, key)
  }

  public clear(): void {
    super.clearCache()
  }
}

export function createI18n(options: I18nOptions): I18n {
  return new I18n(options)
}
