const HAS_SCHEME = /^(?:https?:\/\/|\/\/|tel:|mailto:)/i
/** `example.com`, `www.example.com:8080/a`: a host and port, then the end of the string or a path, query or hash. */
const BARE_DOMAIN = /^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}(?::\d+)?(?:[/?#]|$)/i
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

const pathOf = (href: string): string => href.replace(/[?#].*$/, '').replace(/\/$/, '') || '/'

/** A click the app may take over: primary button, no modifier, no `target`. The rest are the browser's (new tab, download). */
export function isPlainClick(event: MouseEvent): boolean {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return false
  const target = (event.currentTarget as Element | null)?.getAttribute?.('target')
  return !target || target === '_self'
}

/** Whether two URLs name one page: query, hash and a trailing slash do not count. */
export const isSamePage = (a: string, b: string): boolean => pathOf(a) === pathOf(b)
