import type { Translations } from '@i18n-micro/types'
import { toTranslations } from './normalize'
import { buildTranslationPayloadFetchRequest } from './payload-url'

export type TranslationPayloadFetcher = <T>(
  path: string,
  options: { baseURL: string; params?: Record<string, string | number>; cache?: RequestCache; timeout?: number },
) => Promise<T>

/**
 * A host that never answers must not hold a page, and the load every next page waits on. Until the headers only: a slow
 * body has no limit. Long, as a failed read renders raw keys, and a busy host that answers late is better than that.
 */
const HOST_TIMEOUT_MS = 60_000

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
      timeout: HOST_TIMEOUT_MS,
    })
    // a 200 with another body (an HTML fallback, an array, `null`) is a failed load, not an empty dictionary. No body at all is empty: `$fetch` gives `''`
    const empty = data === undefined || data === ''
    if (!empty && (typeof data !== 'object' || data === null || Array.isArray(data)))
      throw new TypeError(`[i18n] Invalid translation payload: ${request.path}`)
    return toTranslations(data)
  } catch (error) {
    // `null`, "no such file", is an answer; anything else is a failed load, which no cache may keep
    if ((error as { status?: number }).status === 404) return null
    throw error
  }
}
