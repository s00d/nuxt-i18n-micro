<script setup lang="ts">
import { joinURL } from 'ufo'

/** Static docs: serve `public/` as-is (IPX + `app.baseURL` breaks SVG/PNG paths on GH Pages). */
const props = defineProps<{
  src?: string
  alt?: string
  width?: string | number
  height?: string | number
}>()

const base = useRuntimeConfig().app.baseURL || '/'
/** Markdown uses root paths (`/diagrams/x.svg`); prefix them with the site base. */
const resolvedSrc = computed(() => {
  const src = props.src
  if (!src || !src.startsWith('/') || src.startsWith('//') || src.startsWith(base)) return src
  return joinURL(base, src)
})
</script>

<template>
  <img :src="resolvedSrc" :alt="alt || ''" :width="width" :height="height" loading="lazy" decoding="async" />
</template>
