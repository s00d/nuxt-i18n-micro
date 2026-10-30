const HAS_SCHEME = /^(?:https?:\/\/|\/\/|tel:|mailto:)/i
/** `example.com`, `www.example.com/a`: a host, then the end of the string or a path, query or hash. */
const BARE_DOMAIN = /^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}(?:[/?#]|$)/i
/** A last segment naming a file (`report.pdf`), which a bare domain would otherwise swallow. */
const FILE_NAME =
  /^[^/?#]+\.(?:html?|php|aspx?|pdf|txt|md|csv|json|xml|ya?ml|js|mjs|css|png|jpe?g|gif|svg|webp|avif|ico|zip|gz|docx?|xlsx?|pptx?)(?:[?#]|$)/i

/**
 * The `href` of a link that leaves the app, `undefined` for a route: a bare domain gets `https://`,
 * anything else already says where it goes.
 */
export function externalLinkHref(to: unknown): string | undefined {
  if (typeof to !== 'string') return undefined
  if (HAS_SCHEME.test(to)) return to
  return BARE_DOMAIN.test(to) && !FILE_NAME.test(to) ? `https://${to}` : undefined
}

const pathOf = (href: string): string => href.replace(/[?#].*$/, '').replace(/\/$/, '') || '/'

/** A click the app may take over: primary button, no modifier, no `target`. The rest are the browser's (new tab, download). */
export function isPlainClick(event: MouseEvent): boolean {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return false
  const target = (event.currentTarget as Element | null)?.getAttribute?.('target')
  return !target || target === '_self'
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

/**
 * `to` in `locale` for a prefix-except-default router: a leading locale segment is replaced, or
 * dropped for the default locale. Query and hash stay as they are.
 */
export function localizedPath(to: string | { path?: string }, locale: string, localeCodes: readonly string[], defaultLocale: string): string {
  const path = typeof to === 'string' ? to : to.path || '/'
  const end = path.search(/[?#]/)
  const pathname = end === -1 ? path : path.slice(0, end)
  const suffix = end === -1 ? '' : path.slice(end)
  const segments = pathname.split('/').filter(Boolean)
  if (localeCodes.includes(segments[0]!)) segments.shift()
  const clean = segments.join('/')
  if (locale === defaultLocale) return `/${clean}${suffix}`
  return `/${locale}${clean && `/${clean}`}${suffix}`
}
