<template>
  <div class="flex h-full flex-col items-center justify-center gap-1 p-8 text-center">
    <div class="mb-2 flex size-10 items-center justify-center rounded-lg border border-line bg-subtle text-muted">
      <Icon :name="icon" class="size-5" />
    </div>
    <p class="text-sm font-semibold text-highlighted">{{ title }}</p>
    <p v-if="description" class="max-w-xs text-sm text-muted">{{ description }}</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
import Icon, { type IconName } from './Icon.vue'

defineProps<{ icon: IconName; title: string; description?: string }>()
</script>
