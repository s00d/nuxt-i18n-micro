<template>
  <div id="slow-layout">
    <SlowPart />
    <slot />
  </div>
</template>

<script setup>
import { defineComponent, h } from 'vue'

// a part of the layout with async work: its page is ready first, and the old layout stays on screen until this ends
const SlowPart = defineComponent({
  async setup() {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return () => h('i')
  },
})
</script>
