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
  if (HAS_SCHEME.test(to)) return to
  return BARE_DOMAIN.test(to) && !FILE_NAME.test(to) ? `https://${to}` : undefined
}

/** `BaseI18nOptions.localeIso` of a locale list. */
export const localeIsoMap = (locales: readonly { code: string; iso?: string }[]): Record<string, string> =>
  Object.fromEntries(locales.flatMap(({ code, iso }) => (iso ? [[code, iso]] : [])))

/** The `query` of a route from a search string: `?tag=a&tag=b` gives `{ tag: ['a', 'b'] }`, as vue-router parses it. */
export function routeQuery(search: string | undefined): Record<string, string | string[]> {
  const params = new URLSearchParams(search)
  return Object.fromEntries(
    [...new Set(params.keys())].map((key) => {
      const values = params.getAll(key)
      return [key, values.length > 1 ? values : values[0]!]
    }),
  )
}

const pathOf = (href: string): string => href.replace(/[?#].*$/, '').replace(/\/$/, '') || '/'

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

/**
 * `to` in `locale` for a prefix-except-default router: a leading locale segment is replaced, or
 * dropped for the default locale. Query and hash stay as they are.
 */
export function localizedPath(to: string | { path?: string }, locale: string, localeCodes: readonly string[], defaultLocale: string): string {
  const path = typeof to === 'string' ? to : to.path || '/'
  const end = path.search(/[?#]/)
  // `#top`, `?x=1`: this page, in this locale
  if (end === 0) return path
  const pathname = end === -1 ? path : path.slice(0, end)
  const suffix = end === -1 ? '' : path.slice(end)
  const segments = pathname.split('/').filter(Boolean)
  if (localeCodes.includes(segments[0]!)) segments.shift()
  const clean = segments.join('/')
  if (locale === defaultLocale) return `/${clean}${suffix}`
  return `/${locale}${clean && `/${clean}`}${suffix}`
}
