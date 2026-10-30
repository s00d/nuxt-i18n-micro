/**
 * Old route → new route for every page that moved, merged or was deleted.
 *
 * GitHub Pages has no server-side redirects, so this one map feeds two things: the theme
 * redirects in the SPA (`theme/index.js`), and `buildEnd` in `config.mts` writes a
 * meta-refresh stub at each old URL for crawlers and external links.
 *
 * Keys and values are routes without the site base. A key ending in `/` is a directory
 * index. A value with a `#hash` points at the section the old page became, and wins over
 * the hash of the old URL; without one, the old hash is kept.
 */
export const redirects: Record<string, string> = {
  // Deleted: the snippets live on the helper and component pages.
  '/examples': '/api/methods',
  '/composables/': '/api/',
  '/components/': '/api/',

  // Renamed.
  '/guide/folder-structure': '/guide/translations',
  '/guide/v3-upgrade': '/guide/upgrade',

  // Merged into another page.
  '/guide/using': '/guide/getting-started#using-translations-in-components',
  '/guide/configuration': '/api/module-options',
  '/guide/multi-domain-locales': '/guide/layers#multiple-domains',
  '/guide/firebase': '/guide/deployment#firebase',
  '/guide/preset-local-testing': '/contributing/release-smoke#preset-local-testing',
  '/integrations/preact-package': '/integrations/react-package#preact',

  // Contributor pages left the user guide.
  '/guide/contribution': '/contributing/',
  '/guide/testing-strategies': '/contributing/testing',
  '/guide/maintenance-commands': '/contributing/maintenance-commands',
  '/guide/release-smoke': '/contributing/release-smoke',
  '/guide/performance-methodology': '/contributing/performance-methodology',
  '/api/i18n-cache-api': '/contributing/architecture',
}

/** The base-prefixed target for `href` (absolute or a path), or `undefined` when it did not move. */
export function redirectTarget(href: string, base = '/'): string | undefined {
  const url = new URL(href, 'http://x')
  let path = url.pathname
  if (base !== '/' && path.startsWith(base)) path = `/${path.slice(base.length)}`
  path = path.replace(/\.html$/, '').replace(/\/index$/, '/')

  const target = redirects[path] ?? redirects[path.replace(/(.)\/$/, '$1')] ?? redirects[`${path}/`]
  if (target === undefined) return undefined
  return `${base.replace(/\/$/, '')}${target}${target.includes('#') ? '' : url.hash}`
}
