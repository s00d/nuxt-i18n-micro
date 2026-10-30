import { createLocaleSwitcher, type RenderSlots } from '@i18n-micro/core/render'
import type { Locale } from '@i18n-micro/types'
import { type CSSProperties, defineComponent, Fragment, h, inject, onMounted, onUnmounted, type PropType, ref } from 'vue'
import type { VueI18n } from '../composer'
import { I18nInjectionKey, I18nLocalesKey, I18nRouterKey } from '../injection'
import { currentFullPath, pathOf } from '../router/path'
import type { I18nRoutingStrategy } from '../router/types'

const styleProp = { type: Object as PropType<CSSProperties>, default: () => ({}) }

export const I18nSwitcher = /*#__PURE__*/ defineComponent({
  name: 'I18nSwitcher',
  props: {
    customLabels: {
      type: Object as PropType<Record<string, string>>,
      default: () => ({}),
    },
    customWrapperStyle: styleProp,
    customButtonStyle: styleProp,
    customDropdownStyle: styleProp,
    customItemStyle: styleProp,
    customLinkStyle: styleProp,
    customActiveLinkStyle: styleProp,
    /**
     * Inline style applied to the switcher button when the *current* locale is
     * marked as `disabled: true` in the locale config.
     *
     * Note: disabled locales are omitted from the dropdown list, but the current
     * locale label is still shown on the button.
     */
    customDisabledLinkStyle: styleProp,
    customIconStyle: styleProp,
    locales: {
      type: Array as PropType<Locale[]>,
      default: undefined,
    },
    currentLocale: {
      type: [String, Function] as PropType<string | (() => string)>,
      default: undefined,
    },
    getLocaleName: {
      type: Function as PropType<() => string | null>,
      default: undefined,
    },
    switchLocale: {
      type: Function as PropType<(locale: string) => void>,
      default: undefined,
    },
    localeRoute: {
      type: Function as PropType<(to: string | { path?: string }, locale?: string) => string | { path?: string }>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const i18n = inject<VueI18n>(I18nInjectionKey)
    const routing = inject<I18nRoutingStrategy | undefined>(I18nRouterKey, undefined)
    const injectedLocales = inject<Locale[] | undefined>(I18nLocalesKey, undefined)

    if (!i18n) {
      throw new Error('[i18n-micro] I18nSwitcher: i18n instance not found. Make sure i18n plugin is installed.')
    }

    if (!injectedLocales && !props.locales) {
      throw new Error(
        '[i18n-micro] I18nSwitcher: locales not provided. Make sure app.provide(I18nLocalesKey, locales) is called or pass locales prop.',
      )
    }

    const locales = () => props.locales || injectedLocales || []

    const location = (code: string): string | { path?: string } => {
      const current = routing
        ? currentFullPath(routing)
        : typeof window !== 'undefined'
          ? window.location.pathname + window.location.search + window.location.hash
          : '/'
      if (props.localeRoute) return props.localeRoute(current, code)
      return routing?.resolvePath ? routing.resolvePath(current, code) : current
    }

    return createLocaleSwitcher(
      { h, Fragment, ref, onMounted, onUnmounted },
      {
        locales,
        locale: () => (typeof props.currentLocale === 'function' ? props.currentLocale() : (props.currentLocale ?? i18n.locale.value)),
        localeName: () =>
          props.getLocaleName ? props.getLocaleName() : (locales().find((locale) => locale.code === i18n.locale.value)?.displayName ?? null),
        href: (code) => {
          const target = location(code)
          const path = typeof target === 'string' ? target : target.path
          return path ? (routing?.toHref?.(path) ?? path) : '#'
        },
        browserNavigates: () => !routing && !props.switchLocale && props.localeRoute !== undefined,
        select: (code) => {
          if (props.switchLocale) return props.switchLocale(code)
          const path = routing && pathOf(location(code))
          i18n.locale.value = code
          if (path) routing.push({ path })
        },
      },
      props,
      slots as RenderSlots,
    )
  },
})
