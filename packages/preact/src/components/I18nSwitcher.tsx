import { h } from 'preact'
import { useState, useEffect, useRef } from 'preact/hooks'
import type { JSX } from 'preact'
import { useI18n } from '../context'
import { useI18nRouter, useI18nLocales, useI18nContext } from '../injection'
import type { Locale } from '@i18n-micro/types'

export interface I18nSwitcherProps extends JSX.HTMLAttributes<HTMLDivElement> {
  locales?: Locale[]
  currentLocale?: string | (() => string)
  getLocaleName?: () => string | null
  switchLocale?: (locale: string) => void
  localeRoute?: (to: string | { path?: string }, locale?: string) => string | { path?: string }
  customLabels?: Record<string, string>
  customWrapperStyle?: Record<string, string | number>
  customButtonStyle?: Record<string, string | number>
  customDropdownStyle?: Record<string, string | number>
  customItemStyle?: Record<string, string | number>
  customLinkStyle?: Record<string, string | number>
  customActiveLinkStyle?: Record<string, string | number>
  customIconStyle?: Record<string, string | number>
}

export const I18nSwitcher = (props: I18nSwitcherProps): JSX.Element => {
  const {
    locales: localesProp,
    currentLocale: currentLocaleProp,
    getLocaleName: getLocaleNameProp,
    switchLocale: switchLocaleProp,
    localeRoute: _localeRouteProp,
    customLabels = {},
    customWrapperStyle,
    customButtonStyle,
    customDropdownStyle,
    customItemStyle,
    customLinkStyle,
    customActiveLinkStyle,
    customIconStyle,
    ...restProps
  } = props

  const i18n = useI18n()
  const i18nInstance = useI18nContext()
  const router = useI18nRouter()
  const injectedLocales = useI18nLocales()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Use props if provided, otherwise fallback to injected or useI18n
  const locales = localesProp || injectedLocales || i18n.getLocales() || []

  // Get current locale value (handle both string and function)
  const getCurrentLocale = (): string => {
    if (typeof currentLocaleProp === 'function') {
      return currentLocaleProp()
    }
    if (typeof currentLocaleProp === 'string') {
      return currentLocaleProp
    }
    return i18n.locale
  }

  const currentLocale = getCurrentLocale()
  const currentLocaleName = getLocaleNameProp ? getLocaleNameProp() : i18n.getLocaleName()

  const toggleDropdown = (event?: Event) => {
    if (event) {
      event.stopPropagation()
      event.preventDefault()
    }
    setDropdownOpen(!dropdownOpen)
  }

  const localeLabel = (localeItem: Locale): string => {
    const current = customLabels[localeItem.code] || localeItem.displayName
    return current || localeItem.code
  }

  const currentLocaleLabel = (): string => {
    const current = locales.find(l => l.code === currentLocale)
    return current ? localeLabel(current) : (currentLocaleName || currentLocale)
  }

  const handleSwitchLocale = (code: string) => {
    setDropdownOpen(false)
    if (switchLocaleProp) {
      switchLocaleProp(code)
      return
    }

    i18nInstance.locale = code

    if (!router) {
      return
    }

    const currentPath = router.getCurrentPath()
    const newPath = props.localeRoute
      ? (() => {
          const res = props.localeRoute(currentPath, code)
          return typeof res === 'string' ? res : (res.path || '/')
        })()
      : (router?.resolvePath
          ? (() => {
              const res = router.resolvePath(currentPath, code)
              return typeof res === 'string' ? res : (res.path || '/')
            })()
          : currentPath)

    router.push({ path: newPath })
  }

  // Default Styles
  const wrapperStyle: Record<string, string | number> = {
    position: 'relative',
    display: 'inline-block',
    verticalAlign: 'middle',
  }

  const buttonStyle: Record<string, string | number> = {
    padding: '4px 12px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#fff',
    border: '1px solid #333',
    transition: 'background-color 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }

  const dropdownStyle: Record<string, string | number> = {
    position: 'absolute',
    top: '100%',
    left: '0',
    zIndex: 1000,
    backgroundColor: '#fff',
    border: '1px solid #333',
    listStyle: 'none',
    padding: '0',
    margin: '4px 0 0 0',
    minWidth: '150px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  }

  const itemStyle: Record<string, string | number> = {
    margin: '0',
    padding: '0',
  }

  const linkStyle: Record<string, string | number> = {
    display: 'block',
    padding: '8px 12px',
    color: '#333',
    textDecoration: 'none',
    transition: 'background-color 0.3s ease',
    cursor: 'pointer',
  }

  const activeLinkStyle: Record<string, string | number> = {
    fontWeight: 'bold',
    color: '#007bff',
  }

  const iconStyle: Record<string, string | number> = {
    marginLeft: '8px',
    display: 'inline-block',
    transition: 'transform 0.3s ease',
  }

  const openIconStyle: Record<string, string | number> = {
    transform: 'rotate(180deg)',
  }

  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (event: MouseEvent) => {
      if (!dropdownOpen) return

      const target = event.target as HTMLElement
      if (!target || !wrapperRef.current) return

      const isClickInside = wrapperRef.current.contains(target)
      const isButtonClick = target.closest('.i18n-switcher-button') !== null

      if (!isClickInside && !isButtonClick) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('click', handler)
    return () => {
      document.removeEventListener('click', handler)
    }
  }, [dropdownOpen])

  const mergedWrapperStyle = { ...wrapperStyle, ...customWrapperStyle }
  const mergedButtonStyle = { ...buttonStyle, ...customButtonStyle }
  const mergedDropdownStyle = { ...dropdownStyle, ...customDropdownStyle }
  const mergedItemStyle = { ...itemStyle, ...customItemStyle }
  const mergedIconStyle = {
    ...iconStyle,
    ...(dropdownOpen ? openIconStyle : {}),
    ...customIconStyle,
  }

  const dropdownItems = locales.map((localeItem) => {
    const isActive = localeItem.code === currentLocale
    const mergedLinkStyle = {
      ...linkStyle,
      ...(isActive ? activeLinkStyle : {}),
      ...customLinkStyle,
      ...(isActive ? customActiveLinkStyle : {}),
      width: '100%',
      textAlign: 'left',
      border: 'none',
      background: 'transparent',
    }

    return h(
      'li',
      {
        key: localeItem.code,
        style: mergedItemStyle,
      },
      h(
        'button',
        {
          type: 'button',
          className: `switcher-locale-${localeItem.code}`,
          style: mergedLinkStyle,
          onClick: (e: Event) => {
            e.preventDefault()
            e.stopPropagation()
            handleSwitchLocale(localeItem.code)
          },
        },
        localeLabel(localeItem),
      ),
    )
  })

  return h(
    'div',
    {
      ref: wrapperRef,
      className: 'i18n-switcher-wrapper',
      style: mergedWrapperStyle,
      ...restProps,
    },
    h(
      'button',
      {
        type: 'button',
        className: 'i18n-switcher-button',
        style: mergedButtonStyle,
        onClick: (e: Event) => {
          e.preventDefault()
          e.stopPropagation()
          toggleDropdown(e)
        },
        ariaHaspopup: 'true',
        ariaExpanded: dropdownOpen,
      },
      h('span', null, currentLocaleLabel()),
      h('span', { style: mergedIconStyle }, '▼'),
    ),
    dropdownOpen
      ? h(
          'ul',
          {
            className: 'i18n-switcher-dropdown',
            style: mergedDropdownStyle,
          },
          ...dropdownItems,
        )
      : null,
  ) as JSX.Element
}
