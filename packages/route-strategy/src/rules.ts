import type { GlobalLocaleRoutes, Locale } from '@i18n-micro/types'
import { absolute, normalizePath, normalizeRouteKey, routeKey } from './paths'

/** Custom paths of one page per locale, or `false` for a page that is not localized. */
export type Rule = Record<string, string> | false

/**
 * globalLocaleRoutes / $defineI18nRoute rules and routeLocales restrictions, keyed once by
 * routeKey so `about/team` and `/about/team` are looked up the same way everywhere. A page is
 * looked up by its full original path first (`about-team` / `/about-team` for a top-level page,
 * the form without the slash winning), then by its route name, which only keys written without a
 * leading slash can be.
 */
export class Rules {
  private readonly rules = new Map<string, Rule>()
  private readonly byName = new Map<string, Rule>()
  private readonly restrictions = new Map<string, string[]>()
  private readonly restrictionsByName = new Map<string, string[]>()

  constructor(globalLocaleRoutes: GlobalLocaleRoutes = {}, routeLocales: Record<string, string[]> = {}, locales: Locale[] = []) {
    const codes = new Set(locales.map((l) => l.code))
    const set = keyed(this.rules, this.byName)
    const restrict = keyed(this.restrictions, this.restrictionsByName)
    for (const [key, value] of Object.entries(globalLocaleRoutes ?? {})) {
      if (value === false) {
        set(key, false)
        continue
      }
      if (!value || typeof value !== 'object') continue
      const paths: Record<string, string> = {}
      for (const [locale, customPath] of Object.entries(value)) {
        if (!customPath) continue
        const normalized = normalizePath(normalizeRouteKey(customPath))
        const asPath = absolute(normalized)
        if (asPath === `/${locale}` || asPath.startsWith(`/${locale}/`)) {
          console.warn(
            `[i18n] globalLocaleRoutes["${key}"].${locale} = "${customPath}" starts with the locale code; the locale prefix is added automatically.`,
          )
        }
        paths[locale] = normalized
      }
      set(key, paths)
    }
    for (const [key, allowed] of Object.entries(routeLocales)) {
      const known = allowed.filter((code) => codes.has(code))
      if (known.length) restrict(key, known)
    }
  }

  get(fullPath: string, name: string | undefined): Rule | undefined {
    return this.rules.get(routeKey(fullPath)) ?? (name ? this.byName.get(name) : undefined)
  }

  /** Locales a page may be served in, or undefined when it is not restricted. */
  allowedLocales(fullPath: string, name: string | undefined): string[] | undefined {
    return this.restrictions.get(routeKey(fullPath)) ?? (name ? this.restrictionsByName.get(name) : undefined)
  }

  /** Custom path of a top-level path for a locale (nitro: prerender and routeRules). */
  customPath(fullPath: string, locale: string): string | undefined {
    const rule = this.rules.get(routeKey(fullPath))
    return rule ? rule[locale] : undefined
  }
}

/**
 * A setter storing values by routeKey, and by name for keys written without a leading slash.
 * `about-team` and `/about-team` are one key there: the form without the slash wins, in any order.
 */
function keyed<T>(byKey: Map<string, T>, byName: Map<string, T>): (key: string, value: T) => void {
  const slashed = new Set<string>()
  return (key, value) => {
    const withSlash = key.startsWith('/')
    if (!withSlash) byName.set(key, value)
    const k = routeKey(key)
    if (withSlash && byKey.has(k) && !slashed.has(k)) return
    byKey.set(k, value)
    if (withSlash) slashed.add(k)
    else slashed.delete(k)
  }
}

/**
 * Whether `localeCode` may serve this path given `$defineI18nRoute` locales / routeLocales.
 * Unrestricted paths (and restrictions naming no known locale) allow every locale.
 */
export function isLocaleAllowedForUnlocalizedRoute(
  routeLocales: Record<string, string[]>,
  locales: Locale[],
  routePath: string,
  localeCode: string,
): boolean {
  const allowed = new Rules({}, routeLocales, locales).allowedLocales(routePath, undefined)
  return !allowed || allowed.includes(localeCode)
}
