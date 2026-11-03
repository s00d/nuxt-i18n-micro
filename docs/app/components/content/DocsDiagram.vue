<script setup lang="ts">
import { joinURL } from 'ufo'
import { tv } from '~/utils/tv'

/**
 * Pre-rendered diagram (`public/v3/diagrams/<name>.svg` and `<name>.dark.svg`): static images,
 * one per color mode, with their intrinsic size so nothing shifts while they load.
 */
const props = defineProps<{
  name: string
  alt: string
  width: string | number
  height: string | number
}>()

const diagramTv = tv({
  slots: {
    root: 'my-6 overflow-x-auto rounded-lg border border-default bg-default p-4',
    img: 'mx-auto h-auto max-w-full',
  },
})

const ui = diagramTv()
const base = useRuntimeConfig().app.baseURL || '/'
const src = (suffix: string) => joinURL(base, `/v3/diagrams/${props.name}${suffix}.svg`)
</script>

<template>
  <figure :class="ui.root()">
    <img :src="src('')" :alt="alt" :width="width" :height="height" loading="lazy" decoding="async" :class="[ui.img(), 'dark:hidden']" />
    <img :src="src('.dark')" :alt="alt" :width="width" :height="height" loading="lazy" decoding="async" :class="[ui.img(), 'hidden dark:block']" />
  </figure>
</template>
