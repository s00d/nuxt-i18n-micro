<template>
  <NuxtLink
    :to="$localeRoute(to)"
    :class="{ active: isActive }"
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
  activeClass?: string
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
</script>

<style scoped>
.active {
  font-weight: bold;
  color: #42b983;
}
</style>
