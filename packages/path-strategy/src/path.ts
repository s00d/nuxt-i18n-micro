/**
 * Path utilities — zero external dependencies, zero regexes at runtime.
 * Lightweight replacements for ufo, tailored to i18n routing.
 * Also includes normalizer functions (getPathWithoutLocale, getLocaleFromPath).
 */

// ---------------------------------------------------------------------------
// Primitive helpers
// ---------------------------------------------------------------------------

const UNSAFE_CHARS_RE = /[^A-Za-z0-9_.\-~]/

export function withLeadingSlash(p: string): string {
  return p.charCodeAt(0) === 47 /* / */ ? p : `/${p}`
}

export function withoutLeadingSlash(p: string): string {
  return p.charCodeAt(0) === 47 /* / */ ? p.slice(1) : p
}

export function withoutTrailingSlash(p: string): string {
  return p.length > 1 && p.charCodeAt(p.length - 1) === 47 /* / */ ? p.slice(0, -1) : p
}

export function hasLeadingSlash(p: string): boolean {
  return p.charCodeAt(0) === 47 /* / */
}

/** Collapse consecutive slashes to single, preserving :// in protocols. */
export function cleanDoubleSlashes(p: string): string {
  const protoIdx = p.indexOf('://')
  if (protoIdx === -1) return _dedupSlashes(p)
  return p.slice(0, protoIdx + 3) + _dedupSlashes(p.slice(protoIdx + 3))
}

function _dedupSlashes(s: string): string {
  if (s.indexOf('//') === -1) return s
  let out = ''
  let prevSlash = false
  for (let i = 0; i < s.length; i++) {
    const isSlash = s.charCodeAt(i) === 47
    if (isSlash && prevSlash) continue
    out += s[i]
    prevSlash = isSlash
  }
  return out
}

export function hasProtocol(p: string): boolean {
  const idx = p.indexOf('://')
  if (idx < 1) return false
  for (let i = 0; i < idx; i++) {
    const c = p.charCodeAt(i)
    // a-z A-Z 0-9 + - .
    if ((c >= 97 && c <= 122) || (c >= 65 && c <= 90) || (c >= 48 && c <= 57) || c === 43 || c === 45 || c === 46) continue
    return false
  }
  return true
}

/** O(1) check whether object has at least one own enumerable key. No array allocation. */
export function hasKeys(obj: Record<string, unknown> | null | undefined): boolean {
  if (!obj) return false
  for (const _ in obj) return true
  return false
}

// ---------------------------------------------------------------------------
// Parse helpers
// ---------------------------------------------------------------------------

export function parsePath(p: string): { pathname: string; search: string; hash: string } {
  let pathname = p
  let search = ''
  let hash = ''
  const hashIdx = p.indexOf('#')
  if (hashIdx >= 0) {
    hash = p.slice(hashIdx)
    pathname = p.slice(0, hashIdx)
  }
  const searchIdx = pathname.indexOf('?')
  if (searchIdx >= 0) {
    search = pathname.slice(searchIdx)
    pathname = pathname.slice(0, searchIdx)
  }
  return { pathname, search, hash }
}

export function parseFilename(p: string): string {
  const idx = p.lastIndexOf('/')
  return idx === -1 ? p : p.slice(idx + 1)
}

// ---------------------------------------------------------------------------
// isSamePath
// ---------------------------------------------------------------------------

export function isSamePath(p1: string, p2: string): boolean {
  return normalizePathForCompare(p1) === normalizePathForCompare(p2)
}

// ---------------------------------------------------------------------------
// Join
// ---------------------------------------------------------------------------

export function joinURL(base: string, ...input: string[]): string {
  let url = base || ''
  for (const segment of input) {
    if (!segment || segment === '/') continue
    if (url) {
      const clean =
        segment.charCodeAt(0) === 46 && segment.charCodeAt(1) === 47 /* ./ */
          ? segment.slice(2)
          : segment.charCodeAt(0) === 47 /* / */
            ? segment.slice(1)
            : segment
      url = (url.charCodeAt(url.length - 1) === 47 ? url : `${url}/`) + clean
    } else {
      url = segment
    }
  }
  return url
}

