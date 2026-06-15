import type { Translations } from '@i18n-micro/types'

/**
 * Normalize unknown fetch/storage payloads into a plain translation object.
 */
export function toTranslations(data: unknown): Translations {
  if (!data) return {}
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    return data as Translations
  }
  return {}
}

/**
 * Normalize unknown payloads into a mutable record (source loader).
 */
export function toTranslationRecord(data: unknown): Record<string, unknown> {
  return toTranslations(data) as Record<string, unknown>
}
