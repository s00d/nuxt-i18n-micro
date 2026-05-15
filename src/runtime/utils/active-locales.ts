import type { Locale } from '@i18n-micro/types'

export function getEnabledLocales(locales?: Locale[] | null): Locale[] {
  return (locales ?? []).filter((locale) => !locale.disabled)
}

export function getEnabledLocaleCodes(locales?: Locale[] | null): string[] {
  return getEnabledLocales(locales).map((locale) => locale.code)
}

export function isEnabledLocale(locales: Locale[] | null | undefined, code: string): boolean {
  return getEnabledLocales(locales).some((locale) => locale.code === code)
}
