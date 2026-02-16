import { cleanDoubleSlashes, normalizePath } from '../path'
import { resolveCustomPath } from '../resolver'
import type { NormalizedRouteInput, ResolvedRouteLike, RouteLike, SwitchLocaleOptions } from '../types'
import { BasePathStrategy } from './base-strategy'
import { defaultResolveLocaleRoute, defaultSwitchLocaleRoute } from './common'

export class NoPrefixPathStrategy extends BasePathStrategy {
  override buildLocalizedPath(path: string, _locale: string, _isCustom: boolean): string {
    return normalizePath(path)
  }

  override getCanonicalPath(route: ResolvedRouteLike, targetLocale: string): string | null {
    const segment = resolveCustomPath(this.ctx, route, targetLocale) ?? ''
    if (!segment) return null
    return segment.charCodeAt(0) === 47 ? segment : `/${segment}`
  }

  override resolveLocaleFromPath(_path: string): string | null {
    return null
  }

  override getSwitchLocaleFallbackWhenNoRoute(route: ResolvedRouteLike, _targetName: string): RouteLike | string {
    return route
  }

  switchLocaleRoute(fromLocale: string, toLocale: string, route: ResolvedRouteLike, options: SwitchLocaleOptions): RouteLike | string {
    return defaultSwitchLocaleRoute(this, fromLocale, toLocale, route, options)
  }

  resolveLocaleRoute(targetLocale: string, normalized: NormalizedRouteInput, currentRoute?: ResolvedRouteLike): RouteLike | string {
    return defaultResolveLocaleRoute(this, targetLocale, normalized, currentRoute)
  }

  getRedirect(currentPath: string, _targetLocale: string): string | null {
    if (this.ctx.noPrefixRedirect === false) return null
    const pathLocale = this.getLocaleFromPath(currentPath)
    if (!pathLocale) return null
    const prefix = `/${pathLocale}`
    let newPath = currentPath.slice(prefix.length)
    if (!newPath || newPath.charCodeAt(0) !== 47) newPath = `/${newPath || ''}`
    return cleanDoubleSlashes(newPath) || '/'
  }

  override formatPathForResolve(path: string, _fromLocale: string, _toLocale: string): string {
    return path
  }

  getClientRedirect(_currentPath: string, _preferredLocale: string): string | null {
    return null
  }

  override shouldReturn404(_currentPath: string): string | null {
    return null
  }
}

/** Alias for Nuxt alias consumption. */
export { NoPrefixPathStrategy as Strategy }
