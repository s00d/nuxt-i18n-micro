/**
 * Shared reactive state for framework i18n adapters (subscribe / getSnapshot / notify).
 */
export interface ReactiveI18nStoreOptions {
  locale: string
  fallbackLocale?: string
  route?: string
}

export interface ReactiveI18nStore {
  subscribe(listener: () => void): () => void
  getSnapshot(): string
  getLocale(): string
  setLocale(locale: string): void
  getFallbackLocale(): string
  setFallbackLocale(locale: string): void
  getRoute(): string
  setRoute(routeName: string): void
  notify(): void
}

export function createReactiveI18nStore(options: ReactiveI18nStoreOptions): ReactiveI18nStore {
  let locale = options.locale
  let fallbackLocale = options.fallbackLocale ?? options.locale
  let currentRoute = options.route ?? 'index'
  let revision = 0
  const listeners = new Set<() => void>()

  const notify = () => {
    revision++
    listeners.forEach((listener) => listener())
  }

  return {
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getSnapshot() {
      return `${locale}:${currentRoute}:${revision}`
    },
    getLocale() {
      return locale
    },
    setLocale(val) {
      if (locale !== val) {
        locale = val
        notify()
      }
    },
    getFallbackLocale() {
      return fallbackLocale
    },
    setFallbackLocale(val) {
      if (fallbackLocale !== val) {
        fallbackLocale = val
        notify()
      }
    },
    getRoute() {
      return currentRoute
    },
    setRoute(routeName) {
      if (currentRoute !== routeName) {
        currentRoute = routeName
        notify()
      }
    },
    notify,
  }
}
