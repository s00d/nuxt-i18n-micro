// @ts-nocheck

import type { Locale } from '@i18n-micro/types'
import { type Accessor, type Component, createMemo, createSignal, type JSX, onCleanup, onMount, splitProps } from 'solid-js'
import { useI18nContext, useI18nLocales, useI18nRouter } from '../injection'
import type { I18nRoutingStrategy } from '../router/types'

interface I18nSwitcherProps extends JSX.HTMLAttributes<HTMLDivElement> {
  locales?: Locale[]
  currentLocale?: string | (() => string)
  getLocaleName?: () => string | null
  switchLocale?: (locale: string) => void
  localeRoute?: (to: string | { path?: string }, locale?: string) => string | { path?: string }
  customLabels?: Record<string, string>
  customWrapperStyle?: JSX.CSSProperties
  customButtonStyle?: JSX.CSSProperties
  customDropdownStyle?: JSX.CSSProperties
  customItemStyle?: JSX.CSSProperties
  customLinkStyle?: JSX.CSSProperties
  customActiveLinkStyle?: JSX.CSSProperties
  customDisabledLinkStyle?: JSX.CSSProperties
  customIconStyle?: JSX.CSSProperties
}

export const I18nSwitcher: Component<I18nSwitcherProps> = (props): JSX.Element => {
  const i18n = useI18nContext()
  const router = useI18nRouter()
  const injectedLocales = useI18nLocales()

  const [local, others] = splitProps(props, [
    'locales',
    'currentLocale',
    'getLocaleName',
    'switchLocale',
    'localeRoute',
    'customLabels',
    'customWrapperStyle',
    'customButtonStyle',
    'customDropdownStyle',
    'customItemStyle',
    'customLinkStyle',
    'customActiveLinkStyle',
    'customDisabledLinkStyle',
    'customIconStyle',
  ])

  const [dropdownOpen, setDropdownOpen] = createSignal(false)
  let wrapperRef: HTMLDivElement | undefined

  const locales = createMemo(() => local.locales || injectedLocales || [])
  const currentLocale = createMemo(() => {
    if (local.currentLocale !== undefined) {
      return typeof local.currentLocale === 'function' ? local.currentLocale() : local.currentLocale
    }
    // Используем реактивный accessor для отслеживания изменений
    return i18n.localeAccessor()
  })
  const currentLocaleName = createMemo(() => {
    if (local.getLocaleName) {
      return local.getLocaleName() || null
    }
    // Используем реактивный accessor для отслеживания изменений
    const current = locales().find((l) => l.code === i18n.localeAccessor())
    return current?.displayName || null
  })

  const toggleDropdown = (event?: Event) => {
    if (event) {
      event.stopPropagation()
      event.preventDefault()
    }
    setDropdownOpen(!dropdownOpen())
  }

  const localeLabel = (localeItem: Locale): string => {
    const current = local.customLabels?.[localeItem.code] || localeItem.displayName
    return current || localeItem.code
  }

  const currentLocaleLabel = createMemo(() => {
    const current = locales().find((l) => l.code === currentLocale())
    return current ? localeLabel(current) : currentLocaleName() || currentLocale()
  })

  const handleSwitchLocale = async (code: string) => {
    setDropdownOpen(false)

    if (local.switchLocale) {
      local.switchLocale(code)
      return
    }

    i18n.locale = code

    if (!router) {
      return
    }

    // Используем accessor напрямую, если доступен, иначе fallback на getCurrentPath()
    const extendedRouter = router as I18nRoutingStrategy & { getCurrentPathAccessor?: Accessor<string> }
    const currentPath = extendedRouter.getCurrentPathAccessor ? extendedRouter.getCurrentPathAccessor() : router.getCurrentPath()
    const newPath = local.localeRoute
      ? (() => {
          const res = local.localeRoute(currentPath, code)
          return typeof res === 'string' ? res : res.path || '/'
        })()
      : router?.resolvePath
        ? (() => {
            const res = router.resolvePath(currentPath, code)
            return typeof res === 'string' ? res : res.path || '/'
          })()
        : currentPath

    router.push({ path: newPath })
  }

  // Default Styles
  const wrapperStyle: JSX.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    'vertical-align': 'middle',
  }

  const buttonStyle: JSX.CSSProperties = {
    padding: '4px 12px',
    'font-size': '16px',
    cursor: 'pointer',
    'background-color': '#fff',
    border: '1px solid #333',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'space-between',
  }

  const dropdownStyle: JSX.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: '0',
    'z-index': 1000,
    'background-color': '#fff',
    border: '1px solid #333',
    'list-style': 'none',
    padding: '0',
    margin: '4px 0 0 0',
    'min-width': '150px',
    'box-shadow': '0 2px 8px rgba(0,0,0,0.15)',
  }

  const itemStyle: JSX.CSSProperties = {
    margin: '0',
    padding: '0',
  }

  const linkStyle: JSX.CSSProperties = {
    display: 'block',
    padding: '8px 12px',
    color: '#333',
    'text-decoration': 'none',
    transition: 'background-color 0.3s ease',
    cursor: 'pointer',
  }

  const activeLinkStyle: JSX.CSSProperties = {
    'font-weight': 'bold',
    color: '#007bff',
  }

  const iconStyle: JSX.CSSProperties = {
    'margin-left': '8px',
    display: 'inline-block',
    transition: 'transform 0.3s ease',
  }

  const openIconStyle: JSX.CSSProperties = {
    transform: 'rotate(180deg)',
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (!dropdownOpen()) return

    const target = event.target as HTMLElement
    if (!target || !wrapperRef) return

    const isClickInside = wrapperRef.contains(target)
    const isButtonClick = target.closest('.i18n-switcher-button') !== null

    if (!isClickInside && !isButtonClick) {
      setDropdownOpen(false)
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside)
  })

  onCleanup(() => {
    document.removeEventListener('click', handleClickOutside)
  })

  return (
    <div
      // @ts-expect-error - ref type conflict with Vue JSX
      ref={(el: HTMLDivElement) => {
        wrapperRef = el
      }}
      class="i18n-switcher-wrapper"
      style={{ ...wrapperStyle, ...local.customWrapperStyle }}
      {...(others as unknown as JSX.HTMLAttributes<HTMLDivElement>)}
    >
      <button
        type="button"
        class="i18n-switcher-button"
        style={{ ...buttonStyle, ...local.customButtonStyle }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          toggleDropdown(e)
        }}
        aria-haspopup="true"
        aria-expanded={dropdownOpen()}
      >
        <span>{currentLocaleLabel()}</span>
        <span
          style={{
            ...iconStyle,
            ...(dropdownOpen() ? openIconStyle : {}),
            ...local.customIconStyle,
          }}
        >
          ▼
        </span>
      </button>

      {dropdownOpen() && (
        <ul class="i18n-switcher-dropdown" style={{ ...dropdownStyle, ...local.customDropdownStyle }}>
          {locales().map((localeItem) => {
            const isActive = localeItem.code === currentLocale()
            // Используем accessor для реактивного отслеживания пути
            const extendedRouter = router as I18nRoutingStrategy & { getCurrentPathAccessor?: Accessor<string> }
            const currentPath = extendedRouter?.getCurrentPathAccessor
              ? extendedRouter.getCurrentPathAccessor()
              : router?.getCurrentPath() || (typeof window !== 'undefined' ? window.location.pathname : '/')
            const result = local.localeRoute
              ? local.localeRoute(currentPath, localeItem.code)
              : router?.resolvePath
                ? router.resolvePath(currentPath, localeItem.code)
                : currentPath
            const routeTo = typeof result === 'string' ? result : result?.path || '#'

            return (
              <li style={{ ...itemStyle, ...local.customItemStyle }}>
                <a
                  class={`switcher-locale-${localeItem.code}`}
                  href={typeof routeTo === 'string' ? routeTo : '#'}
                  style={{
                    ...linkStyle,
                    ...(isActive ? activeLinkStyle : {}),
                    ...local.customLinkStyle,
                    ...(isActive ? local.customActiveLinkStyle : {}),
                  }}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleSwitchLocale(localeItem.code)
                  }}
                >
                  {localeLabel(localeItem)}
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  ) as unknown as JSX.Element
}
