import { I18n, type I18nOptions } from '@i18n-micro/runtime'
import type { Translations } from '@i18n-micro/types'

export type AstroI18nOptions = I18nOptions

/** The runtime instance, plus what Astro pages use on top: per-route reads and a reset that keeps `messages`. */
export class AstroI18n extends I18n {
  private readonly initialMessages: Record<string, Translations>
  private readonly initialRouteMessages: Record<string, Record<string, Translations>>

  constructor(options: AstroI18nOptions) {
    super(options)
    const parent = options.parent as AstroI18n | undefined
    this.initialMessages = parent?.initialMessages ?? options.messages ?? {}
    this.initialRouteMessages = parent?.initialRouteMessages ?? options.routeMessages ?? {}
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
