import { externalLinkHref, isActiveLink, isPlainClick } from '@i18n-micro/core'
import { type Component, createMemo, type JSX, mergeProps, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { useI18nContext, useI18nRouter } from '../injection'
import type { RouteTarget } from '../router/types'
import { routePath, useI18n } from '../use-i18n'

export interface I18nLinkProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: RouteTarget
  localeRoute?: (to: RouteTarget, locale?: string) => RouteTarget
  activeStyle?: JSX.CSSProperties
}

/** Solid's two handler shapes: a function, or `[function, data]`. */
function callHandler(handler: I18nLinkProps['onClick'], event: Parameters<ClickHandler>[0]): void {
  if (typeof handler === 'function') handler(event)
  else if (handler) handler[0](handler[1], event)
}

type ClickHandler = JSX.EventHandler<HTMLAnchorElement, MouseEvent>

export const I18nLink: Component<I18nLinkProps> = (props): JSX.Element => {
  const i18n = useI18nContext()
  const api = useI18n()
  const router = useI18nRouter()
  const [local, others] = splitProps(props, ['to', 'localeRoute', 'activeStyle', 'style', 'onClick'])

  const externalHref = createMemo(() => externalLinkHref(local.to))
  const target = createMemo(() => routePath((local.localeRoute ?? api.localeRoute)(local.to, i18n.locale)))

  const isActive = createMemo(() => {
    if (!router || !local.activeStyle || externalHref() !== undefined) return false
    // The current, default and fallback locale count too, so a provider without `locales` still knows its own root.
    const codes = [i18n.locale, api.defaultLocale(), i18n.fallbackLocale, ...api.getLocales().map((l) => l.code)]
    return isActiveLink(router.getCurrentPath(), target(), codes)
  })

  const handleClick: ClickHandler = (event) => {
    callHandler(local.onClick, event)
    if (!router || externalHref() !== undefined || !isPlainClick(event)) return
    event.preventDefault()
    router.push({ path: target() })
  }

  const usesRouterLink = () => externalHref() === undefined && router?.linkComponent !== undefined

  const merged = mergeProps(others, {
    get href() {
      return externalHref() ?? target()
    },
    get style() {
      return isActive() ? { ...(local.style as object), ...local.activeStyle } : local.style
    },
    // a router link handles its own clicks
    get onClick() {
      return usesRouterLink() ? local.onClick : handleClick
    },
    get target() {
      return externalHref() === undefined ? undefined : (others.target ?? '_blank')
    },
    get rel() {
      return externalHref() === undefined ? undefined : (others.rel ?? 'noopener noreferrer')
    },
  })

  return <Dynamic component={usesRouterLink() ? router!.linkComponent! : 'a'} {...merged} />
}
