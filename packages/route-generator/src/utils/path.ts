import path from 'node:path'

export function normalizeRouteKey(key: string): string {
  return key
    .split('/')
    .map((segment) => {
      if (segment.startsWith('[...') && segment.endsWith(']')) {
        const paramName = segment.substring(4, segment.length - 1)
        return `:${paramName}(.*)*`
      }
      if (segment.startsWith('[') && segment.endsWith(']')) {
        const paramName = segment.substring(1, segment.length - 1)
        return `:${paramName}`
      }
      return segment
    })
    .join('/')
}

export const normalizePath = (routePath: string): string => {
  if (!routePath) {
    return ''
  }
  const normalized = path.posix.normalize(routePath).replace(/\/+$/, '')
  return normalized === '.' ? '' : normalized
}

export const removeLeadingSlash = (routePath: string): string =>
  routePath.startsWith('/') ? routePath.slice(1) : routePath

export function joinPath(...segments: string[]): string {
  return path.posix.join(...segments)
}

function normalizeRegex(toNorm?: string): string | undefined {
  if (typeof toNorm === 'undefined') return undefined
  return toNorm.startsWith('/') && toNorm.endsWith('/') ? toNorm?.slice(1, -1) : toNorm
}

/**
 * Encodes literal path segments (not dynamic params like :slug) that contain non-ASCII
 * so the route path matches URL-encoded requests (e.g. /bg/търсене → /bg/%D1%82%D1%8A%D1%80%D1%81%D0%B5%D0%BD%D0%B5).
 */
function encodeLiteralPathSegments(routePath: string): string {
  if (!routePath || !/[\u0080-\uFFFF]/.test(routePath)) return routePath
  return routePath
    .split('/')
    .map((segment) => {
      if (!segment) return segment
      if (segment.startsWith(':')) return segment
      if (!/[\u0080-\uFFFF]/.test(segment)) return segment
      return encodeURI(segment)
    })
    .join('/')
}

export function buildFullPath(locale: string | string[], basePath: string, customRegex?: string | RegExp): string {
  const regexString = normalizeRegex(customRegex?.toString())
  const localeParam = regexString ? regexString : Array.isArray(locale) ? locale.join('|') : locale
  const encodedBase = encodeLiteralPathSegments(basePath)
  return normalizePath(path.posix.join('/', `:locale(${localeParam})`, encodedBase))
}

export function buildFullPathNoPrefix(basePath: string): string {
  const encodedBase = encodeLiteralPathSegments(basePath)
  return normalizePath(encodedBase)
}
