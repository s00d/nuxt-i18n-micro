import { joinURL } from 'ufo'
import { defineNitroPlugin, useRuntimeConfig } from 'nitropack/runtime'
import { setResponseHeader } from 'h3'
import { getI18nServerConfig } from '../utils/locale-detector'
import { payloadCacheControl } from '../utils/payload-cache'

/**
 * Nitro's static handler ignores the query, and answers before any middleware. The response of a payload file takes
 * its header here, on its way out: only what serves `public/` from this process gets one, a host stays on the route rule.
 */
export default defineNitroPlugin((nitroApp) => {
  let prefix: string | undefined
  nitroApp.hooks.hook('beforeResponse', (event) => {
    prefix ??= `${joinURL(useRuntimeConfig().app.baseURL, getI18nServerConfig().apiBaseUrl ?? '_locales')}/`
    if (!event.path.startsWith(prefix) || event.node.res.statusCode >= 400) return
    const config = getI18nServerConfig(event)
    const cacheControl = config.httpCacheControl !== false && payloadCacheControl(event, config)
    if (cacheControl) setResponseHeader(event, 'Cache-Control', cacheControl)
  })
})
