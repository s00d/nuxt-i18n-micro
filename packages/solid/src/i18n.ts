import { I18n, type I18nOptions } from '@i18n-micro/runtime'
import { type Accessor, createSignal } from 'solid-js'

export type SolidI18nOptions = I18nOptions

/**
 * The runtime instance with one signal over its store: every read tracks it, every change bumps
 * it. `getLocale()` and `getRoute()` stay plain, as a write reads them too: track with `locale`
 * and `currentRoute`.
 */
export class SolidI18n extends I18n {
  private readonly revision: Accessor<number>

  public readonly localeAccessor: Accessor<string> = () => this.locale
  public readonly routeAccessor: Accessor<string> = () => this.currentRoute

  constructor(options: SolidI18nOptions) {
    super(options)
    const [revision, setRevision] = createSignal(0)
    this.revision = revision
    this.subscribe(() => setRevision((n) => n + 1))
  }

  protected override touch(): void {
    this.revision()
  }

  override get locale(): string {
    this.touch()
    return super.locale
  }

  override set locale(value: string) {
    super.locale = value
  }

  override get fallbackLocale(): string {
    this.touch()
    return super.fallbackLocale
  }

  override set fallbackLocale(value: string) {
    super.fallbackLocale = value
  }

  override get currentRoute(): string {
    this.touch()
    return super.currentRoute
  }
}

export function createI18n(options: SolidI18nOptions): SolidI18n {
  return new SolidI18n(options)
}
