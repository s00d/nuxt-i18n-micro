<template>
  <section class="overflow-hidden rounded-lg border border-line bg-surface">
    <header class="flex items-center gap-2 border-b border-line px-4 py-3">
      <Icon v-if="icon" :name="icon" class="text-muted" />
      <h3 class="text-sm font-semibold text-highlighted">{{ title }}</h3>
      <span v-if="description" class="truncate text-sm text-muted">· {{ description }}</span>
      <div class="ml-auto"><slot name="actions" /></div>
    </header>
    <div :class="flush ? '' : 'p-4'">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import Icon, { type IconName } from './Icon.vue'

defineProps<{
  title: string
  description?: string
  icon?: IconName
  /** No padding: the content (a table, a list) runs to the card edges. */
  flush?: boolean
}>()
</script>
