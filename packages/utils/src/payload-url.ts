export function resolveTranslationPayloadPage(routeName: string | undefined, routesLocaleLinks?: Record<string, string>): string {
  const name = routeName || 'index'
  return routesLocaleLinks?.[name] ?? name
}

export function buildTranslationPayloadPath(apiBaseUrl: string, page: string, locale: string): string {
  const normalizedBase = apiBaseUrl.replace(/^\/+|\/+$/g, '')
  return `/${normalizedBase}/${page}/${locale}/data.json`.replace(/\/{2,}/g, '/')
}

export function resolveTranslationPayloadBaseURL(options: {
  isServer: boolean
  baseURL: string
  apiBaseClientHost?: string
  apiBaseServerHost?: string
}): string {
  const external = options.isServer ? options.apiBaseServerHost : options.apiBaseClientHost
  return external ?? options.baseURL
}

export interface TranslationPayloadFetchRequestInput {
  apiBaseUrl: string
  routeName?: string
  locale: string
  isServer: boolean
  baseURL: string
  apiBaseClientHost?: string
  apiBaseServerHost?: string
  dateBuild?: string | number
  routesLocaleLinks?: Record<string, string>
}

export function buildTranslationPayloadFetchRequest(input: TranslationPayloadFetchRequestInput): {
  path: string
  baseURL: string
  params?: Record<string, string | number>
} {
  const page = resolveTranslationPayloadPage(input.routeName, input.routesLocaleLinks)
  return {
    path: buildTranslationPayloadPath(input.apiBaseUrl, page, input.locale),
    baseURL: resolveTranslationPayloadBaseURL(input),
    params: input.dateBuild ? { v: input.dateBuild } : undefined,
  }
}
