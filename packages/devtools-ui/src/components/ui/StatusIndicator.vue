<template>
  <div class="status-indicator">
    <div
      class="status-indicator__dot"
      :class="dotClass"
    />
    <span
      class="status-indicator__text"
      :class="textClass"
    >
      {{ label }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  status: 'active' | 'inactive' | 'enabled' | 'disabled' | 'success' | 'warning' | 'error' | 'info'
  label: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const dotClass = computed(() => {
  const baseClass = 'status-indicator__dot'
  const sizeClass = `status-indicator__dot--${props.size}`

  switch (props.status) {
    case 'active':
    case 'enabled':
    case 'success':
      return `${baseClass} ${sizeClass} status-indicator__dot--success`
    case 'inactive':
    case 'disabled':
      return `${baseClass} ${sizeClass} status-indicator__dot--disabled`
    case 'warning':
      return `${baseClass} ${sizeClass} status-indicator__dot--warning`
    case 'error':
      return `${baseClass} ${sizeClass} status-indicator__dot--error`
    case 'info':
      return `${baseClass} ${sizeClass} status-indicator__dot--info`
    default:
      return `${baseClass} ${sizeClass} status-indicator__dot--default`
  }
})

const textClass = computed(() => {
  switch (props.status) {
    case 'active':
    case 'enabled':
    case 'success':
      return 'text-green-700'
    case 'inactive':
    case 'disabled':
      return 'text-red-700'
    case 'warning':
      return 'text-yellow-700'
    case 'error':
      return 'text-red-700'
    case 'info':
      return 'text-blue-700'
    default:
      return 'text-slate-700'
  }
})
</script>

<style scoped>
@reference "tailwindcss";

.status-indicator {
  @apply flex items-center gap-2;
}

.status-indicator__dot {
  @apply rounded-full transition-all duration-200;
}

.status-indicator__dot--sm {
  @apply w-2 h-2;
}

.status-indicator__dot--md {
  @apply w-3 h-3;
}

.status-indicator__dot--lg {
  @apply w-4 h-4;
}

.status-indicator__dot--success {
  @apply bg-green-500;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
}

.status-indicator__dot--disabled {
  @apply bg-red-500;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.status-indicator__dot--warning {
  @apply bg-yellow-500;
  box-shadow: 0 0 0 2px rgba(234, 179, 8, 0.2);
}

.status-indicator__dot--error {
  @apply bg-red-500;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.status-indicator__dot--info {
  @apply bg-blue-500;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.status-indicator__dot--default {
  @apply bg-slate-500;
  box-shadow: 0 0 0 2px rgba(100, 116, 139, 0.2);
}

.status-indicator__text {
  @apply text-sm font-medium;
}
</style>
