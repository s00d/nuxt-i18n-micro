<script setup lang="ts">
import { joinURL } from 'ufo'
import { tv } from '~/utils/tv'

const chartTv = tv({
  slots: {
    root: 'my-6 rounded-lg border border-default bg-default p-3',
    fallback: 'text-sm text-muted p-8 text-center',
  },
})

const ui = chartTv()
const props = defineProps<{ url: string }>()
const canvas = ref<HTMLCanvasElement | null>(null)
let chart: { destroy: () => void } | null = null

const base = useRuntimeConfig().app.baseURL || '/'

/** `<canvas>` lives inside `<ClientOnly>`, so it appears after this component mounts. */
watch(canvas, async (el) => {
  if (!el || chart) return
  // Chart configs live in `public/charts`: prefix the site base and import them as-is.
  const url = props.url.startsWith('/') ? joinURL(base, props.url) : props.url
  const [{ Chart, registerables }, configModule] = await Promise.all([import('chart.js'), import(/* @vite-ignore */ url)])
  Chart.register(...registerables)
  const exported = (configModule as { default?: unknown }).default ?? configModule
  // Generated configs export a factory (`export default function () { return {...} }`).
  const config = typeof exported === 'function' ? (exported as () => unknown)() : exported
  chart = new Chart(el, config as never)
})

onBeforeUnmount(() => {
  chart?.destroy()
  chart = null
})
</script>

<template>
  <div :class="ui.root()">
    <ClientOnly>
      <canvas ref="canvas" height="400" />
      <template #fallback>
        <div :class="ui.fallback()">Loading chart…</div>
      </template>
    </ClientOnly>
  </div>
</template>
