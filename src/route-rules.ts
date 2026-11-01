import { isLocaleAllowedForUnlocalizedRoute, normalizePath, type RouteGenerator } from '@i18n-micro/route-strategy'

/** `localeCodes`: a rule already written under a locale prefix stays as written, a copy would double the prefix. */
export function shouldLocalizeRouteRulePath(originalPath: string, localeCodes: string[] = []): boolean {
  const routeRulePath = originalPath.trim()
  if (!routeRulePath) return true

  const path = routeRulePath.startsWith('/') ? routeRulePath : `/${routeRulePath}`
  if (path === '/api' || path.startsWith('/api/')) return false

  const firstSegment = path.replace(/^\/+/, '').split('/')[0] ?? ''
  return !firstSegment.startsWith('_') && !localeCodes.includes(firstSegment)
}

type RuleLocales = Pick<RouteGenerator, 'locales' | 'disabledLocales' | 'routeLocales' | 'resolveLocalizedRulePaths'>

/** The URLs of a rule's path in every locale that serves it, without the path itself. */
function localizedRulePaths(path: string, generator: RuleLocales): string[] {
  return generator.locales
    .filter(({ code }) => isLocaleAllowedForUnlocalizedRoute(generator.routeLocales, generator.locales, path, code))
    .flatMap(({ code }) => generator.resolveLocalizedRulePaths(path, code))
    .filter((localized) => localized !== path && localized !== normalizePath(path))
}

/** Copies each page rule to its localized URLs, into `target`. A `redirect` stays on the path it was written for. */
export function localizeRouteRules<Rule extends { redirect?: unknown }>(
  rules: Record<string, Rule>,
  target: Record<string, Omit<Rule, 'redirect'>>,
  generator: RuleLocales,
  onCopy: (path: string, rule: Omit<Rule, 'redirect'>) => void,
): void {
  const localeCodes = [...generator.locales, ...generator.disabledLocales].map((locale) => locale.code)
  for (const [path, value] of Object.entries(rules)) {
    const { redirect: _redirect, ...rule } = value
    if (!Object.keys(rule).length || !shouldLocalizeRouteRulePath(path, localeCodes)) continue
    for (const localized of localizedRulePaths(path, generator)) {
      target[localized] = { ...target[localized], ...rule }
      onCopy(localized, rule)
    }
  }
}

interface CachedRule {
  swr?: boolean | number
  cache?: false | { varies?: string[] | readonly string[] }
}

/** A domain build renders per host while Nitro's route cache keys on the path: one host would serve another its page. */
export function varyRouteCacheByHost<Rule extends CachedRule>(rule: Rule, trustForwardedHost: boolean): Rule {
  if (rule.cache === false || !(rule.swr || rule.cache)) return rule
  const hosts = trustForwardedHost ? ['host', 'x-forwarded-host'] : ['host']
  return { ...rule, cache: { ...rule.cache, varies: [...new Set([...(rule.cache?.varies ?? []), ...hosts])] } }
}

/** The Nitro route rule for the translation payload prefix. */
export interface TranslationPayloadRouteRule {
  cors: true
  headers?: { 'Cache-Control': string }
}

/**
 * Build the route rule for `/{apiBaseUrl}/**`.
 *
 * - **No Nitro `cache`.** Its key is the full URL, query included, so any query string makes a new
 *   unbounded entry, and it holds a third copy of chunks the server loader already keeps (bounded).
 *   Turning it on also switches on `payloadExtraction` for the whole app.
 * - **Nothing is cached in dev.** HMR and live edits must not be answered from the browser cache either.
 * - **The header is the conservative policy.** A route rule matches by path, and `?v=` is a query, so
 *   this rule also answers requests without the cache-buster. The payload handler upgrades a
 *   versioned request to `immutable`; here we cannot know, so we must not promise it.
 */
export function buildTranslationPayloadRouteRule(input: { dev: boolean; cacheControl: string | null }): TranslationPayloadRouteRule {
  if (input.dev || !input.cacheControl) return { cors: true }
  return { cors: true, headers: { 'Cache-Control': input.cacheControl } }
}
