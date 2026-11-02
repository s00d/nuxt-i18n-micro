import { defineNitroPlugin } from 'nitropack/runtime'
import { getResponseHeader, removeResponseHeader, setResponseHeaders } from 'h3'

/** Lives on the cache entry: a request that waited on another's render, in Nitro's cache, has no flag of its own. */
const MARK = 'x-i18n-failed-read'

/**
 * A page rendered with a dictionary that could not be read keeps its HTML, and the browser reads the dictionary again
 * on hydration. A 200 would be kept by a route rule and a CDN for their TTL, raw keys included.
 * An island has no `render:response`: it stays a 200, as a 503 would take it out of the page that embeds it.
 */
export default defineNitroPlugin((nitroApp) => {
  // inside the route cache: it does not store a code of 400 or more. A redirect or an error page keeps its status
  nitroApp.hooks.hook('render:response', (response, { event }) => {
    if (!event.context.i18n?.failedRead || (response.statusCode ?? 200) !== 200) return
    response.statusCode = 503
    response.headers = { ...response.headers, [MARK]: '1' }
  })
  // outside it: for a `swr` or `cache` rule it writes its own `cache-control` over whatever the render set.
  // Netlify's preset adds its own CDN header for an `isr` rule, which outranks `Cache-Control` and comes from no status
  nitroApp.hooks.hook('beforeResponse', (event) => {
    if (!getResponseHeader(event, MARK)) return
    removeResponseHeader(event, MARK)
    setResponseHeaders(event, { 'Cache-Control': 'no-store', 'Netlify-CDN-Cache-Control': 'no-store', 'Retry-After': '60' })
  })
})
