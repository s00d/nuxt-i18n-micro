export class FormatService {
  formatNumber(value: number, locale: string, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(locale, options).format(value)
  }

  formatDate(value: Date | number | string, locale: string, options?: Intl.DateTimeFormatOptions): string {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return 'Invalid Date'
    }
    return new Intl.DateTimeFormat(locale, options).format(date)
  }

  formatRelativeTime(value: Date | number | string, locale: string, options?: Intl.RelativeTimeFormatOptions): string {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return 'Invalid Date'
    }
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    const units: { unit: Intl.RelativeTimeFormatUnit, seconds: number }[] = [
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
        return new Intl.RelativeTimeFormat(locale, options).format(-diff, unit)
      }
    }

    return new Intl.RelativeTimeFormat(locale, options).format(0, 'second')
  }
}
