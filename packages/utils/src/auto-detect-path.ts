/**
 * Whether preference-based locale redirects may run for an unprefixed path (#242).
 *
 * Modes (`ModuleOptions.autoDetectPath`):
 * - `'/'` (default) — only `/`
 * - `'no_prefix'` — any path without a locale prefix
 * - `'*'` — every path (also enables aggressive prefixed-URL rewrites in the plugin)
 * - any other string — exact path match
 *
 * Prefixed strategy cleanup (e.g. `/en` → `/` under `prefix_except_default`) is not gated here.
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
