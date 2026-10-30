import { externalLinkHref, isActiveLink, isPlainClick } from '@i18n-micro/core'
import { h, type HostAnchorAttrs, type HostElement, type HostMouseEvent, type HostNode, type HostStyle } from '#host'
import { routePath, useI18n } from '../context'
import { type RouteTarget, useI18nRouter } from '../injection'

// a type, not an interface: Preact 11's anchor attributes are a union alias
export type I18nLinkProps = HostAnchorAttrs<HTMLAnchorElement> & {
  to: RouteTarget
  activeStyle?: HostStyle
  localeRoute?: (to: RouteTarget, locale?: string) => RouteTarget
  children?: HostNode
}

export const I18nLink = (props: I18nLinkProps): HostElement => {
  const i18n = useI18n()
  const router = useI18nRouter()
  const { to, activeStyle, localeRoute = i18n.localeRoute, style, onClick, children, ...restProps } = props

  const externalHref = externalLinkHref(to)
  if (externalHref !== undefined) {
    return h('a', { target: '_blank', rel: 'noopener noreferrer', ...restProps, onClick, style, href: externalHref }, children)
  }

  const href = routePath(localeRoute(to))
  // The current, default and fallback locale count too, so a provider without `locales` still knows its own root.
  const codes = () => [i18n.locale, i18n.defaultLocale(), i18n.fallbackLocale, ...i18n.getLocales().map((l) => l.code)]
  const active = activeStyle && router && isActiveLink(router.getCurrentPath(), href, codes())
  const linkProps = { ...restProps, href, style: active ? { ...(style as object), ...activeStyle } : style }

  if (router?.linkComponent) return h(router.linkComponent as never, { ...linkProps, onClick }, children)

  const handleClick = (event: HostMouseEvent<HTMLAnchorElement>) => {
    onClick?.(event as never)
    if (!router || !isPlainClick(event as unknown as MouseEvent)) return
    event.preventDefault()
    router.push({ path: href })
  }
  return h('a', { ...linkProps, onClick: handleClick }, children)
}
