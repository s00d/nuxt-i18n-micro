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
    :to="$localePath(to)"
    :style="computedStyle"
  >
    <slot />
  </NuxtLink>
</template>

<script lang="ts" setup>
import type { RouteLocationNamedRaw, RouteLocationResolvedGeneric } from 'vue-router'
import { useNuxtApp, useRoute, useRouter } from '#imports'
import { computed } from 'vue'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const { $localePath } = useNuxtApp()

interface Props {
  to: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string
  activeStyle?: Partial<CSSStyleValue>
}

const props = defineProps<Props>()
const route = useRoute()

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
  const pathStr = $localePath(props.to)
  return route.path === useRouter().resolve(pathStr).path
})

const computedStyle = computed((): Partial<CSSStyleValue> => {
  return isActive.value
    ? { ...props.activeStyle }
    : {}
})
</script>
