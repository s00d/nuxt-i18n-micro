/**
 * Old route → new route. Feeds Nitro `routeRules`, client middleware, and unit tests.
 * Destinations may include `#hash`.
 */
export const redirects: Record<string, string> = {
  '/examples': '/api/methods',
  '/composables/': '/api/',
  '/components/': '/api/',
  '/guide/folder-structure': '/guide/translations',
  '/guide/v3-upgrade': '/guide/upgrade',
  '/guide/using': '/guide/getting-started#use-t-on-a-page',
  '/guide/configuration': '/api/module-options',
  '/guide/multi-domain-locales': '/guide/layers#multiple-domains',
  '/guide/firebase': '/guide/deployment#firebase',
  '/guide/preset-local-testing': '/contributing/release-smoke#serverless-presets-locally',
  '/integrations/preact-package': '/integrations/react-package#preact',
  '/guide/contribution': '/contributing/',
  '/guide/testing-strategies': '/contributing/testing',
  '/guide/maintenance-commands': '/contributing/maintenance-commands',
  '/guide/release-smoke': '/contributing/release-smoke',
  '/guide/performance-methodology': '/contributing/performance-methodology',
  '/api/i18n-cache-api': '/contributing/architecture',
}

/** Resolve an old href to the new path (optional base prefix), or undefined. */
export function redirectTarget(href: string, base = '/'): string | undefined {
  const url = new URL(href, 'http://x')
  let path = url.pathname
  if (base !== '/' && path.startsWith(base)) path = `/${path.slice(base.length)}`
  path = path.replace(/\.html$/, '').replace(/\/index$/, '/')

  const target = redirects[path] ?? redirects[path.replace(/(.)\/$/, '$1')] ?? redirects[`${path}/`]
  if (target === undefined) return undefined
  return `${base.replace(/\/$/, '')}${target}${target.includes('#') ? '' : url.hash}`
}
