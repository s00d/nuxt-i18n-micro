const EXTERNAL_LINK = /^(?:https?:\/\/|\/\/|tel:|mailto:|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/
const HAS_SCHEME = /^(?:https?:|\/\/|tel:|mailto:)/

/**
 * The `href` of a link that leaves the app, `undefined` for a route: a bare domain gets `https://`,
 * anything else already says where it goes.
 */
export function externalLinkHref(to: unknown): string | undefined {
  if (typeof to !== 'string' || !EXTERNAL_LINK.test(to)) return undefined
  return HAS_SCHEME.test(to) ? to : `https://${to}`
}
