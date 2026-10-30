import type { ModuleOptionsExtend } from '@i18n-micro/types'

export const DEFAULT_COOKIE_NAME = 'user-locale'
export const DEFAULT_HASH_COOKIE_NAME = 'hash-locale'
export const DEFAULT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

/**
 * Returns cookie name from config.
 * If localeCookie === null, returns null (cookies disabled).
 */
export function getLocaleCookieName(config: ModuleOptionsExtend): string | null {
  if (config.localeCookie === null) return null
  return config.localeCookie || DEFAULT_COOKIE_NAME
}

/**
 * Returns hash cookie name when hashMode is enabled.
 * Returns null when hashMode is false.
 */
export function getHashCookieName(config: ModuleOptionsExtend): string | null {
  if (!config.hashMode) return null
  return DEFAULT_HASH_COOKIE_NAME
}

/**
 * The cookie that holds the visitor's locale preference: the hash cookie under hashMode, else the
 * locale cookie. Server and client read the same one.
 */
export function getPreferenceCookieName(config: ModuleOptionsExtend): string | null {
  return config.hashMode ? getHashCookieName(config) : getLocaleCookieName(config)
}

/** A cookie value, or null when it is not valid percent-encoding (a malformed cookie is absent). */
export function decodeCookieValue(value: string): string | null {
  try {
    return decodeURIComponent(value)
  } catch {
    return null
  }
}

/**
 * Returns standard options for locale/hash cookies. `decode` keeps a malformed cookie from
 * throwing in Nuxt's `useCookie`.
 */
export function getLocaleCookieOptions() {
  const date = new Date()
  date.setTime(date.getTime() + DEFAULT_COOKIE_MAX_AGE * 1000)

  return {
    expires: date,
    maxAge: DEFAULT_COOKIE_MAX_AGE,
    path: '/',
    watch: true,
    sameSite: 'lax' as const,
    decode: decodeCookieValue,
  }
}
