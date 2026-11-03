<template>
  <!-- Rendered in place, not teleported: a teleport to `body` leaves the shadow root and its styles. -->
  <Transition
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
    enter-active-class="transition-opacity duration-150"
    leave-active-class="transition-opacity duration-150"
  >
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4 backdrop-blur-[2px]" @click.self="close">
      <div
        ref="dialog"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        tabindex="-1"
        :class="['flex max-h-full w-full flex-col overflow-hidden rounded-lg border border-line bg-surface outline-none', SIZES[size]]"
        :style="{ boxShadow: 'var(--ui-shadow-lg)' }"
        @keydown.esc.stop="close"
      >
        <header class="flex shrink-0 items-center justify-between gap-4 border-b border-line px-4 py-3">
          <h3 class="truncate text-sm font-semibold text-highlighted">{{ title }}</h3>
          <Button variant="ghost" size="sm" square icon="x" title="Close" aria-label="Close" @click="close" />
        </header>
        <div class="scroll-thin min-h-0 flex-1 overflow-y-auto p-4">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="flex shrink-0 items-center justify-end gap-2 border-t border-line bg-subtle px-4 py-3">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import Button from './Button.vue'

const SIZES = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-3xl' }

const props = withDefaults(defineProps<{ show: boolean; title?: string; size?: keyof typeof SIZES }>(), { size: 'md' })
const emit = defineEmits<{ 'update:show': [value: boolean]; close: [] }>()

const dialog = ref<HTMLElement | null>(null)

const close = () => {
  emit('update:show', false)
  emit('close')
}

// Focus the dialog so Esc and Tab work without a click first
watch(
  () => props.show,
  async (open) => {
    if (!open) return
    await nextTick()
    dialog.value?.focus()
  },
  { immediate: true },
)
</script>
