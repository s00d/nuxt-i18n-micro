export type NumberFormatsConfig = Record<string, Record<string, Intl.NumberFormatOptions>>
export type DateTimeFormatsConfig = Record<string, Record<string, Intl.DateTimeFormatOptions>>

export interface FormatServiceOptions {
  numberFormats?: NumberFormatsConfig
  /** Vue I18n-compatible name (`datetimeFormats`). */
  datetimeFormats?: DateTimeFormatsConfig
  /** IANA zone for dates; a format's own `timeZone` wins. Unset: the runtime's zone. */
  timeZone?: string
  /** The clock of relative dates: hand hydration the server's time so both render one text. Unset: `Date.now`. */
  now?: () => number
}

/** Largest unit first: the first one that fits at least once is used. */
const UNITS: ReadonlyArray<readonly [Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 31536000],
  ['month', 2592000],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
  ['second', 1],
]

/**
 * Stable cache key of an options object: key order does not matter, `{}` equals none.
 * Intl options are flat primitives, so typed `name=value` pairs are enough (no JSON):
 * `false` and `'false'` are different options (`useGrouping`).
 */
function optionsKey(options: object | undefined): string {
  if (!options) return ''
  let key = ''
  for (const name of Object.keys(options).sort()) {
    const value = (options as Record<string, unknown>)[name]
    key += `${name}=${typeof value}:${String(value)}\u0001`
  }
  return key
}

/** Enough for every format a real app uses; a loop over generated options cannot grow the cache past it. */
const MAX_FORMATTERS = 500

/** One formatter per locale + options, created on first use. Bounded, cleared wholesale. */
function cached<F, O extends object>(cache: Map<string, F>, locale: string, options: O | undefined, create: (locale: string, options?: O) => F): F {
  const key = `${locale}\0${optionsKey(options)}`
  let formatter = cache.get(key)
  if (formatter === undefined) {
    formatter = create(locale, options)
    if (cache.size >= MAX_FORMATTERS) cache.clear()
    cache.set(key, formatter)
  }
  return formatter
}

const newNumber = (locale: string, options?: Intl.NumberFormatOptions) => new Intl.NumberFormat(locale, options)
const newDate = (locale: string, options?: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, options)
const newRelative = (locale: string, options?: Intl.RelativeTimeFormatOptions) => new Intl.RelativeTimeFormat(locale, options)

/** Named format: the locale, then each shorter tag (`zh-Hant-TW` → `zh-Hant` → `zh`). */
function named<T>(formats: Record<string, Record<string, T>>, locale: string, key: string): T | undefined {
  for (let tag = locale; tag; tag = tag.slice(0, Math.max(tag.lastIndexOf('-'), 0))) {
    const format = formats[tag]?.[key]
    if (format !== undefined) return format
  }
  return undefined
}

/**
 * Cached `Intl` formatters and Vue I18n-compatible named formats (`numberFormats`,
 * `datetimeFormats`) for `tn(1000, 'currency')` / `td(date, 'short')`.
 */
export class FormatService {
  private numberFormats: NumberFormatsConfig
  private datetimeFormats: DateTimeFormatsConfig
  private numberCache = new Map<string, Intl.NumberFormat>()
  private dateCache = new Map<string, Intl.DateTimeFormat>()
  private relativeCache = new Map<string, Intl.RelativeTimeFormat>()
  private timeZone?: string
  private now?: () => number

  constructor(options: FormatServiceOptions = {}) {
    this.numberFormats = options.numberFormats ?? {}
    this.datetimeFormats = options.datetimeFormats ?? {}
    this.timeZone = options.timeZone
    this.now = options.now
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

  resolveNumberFormat(locale: string, key: string): Intl.NumberFormatOptions | undefined {
    return named(this.numberFormats, locale, key)
  }

  resolveDateTimeFormat(locale: string, key: string): Intl.DateTimeFormatOptions | undefined {
    return named(this.datetimeFormats, locale, key)
  }

  getNumberFormatter(locale: string, options?: Intl.NumberFormatOptions): Intl.NumberFormat {
    return cached(this.numberCache, locale, options, newNumber)
  }

  getDateTimeFormatter(locale: string, options?: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
    return cached(this.dateCache, locale, options, newDate)
  }

  getRelativeTimeFormatter(locale: string, options?: Intl.RelativeTimeFormatOptions): Intl.RelativeTimeFormat {
    return cached(this.relativeCache, locale, options, newRelative)
  }

  formatNumber(value: number, locale: string, options?: Intl.NumberFormatOptions): string {
    return this.getNumberFormatter(locale, options).format(value)
  }

  formatDate(value: Date | number | string, locale: string, options?: Intl.DateTimeFormatOptions): string {
    const time = new Date(value).getTime()
    if (Number.isNaN(time)) return 'Invalid Date'
    return this.getDateTimeFormatter(
      locale,
      this.timeZone && options?.timeZone === undefined ? { ...options, timeZone: this.timeZone } : options,
    ).format(time)
  }

  /** `3 days ago` / `in 3 days`: the largest unit that fits at least once, rounded down; `Invalid Date` like {@link formatDate}. */
  formatRelativeTime(value: Date | number | string, locale: string, options?: Intl.RelativeTimeFormatOptions): string {
    const seconds = (new Date(value).getTime() - (this.now ? this.now() : Date.now())) / 1000
    if (Number.isNaN(seconds)) return 'Invalid Date'
    const formatter = this.getRelativeTimeFormatter(locale, options)
    const size = Math.abs(seconds)
    const unit = UNITS.find(([, length]) => size >= length)
    return unit ? formatter.format(Math.sign(seconds) * Math.floor(size / unit[1]), unit[0]) : formatter.format(0, 'second')
  }
}
