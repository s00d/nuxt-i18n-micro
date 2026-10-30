import { isPlainClick, ownValue } from '@i18n-micro/core'
import { SWITCHER_STYLES } from '@i18n-micro/core/render'
import type { Locale } from '@i18n-micro/types'
import { type Component, createMemo, createSignal, For, type JSX, onCleanup, onMount, Show, splitProps } from 'solid-js'
import { useI18nContextValue } from '../injection'
import type { RouteTarget } from '../router/types'
import { routePath, useI18n } from '../use-i18n'
import { mergeStyles } from './merge-styles'

export interface I18nSwitcherProps extends JSX.HTMLAttributes<HTMLDivElement> {
  locales?: Locale[]
  currentLocale?: string | (() => string)
  getLocaleName?: () => string | null
  switchLocale?: (locale: string) => void
  localeRoute?: (to: RouteTarget, locale?: string) => RouteTarget
  customLabels?: Record<string, string>
  customWrapperStyle?: JSX.CSSProperties
  customButtonStyle?: JSX.CSSProperties
  customDropdownStyle?: JSX.CSSProperties
  customItemStyle?: JSX.CSSProperties
  customLinkStyle?: JSX.CSSProperties
  customActiveLinkStyle?: JSX.CSSProperties
  /**
   * Inline style applied to the main switcher button when the current locale is
   * marked as `disabled: true` in locale config.
   *
   * Disabled locales are omitted from dropdown items.
   */
  customDisabledLinkStyle?: JSX.CSSProperties
  customIconStyle?: JSX.CSSProperties
}

/** Core's look with Solid's property names: `style` here takes CSS names. */
const css = (style: object): JSX.CSSProperties =>
  Object.fromEntries(
    Object.entries(style).map(([name, value]) => [name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`), value]),
  ) as JSX.CSSProperties

const WRAPPER_STYLE = /*#__PURE__*/ css(SWITCHER_STYLES.wrapper)
const BUTTON_STYLE = /*#__PURE__*/ css(SWITCHER_STYLES.button)
const DROPDOWN_STYLE = /*#__PURE__*/ css(SWITCHER_STYLES.dropdown)
const ITEM_STYLE = /*#__PURE__*/ css(SWITCHER_STYLES.item)
const LINK_STYLE = /*#__PURE__*/ css(SWITCHER_STYLES.link)
const ACTIVE_LINK_STYLE = /*#__PURE__*/ css(SWITCHER_STYLES.activeLink)
const ICON_STYLE = /*#__PURE__*/ css(SWITCHER_STYLES.icon)
const OPEN_ICON_STYLE = /*#__PURE__*/ css(SWITCHER_STYLES.openIcon)

export const I18nSwitcher: Component<I18nSwitcherProps> = (props): JSX.Element => {
  const i18n = useI18n()
  // the provider's props are reactive: its values are read where they are used
  const context = useI18nContextValue()

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
    'class',
    'style',
  ])

  const [open, setOpen] = createSignal(false)
  let wrapper: HTMLDivElement | undefined

  const allLocales = createMemo(() => local.locales ?? context.locales ?? [])
  const current = createMemo(() => {
    const prop = local.currentLocale
    return typeof prop === 'function' ? prop() : (prop ?? i18n.locale())
  })
  const currentItem = createMemo(() => allLocales().find((l) => l.code === current()))

  const label = (locale: Locale): string =>
    (local.customLabels && (ownValue(local.customLabels, locale.code) as string)) || locale.displayName || locale.code

  const href = (code: string): string => {
    const router = context.router
    const path = router?.getCurrentPath() ?? '/'
    if (local.localeRoute) return routePath(local.localeRoute(path, code))
    if (!router) return '#'
    return routePath(router.resolvePath ? router.resolvePath(path, code) : path)
  }

  const select = (event: MouseEvent, code: string): void => {
    if (!isPlainClick(event)) return
    event.preventDefault()
    setOpen(false)
    if (local.switchLocale) return local.switchLocale(code)
    if (!local.localeRoute) return i18n.switchLocale(code)
    i18n.instance.locale = code
    context.router?.push({ path: href(code) })
  }

  const onDocumentClick = (event: MouseEvent) => {
    if (open() && !wrapper?.contains(event.target as Node)) setOpen(false)
  }
  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') setOpen(false)
  }

  // inside onMount: a cleanup registered at setup also runs on the server, where document is missing
  onMount(() => {
    document.addEventListener('click', onDocumentClick)
    document.addEventListener('keydown', onKeydown)
    onCleanup(() => {
      document.removeEventListener('click', onDocumentClick)
      document.removeEventListener('keydown', onKeydown)
    })
  })

  return (
    <div
      {...others}
      ref={(element) => {
        wrapper = element
      }}
      class={['i18n-switcher-wrapper', local.class].filter(Boolean).join(' ')}
      style={mergeStyles(WRAPPER_STYLE, local.customWrapperStyle, local.style)}
    >
      <button
        type="button"
        class="i18n-switcher-button language-switcher"
        style={{ ...BUTTON_STYLE, ...local.customButtonStyle, ...(currentItem()?.disabled ? local.customDisabledLinkStyle : undefined) }}
        aria-expanded={open()}
        onClick={() => setOpen(!open())}
      >
        <span>{local.getLocaleName?.() || label(currentItem() ?? { code: current() })}</span>{' '}
        <span style={{ ...ICON_STYLE, ...(open() ? OPEN_ICON_STYLE : undefined), ...local.customIconStyle }}>▾</span>
      </button>

      <Show when={open()}>
        <ul class="i18n-switcher-dropdown" style={{ ...DROPDOWN_STYLE, ...local.customDropdownStyle }}>
          <For each={allLocales().filter((locale) => !locale.disabled)}>
            {(locale) => {
              const active = () => locale.code === current()
              const language = locale.iso || locale.code
              return (
                <li style={{ ...ITEM_STYLE, ...local.customItemStyle }}>
                  <a
                    class={`switcher-locale-${locale.code}`}
                    href={href(locale.code)}
                    hreflang={language}
                    lang={language}
                    dir={locale.dir}
                    aria-current={active() ? 'page' : undefined}
                    style={{
                      ...LINK_STYLE,
                      ...(active() ? ACTIVE_LINK_STYLE : undefined),
                      ...local.customLinkStyle,
                      ...(active() ? local.customActiveLinkStyle : undefined),
                    }}
                    onClick={(event) => select(event, locale.code)}
                  >
                    {label(locale)}
                  </a>
                </li>
              )
            }}
          </For>
        </ul>
      </Show>
    </div>
  )
}