export function joinUrl(...segments: (string | undefined | null)[]): string {
  if (segments.length === 2) {
    const a = segments[0]
    const b = segments[1]
    if (a && b) return _joinTwo(a, b)
    if (a) return _normSimple(a)
    if (b) return _normSimple(b)
    return '/'
  }
  const valid = segments.filter((s): s is string => typeof s === 'string' && s !== '')
  if (valid.length === 0) return '/'
  const [base, ...rest] = valid
  const joined = joinURL(base!, ...rest) || '/'
  if (hasProtocol(joined)) return withoutTrailingSlash(joined) || joined
  return withLeadingSlash(withoutTrailingSlash(joined)) || '/'
}

function _joinTwo(a: string, b: string): string {
  const aEnd = a.charCodeAt(a.length - 1) === 47
  const bStart = b.charCodeAt(0) === 47
  let result: string
  if (aEnd && bStart) result = a + b.slice(1)
  else if (!aEnd && !bStart) result = `${a}/${b}`
  else result = a + b
  if (result.indexOf('://') !== -1) {
    if (result.length > 1 && result.charCodeAt(result.length - 1) === 47) result = result.slice(0, -1)
    return result
  }
  if (result.charCodeAt(0) !== 47) result = `/${result}`
  if (result.length > 1 && result.charCodeAt(result.length - 1) === 47) result = result.slice(0, -1)
  return result
}

function _normSimple(s: string): string {
  if (s.charCodeAt(0) !== 47) s = `/${s}`
  if (s.length > 1 && s.charCodeAt(s.length - 1) === 47) s = s.slice(0, -1)
  return s || '/'
}

// ---------------------------------------------------------------------------
// Query / URL building
// ---------------------------------------------------------------------------

export function buildUrl(path: string, query?: Record<string, any>, hash?: string): string {
  const hasHash = hash && hash !== '#'
  if (!query && !hasHash) return path

  let url = path

  if (query) {
    let separator = ''
    const hasQuestionMark = url.indexOf('?') !== -1
    let sepChar = hasQuestionMark ? '&' : '?'

    for (const key in query) {
      const value = query[key]

      if (value === undefined || value === null) continue

      if (Array.isArray(value)) {
        const keyPrefix = `${key}=`
        for (let i = 0, len = value.length; i < len; i++) {
          const val = value[i]
          if (val === undefined || val === null) continue

          let encodedVal
          const type = typeof val

          if (type === 'number' || type === 'boolean') {
            encodedVal = val
          } else {
            const str = `${val}`
            encodedVal = UNSAFE_CHARS_RE.test(str) ? encodeURIComponent(str) : str
          }
          // ---------------------------

          if (separator === '') {
            separator = sepChar
            sepChar = '&'
          } else {
            separator = '&'
          }

          url += separator + keyPrefix + encodedVal
        }
      } else {
        let encodedVal
        const type = typeof value

        if (type === 'number' || type === 'boolean') {
          encodedVal = value
        } else {
          const str = `${value}`
          encodedVal = UNSAFE_CHARS_RE.test(str) ? encodeURIComponent(str) : str
        }

        if (separator === '') {
          separator = sepChar
          sepChar = '&'
        } else {
          separator = '&'
        }

        url += `${separator + key}=${encodedVal}`
      }
    }
  }

  if (hasHash) {
    url += hash!.charCodeAt(0) === 35 ? hash : `#${hash}`
  }

  return url
}

// ---------------------------------------------------------------------------
// High-level path helpers
// ---------------------------------------------------------------------------

export function getPathSegments(pathOrSlashKey: string): string[] {
  const p = pathOrSlashKey.charCodeAt(0) === 47 ? pathOrSlashKey : `/${pathOrSlashKey}`
  const { pathname } = parsePath(p)
  return pathname.split('/').filter(Boolean)
}

