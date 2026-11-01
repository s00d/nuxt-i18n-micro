import { getRequestURL, type H3Event } from 'h3'

/** `getRequestURL` for a pathname. It builds on `Host`, which a client writes: one that does not parse must not cost the page. */
export function requestURL(event: H3Event): URL {
  try {
    return getRequestURL(event)
  } catch {
    return new URL(event.path.replace(/^[/\\]+/, '/'), 'http://localhost')
  }
}
