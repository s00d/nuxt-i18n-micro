import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { resolveTranslationPayloadCachePolicy } from '@i18n-micro/utils/payload-url'
import { getQuery, type H3Event } from 'h3'
import { resolveServerHost } from './server-loader'

/** The header of a payload response, by the `?v=` of its request. */
export function payloadCacheControl(event: H3Event, config: ModuleOptionsExtend, empty = false): string | null {
  const policy = resolveTranslationPayloadCachePolicy({
    httpCacheDuration: config.httpCacheDuration,
    httpCacheControl: config.httpCacheControl,
    dateBuild: config.dateBuild,
    live: config.translationPayloadMode === 'source' || Boolean(config.cacheTtl) || Boolean(resolveServerHost()),
  })
  const current = Boolean(config.dateBuild) && String(getQuery(event).v ?? '') === String(config.dateBuild) && !empty
  return current ? policy.current : policy.stale
}
