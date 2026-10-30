import { I18n, type I18nOptions } from '@i18n-micro/runtime'
import type { Translations } from '@i18n-micro/types'

export type AstroI18nOptions = I18nOptions

/** The runtime instance, plus what Astro pages use on top: per-route reads and a reset that keeps `messages`. */
export class AstroI18n extends I18n {
  private initialMessages: Record<string, Translations>
  private initialRouteMessages: Record<string, Record<string, Translations>>

  constructor(options: AstroI18nOptions) {
    super(options)
    const parent = options.parent as AstroI18n | undefined
    this.initialMessages = parent?.initialMessages ?? { ...options.messages }
    this.initialRouteMessages =
      parent?.initialRouteMessages ??
      Object.fromEntries(Object.entries(options.routeMessages ?? {}).map(([route, locales]) => [route, { ...locales }]))
  }

  /** Dictionaries loaded after the constructor that `clearCache` keeps too: a directory read at runtime. */
  public keepMessages(messages: Record<string, Translations>, routeMessages: Record<string, Record<string, Translations>>): void {
    this.initialMessages = { ...this.initialMessages, ...messages }
    const routes = { ...this.initialRouteMessages }
    for (const [route, locales] of Object.entries(routeMessages)) routes[route] = { ...routes[route], ...locales }
    this.initialRouteMessages = routes
  }

  /** The `localeIso` option: what an island needs to plural in another locale. */
  public getLocaleIso(): Record<string, string> {
    return this.localeIso
  }

  public getRouteTranslations(locale: string, routeName: string): Translations | null {
    return this.helper.getCache(locale, routeName) ?? null
  }

  public mergeTranslations(locale: string, routeName: string, translations: Translations): void {
    this.addRouteTranslations(locale, routeName, translations)
  }

  public override clearCache(): void {
    super.clearCache()
    this.loadMessages(this.initialMessages, this.initialRouteMessages)
  }
}
