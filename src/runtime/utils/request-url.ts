import { getRequestURL, type H3Event } from 'h3'

/**
 * `getRequestURL` for a pathname. It builds on `Host` and the request line, which a client writes: what does not parse must not
 * cost the page. With a leading `/` any line is a path, so `GET http://[/` is a page that does not exist.
 */
export function requestURL(event: H3Event): URL {
  try {
    return getRequestURL(event)
  } catch {
    const path = event.path
    let start = 0
    while (path[start] === '/' || path[start] === '\\') start++
    return new URL(`/${path.slice(start)}`, 'http://localhost')
  }
}
