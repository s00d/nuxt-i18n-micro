<template>
  <a v-if="isExternalLink" :href="externalHref" :style="computedStyle" target="_blank" rel="noopener noreferrer">
    <!-- @slot Link content. -->
    <slot />
  </a>

  <NuxtLink v-else :to="$localePath(to)" :style="computedStyle">
    <slot />
  </NuxtLink>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { RouteLocationNamedRaw, RouteLocationResolvedGeneric } from 'vue-router'
import { useNuxtApp, useRoute, useRouter } from '#imports'

/**
 * A link that keeps the active locale: renders `NuxtLink` to the localized route, or a
 * plain `<a target="_blank">` when `to` is an external URL.
 */
defineOptions({ name: 'I18nLink' })

const { $localePath } = useNuxtApp()

interface Props {
  /** Target route. Localized automatically; an external URL is passed through unchanged. */
  to: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string
  /** Inline style applied while the link points at the current route. */
  activeStyle?: Partial<CSSStyleValue>
}

const props = defineProps<Props>()
const route = useRoute()
const router = useRouter()

const isExternalLink = computed(() => {
  if (typeof props.to === 'string') {
    return /^(?:https?:\/\/|\/\/|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})|tel:|mailto:/.test(props.to)
  }
  return false
})

const externalHref = computed(() => {
  if (isExternalLink.value && typeof props.to === 'string') {
    if (props.to.startsWith('//')) {
      return props.to
    }
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
  const pathStr = $localePath(props.to)
  return route.path === router.resolve(pathStr).path
})

const computedStyle = computed((): Partial<CSSStyleValue> => {
  return isActive.value ? { ...props.activeStyle } : {}
})
</script>
