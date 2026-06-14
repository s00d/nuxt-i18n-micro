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
 * Returns standard options for locale/hash cookies.
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
  }
}
