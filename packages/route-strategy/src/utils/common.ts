import type { Locale } from '@i18n-micro/types'
import type { NuxtPage } from '@nuxt/schema'

export { isInternalPath } from '@i18n-micro/utils/app-path'

export const cloneArray = <T extends object>(array: T[]): T[] => array.map((item) => ({ ...item }))

export const isPageRedirectOnly = (page: NuxtPage): boolean => !!(page.redirect && !page.file)

export const buildRouteName = (baseName: string, localeCode: string, isCustom: boolean, prefix = 'localized-'): string =>
  isCustom ? `${prefix}${baseName}-${localeCode}` : `${prefix}${baseName}`

export const buildRouteNameFromRoute = (name: string | null | undefined, routePath: string | null | undefined): string =>
  name ?? (routePath ?? '').replace(/[^a-z0-9]/gi, '-').replace(/^-+|-+$/g, '')

export const shouldAddLocalePrefix = (locale: string, defaultLocale: Locale, addLocalePrefix: boolean): boolean =>
  addLocalePrefix && locale !== defaultLocale.code

export const isLocaleDefault = (locale: string | Locale, defaultLocale: Locale): boolean => {
  const localeCode = typeof locale === 'string' ? locale : locale.code
  return localeCode === defaultLocale.code
}
