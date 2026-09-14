import { hasProtocol, withTrailingSlash, withoutTrailingSlash } from 'ufo'
import { nuxtLinkDefaults } from '#build/nuxt.config.mjs'

/**
 * Same rule as NuxtLink (`applyTrailingSlashBehavior`).
 * Source: `experimental.defaults.nuxtLink.trailingSlash` via `#build/nuxt.config.mjs`.
 */
export function applyNuxtTrailingSlash(to: string): string {
  const trailingSlash = (nuxtLinkDefaults as { trailingSlash?: 'append' | 'remove' }).trailingSlash
  if (trailingSlash !== 'append' && trailingSlash !== 'remove') return to
  if (hasProtocol(to) && !to.startsWith('http')) return to
  return (trailingSlash === 'append' ? withTrailingSlash : withoutTrailingSlash)(to, true)
}
