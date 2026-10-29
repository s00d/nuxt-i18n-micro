import type { GlobalLocaleRoutes, Locale } from '@i18n-micro/types'
import { normalizePath, normalizeRouteKey, routeKey } from './paths'

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
    // `about-team` and `/about-team` name the same key: the form without the slash wins
    const slashed = new Set<string>()
    const set = (key: string, rule: Rule) => {
      if (!key.startsWith('/')) this.byName.set(key, rule)
      const k = routeKey(key)
      if (this.rules.has(k) && !slashed.has(k) && key.startsWith('/')) return
      this.rules.set(k, rule)
      if (key.startsWith('/')) slashed.add(k)
      else slashed.delete(k)
    }
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
        if (normalized === `/${locale}` || normalized.startsWith(`/${locale}/`)) {
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
      if (!known.length) continue
      this.restrictions.set(routeKey(key), known)
      if (!key.startsWith('/')) this.restrictionsByName.set(key, known)
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
 * Whether `localeCode` may serve this path given `$defineI18nRoute` locales / routeLocales.
 * Unrestricted paths (and restrictions naming no known locale) allow every locale.
 */
export function isLocaleAllowedForUnlocalizedRoute(
  routeLocales: Record<string, string[]>,
  locales: Locale[],
  routePath: string,
  localeCode: string,
): boolean {
  let rules = restrictionCache.get(routeLocales)
  if (!rules) restrictionCache.set(routeLocales, (rules = new Rules({}, routeLocales, locales)))
  const allowed = rules.allowedLocales(routePath, undefined)
  return !allowed || allowed.includes(localeCode)
}
// ponytail: keyed by the routeLocales object only; a different `locales` list for the same object reuses the first
const restrictionCache = new WeakMap<Record<string, string[]>, Rules>()
