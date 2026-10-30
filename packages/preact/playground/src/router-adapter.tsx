import { localizedPath } from '@i18n-micro/core'
import type { I18nRoutingStrategy } from '@i18n-micro/preact'
import type { Locale } from '@i18n-micro/types'
import { Link } from 'wouter-preact'

export function createWouterAdapter(
  locales: Locale[],
  defaultLocale: string,
  locationPath: string, // from useLocation()[0]
  navigate: (to: string, options?: { replace?: boolean }) => void, // from useLocation()[1]
): I18nRoutingStrategy {
  const codes = locales.map((loc) => loc.code)
  // wouter's location is the pathname alone
  const fullPath = () => `${locationPath}${window.location.search}${window.location.hash}`

  return {
    linkComponent: Link as unknown as I18nRoutingStrategy['linkComponent'],
    getCurrentPath: fullPath,
    push: (target) => navigate(target.path),
    replace: (target) => navigate(target.path, { replace: true }),
    resolvePath: (to, locale) => localizedPath(to, locale, codes, defaultLocale),
    getRoute: () => ({ fullPath: fullPath(), query: Object.fromEntries(new URLSearchParams(window.location.search)) }),
  }
}
