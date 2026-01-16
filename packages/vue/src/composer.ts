import { ref, shallowRef, triggerRef, type Ref } from 'vue'
import {
  BaseI18n,
  type TranslationCache,
} from '@i18n-micro/core'
import type {
  Translations,
  PluralFunc,
  MessageCompilerFunc,
} from '@i18n-micro/types'

export interface VueI18nOptions {
  locale: string
  fallbackLocale?: string
  messages?: Record<string, Translations>
  plural?: PluralFunc
  /**
   * Custom function for compiling messages, enabling ICU MessageFormat or other advanced formatting libraries.
   */
  messageCompiler?: MessageCompilerFunc
  missingWarn?: boolean
  missingHandler?: (locale: string, key: string, routeName: string) => void
}

export class VueI18n extends BaseI18n {
  private _locale: Ref<string>
  private _fallbackLocale: Ref<string>
  private _currentRoute: Ref<string>

  // Реактивный кэш, совместимый с RefLike из core
  public readonly cache: TranslationCache

  // Слушатели изменений для DevTools
  private listeners: Set<() => void> = new Set()

  constructor(options: VueI18nOptions) {
    // Создаем реактивные хранилища для Core
    const cache: TranslationCache = {
      generalLocaleCache: shallowRef<Record<string, Translations>>({}),
      routeLocaleCache: shallowRef<Record<string, Translations>>({}),
      dynamicTranslationsCaches: shallowRef<Record<string, Translations>[]>([]),
      serverTranslationCache: shallowRef<Record<string, Map<string, Translations | unknown>>>({}),
    }

    // Call parent constructor with options
    super({
      cache,
      plural: options.plural,
      messageCompiler: options.messageCompiler,
      missingWarn: options.missingWarn,
      missingHandler: options.missingHandler,
    })

    // Assign cache to public readonly property
    this.cache = cache

    this._locale = ref(options.locale)
    this._fallbackLocale = ref(options.fallbackLocale || options.locale)
    this._currentRoute = ref('general')

    // Загружаем начальные сообщения
    if (options.messages) {
      for (const [lang, msgs] of Object.entries(options.messages)) {
        this.helper.loadTranslations(lang, msgs)
      }
    }
  }

  // Геттер/Сеттер для локали
  get locale(): Ref<string> {
    return this._locale
  }

  set locale(val: Ref<string> | string) {
    if (typeof val === 'string') {
      this._locale.value = val
    }
    else {
      this._locale = val
    }
  }

  // Геттер/Сеттер для fallback локали
  get fallbackLocale(): Ref<string> {
    return this._fallbackLocale
  }

  set fallbackLocale(val: Ref<string> | string) {
    if (typeof val === 'string') {
      this._fallbackLocale.value = val
    }
    else {
      this._fallbackLocale = val
    }
  }

  // Геттер/Сеттер для текущего роута
  get currentRoute(): Ref<string> {
    return this._currentRoute
  }

  setRoute(routeName: string): void {
    this._currentRoute.value = routeName
  }

  // --- Implementation of abstract methods ---

  public getLocale(): string {
    return this._locale.value
  }

  public getFallbackLocale(): string {
    return this._fallbackLocale.value
  }

  public getRoute(): string {
    return this._currentRoute.value
  }

  // Методы для добавления переводов (реактивно) - uses protected methods from base class
  public addTranslations(locale: string, translations: Translations, merge: boolean = true): void {
    super.loadTranslationsCore(locale, translations, merge)
    // Clear compiled message cache when translations are updated
    this.clearCompiledCache()
    // Триггерим реактивность для shallowRef после изменения объекта внутри
    // В Vue пакете cache всегда содержит shallowRef, поэтому используем type assertion
    triggerRef(this.cache.generalLocaleCache as Ref<Record<string, Translations>>)
    this.notifyListeners()
  }

  public addRouteTranslations(
    locale: string,
    routeName: string,
    translations: Translations,
    merge: boolean = true,
  ): void {
    super.loadRouteTranslationsCore(locale, routeName, translations, merge)
    // Clear compiled message cache when translations are updated
    this.clearCompiledCache()
    // Триггерим реактивность для shallowRef после изменения объекта внутри
    triggerRef(this.cache.routeLocaleCache as Ref<Record<string, Translations>>)
    this.notifyListeners()
  }

  public mergeTranslations(locale: string, routeName: string, translations: Translations): void {
    this.helper.mergeTranslation(locale, routeName, translations, true)
    // Триггерим реактивность для shallowRef после изменения объекта внутри
    triggerRef(this.cache.routeLocaleCache as Ref<Record<string, Translations>>)
    this.notifyListeners()
  }

  public mergeGlobalTranslations(locale: string, translations: Translations): void {
    this.helper.mergeGlobalTranslation(locale, translations, true)
    // Триггерим реактивность для shallowRef после изменения объекта внутри
    triggerRef(this.cache.generalLocaleCache as Ref<Record<string, Translations>>)
    this.notifyListeners()
  }

  public override clearCache(): void {
    super.clearCache()
    // Триггерим реактивность для всех shallowRef после очистки кэша
    triggerRef(this.cache.generalLocaleCache as Ref<Record<string, Translations>>)
    triggerRef(this.cache.routeLocaleCache as Ref<Record<string, Translations>>)
    triggerRef(this.cache.dynamicTranslationsCaches as Ref<Record<string, Translations>[]>)
    triggerRef(this.cache.serverTranslationCache as Ref<Record<string, Map<string, Translations | unknown>>>)
    this.notifyListeners()
  }

  // Подписка на изменения для DevTools
  public subscribeToChanges(cb: () => void): () => void {
    this.listeners.add(cb)
    return () => {
      this.listeners.delete(cb)
    }
  }

  // Уведомление подписчиков об изменениях
  private notifyListeners(): void {
    this.listeners.forEach((cb) => {
      cb()
    })
  }

  // Method for devtools: get all translations from cache
  public getAllTranslations(): Record<string, Translations> {
    const result: Record<string, Translations> = {}
    const generalCache = this.cache.generalLocaleCache.value || {}
    const routeCache = this.cache.routeLocaleCache.value || {}

    // Merge general translations
    for (const [locale, translations] of Object.entries(generalCache)) {
      if (!result[locale]) {
        result[locale] = {}
      }
      Object.assign(result[locale], translations)
    }

    // Merge route-specific translations (flattened by route)
    for (const [_route, localeTranslations] of Object.entries(routeCache)) {
      if (localeTranslations && typeof localeTranslations === 'object' && !Array.isArray(localeTranslations)) {
        for (const [locale, translations] of Object.entries(localeTranslations as Record<string, Translations>)) {
          if (!result[locale]) {
            result[locale] = {}
          }
          // Route translations are already namespaced by route in the cache
          if (translations && typeof translations === 'object' && !Array.isArray(translations)) {
            Object.assign(result[locale], translations)
          }
        }
      }
    }

    return result
  }

  // Method for devtools: get cache (for direct access if needed)
  public getCache(): TranslationCache {
    return this.cache
  }
}
