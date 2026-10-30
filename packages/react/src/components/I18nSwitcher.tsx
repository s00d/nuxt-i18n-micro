import { isPlainClick } from '@i18n-micro/core'
import { SWITCHER_STYLES as STYLES } from '@i18n-micro/core/render'
import type { Locale } from '@i18n-micro/types'
import { h, type HostAttrs, type HostElement, type HostMouseEvent, type HostStyle, useEffect, useRef, useState } from '#host'
import { routePath, useI18n } from '../context'
import { type RouteTarget, useI18nLocales, useI18nRouter } from '../injection'

export interface I18nSwitcherProps extends HostAttrs<HTMLDivElement> {
  locales?: Locale[]
  currentLocale?: string | (() => string)
  getLocaleName?: () => string | null
  switchLocale?: (locale: string) => void
  localeRoute?: (to: RouteTarget, locale?: string) => RouteTarget
  customLabels?: Record<string, string>
  customWrapperStyle?: HostStyle
  customButtonStyle?: HostStyle
  customDropdownStyle?: HostStyle
  customItemStyle?: HostStyle
  customLinkStyle?: HostStyle
  customActiveLinkStyle?: HostStyle
  /**
   * Inline style applied to the main switcher button when the current locale is
   * marked as `disabled: true` in the locale config.
   *
   * Disabled locales are omitted from the dropdown items, but still shown as the
   * active button label.
   */
  customDisabledLinkStyle?: HostStyle
  customIconStyle?: HostStyle
}

export const I18nSwitcher = (props: I18nSwitcherProps): HostElement => {
  const {
    locales: localesProp,
    currentLocale: currentLocaleProp,
    getLocaleName,
    switchLocale,
    localeRoute,
    customLabels,
    customWrapperStyle,
    customButtonStyle,
    customDropdownStyle,
    customItemStyle,
    customLinkStyle,
    customActiveLinkStyle,
    customDisabledLinkStyle,
    customIconStyle,
    className,
    class: userClass,
    style,
    ...restProps
  } = props as I18nSwitcherProps & { class?: string }

  const i18n = useI18n()
  const router = useI18nRouter()
  const injectedLocales = useI18nLocales()
  const [open, setOpen] = useState(false)
  const wrapper = useRef<HTMLDivElement>(null)

  // `disabled` locales stay out of the list, but one that is current still labels the button.
  const allLocales = localesProp ?? injectedLocales ?? i18n.getLocales()
  const current = typeof currentLocaleProp === 'function' ? currentLocaleProp() : (currentLocaleProp ?? i18n.locale)
  const currentItem = allLocales.find((l) => l.code === current)

  useEffect(() => {
    if (!open) return
    const onClick = (event: MouseEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKeydown)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKeydown)
    }
  }, [open])

  const label = (locale: Locale): string => customLabels?.[locale.code] || locale.displayName || locale.code
  const href = (code: string): string => {
    const path = router?.getCurrentPath() ?? '/'
    if (localeRoute) return routePath(localeRoute(path, code))
    if (!router) return '#'
    return routePath(router.resolvePath ? router.resolvePath(path, code) : path)
  }

  const select = (event: HostMouseEvent<HTMLAnchorElement>, code: string) => {
    if (!isPlainClick(event as unknown as MouseEvent)) return
    event.preventDefault()
    setOpen(false)
    if (switchLocale) return switchLocale(code)
    if (!localeRoute) return i18n.switchLocale(code)
    i18n.setLocale(code)
    router?.push({ path: href(code) })
  }

  const renderItem = (locale: Locale) => {
    const active = locale.code === current
    const language = locale.iso || locale.code
    return h(
      'li',
      { key: locale.code, style: { ...STYLES.item, ...customItemStyle } },
      h(
        'a',
        {
          className: `switcher-locale-${locale.code}`,
          href: href(locale.code),
          hrefLang: language,
          lang: language,
          dir: locale.dir,
          style: { ...STYLES.link, ...(active ? STYLES.activeLink : null), ...customLinkStyle, ...(active ? customActiveLinkStyle : null) },
          onClick: (event: HostMouseEvent<HTMLAnchorElement>) => select(event, locale.code),
        },
        label(locale),
      ),
    )
  }

  return h(
    'div',
    {
      ...restProps,
      ref: wrapper,
      className: ['i18n-switcher-wrapper', className, userClass].filter(Boolean).join(' '),
      style: { ...STYLES.wrapper, ...customWrapperStyle, ...(style as object) },
    },
    h(
      'button',
      {
        type: 'button',
        className: 'i18n-switcher-button language-switcher',
        style: { ...STYLES.button, ...customButtonStyle, ...(currentItem?.disabled ? customDisabledLinkStyle : null) },
        'aria-expanded': open,
        onClick: () => setOpen(!open),
      },
      h('span', null, getLocaleName?.() || label(currentItem ?? { code: current })),
      ' ',
      h('span', { style: { ...STYLES.icon, ...(open ? STYLES.openIcon : null), ...customIconStyle } }, '▾'),
    ),
    open
      ? h('ul', { className: 'i18n-switcher-dropdown', style: { ...STYLES.dropdown, ...customDropdownStyle } }, allLocales.filter((l) => !l.disabled).map(renderItem))
      : null,
  )
}
