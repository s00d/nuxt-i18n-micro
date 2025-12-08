import { defineComponent, computed, h, type PropType, type CSSProperties, type DefineComponent } from 'vue'
import { RouterLink, useRouter, useRoute, type RouteLocationRaw, type RouteLocationNormalizedLoaded, type RouterLinkProps } from 'vue-router'
import { useI18n } from '../use-i18n'

export const I18nLink = defineComponent({
  name: 'I18nLink',
  props: {
    to: {
      type: [String, Object] as PropType<RouteLocationRaw | RouteLocationNormalizedLoaded | string>,
      required: true,
    },
    activeStyle: {
      type: Object as PropType<CSSProperties>,
      default: () => ({}),
    },
  },
  setup(props, { slots }) {
    const router = useRouter()
    const route = useRoute()
    const { localeRoute } = useI18n()

    const isExternalLink = computed(() => {
      if (typeof props.to === 'string') {
        return /^(?:https?:\/\/|\/\/|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})|tel:|mailto:/.test(props.to)
      }
      return false
    })

    const externalHref = computed(() => {
      if (isExternalLink.value && typeof props.to === 'string') {
        if (!/^https?:\/\//.test(props.to)) {
          return `https://${props.to}`
        }
        return props.to
      }
      return undefined
    })

    const isActive = computed(() => {
      if (isExternalLink.value) {
        return false
      }

      if (!localeRoute) {
        return false
      }

      const newPath = localeRoute(props.to)
      if (typeof newPath === 'string') {
        return route.path === router.resolve(newPath).path
      }

      if (typeof newPath === 'object' && 'path' in newPath) {
        return route.path === newPath.path
      }

      return false
    })

    const computedStyle = computed((): CSSProperties => {
      return isActive.value
        ? { ...props.activeStyle }
        : {}
    })

    const localizedTo = computed(() => {
      if (isExternalLink.value) {
        return undefined
      }
      if (localeRoute) {
        return localeRoute(props.to)
      }
      return props.to
    })

    return () => {
      if (isExternalLink.value) {
        return h('a', {
          href: externalHref.value,
          style: computedStyle.value,
          target: '_blank',
          rel: 'noopener noreferrer',
        }, slots.default?.())
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const RouterLinkTyped = RouterLink as DefineComponent<
        RouterLinkProps & { style?: CSSProperties }
      >

      return h(RouterLinkTyped, {
        to: (localizedTo.value || props.to) as RouteLocationRaw,
        style: computedStyle.value,
      }, {
        default: slots.default,
      })
    }
  },
})
