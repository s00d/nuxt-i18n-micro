import { createSignal, type Accessor, type Setter } from 'solid-js'
import { createStore, type SetStoreFunction } from 'solid-js/store'
import { BaseI18n, type TranslationCache } from '@i18n-micro/core'
import type { Translations, PluralFunc, MessageCompilerFunc } from '@i18n-micro/types'

export interface SolidI18nOptions {
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

/**
 * SolidJS I18n Adapter
 *
 * Provides a SolidJS-compatible i18n instance that uses the shared core logic.
 * Uses createSignal for locale/route reactivity and createStore for translation cache.
 */
export class SolidI18n extends BaseI18n {
  // Реактивные примитивы Solid
  private _locale: Accessor<string>
  private _setLocale: Setter<string>
  private _fallbackLocale: Accessor<string>
  private _currentRoute: Accessor<string>
  private _setRoute: Setter<string>

  // Store для кэша.
  // Мы используем createStore для глубокой реактивности, чтобы при подгрузке
  // частичных переводов (mergeTranslation) интерфейс обновлялся.
  public readonly cacheStore: {
    general: Record<string, Translations>
    route: Record<string, Translations>
  }

  private setCacheStore: SetStoreFunction<{
    general: Record<string, Translations>
    route: Record<string, Translations>
  }>

  // Слушатели для DevTools (аналог subscribe в React версии)
  private listeners = new Set<() => void>()

  constructor(options: SolidI18nOptions) {
    // 1. Инициализация реактивного хранилища
    // Создаем signals и store напрямую (без createRoot, так как это SolidJS, не Preact)
    const [locale, setLocale] = createSignal(options.locale)
    const [fallback] = createSignal(options.fallbackLocale || options.locale)
    const [route, setRoute] = createSignal('general')

    const [store, setStore] = createStore({
      general: {} as Record<string, Translations>,
      route: {} as Record<string, Translations>,
    })

    // 2. Адаптация для BaseI18n
    // BaseI18n ожидает RefLike объекты. В Solid Store работает как Proxy,
    // поэтому мы можем обернуть доступ к нему.
    const cacheAdapter: TranslationCache = {
      // Solid Store Proxy is compatible with reading objects
      generalLocaleCache: { value: store.general } as unknown as TranslationCache['generalLocaleCache'],
      routeLocaleCache: { value: store.route } as unknown as TranslationCache['routeLocaleCache'],
      dynamicTranslationsCaches: { value: [] },
      serverTranslationCache: { value: {} },
    }

    super({
      cache: cacheAdapter,
      plural: options.plural,
      messageCompiler: options.messageCompiler,
      missingWarn: options.missingWarn,
      missingHandler: options.missingHandler,
    })

    this._locale = locale
    this._setLocale = setLocale
    this._fallbackLocale = fallback
    this._currentRoute = route
    this._setRoute = setRoute

    this.cacheStore = store
    this.setCacheStore = setStore

    // Загрузка начальных сообщений
    if (options.messages) {
      for (const [lang, msgs] of Object.entries(options.messages)) {
        this.addTranslations(lang, msgs)
      }
    }
  }

  // --- Abstract Implementation ---

  public getLocale(): string {
    return this._locale()
  }

  public getFallbackLocale(): string {
    return this._fallbackLocale()
  }

  public getRoute(): string {
    return this._currentRoute()
  }

  // --- Setters ---

  public set locale(val: string) {
    this._setLocale(val)
    this.notifyListeners()
  }

  public get locale(): string {
    return this._locale()
  }

  // Публичный accessor для реактивности
  public get localeAccessor(): Accessor<string> {
    return this._locale
  }

  public get fallbackLocale(): string {
    return this._fallbackLocale()
  }

  public get currentRoute(): string {
    return this._currentRoute()
  }

  // Публичный accessor для реактивности
  public get routeAccessor(): Accessor<string> {
    return this._currentRoute
  }

  public setRoute(val: string): void {
    this._setRoute(val)
    this.notifyListeners()
  }

  // --- Overrides for Reactivity ---

  public addTranslations(locale: string, translations: Translations, merge = true): void {
    if (merge) {
      this.setCacheStore('general', locale, (prev: Translations | undefined) => ({
        ...(prev || {}),
        ...translations,
      }))
    }
    else {
      this.setCacheStore('general', locale, translations)
    }
    // Clear compiled message cache when translations are updated
    this.clearCompiledCache()
    this.notifyListeners()
  }

  public addRouteTranslations(locale: string, routeName: string, translations: Translations, merge = true): void {
    const key = `${locale}:${routeName}`
    if (merge) {
      this.setCacheStore('route', key, (prev: Translations | undefined) => ({
        ...(prev || {}),
        ...translations,
      }))
    }
    else {
      this.setCacheStore('route', key, translations)
    }
    // Clear compiled message cache when translations are updated
    this.clearCompiledCache()
    this.notifyListeners()
  }

  public override clearCache(): void {
    this.setCacheStore('general', {})
    this.setCacheStore('route', {})
    super.clearCache()
    this.notifyListeners()
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb)
    return () => this.listeners.delete(cb)
  }

  private notifyListeners(): void {
    this.listeners.forEach((cb) => {
      cb()
    })
  }
}

export function createI18n(options: SolidI18nOptions): SolidI18n {
  return new SolidI18n(options)
}
