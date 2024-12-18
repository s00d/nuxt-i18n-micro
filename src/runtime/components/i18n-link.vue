<template>
  <a
    v-if="isExternalLink"
    :href="externalHref"
    :style="computedStyle"
    target="_blank"
    rel="noopener noreferrer"
  >
    <slot />
  </a>

  <NuxtLink
    v-else
    :to="$localeRoute(to)"
    :style="computedStyle"
  >
    <slot />
  </NuxtLink>
</template>

<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router'
import { useNuxtApp, computed, useRoute, useRouter } from '#imports'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const { $localeRoute } = useNuxtApp()

interface Props {
  to: RouteLocationRaw | string
  activeStyle?: Partial<CSSStyleValue>
}

const props = defineProps<Props>()
const route = useRoute()

const isExternalLink = computed(() => {
  if (typeof props.to === 'string') {
    return /^(?:https?:\/\/|\/\/|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/.test(props.to)
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
  // If `to` is a string, compare it directly to the route path
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const newPath = $localeRoute(props.to)
  if (typeof newPath === 'string') {
    return route.path === useRouter().resolve(newPath).path
  }

  return route.path === newPath.path
})

const computedStyle = computed((): Partial<CSSStyleValue> => {
  return isActive.value
    ? { ...props.activeStyle }
    : {}
})
</script>
