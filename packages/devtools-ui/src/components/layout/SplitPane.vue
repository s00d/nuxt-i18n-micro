<template>
  <div class="relative h-full w-full overflow-hidden">
    <div class="absolute inset-y-0 left-0 overflow-hidden border-r border-line bg-subtle" :style="{ width: leftWidth }">
      <slot name="left" />
    </div>

    <div
      class="group absolute inset-y-0 z-10 -ml-1.5 flex w-3 cursor-col-resize justify-center"
      :style="{ left: leftWidth }"
      role="separator"
      aria-orientation="vertical"
      @mousedown.prevent="startResize"
    >
      <div :class="['h-full w-px transition-colors group-hover:w-0.5 group-hover:bg-primary', isResizing ? 'w-0.5 bg-primary' : 'bg-transparent']" />
    </div>

    <div class="absolute inset-y-0 right-0 overflow-hidden" :style="{ left: leftWidth }">
      <slot name="right" />
    </div>

    <!-- Keeps inputs and iframes from swallowing mouse events while dragging -->
    <div v-if="isResizing" class="fixed inset-0 z-50 cursor-col-resize" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    storageKey?: string
    defaultLeftWidth?: string
    minLeftWidth?: number
  }>(),
  {
    defaultLeftWidth: '300px',
    minLeftWidth: 150,
  },
)

const leftWidth = ref(props.defaultLeftWidth)
const isResizing = ref(false)

onMounted(() => {
  if (props.storageKey) {
    const saved = localStorage.getItem(`split-pane-${props.storageKey}`)
    if (saved) leftWidth.value = saved
  }
})

const startResize = () => {
  isResizing.value = true
  window.addEventListener('mousemove', handleResize)
  window.addEventListener('mouseup', stopResize)
}

const handleResize = (e: MouseEvent) => {
  if (e.clientX >= props.minLeftWidth) leftWidth.value = `${e.clientX}px`
}

const stopResize = () => {
  if (!isResizing.value) return
  isResizing.value = false
  if (props.storageKey) localStorage.setItem(`split-pane-${props.storageKey}`, leftWidth.value)
  window.removeEventListener('mousemove', handleResize)
  window.removeEventListener('mouseup', stopResize)
}
</script>
