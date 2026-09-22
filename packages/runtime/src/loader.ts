import type { Translations } from '@i18n-micro/types'

export interface LoadFromUrlOptions {
  locale?: string
  routeName?: string
  init?: RequestInit
}

export interface LoadFromUrlEntry extends LoadFromUrlOptions {
  url: string
  locale: string
}

/**
 * Fetch a JSON translation document from a URL (browser or any fetch-capable runtime).
 */
export async function fetchJsonTranslations(url: string, init?: RequestInit): Promise<Translations> {
  const response = await fetch(url, init)
  if (!response.ok) {
    throw new Error(`[i18n-runtime] Failed to fetch ${url}: ${response.status} ${response.statusText}`)
  }
  return (await response.json()) as Translations
}
