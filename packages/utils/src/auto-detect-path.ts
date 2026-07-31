/**
 * Whether cookie / Accept-Language preference may steer locale redirects (#242).
 *
 * Modes (`ModuleOptions.autoDetectPath`):
 * - `'/'` (default) — only `/`
 * - `'no_prefix'` — any path without a locale prefix
 * - `'*'` — every path (also enables aggressive prefixed-URL rewrites in the plugin)
 * - any other string — exact path match
 *
 * Does not gate strategy / `localeRoutes` canonicalization: when preference is denied on an
 * unprefixed path, the plugin still runs `getClientRedirect` with the default locale.
 */
export function shouldAttemptLocaleRedirect(path: string, options: { autoDetectPath?: string; hasLocalePrefix?: boolean } = {}): boolean {
  const mode = options.autoDetectPath ?? '/'
  const normalized = !path || path === '' ? '/' : path

  if (mode === '*') return true

  if (mode === 'no_prefix') {
    return !options.hasLocalePrefix
  }

  if (mode === '/' || mode === '') {
    return normalized === '/'
  }

  const target = mode.startsWith('/') ? mode : `/${mode}`
  return normalized === target || normalized === `${target}/`
}
