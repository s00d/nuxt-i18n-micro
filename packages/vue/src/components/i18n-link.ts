import { externalLinkHref, isPlainClick, isSamePage } from '@i18n-micro/core'
import { type CSSProperties, computed, defineComponent, h, inject, type PropType } from 'vue'
import type { VueI18n } from '../composer'
import { I18nInjectionKey, I18nRouterKey } from '../injection'
import { pathOf } from '../router/path'
import type { I18nRoutingStrategy, I18nRouteTarget } from '../router/types'

export const I18nLink = /*#__PURE__*/ defineComponent({
  name: 'I18nLink',
  props: {
    to: {
      type: [String, Object] as PropType<I18nRouteTarget>,
      required: true,
    },
    activeStyle: {
      type: Object as PropType<CSSProperties>,
      default: () => ({}),
    },
    localeRoute: {
      type: Function as PropType<(to: I18nRouteTarget, locale?: string) => string | { path?: string }>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const i18n = inject<VueI18n>(I18nInjectionKey)
    const routerStrategy = inject<I18nRoutingStrategy | undefined>(I18nRouterKey, undefined)

    if (!i18n) {
      throw new Error('[i18n-micro] I18nLink: i18n instance not found. Make sure i18n plugin is installed.')
    }

    const externalHref = computed(() => externalLinkHref(props.to))

    const targetPath = computed(() => {
      if (props.localeRoute) return pathOf(props.localeRoute(props.to))
      if (routerStrategy?.resolvePath) return pathOf(routerStrategy.resolvePath(props.to, i18n.locale.value))
      return pathOf(props.to as string | { path?: string })
    })

    const computedStyle = computed(() => {
      const active = routerStrategy !== undefined && externalHref.value === undefined && isSamePage(routerStrategy.getCurrentPath(), targetPath.value)
      return active ? props.activeStyle : {}
    })

    const follow = (event: MouseEvent) => {
      if (!isPlainClick(event)) return
      event.preventDefault()
      if (routerStrategy) routerStrategy.push({ path: targetPath.value })
      else window.location.href = targetPath.value
    }

    return () => {
      if (externalHref.value !== undefined) {
        return h('a', { href: externalHref.value, target: '_blank', rel: 'noopener noreferrer', style: computedStyle.value }, slots.default?.())
      }

      if (routerStrategy?.linkComponent) {
        return h(routerStrategy.linkComponent, { to: targetPath.value, style: computedStyle.value }, { default: slots.default })
      }

      const href = routerStrategy?.toHref?.(targetPath.value) ?? targetPath.value
      return h('a', { href, style: computedStyle.value, onClick: follow }, slots.default?.())
    }
  },
})
