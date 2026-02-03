import type { ResolvedRouteLike, RouteLike } from '../core/types'
import { BasePathStrategy } from './base-strategy'
import { cleanDoubleSlashes } from 'ufo'
import { normalizePath } from '../utils/path'

export class NoPrefixPathStrategy extends BasePathStrategy {
  protected buildLocalizedPath(path: string, _locale: string, _isCustom: boolean): string {
    return normalizePath(path)
  }

  protected buildLocalizedRouteName(baseName: string, locale: string): string {
    return this.buildLocalizedName(baseName, locale)
  }

  override getCanonicalPath(route: ResolvedRouteLike, targetLocale: string): string | null {
    const segment = this.getCustomPathSegment(route, targetLocale)
    if (!segment) return null
    return segment.startsWith('/') ? segment : `/${segment}`
  }

  resolveLocaleFromPath(_path: string): string | null {
    return null
  }

  override getLocaleFromPath(path: string): string | null {
    return super.getLocaleFromPath(path)
  }

  /** NoPrefix: when router does not know the route — return source route unchanged. */
  protected override getSwitchLocaleFallbackWhenNoRoute(route: ResolvedRouteLike, _targetName: string): RouteLike | string {
    return route
  }

  /**
   * In no_prefix strategy, URL should not contain locale. If path starts with a locale segment,
   * redirect to path without it. Controlled by ctx.noPrefixRedirect (default: true).
   */
  getRedirect(currentPath: string, _targetLocale: string): string | null {
    if (this.ctx.noPrefixRedirect === false) return null
    const pathLocale = this.getLocaleFromPath(currentPath)
    if (!pathLocale) return null
    const prefix = `/${pathLocale}`
    let newPath = currentPath.slice(prefix.length)
    if (!newPath || !newPath.startsWith('/')) newPath = '/' + (newPath || '')
    return cleanDoubleSlashes(newPath) || '/'
  }
}

/** Alias for Nuxt alias consumption. */
export { NoPrefixPathStrategy as Strategy }
