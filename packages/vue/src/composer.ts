import { ref, shallowRef, triggerRef, type Ref } from 'vue'
import {
  useTranslationHelper,
  interpolate,
  FormatService,
  defaultPlural,
  type TranslationCache,
} from '@i18n-micro/core'
import type {
  Translations,
  Params,
  PluralFunc,
  Getter,
  CleanTranslation,
  TranslationKey,
} from '@i18n-micro/types'

export interface VueI18nOptions {
  locale: string
  fallbackLocale?: string
  messages?: Record<string, Translations>
  plural?: PluralFunc
  missingWarn?: boolean
  missingHandler?: (locale: string, key: string, routeName: string) => void
}

export class VueI18n {
  private _locale: Ref<string>
  private _fallbackLocale: Ref<string>
  private _currentRoute: Ref<string>
  private helper: ReturnType<typeof useTranslationHelper>
  private formatter = new FormatService()
  private pluralFunc: PluralFunc
  private missingWarn: boolean
  private missingHandler?: (locale: string, key: string, routeName: string) => void

  // Реактивный кэш, совместимый с RefLike из core
  // Делаем cache публичным, чтобы Bridge мог читать структуру
  public readonly cache: TranslationCache

  // Слушатели изменений для DevTools
  private listeners: Set<() => void> = new Set()

  constructor(options: VueI18nOptions) {
    this._locale = ref(options.locale)
    this._fallbackLocale = ref(options.fallbackLocale || options.locale)
    this._currentRoute = ref('general')
    this.pluralFunc = options.plural || defaultPlural
    this.missingWarn = options.missingWarn ?? false
    this.missingHandler = options.missingHandler

    // Создаем реактивные хранилища для Core
    this.cache = {
      generalLocaleCache: shallowRef<Record<string, Translations>>({}),
      routeLocaleCache: shallowRef<Record<string, Translations>>({}),
      dynamicTranslationsCaches: shallowRef<Record<string, Translations>[]>([]),
      serverTranslationCache: shallowRef<Record<string, Map<string, Translations | unknown>>>({}),
    }

    // Инициализируем Core с реактивным кэшем
    this.helper = useTranslationHelper(this.cache)

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

  getRoute(): string {
    return this._currentRoute.value
  }

  // Методы перевода
  public t(
    key: TranslationKey,
    params?: Params,
    defaultValue?: string | null,
    routeName?: string,
  ): CleanTranslation {
    if (!key) return ''

    const route = routeName || this._currentRoute.value
    const localeVal = this._locale.value

    // 1. Try to find translation in current locale (Core helper checks Route -> Global automatically)
    let value = this.helper.getTranslation<string>(localeVal, route, key)

    // 2. Fallback to fallbackLocale if not found and different
    if (!value && localeVal !== this._fallbackLocale.value) {
      value = this.helper.getTranslation<string>(this._fallbackLocale.value, route, key)
    }

    // 3. Handle missing
    if (!value) {
      if (this.missingHandler) {
        this.missingHandler(localeVal, key, route)
      }
      else if (this.missingWarn) {
        console.warn(
          `[i18n] Translation key '${key}' not found for locale '${localeVal}' (route: '${route}').`,
        )
      }
      value = defaultValue === undefined ? key : (defaultValue || key)
    }

    // 4. Interpolate
    if (typeof value === 'string' && params) {
      return interpolate(value, params)
    }

    return value || key
  }

  public ts(
    key: TranslationKey,
    params?: Params,
    defaultValue?: string,
    routeName?: string,
  ): string {
    const value = this.t(key, params, defaultValue, routeName)
    return value?.toString() ?? defaultValue ?? key
  }

  public tc(key: TranslationKey, count: number | Params, defaultValue?: string): string {
    const { count: countValue, ...params } = typeof count === 'number' ? { count } : count

    if (countValue === undefined) {
      return defaultValue ?? key
    }

    const getter: Getter = (k: TranslationKey, p?: Params, dv?: string) => {
      return this.t(k, p, dv)
    }

    const result = this.pluralFunc(
      key,
      Number.parseInt(countValue.toString()),
      params,
      this._locale.value,
      getter,
    )

    return result ?? defaultValue ?? key
  }

  public tn(value: number, options?: Intl.NumberFormatOptions): string {
    return this.formatter.formatNumber(value, this._locale.value, options)
  }

  public td(value: Date | number | string, options?: Intl.DateTimeFormatOptions): string {
    return this.formatter.formatDate(value, this._locale.value, options)
  }

  public tdr(value: Date | number | string, options?: Intl.RelativeTimeFormatOptions): string {
    return this.formatter.formatRelativeTime(value, this._locale.value, options)
  }

  public has(key: TranslationKey, _routeName?: string): boolean {
    return this.helper.hasTranslation(this._locale.value, key)
  }

  // Методы для добавления переводов (реактивно)
  public addTranslations(locale: string, translations: Translations, merge: boolean = true): void {
    if (merge) {
      this.helper.mergeGlobalTranslation(locale, translations, true)
    }
    else {
      this.helper.loadTranslations(locale, translations)
    }
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
    if (merge) {
      this.helper.mergeTranslation(locale, routeName, translations, true)
    }
    else {
      this.helper.loadPageTranslations(locale, routeName, translations)
    }
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

  public clearCache(): void {
    this.helper.clearCache()
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
