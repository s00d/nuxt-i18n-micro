import type { AstroGlobal } from 'astro'

/** Strip locale prefix from the current URL for Astro.rewrite routes. */
export function getLocaleRewritePath(astro: AstroGlobal): string {
  const pathname = astro.locals.currentUrl.pathname
  const localeCodes = astro.locals.locales?.map((locale) => locale.code) ?? []
  const segments = pathname.split('/').filter(Boolean)

  if (segments[0] && localeCodes.includes(segments[0])) {
    segments.shift()
  }

  return segments.length > 0 ? `/${segments.join('/')}` : '/'
}
