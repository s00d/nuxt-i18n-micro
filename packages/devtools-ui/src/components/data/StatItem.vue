<template>
  <div class="min-w-0 rounded-md border border-line bg-surface px-3 py-2.5">
    <div class="truncate text-xs text-muted" :title="label">{{ label }}</div>
    <div
      :class="['mt-0.5 truncate font-semibold text-highlighted tabular-nums', mono ? 'font-mono text-sm' : 'text-lg', TONES[tone]]"
      :title="String(formattedValue)"
    >
      {{ formattedValue }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const TONES = { default: '', primary: 'text-primary', warning: 'text-warning', error: 'text-error' }

const props = withDefaults(
  defineProps<{
    label: string
    value: string | number
    tone?: keyof typeof TONES
    /** The value is a key or code, not a number. */
    mono?: boolean
  }>(),
  { tone: 'default' },
)

const formattedValue = computed(() => (typeof props.value === 'number' ? props.value.toLocaleString() : props.value))
</script>
