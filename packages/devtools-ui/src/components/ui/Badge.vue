<template>
  <span :class="['inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs font-medium whitespace-nowrap', COLORS[color]]">
    <span v-if="dot" class="size-1.5 rounded-full bg-current" />
    <slot />
  </span>
</template>

<script setup lang="ts">
// Soft badges as in Nuxt UI: tinted background, colored text.
const COLORS = {
  primary: 'bg-primary/10 text-primary',
  neutral: 'bg-elevated text-default',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
  info: 'bg-info/10 text-info',
}

withDefaults(defineProps<{ color?: keyof typeof COLORS; dot?: boolean }>(), { color: 'neutral' })
</script>
