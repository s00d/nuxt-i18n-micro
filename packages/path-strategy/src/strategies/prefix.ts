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
}

/** Alias for Nuxt alias consumption: only this strategy is bundled when importing from #i18n-strategy. */
export { PrefixPathStrategy as Strategy }
