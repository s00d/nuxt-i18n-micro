import React from 'react'
import { useI18n } from '../context'
import { useI18nRouter } from '../injection'

export interface I18nLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string | { path?: string }
  activeStyle?: React.CSSProperties
  localeRoute?: (to: string | { path?: string }, locale?: string) => string | { path?: string }
}

export const I18nLink = (props: I18nLinkProps): React.ReactElement => {
  const i18n = useI18n()
  const router = useI18nRouter()
  const { to, activeStyle, localeRoute: localeRouteProp, children, ...restProps } = props

  // Use prop if provided, otherwise fallback to useI18n
  const localeRoute = localeRouteProp || i18n.localeRoute

  const isExternalLink = (): boolean => {
    if (typeof to === 'string') {
      return /^(?:https?:\/\/|\/\/|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})|tel:|mailto:/.test(to)
    }
    return false
  }

  const externalHref = (): string | undefined => {
    if (isExternalLink() && typeof to === 'string') {
      if (!/^https?:\/\//.test(to)) {
        return `https://${to}`
      }
      return to
    }
    return undefined
  }

  const targetPath = (): string => {
    if (isExternalLink()) {
      if (typeof to === 'string') {
        return to
      }
      const toObj = to as { path?: string }
      return toObj?.path || '/'
    }

    if (localeRoute) {
      const res = localeRoute(to)
      return typeof res === 'string' ? res : (res.path || '/')
    }

    if (!router?.resolvePath) {
      return typeof to === 'string' ? to : (to.path || '/')
    }

    const res = router.resolvePath(to, i18n.locale)
    return typeof res === 'string' ? res : (res.path || '/')
  }

  const isActive = (): boolean => {
    if (isExternalLink() || !router) {
      return false
    }

    const currentPath = router.getCurrentPath()
    const linkPath = targetPath()

    // Normalize paths (remove trailing slashes)
    const normalizedCurrent = currentPath.replace(/\/$/, '')
    const normalizedLink = linkPath.replace(/\/$/, '')

    // Exact match (ignoring query params and hash)
    if (normalizedCurrent === normalizedLink) {
      return true
    }

    // Partial match: check if current path starts with link path
    // This allows parent routes to be marked as active
    if (normalizedCurrent.startsWith(normalizedLink + '/')) {
      return true
    }

    return false
  }

  const computedStyle: React.CSSProperties = isActive() ? (activeStyle || {}) : {}
  const toValue = targetPath()

  if (isExternalLink()) {
    return React.createElement(
      'a',
      {
        ...restProps,
        href: externalHref(),
        style: computedStyle,
        target: '_blank',
        rel: 'noopener noreferrer',
      },
      children,
    )
  }

  // Use router linkComponent if available
  if (router?.linkComponent) {
    const LinkComponent = router.linkComponent
    return React.createElement(
      LinkComponent,
      {
        ...restProps,
        href: toValue,
        style: computedStyle,
      },
      children,
    )
  }

  // Fallback to anchor with onClick handler
  return React.createElement(
    'a',
    {
      ...restProps,
      href: toValue,
      style: computedStyle,
      onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()
        if (router) {
          router.push({ path: toValue })
        }
        else {
          window.location.href = toValue
        }
      },
    },
    children,
  )
}
