import type { Translations } from '@i18n-micro/types'
import { toTranslations } from './normalize'
import { buildTranslationPayloadFetchRequest } from './payload-url'

export type TranslationPayloadFetcher = <T>(path: string, options: { baseURL: string; params?: Record<string, string | number> }) => Promise<T>

export interface TranslationPayloadHostConfig {
  apiBaseUrl?: string
  apiBaseServerHost?: string
  dateBuild?: string | number
}

export async function fetchTranslationPayloadFromHost(
  config: TranslationPayloadHostConfig,
  locale: string,
  page: string,
  fetcher: TranslationPayloadFetcher,
): Promise<Translations | null> {
  if (!config.apiBaseServerHost) return {}

  const request = buildTranslationPayloadFetchRequest({
    apiBaseUrl: config.apiBaseUrl ?? '_locales',
    routeName: page,
    locale,
    isServer: true,
    baseURL: config.apiBaseServerHost,
    apiBaseServerHost: config.apiBaseServerHost,
    dateBuild: config.dateBuild,
  })

  try {
    const data = await fetcher(request.path, {
      baseURL: request.baseURL,
      params: request.params,
    })
    // a 200 with another body (an HTML fallback, an array) is a failed load, not an empty dictionary
    if (data && (typeof data !== 'object' || Array.isArray(data))) throw new TypeError(`[i18n] Invalid translation payload: ${request.path}`)
    return toTranslations(data)
  } catch (error) {
    // `null`, "no such file", is an answer; anything else is a failed load, which no cache may keep
    if ((error as { status?: number }).status === 404) return null
    throw error
  }
}
