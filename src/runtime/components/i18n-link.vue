<template>
  <NuxtLink
    :to="$localeRoute(to)"
    :style="activeStyle"
  >
    <slot>Go to Page</slot>
  </NuxtLink>
</template>

<script lang="ts" setup>
import { useNuxtApp, computed, useRoute, useRouter } from '#imports'
import type { NuxtLinkProps } from '#app/components/nuxt-link'

const { $localeRoute } = useNuxtApp()

interface Props {
  to: NuxtLinkProps
  activeStyle?: Partial<CSSStyleDeclaration>
}

const props = defineProps<Props>()
const route = useRoute()

const isActive = computed(() => {
  // If `to` is a string, compare it directly to the route path
  const newPath = $localeRoute(props.to)
  if (typeof newPath === 'string') {
    return route.path === useRouter().resolve(newPath).path
  }

  return route.path === newPath.path
})

// Define the active styles
const activeStyle = computed(() => {
  return isActive.value
    ? {
        fontWeight: 'bold',
        ...props.activeStyle, // Merge with any custom active styles passed as props
      }
    : {}
})
</script>
