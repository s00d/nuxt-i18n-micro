import { buildPrefixedPath, isUnlocalizedRoute, prefixRedirect } from '../helpers'
import { getCleanPath, isSamePath } from '../path'
import type { NormalizedRouteInput, ResolvedRouteLike, RouteLike, SwitchLocaleOptions } from '../types'
import { BasePathStrategy } from './base-strategy'
import { defaultResolveLocaleRoute, defaultSwitchLocaleRoute } from './common'

export class PrefixPathStrategy extends BasePathStrategy {
  switchLocaleRoute(fromLocale: string, toLocale: string, route: ResolvedRouteLike, options: SwitchLocaleOptions): RouteLike | string {
    return defaultSwitchLocaleRoute(this, fromLocale, toLocale, route, options)
  }

  resolveLocaleRoute(targetLocale: string, normalized: NormalizedRouteInput, currentRoute?: ResolvedRouteLike): RouteLike | string {
    return defaultResolveLocaleRoute(this, targetLocale, normalized, currentRoute)
  }

  getRedirect(currentPath: string, detectedLocale: string): string | null {
    return prefixRedirect(this, currentPath, detectedLocale)
  }

  getClientRedirect(currentPath: string, preferredLocale: string): string | null {
    const { pathWithoutLocale, localeFromPath } = this.getPathWithoutLocale(currentPath)
    if (isUnlocalizedRoute(pathWithoutLocale, this.ctx.globalLocaleRoutes)) return null
    if (localeFromPath !== null) return null
    const targetPath = buildPrefixedPath(this, pathWithoutLocale, preferredLocale)
    const currentClean = getCleanPath(currentPath)
    if (isSamePath(currentClean, targetPath)) return null
    return targetPath
  }
}

/** Alias for Nuxt alias consumption: only this strategy is bundled when importing from #i18n-strategy. */
export { PrefixPathStrategy as Strategy }
