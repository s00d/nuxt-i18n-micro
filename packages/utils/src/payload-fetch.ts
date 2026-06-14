import type { Translations } from '@i18n-micro/types'
import { buildTranslationPayloadFetchRequest } from './payload-url'

export type TranslationPayloadFetcher = <T>(path: string, options: { baseURL: string; params?: Record<string, string | number> }) => Promise<T>

function toTranslations(data: unknown): Translations {
  if (!data) return {}
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    return data as Translations
  }
  return {}
}

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
): Promise<Translations> {
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
    return toTranslations(data)
  } catch {
    return {}
  }
}
