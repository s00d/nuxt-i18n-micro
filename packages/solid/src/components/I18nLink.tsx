/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { splitProps, createMemo, type Accessor, type Component, type JSX } from 'solid-js'
import { useI18nRouter, useI18nContext } from '../injection'
import type { I18nRoutingStrategy } from '../router/types'

interface I18nLinkProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string | { path?: string }
  localeRoute?: (to: string | { path?: string }, locale?: string) => string | { path?: string }
  activeStyle?: JSX.CSSProperties
}

export const I18nLink: Component<I18nLinkProps> = (props): JSX.Element => {
  const router = useI18nRouter()
  const i18n = useI18nContext()
  // Split props: explicitly extract style to merge it with activeStyle
  const [local, others] = splitProps(props, ['to', 'localeRoute', 'activeStyle', 'style', 'children'])

  // 1. Get accessor for current path from router
  const extendedRouter = router as I18nRoutingStrategy & { getCurrentPathAccessor?: Accessor<string> }
  const pathnameAccessor = extendedRouter?.getCurrentPathAccessor

  // 2. Calculate target path (href) - reactively tracks locale changes
  const targetPath = createMemo(() => {
    // Use reactive accessor to track locale changes
    const currentLocale = i18n.localeAccessor()
    let result: string
    if (local.localeRoute) {
      const res = local.localeRoute(local.to, currentLocale)
      result = typeof res === 'string' ? res : res?.path || '/'
    }
    else if (router?.resolvePath) {
      const res = router.resolvePath(local.to, currentLocale)
      result = typeof res === 'string' ? res : (res?.path || '/')
    }
    else if (typeof local.to === 'string') {
      result = local.to
    }
    else {
      result = (local.to as { path?: string })?.path || '/'
    }
    return result
  })

  // 3. Check for external link
  const isExternal = createMemo(() => {
    if (typeof local.to === 'string') {
      return /^(?:https?:\/\/|\/\/|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})|tel:|mailto:/.test(local.to)
    }
    return false
  })

  // 4. Calculate active state
  // Important: call pathnameAccessor() inside createMemo for proper change tracking
  const isActive = createMemo(() => {
    if (isExternal()) {
      return false
    }

    // Get current path - call accessor inside createMemo for reactivity
    const current = pathnameAccessor
      ? pathnameAccessor() // Calling accessor inside createMemo tracks changes
      : (router ? router.getCurrentPath() : (typeof window !== 'undefined' ? window.location.pathname : '/'))
    const target = targetPath()

    // Normalize for comparison (remove trailing slash if not root)
    const normCurrent = current === '/' ? '/' : current.replace(/\/$/, '')
    const normTarget = target === '/' ? '/' : target.replace(/\/$/, '')

    return normCurrent === normTarget
  })

  // 5. Merge styles - use isActive directly for reactivity
  const mergedStyle = createMemo(() => {
    const baseStyle = local.style || {}
    // Call isActive() inside createMemo to track changes
    const active = isActive()
    const activeStyle = active ? (local.activeStyle || {}) : {}

    // SolidJS handles style objects correctly when merging
    return {
      ...(typeof baseStyle === 'object' ? baseStyle : {}),
      ...(typeof activeStyle === 'object' ? activeStyle : {}),
    } as JSX.CSSProperties
  })

  // Use linkComponent from router if available
  const LinkComponent = router?.linkComponent

  if (isExternal()) {
    return (
      // @ts-expect-error - Type conflict with Vue JSX
      <a
        href={typeof local.to === 'string' ? local.to : ''}
        target="_blank"
        rel="noopener noreferrer"
        style={mergedStyle()}
        {...(others as unknown as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {local.children}
      </a>
    ) as unknown as JSX.Element
  }

  // If there's linkComponent from router (e.g., A from @solidjs/router), use it
  if (LinkComponent) {
    return (
      // @ts-expect-error - Type conflict with router component types
      <LinkComponent
        href={targetPath()}
        style={mergedStyle()}
        {...(others as unknown as Record<string, unknown>)}
      >
        {local.children}
      </LinkComponent>
    ) as unknown as JSX.Element
  }

  // Fallback to native <a> with onClick handler
  return (
    // @ts-expect-error - Type conflict with Vue JSX
    <a
      href={targetPath()}
      style={mergedStyle()}
      {...(others as unknown as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)}
      onClick={(e: MouseEvent) => {
        if (router && !isExternal()) {
          e.preventDefault()
          router.push({ path: targetPath() })
        }
      }}
    >
      {local.children}
    </a>
  ) as unknown as JSX.Element
}
