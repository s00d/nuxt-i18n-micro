<template>
  <div
    class="split-pane"
    @mouseup="stopResize"
    @mouseleave="stopResize"
  >
    <!-- Левая панель -->
    <div
      class="split-pane__left"
      :style="{ width: leftWidth }"
    >
      <slot name="left" />
    </div>

    <!-- Разделитель -->
    <div
      class="split-pane__divider"
      :style="{ left: leftWidth }"
      @mousedown.prevent="startResize"
    >
      <div class="divider-handle" />
    </div>

    <!-- Правая панель -->
    <div
      class="split-pane__right"
      :style="{ left: leftWidth, paddingLeft: '4px' }"
    >
      <slot name="right" />
    </div>

    <!-- Оверлей при ресайзе (чтобы iframe/input не перехватывали события) -->
    <div
      v-if="isResizing"
      class="resize-overlay"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    storageKey?: string
    defaultLeftWidth?: string
    minLeftWidth?: number
    minRightWidth?: number
  }>(),
  {
    defaultLeftWidth: '300px',
    minLeftWidth: 150,
    minRightWidth: 300,
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
  document.body.style.cursor = 'col-resize'
  window.addEventListener('mousemove', handleResize)
  window.addEventListener('mouseup', stopResize)
}

const handleResize = (e: MouseEvent) => {
  if (!isResizing.value) return

  const splitPane = (e.target as HTMLElement).closest('.split-pane')
  if (!splitPane) return

  const newWidth = e.clientX

  if (newWidth >= props.minLeftWidth) {
    leftWidth.value = `${newWidth}px`
  }
}

const stopResize = () => {
  if (isResizing.value) {
    isResizing.value = false
    document.body.style.cursor = ''
    if (props.storageKey) {
      localStorage.setItem(`split-pane-${props.storageKey}`, leftWidth.value)
    }
    window.removeEventListener('mousemove', handleResize)
    window.removeEventListener('mouseup', stopResize)
  }
}
</script>

<style scoped>
@reference "tailwindcss";

.split-pane {
  @apply relative w-full h-full bg-white overflow-hidden;
}

.split-pane__left {
  @apply absolute top-0 bottom-0 left-0 border-r border-slate-200 overflow-hidden bg-white z-0;
}

.split-pane__divider {
  @apply absolute top-0 bottom-0 w-4 cursor-col-resize z-50 flex justify-center hover:bg-blue-50/50 transition-colors;
  margin-left: -2px;
}

.divider-handle {
  @apply w-[1px] h-full bg-slate-200 transition-colors;
}

.split-pane__divider:hover .divider-handle,
.split-pane__divider:active .divider-handle {
  @apply bg-blue-500 w-[2px];
}

.split-pane__right {
  @apply absolute top-0 bottom-0 right-0 overflow-hidden bg-white z-0;
}

.resize-overlay {
  @apply fixed inset-0 z-[100] cursor-col-resize;
}
</style>
