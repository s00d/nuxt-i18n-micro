<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'focus-ring inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50',
      SIZES[size],
      VARIANTS[variant],
      { 'aspect-square px-0': square },
    ]"
  >
    <Icon v-if="icon" :name="icon" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import Icon, { type IconName } from './Icon.vue'

const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-green-600 dark:text-zinc-900 dark:hover:bg-green-300',
  secondary: 'border border-line bg-surface text-highlighted hover:bg-elevated',
  danger: 'bg-error text-white hover:opacity-90 dark:text-zinc-900',
  ghost: 'text-default hover:bg-elevated hover:text-highlighted',
}

const SIZES = { sm: 'h-7 px-2 text-xs', md: 'h-8 px-2.5 text-sm' }

withDefaults(
  defineProps<{
    variant?: keyof typeof VARIANTS
    size?: keyof typeof SIZES
    icon?: IconName
    /** Icon-only: square, label goes in `title`/`aria-label`. */
    square?: boolean
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  { variant: 'secondary', size: 'md', type: 'button' },
)
</script>
