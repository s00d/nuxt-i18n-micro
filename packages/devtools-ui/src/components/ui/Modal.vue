<template>
  <Teleport to="body">
    <transition name="modal">
      <div
        v-if="show"
        class="modal-overlay"
        @click.self="handleOutsideClick"
        @keydown.esc="handleEsc"
      >
        <div
          class="modal-content"
          :style="{
            width: customWidth || sizeMap[size].width,
            height: customHeight || sizeMap[size].height,
          }"
        >
          <!-- Header -->
          <div
            class="modal-header"
            :class="headerClass"
          >
            <div class="header-content">
              <slot name="header">
                <h3 class="modal-title">
                  {{ title }}
                </h3>
              </slot>
            </div>
            <button
              v-if="showCloseButton"
              class="modal-close-button"
              aria-label="Close modal"
              @click="closeModal"
            >
              <svg
                class="close-icon"
                viewBox="0 0 24 24"
              >
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <slot />
          </div>

          <!-- Footer -->
          <div
            v-if="$slots.footer"
            class="modal-footer"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    show: boolean
    title?: string
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom'
    width?: string
    height?: string
    disableOutsideClick?: boolean
    disableEsc?: boolean
    showCloseButton?: boolean
    headerClass?: string
  }>(),
  {
    size: 'md',
    showCloseButton: true,
    disableOutsideClick: false,
    disableEsc: false,
  },
)

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'close'): void
}>()

const sizeMap = {
  sm: { width: '400px', height: 'auto' },
  md: { width: '600px', height: '70vh' },
  lg: { width: '800px', height: '80vh' },
  xl: { width: '90vw', height: '90vh' },
  custom: { width: props.width || 'auto', height: props.height || 'auto' },
}

const customWidth = computed(() => (props.size === 'custom' ? props.width : null))

const customHeight = computed(() => (props.size === 'custom' ? props.height : null))

const closeModal = () => {
  emit('update:show', false)
  emit('close')
}

const handleOutsideClick = () => {
  if (!props.disableOutsideClick) {
    closeModal()
  }
}

const handleEsc = () => {
  if (!props.disableEsc) {
    closeModal()
  }
}

// Keyboard events handling
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') handleEsc()
}

// Block scroll when modal is open
const originalOverflow = ref<string>('')

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)

  // Block scroll when modal is open
  if (props.show) {
    const appContainer = document.querySelector('i18n-devtools-ui')
    if (appContainer) {
      originalOverflow.value = (appContainer as HTMLElement).style.overflow || ''
      ;(appContainer as HTMLElement).style.overflow = 'hidden'
    }
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)

  // Restore scroll on close
  const appContainer = document.querySelector('i18n-devtools-ui')
  if (appContainer) {
    ;(appContainer as HTMLElement).style.overflow = originalOverflow.value
  }
})

// Watch show changes for blocking/unblocking scroll
watch(
  () => props.show,
  (isOpen) => {
    const appContainer = document.querySelector('i18n-devtools-ui')
    if (appContainer) {
      if (isOpen) {
        originalOverflow.value = (appContainer as HTMLElement).style.overflow || ''
        ;(appContainer as HTMLElement).style.overflow = 'hidden'
      } else {
        ;(appContainer as HTMLElement).style.overflow = originalOverflow.value
      }
    }
  },
)
</script>

<style scoped>
@reference "tailwindcss";

.modal-overlay {
  @apply fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[1000];
  backdrop-filter: blur(2px);
}

.modal-content {
  @apply bg-white rounded-xl shadow-2xl flex flex-col;
  max-height: calc(100vh - 2rem);
}

.modal-header {
  @apply flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0;
}

.header-content {
  @apply flex-1 min-w-0;
}

.modal-title {
  @apply text-xl font-semibold text-gray-900 truncate;
}

.modal-close-button {
  @apply p-2 ml-4 -mr-2 text-gray-400 hover:text-gray-600 transition-colors;
}

.close-icon {
  @apply w-6 h-6 fill-current;
}

.modal-body {
  @apply flex-1 p-6 overflow-y-auto;
  scrollbar-width: thin;
  scrollbar-color: theme('colors.gray.300') theme('colors.white');
}

.modal-body::-webkit-scrollbar {
  @apply w-2;
}

.modal-body::-webkit-scrollbar-track {
  @apply bg-gray-100 rounded-sm;
}

.modal-body::-webkit-scrollbar-thumb {
  @apply bg-gray-300 rounded-sm hover:bg-gray-400;
}

.modal-footer {
  @apply flex items-center justify-end px-6 py-4 space-x-3 border-t border-gray-100 shrink-0;
}
</style>
