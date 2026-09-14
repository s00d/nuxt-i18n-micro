import { hasProtocol, withTrailingSlash, withoutTrailingSlash } from 'ufo'

/**
 * Same rule as NuxtLink (`applyTrailingSlashBehavior`).
 * Pass resolved `i18n.trailingSlash` (or Nuxt `experimental.defaults.nuxtLink.trailingSlash`).
 */
export function applyTrailingSlash(to: string, trailingSlash?: 'append' | 'remove'): string {
  if (trailingSlash !== 'append' && trailingSlash !== 'remove') return to
  if (hasProtocol(to) && !to.startsWith('http')) return to
  return (trailingSlash === 'append' ? withTrailingSlash : withoutTrailingSlash)(to, true)
}
