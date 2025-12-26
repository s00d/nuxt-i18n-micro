/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { createSignal, createEffect, type Accessor, type Component, type JSX } from 'solid-js'
import { A, type useNavigate, type Location } from '@solidjs/router'
import type { I18nRoutingStrategy } from '@i18n-micro/solid'
import type { Locale } from '@i18n-micro/types'

type NavigateFunction = ReturnType<typeof useNavigate>

export function createSolidRouterAdapter(
  locales: Locale[],
  defaultLocale: string,
  navigate: NavigateFunction,
  location: Location,
): I18nRoutingStrategy & { getCurrentPathAccessor: Accessor<string> } {
  const localeCodes = locales.map(loc => loc.code)

  // Создаем сигнал для отслеживания изменений pathname
  const [pathname, setPathname] = createSignal(location.pathname)

  // Отслеживаем изменения location.pathname
  createEffect(() => {
    setPathname(location.pathname)
  })

  const resolvePath = (to: string | { path?: string }, locale: string): string | { path?: string } => {
    const path = typeof to === 'string' ? to : (to.path || '/')
    const pathSegments = path.split('/').filter(Boolean)

    if (pathSegments.length > 0 && localeCodes.includes(pathSegments[0])) {
      pathSegments.shift()
    }

    const cleanPath = '/' + pathSegments.join('/')
    return locale === defaultLocale ? cleanPath : `/${locale}${cleanPath === '/' ? '' : cleanPath}`
  }

  return {
    getCurrentPath: () => pathname(), // Returns current value for compatibility
    getCurrentPathAccessor: pathname, // Returns accessor for reactivity

    push: (target: { path: string }) => {
      // Используем navigate из @solidjs/router
      navigate(target.path)
    },

    replace: (target: { path: string }) => {
      // Используем navigate с replace опцией
      navigate(target.path, { replace: true })
    },

    resolvePath: (to: string | { path?: string }, locale: string) => resolvePath(to, locale),

    getRoute: () => ({
      fullPath: pathname(),
      query: {},
    }),

    // Используем компонент A из @solidjs/router
    linkComponent: ((props: { href: string, children?: JSX.Element, class?: string, style?: JSX.CSSProperties, [key: string]: unknown }) => {
      const { href, children, class: className, style, ...restProps } = props
      return (
        <A
          href={href}
          class={className}
          style={style}
          {...restProps}
        >
          {children}
        </A>
      ) as unknown as JSX.Element
    }) as unknown as Component<{
      href: string
      children?: JSX.Element
      style?: JSX.CSSProperties
      class?: string
      [key: string]: unknown
    }>,
  }
}
