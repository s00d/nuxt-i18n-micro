import type { ResolvedRouteLike } from '../core/types'
import { BasePathStrategy } from './base-strategy'
import { cleanDoubleSlashes, isSamePath, withoutLeadingSlash } from 'ufo'
import { getCleanPath, joinUrl, normalizePath, normalizePathForCompare } from '../utils/path'

export class PrefixPathStrategy extends BasePathStrategy {
  protected buildLocalizedPath(path: string, locale: string, _isCustom: boolean): string {
    return joinUrl(locale, normalizePath(path))
  }

  protected buildLocalizedRouteName(baseName: string, locale: string): string {
    return this.buildLocalizedName(baseName, locale)
  }

  override getCanonicalPath(route: ResolvedRouteLike, targetLocale: string): string | null {
    const segment = this.getCustomPathSegment(route, targetLocale)
    if (!segment) return null
    const normalized = segment.startsWith('/') ? segment : `/${segment}`
    return cleanDoubleSlashes(`/${targetLocale}${normalized}`)
  }

  resolveLocaleFromPath(path: string): string | null {
    const { localeFromPath } = this.getPathWithoutLocale(path)
    return localeFromPath
  }

  getRedirect(currentPath: string, detectedLocale: string): string | null {
    const { pathWithoutLocale, localeFromPath } = this.getPathWithoutLocale(currentPath)
    const gr = this.ctx.globalLocaleRoutes
    const pathKey = pathWithoutLocale === '/' ? '/' : withoutLeadingSlash(pathWithoutLocale)
    const isUnlocalized = gr && (gr[pathWithoutLocale] === false || gr[pathKey] === false)
    if (isUnlocalized && localeFromPath !== null) {
      return normalizePathForCompare(pathWithoutLocale)
    }
    if (isUnlocalized && localeFromPath === null) {
      return null
    }
    const expectedPath = this.buildPathWithPrefix(pathWithoutLocale, detectedLocale)
    const currentPathOnly = getCleanPath(currentPath)
    if (localeFromPath === detectedLocale && isSamePath(currentPathOnly, expectedPath)) {
      return null
    }
    return expectedPath
  }

  private buildPathWithPrefix(pathWithoutLocale: string, locale: string): string {
    const resolved = this.resolvePathForLocale(pathWithoutLocale, locale)
    if (resolved === '/' || resolved === '') {
      return `/${locale}`
    }
    const prefix = `/${locale}`
    const withSlash = resolved.startsWith('/') ? resolved : `/${resolved}`
    return cleanDoubleSlashes(prefix + withSlash)
  }

  /**
   * Formats path for router.resolve.
   * prefix: always add locale prefix.
   */
  formatPathForResolve(path: string, fromLocale: string, _toLocale: string): string {
    return `/${fromLocale}${path}`
  }

  /**
   * prefix strategy: redirect only if URL has no locale prefix.
   * Does NOT redirect if user explicitly navigates to a locale path.
   * Uses custom paths from globalLocaleRoutes when available.
   */
  getClientRedirect(currentPath: string, preferredLocale: string): string | null {
    const { pathWithoutLocale, localeFromPath } = this.getPathWithoutLocale(currentPath)

    // Check if route is unlocalized
    const gr = this.ctx.globalLocaleRoutes
    const pathKey = pathWithoutLocale === '/' ? '/' : withoutLeadingSlash(pathWithoutLocale)
    if (gr && (gr[pathWithoutLocale] === false || gr[pathKey] === false)) {
      return null // Unlocalized routes - no redirect
    }

    // URL has locale prefix - user explicitly navigated here, don't redirect
    if (localeFromPath !== null) return null

    // Resolve custom path for this locale (uses globalLocaleRoutes)
    const customPath = this.resolvePathForLocale(pathWithoutLocale, preferredLocale)
    let targetPath = cleanDoubleSlashes(`/${preferredLocale}${customPath.startsWith('/') ? customPath : `/${customPath}`}`)

    // Remove trailing slash (except for root)
    if (targetPath !== '/' && targetPath.endsWith('/')) {
      targetPath = targetPath.slice(0, -1)
    }

    // Only redirect if target differs from current
    const currentClean = getCleanPath(currentPath)
    if (isSamePath(currentClean, targetPath)) return null

    return targetPath
  }
}

/** Alias for Nuxt alias consumption: only this strategy is bundled when importing from #i18n-strategy. */
export { PrefixPathStrategy as Strategy }
