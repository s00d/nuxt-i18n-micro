import { defineComponent, computed, h, inject, type PropType, type CSSProperties } from 'vue'
import { I18nRouterKey, I18nInjectionKey } from '../injection'
import type { VueI18n } from '../composer'
import type { I18nRoutingStrategy } from '../router/types'

export const I18nLink = defineComponent({
  name: 'I18nLink',
  props: {
    to: {
      type: [String, Object] as PropType<string | { path?: string }>,
      required: true,
    },
    activeStyle: {
      type: Object as PropType<CSSProperties>,
      default: () => ({}),
    },
    localeRoute: {
      type: Function as PropType<(to: string | { path?: string }, locale?: string) => string | { path?: string }>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const i18n = inject<VueI18n>(I18nInjectionKey)
    const routerStrategy = inject<I18nRoutingStrategy | undefined>(I18nRouterKey, undefined)

    if (!i18n) {
      throw new Error('[i18n-micro] I18nLink: i18n instance not found. Make sure i18n plugin is installed.')
    }

    const isExternalLink = computed(() => {
      if (typeof props.to === 'string') {
        return /^(?:https?:\/\/|\/\/|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})|tel:|mailto:/.test(props.to)
      }
      return false
    })

    const targetPath = computed(() => {
      if (isExternalLink.value) {
        return props.to as string
      }

      if (props.localeRoute) {
        const res = props.localeRoute(props.to)
        return typeof res === 'string' ? res : (res.path || '/')
      }

      if (!routerStrategy?.resolvePath) {
        return typeof props.to === 'string' ? props.to : (props.to.path || '/')
      }

      const res = routerStrategy.resolvePath(props.to, i18n.locale.value)
      return typeof res === 'string' ? res : (res.path || '/')
    })

    const isActive = computed(() => {
      if (isExternalLink.value || !routerStrategy) {
        return false
      }

      const currentPath = routerStrategy.getCurrentPath().replace(/\/$/, '')
      const linkPath = targetPath.value.replace(/\/$/, '')

      return currentPath === linkPath
    })

    const computedStyle = computed(() => isActive.value ? props.activeStyle : {})

    return () => {
      if (isExternalLink.value) {
        return h('a', {
          href: targetPath.value,
          target: '_blank',
          rel: 'noopener noreferrer',
          style: computedStyle.value,
        }, slots.default?.())
      }

      if (routerStrategy?.linkComponent) {
        return h(routerStrategy.linkComponent, {
          to: targetPath.value,
          style: computedStyle.value,
        }, { default: slots.default })
      }

      return h('a', {
        href: targetPath.value,
        style: computedStyle.value,
        onClick: (e: MouseEvent) => {
          e.preventDefault()
          if (routerStrategy) {
            routerStrategy.push({ path: targetPath.value })
          }
          else {
            window.location.href = targetPath.value
          }
        },
      }, slots.default?.())
    }
  },
})
