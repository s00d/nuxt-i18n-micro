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

export interface AstroI18nOptions {
  locale: string
  fallbackLocale?: string
  messages?: Record<string, Translations>
  plural?: PluralFunc
  missingWarn?: boolean
  missingHandler?: (locale: string, key: string, routeName: string) => void
  // NEW: Allow passing existing cache
  _cache?: TranslationCache
}

export class AstroI18n {
  private _locale: string
  private _fallbackLocale: string
  private _currentRoute: string
  private helper: ReturnType<typeof useTranslationHelper>
  private formatter = new FormatService()
  private pluralFunc: PluralFunc
  private missingWarn: boolean
  private missingHandler?: (locale: string, key: string, routeName: string) => void

  // Кэш для Core (без Vue реактивности)
  public readonly cache: TranslationCache

  // Сохраняем начальные переводы для восстановления после clearCache
  private initialMessages: Record<string, Translations> = {}

  constructor(options: AstroI18nOptions) {
    this._locale = options.locale
    this._fallbackLocale = options.fallbackLocale || options.locale
    this._currentRoute = 'general'
    this.pluralFunc = options.plural || defaultPlural
    this.missingWarn = options.missingWarn ?? false
    this.missingHandler = options.missingHandler

    // Если передан существующий кэш (от глобального инстанса), используем его.
    // Иначе создаем новый.
    this.cache = options._cache || {
      generalLocaleCache: {},
      routeLocaleCache: {},
      dynamicTranslationsCaches: [],
      serverTranslationCache: {},
    }

    // Инициализируем Core с простым кэшем
    this.helper = useTranslationHelper(this.cache)

    // Загружаем начальные сообщения (только если это первичная инициализация или добавление новых)
    if (options.messages) {
      // Сохраняем начальные переводы для восстановления после clearCache
      this.initialMessages = { ...options.messages }
      for (const [lang, msgs] of Object.entries(options.messages)) {
        this.helper.loadTranslations(lang, msgs)
      }
    }
  }

  // Создать легкую копию для нового запроса с тем же кэшем
  public clone(newLocale?: string): AstroI18n {
    return new AstroI18n({
      locale: newLocale || this._locale,
      fallbackLocale: this._fallbackLocale,
      plural: this.pluralFunc,
      missingWarn: this.missingWarn,
      missingHandler: this.missingHandler,
      _cache: this.cache, // ШЕРИМ КЭШ
    })
  }

  // Геттер/Сеттер для локали
  get locale(): string {
    return this._locale
  }

  set locale(val: string) {
    this._locale = val
  }

  // Геттер/Сеттер для fallback локали
  get fallbackLocale(): string {
    return this._fallbackLocale
  }

  set fallbackLocale(val: string) {
    this._fallbackLocale = val
  }

  // Геттер/Сеттер для текущего роута
  get currentRoute(): string {
    return this._currentRoute
  }

  setRoute(routeName: string): void {
    this._currentRoute = routeName
  }

  getRoute(): string {
    return this._currentRoute
  }

  // Методы перевода
  public t(
    key: TranslationKey,
    params?: Params,
    defaultValue?: string | null,
    routeName?: string,
  ): CleanTranslation {
    if (!key) return ''

    const route = routeName || this._currentRoute
    const localeVal = this._locale

    // 1. Try to find translation in current locale (Core helper checks Route -> Global automatically)
    let value = this.helper.getTranslation<string>(localeVal, route, key)

    // 2. Fallback to fallbackLocale if not found and different
    if (!value && localeVal !== this._fallbackLocale) {
      value = this.helper.getTranslation<string>(this._fallbackLocale, route, key)
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
      // Приводим типы, так как t может вернуть сложный объект, но для плюрализации нам нужна строка
      const val = this.t(k, p, dv)
      return typeof val === 'string' ? val : ''
    }

    const result = this.pluralFunc(
      key,
      Number.parseInt(countValue.toString()),
      params,
      this._locale,
      getter,
    )

    return result ?? defaultValue ?? key
  }

  public tn(value: number, options?: Intl.NumberFormatOptions): string {
    return this.formatter.formatNumber(value, this._locale, options)
  }

  public td(value: Date | number | string, options?: Intl.DateTimeFormatOptions): string {
    return this.formatter.formatDate(value, this._locale, options)
  }

  public tdr(value: Date | number | string, options?: Intl.RelativeTimeFormatOptions): string {
    return this.formatter.formatRelativeTime(value, this._locale, options)
  }

  public has(key: TranslationKey, _routeName?: string): boolean {
    return this.helper.hasTranslation(this._locale, key)
  }

  // Методы для добавления переводов
  public addTranslations(locale: string, translations: Translations, merge: boolean = true): void {
    if (merge) {
      this.helper.mergeGlobalTranslation(locale, translations, true)
    }
    else {
      this.helper.loadTranslations(locale, translations)
    }
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
  }

  public mergeTranslations(locale: string, routeName: string, translations: Translations): void {
    this.helper.mergeTranslation(locale, routeName, translations, true)
  }

  public mergeGlobalTranslations(locale: string, translations: Translations): void {
    this.helper.mergeGlobalTranslation(locale, translations, true)
  }

  public clearCache(): void {
    // Сохраняем начальные переводы перед очисткой
    const initialMessages = { ...this.initialMessages }

    // Очищаем кэш
    this.helper.clearCache()

    // Восстанавливаем начальные переводы
    if (Object.keys(initialMessages).length > 0) {
      for (const [lang, msgs] of Object.entries(initialMessages)) {
        this.helper.loadTranslations(lang, msgs)
      }
    }
  }
}
