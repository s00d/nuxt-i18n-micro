import { I18n, type I18nOptions } from '@i18n-micro/runtime'
import { type Accessor, batch, createSignal } from 'solid-js'

export type SolidI18nOptions = I18nOptions

/**
 * The runtime instance with signals over its store. A translation read tracks the revision, which
 * every change bumps. Reading the locale tracks the locale alone, so `createEffect(() => load(locale()))`
 * does not wake itself. `getLocale()` and `getRoute()` stay plain, as a write reads them too: track
 * with `locale` and `currentRoute`.
 */
export class SolidI18n extends I18n {
  private readonly revision: Accessor<number>
  private readonly localeSignal: Accessor<string>
  private readonly fallbackSignal: Accessor<string>
  private readonly routeSignal: Accessor<string>

  public readonly localeAccessor: Accessor<string> = () => this.locale
  public readonly routeAccessor: Accessor<string> = () => this.currentRoute

  constructor(options: SolidI18nOptions) {
    super(options)
    const [revision, setRevision] = createSignal(0)
    const [locale, setLocale] = createSignal(this.getLocale())
    const [fallback, setFallback] = createSignal(this.getFallbackLocale())
    const [route, setRoute] = createSignal(this.getRoute())
    this.revision = revision
    this.localeSignal = locale
    this.fallbackSignal = fallback
    this.routeSignal = route
    this.subscribe(() => {
      batch(() => {
        setLocale(this.getLocale())
        setFallback(this.getFallbackLocale())
        setRoute(this.getRoute())
        setRevision((n) => n + 1)
      })
    })
  }

  protected override touch(): void {
    this.revision()
  }

  override get locale(): string {
    return this.localeSignal()
  }

  override set locale(value: string) {
    super.locale = value
  }

  override get fallbackLocale(): string {
    return this.fallbackSignal()
  }

  override set fallbackLocale(value: string) {
    super.fallbackLocale = value
  }

  override get currentRoute(): string {
    return this.routeSignal()
  }
}

export function createI18n(options: SolidI18nOptions): SolidI18n {
  return new SolidI18n(options)
}
