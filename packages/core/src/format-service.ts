export type NumberFormatsConfig = Record<string, Record<string, Intl.NumberFormatOptions>>
export type DateTimeFormatsConfig = Record<string, Record<string, Intl.DateTimeFormatOptions>>

export interface FormatServiceOptions {
  numberFormats?: NumberFormatsConfig
  /** Vue I18n-compatible name (`datetimeFormats`). */
  datetimeFormats?: DateTimeFormatsConfig
}

function stableOptionsKey(options: object | undefined): string {
  if (!options) return ''
  const keys = Object.keys(options).sort()
  if (keys.length === 0) return ''
  const normalized: Record<string, unknown> = {}
  for (const key of keys) {
    normalized[key] = (options as Record<string, unknown>)[key]
  }
  return JSON.stringify(normalized)
}

function formatterCacheKey(locale: string, options: object | undefined): string {
  const optsKey = stableOptionsKey(options)
  return optsKey ? `${locale}\0${optsKey}` : locale
}

/**
 * Shared Intl formatters with:
 * - Map cache keyed by locale + options (avoids `new Intl.*Format` on every call)
 * - Named formats (`numberFormats` / `datetimeFormats`) for Vue I18n-compatible `$tn(n, 'currency')`
 */
export class FormatService {
  private numberFormats: NumberFormatsConfig
  private datetimeFormats: DateTimeFormatsConfig
  private numberCache = new Map<string, Intl.NumberFormat>()
  private dateCache = new Map<string, Intl.DateTimeFormat>()
  private relativeCache = new Map<string, Intl.RelativeTimeFormat>()

  constructor(options: FormatServiceOptions = {}) {
    this.numberFormats = options.numberFormats ?? {}
    this.datetimeFormats = options.datetimeFormats ?? {}
  }

  setNumberFormats(formats: NumberFormatsConfig): void {
    this.numberFormats = formats
    this.numberCache.clear()
  }

  setDateTimeFormats(formats: DateTimeFormatsConfig): void {
    this.datetimeFormats = formats
    this.dateCache.clear()
  }

  getNumberFormats(): NumberFormatsConfig {
    return this.numberFormats
  }

  getDateTimeFormats(): DateTimeFormatsConfig {
    return this.datetimeFormats
  }

  clearCache(): void {
    this.numberCache.clear()
    this.dateCache.clear()
    this.relativeCache.clear()
  }

  /** Resolve a named number format for a locale (exact match, then language subtag). */
  resolveNumberFormat(locale: string, key: string): Intl.NumberFormatOptions | undefined {
    return this.numberFormats[locale]?.[key] ?? this.numberFormats[locale.split('-')[0]!]?.[key]
  }

  /** Resolve a named datetime format for a locale (exact match, then language subtag). */
  resolveDateTimeFormat(locale: string, key: string): Intl.DateTimeFormatOptions | undefined {
    return this.datetimeFormats[locale]?.[key] ?? this.datetimeFormats[locale.split('-')[0]!]?.[key]
  }

  getNumberFormatter(locale: string, options?: Intl.NumberFormatOptions): Intl.NumberFormat {
    const key = formatterCacheKey(locale, options)
    let formatter = this.numberCache.get(key)
    if (!formatter) {
      formatter = new Intl.NumberFormat(locale, options)
      this.numberCache.set(key, formatter)
    }
    return formatter
  }

  getDateTimeFormatter(locale: string, options?: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
    const key = formatterCacheKey(locale, options)
    let formatter = this.dateCache.get(key)
    if (!formatter) {
      formatter = new Intl.DateTimeFormat(locale, options)
      this.dateCache.set(key, formatter)
    }
    return formatter
  }

  getRelativeTimeFormatter(locale: string, options?: Intl.RelativeTimeFormatOptions): Intl.RelativeTimeFormat {
    const key = formatterCacheKey(locale, options)
    let formatter = this.relativeCache.get(key)
    if (!formatter) {
      formatter = new Intl.RelativeTimeFormat(locale, options)
      this.relativeCache.set(key, formatter)
    }
    return formatter
  }

  formatNumber(value: number, locale: string, options?: Intl.NumberFormatOptions): string {
    return this.getNumberFormatter(locale, options).format(value)
  }

  formatDate(value: Date | number | string, locale: string, options?: Intl.DateTimeFormatOptions): string {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return 'Invalid Date'
    }
    return this.getDateTimeFormatter(locale, options).format(date)
  }

  formatRelativeTime(value: Date | number | string, locale: string, options?: Intl.RelativeTimeFormatOptions): string {
    const date = new Date(value)
    const formatter = this.getRelativeTimeFormatter(locale, options)

    if (Number.isNaN(date.getTime())) {
      return formatter.format(0, 'second')
    }

    const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000)

    const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
      { unit: 'year', seconds: 31536000 },
      { unit: 'month', seconds: 2592000 },
      { unit: 'day', seconds: 86400 },
      { unit: 'hour', seconds: 3600 },
      { unit: 'minute', seconds: 60 },
      { unit: 'second', seconds: 1 },
    ]

    for (const { unit, seconds } of units) {
      const diff = Math.floor(diffInSeconds / seconds)
      if (diff >= 1) {
        return formatter.format(-diff, unit)
      }
    }

    return formatter.format(0, 'second')
  }
}