export const normalizePath = (p: string): string => {
  if (!p || p === '/') return '/'
  if (p.charCodeAt(0) === 47 && p.indexOf('//') === -1) {
    return p.length > 1 && p.charCodeAt(p.length - 1) === 47 ? p.slice(0, -1) : p
  }
  return withLeadingSlash(withoutTrailingSlash(cleanDoubleSlashes(p))) || '/'
}

export function normalizePathForCompare(p: string): string {
  return withoutTrailingSlash(cleanDoubleSlashes(p || '/')) || '/'
}

export function getCleanPath(path: string | null | undefined): string {
  if (!path) return ''
  const hashIdx = path.indexOf('#')
  const noHash = hashIdx >= 0 ? path.slice(0, hashIdx) : path
  const searchIdx = noHash.indexOf('?')
  return searchIdx >= 0 ? noHash.slice(0, searchIdx) : noHash
}

export function getParentPath(routePath: string): string | null {
  const segments = getPathSegments(routePath)
  if (segments.length === 0) return null
  if (segments.length <= 1) return '/'
  return joinUrl('/', ...segments.slice(0, -1))
}

// ---------------------------------------------------------------------------
// Route-name helpers (string transforms)
// ---------------------------------------------------------------------------

export function transformNameKeyToPath(nameKey: string): string {
  if (!nameKey) return ''
  let out = ''
  for (let i = 0; i < nameKey.length; i++) {
    out += nameKey.charCodeAt(i) === 45 /* - */ ? '/' : nameKey[i]
  }
  return out
}

export function nameKeyFirstSlash(nameKey: string): string {
  if (!nameKey) return ''
  const idx = nameKey.indexOf('-')
  return idx === -1 ? nameKey : `${nameKey.slice(0, idx)}/${nameKey.slice(idx + 1)}`
}

export function nameKeyLastSlash(nameKey: string): string {
  if (!nameKey) return ''
  const idx = nameKey.lastIndexOf('-')
  return idx === -1 ? nameKey : `${nameKey.slice(0, idx)}/${nameKey.slice(idx + 1)}`
}

export function parentKeyFromSlashKey(keyWithSlash: string): string {
  const segments = getPathSegments(keyWithSlash)
  return segments.length > 1 ? segments.slice(0, -1).join('-') : ''
}

export function lastPathSegment(path: string): string {
  return parseFilename(path || '/')
}

// ---------------------------------------------------------------------------
// Normalizer — locale extraction from path (was core/normalizer.ts)
// ---------------------------------------------------------------------------

/**
 * Parses path: if first segment is a known locale, returns path without it and locale code.
 */
export function getPathWithoutLocale(path: string, localeCodes: readonly string[]): { pathWithoutLocale: string; localeFromPath: string | null } {
  if (!path || path === '/') return { pathWithoutLocale: '/', localeFromPath: null }

  const clean = getCleanPath(path)
  const normalized = normalizePath(clean)

  if (normalized === '/' || normalized.charCodeAt(0) !== 47) {
    return { pathWithoutLocale: normalized || '/', localeFromPath: null }
  }

  const nextSlash = normalized.indexOf('/', 1)
  const firstSegment = nextSlash === -1 ? normalized.slice(1) : normalized.slice(1, nextSlash)

  if (firstSegment && localeCodes.includes(firstSegment)) {
    const lengthToCut = 1 + firstSegment.length
    const remaining = normalized.slice(lengthToCut)
    const result = !remaining || remaining === '/' ? '/' : remaining.charCodeAt(0) === 47 ? remaining : `/${remaining}`
    return { pathWithoutLocale: result, localeFromPath: firstSegment }
  }

  return { pathWithoutLocale: normalized, localeFromPath: null }
}

/**
 * Determines locale from first path segment.
 */
export function getLocaleFromPath(path: string, localeCodes: readonly string[]): string | null {
  const clean = getCleanPath(path)

  if (clean === '/' || clean === '') return null

  if (!hasLeadingSlash(clean)) return null

  const nextSlash = clean.indexOf('/', 1)
  const segment = nextSlash === -1 ? clean.slice(1) : clean.slice(1, nextSlash)
  if (segment && localeCodes.includes(segment)) {
    return segment
  }

  return null
}
