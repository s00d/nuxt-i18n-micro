const HAS_SCHEME = /^(?:https?:\/\/|\/\/|tel:|mailto:)/i
/** `example.com`, `www.example.com:8080/a`: a host and port, then the end of the string or a path, query or hash. */
const BARE_DOMAIN = /^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}\.?(?::\d+)?(?:[/?#]|$)/i
/** A last segment naming a file (`report.pdf`), which a bare domain would otherwise swallow. */
const FILE_NAME =
  /^[^/?#]+\.(?:html?|php|aspx?|pdf|txt|md|csv|json|xml|ya?ml|js|mjs|css|png|jpe?g|gif|svg|webp|avif|ico|zip|gz|docx?|xlsx?|pptx?)(?:[?#]|$)/i

/**
 * The `href` of a link that leaves the app, `undefined` for a route: a bare domain gets `https://`,
 * anything else already says where it goes.
 */
export function externalLinkHref(to: unknown): string | undefined {
  if (typeof to !== 'string') return undefined
  // `/about`, `?x`, `#y`: not one pattern below can match
  const first = to.charCodeAt(0)
  if ((first === 47 && to.charCodeAt(1) !== 47) || first === 63 || first === 35) return undefined
  if (HAS_SCHEME.test(to)) return to
  return BARE_DOMAIN.test(to) && !FILE_NAME.test(to) ? `https://${to}` : undefined
}

/** `BaseI18nOptions.localeIso` of a locale list. */
export const localeIsoMap = (locales: readonly { code: string; iso?: string }[]): Record<string, string> =>
  Object.fromEntries(locales.flatMap(({ code, iso }) => (iso ? [[code, iso]] : [])))

/** A query part that does not decode stays as written: `URLSearchParams` would put U+FFFD in it. */
const decodeQueryPart = (part: string): string => {
  if (!part.includes('%')) return part
  try {
    return decodeURIComponent(part)
  } catch {
    return part
  }
}

/**
 * The `query` of a route from a search string, as vue-router parses it: `?tag=a&tag=b` gives
 * `{ tag: ['a', 'b'] }`, `?flag` gives `{ flag: null }`. An empty pair (`?a&&b`) counts for nothing.
 */
export function routeQuery(search: string | undefined): Record<string, string | null | (string | null)[]> {
  const parsed: Record<string, string | null | (string | null)[]> = {}
  const query = search?.[0] === '?' ? search.slice(1) : (search ?? '')
  for (const pair of query.split('&')) {
    if (!pair) continue
    const text = pair.includes('+') ? pair.split('+').join(' ') : pair
    const equals = text.indexOf('=')
    const key = decodeQueryPart(equals < 0 ? text : text.slice(0, equals))
    const value = equals < 0 ? null : decodeQueryPart(text.slice(equals + 1))
    const seen = Object.prototype.hasOwnProperty.call(parsed, key) ? parsed[key] : undefined
    const merged = seen === undefined ? value : Array.isArray(seen) ? [...seen, value] : [seen, value]
    // `?__proto__=x` is a plain key
    if (key === '__proto__') Object.defineProperty(parsed, key, { value: merged, enumerable: true, writable: true, configurable: true })
    else parsed[key] = merged
  }
  return parsed
}

/** Where a URL's path ends: its first `?` or `#`, `-1` for neither. */
export function pathEnd(url: string): number {
  const query = url.indexOf('?')
  const hash = url.indexOf('#')
  return query === -1 ? hash : hash === -1 || query < hash ? query : hash
}

/** The URL up to its query and hash. */
export function urlPath(url: string): string {
  const end = pathEnd(url)
  return end === -1 ? url : url.slice(0, end)
}

const pathOf = (href: string): string => {
  const path = urlPath(href)
  return (path.endsWith('/') ? path.slice(0, -1) : path) || '/'
}

/** A click the app may take over: primary button, no modifier, no `target`, no `download`. The rest are the browser's. */
export function isPlainClick(event: MouseEvent): boolean {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return false
  const link = event.currentTarget as Element | null
  const target = link?.getAttribute?.('target')
  return (!target || target === '_self') && !link?.hasAttribute?.('download')
}

/** Whether two URLs name one page: query, hash and a trailing slash do not count. */
export const isSamePage = (a: string, b: string): boolean => pathOf(a) === pathOf(b)

/**
 * Whether a link to `link` is active on `current`: the same page, or a section above it. A locale
 * root (`/de`) is above every page of that locale, so it needs the same page.
 */
export function isActiveLink(current: string, link: string, localeCodes: readonly string[]): boolean {
  const here = pathOf(current)
  const target = pathOf(link)
  if (here === target) return true
  return here.startsWith(`${target}/`) && !localeCodes.some((code) => target === `/${code}`)
}

/** A segment as a browser reads it: a tab or newline is dropped, blanks at the end of a URL are trimmed, `%2e` is a dot. */
function plainSegment(segment: string): string {
  const text = segment.split('\t').join('').split('\n').join('').split('\r').join('')
  let end = text.length
  while (text.charCodeAt(end - 1) <= 32) end--
  const plain = text.slice(0, end)
  return plain.includes('%') ? plain.split('%2e').join('.').split('%2E').join('.') : plain
}

/** A segment that can be a dot one opens with `.` or `%`: `/a.html` and `/john.doe` go by without a split. A blank opens one too, as the caller may cut there. */
function mayHoldDots(path: string): boolean {
  let open = true
  for (let i = 0; i < path.length; i++) {
    const c = path.charCodeAt(i)
    if (c === 47 || c === 92 || c === 9 || c === 10 || c === 13) open = true
    else if (open && (c === 46 || c === 37)) return true
    else open = false
  }
  return false
}

/** `segments` with `.` and `..` applied, the same array when there are none. A `..` at the top goes nowhere: it never climbs out. */
function resolveDots(segments: string[]): string[] {
  const kept: string[] = []
  let found = false
  for (const segment of segments) {
    const plain = plainSegment(segment)
    if (plain === '.' || plain === '..') {
      found = true
      if (plain === '..') kept.pop()
    } else if (plain !== '') kept.push(segment)
  }
  return found ? kept : segments
}

/** `/a/b/../c` → `/a/c`, or a `../` would climb out of a locale prefix added later. Read as a browser reads it, `\\` a slash and `%2e` a dot. */
export function withoutDots(path: string): string {
  if (!mayHoldDots(path)) return path
  const segments = path.split('\\').join('/').split('/')
  const kept = resolveDots(segments)
  return kept === segments ? path : `/${kept.join('/')}`
}

/**
 * `to` in `locale` for a prefix-except-default router: a leading locale segment is replaced, or
 * dropped for the default locale. Query and hash stay as they are.
 */
export function localizedPath(to: string | { path?: string }, locale: string, localeCodes: readonly string[], defaultLocale: string): string {
  const path = typeof to === 'string' ? to : to.path || '/'
  const end = pathEnd(path)
  // `#top`, `?x=1`: this page, in this locale
  if (end === 0) return path
  const pathname = end === -1 ? path : path.slice(0, end)
  const suffix = end === -1 ? '' : path.slice(end)
  // as a browser reads the URL: `\` is a slash and a tab or a newline is dropped, so `/\host` cannot pass for a path
  const parts = (/[\\\t\n\r]/.test(pathname) ? pathname.split(/[/\\\t\n\r]/) : pathname.split('/')).filter(Boolean)
  const segments = mayHoldDots(pathname) ? resolveDots(parts) : parts
  if (localeCodes.includes(segments[0]!)) segments.shift()
  const clean = segments.join('/')
  if (locale === defaultLocale) return `/${clean}${suffix}`
  return `/${locale}${clean && `/${clean}`}${suffix}`
}
