<template>
  <a v-if="isExternalLink" :href="externalHref" :style="computedStyle" target="_blank" rel="noopener noreferrer">
    <!-- @slot Link content. -->
    <slot />
  </a>

  <NuxtLink v-else :to="localizedPath" :style="computedStyle">
    <slot />
  </NuxtLink>
</template>

<script lang="ts" setup>
import { externalLinkHref } from '@i18n-micro/core'
import { computed } from 'vue'
import type { RouteLocationNamedRaw, RouteLocationResolvedGeneric } from 'vue-router'
import { useNuxtApp, useRoute } from '#imports'

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

const externalHref = computed(() => externalLinkHref(props.to))
const isExternalLink = computed(() => externalHref.value !== undefined)

const localizedPath = computed(() => (isExternalLink.value ? '' : $localePath(props.to)))

// compared as paths: a router.resolve per render matched the URL against every record
const isActive = computed(() => !isExternalLink.value && route.path === localizedPath.value.split(/[?#]/)[0])

const computedStyle = computed((): Partial<CSSStyleValue> => {
  return isActive.value ? { ...props.activeStyle } : {}
})
</script>
