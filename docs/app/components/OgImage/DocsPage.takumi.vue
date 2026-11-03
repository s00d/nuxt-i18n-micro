<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

defineProps<{
  headline?: string
  title?: string
  description?: string
}>()
</script>

<template>
  <div class="w-full h-full flex bg-neutral-950 relative overflow-hidden" data-theme="dark">
    <div class="absolute top-0 left-0 w-1.5 h-full bg-primary-400" />

    <div class="flex flex-col justify-between flex-1 px-20 py-16">
      <div />

      <div class="flex flex-col gap-5">
        <span v-if="headline" class="text-2xl font-medium text-primary-400">
          {{ headline }}
        </span>

        <h1 v-if="title" class="text-6xl font-bold text-highlighted">
          {{ title }}
        </h1>

        <p v-if="description" class="text-3xl/11 text-muted" :style="{ lineClamp: 2, textOverflow: 'ellipsis' }">
          {{ description }}
        </p>
      </div>

      <div class="flex items-center gap-4">
        <span class="text-xl font-semibold text-highlighted">Nuxt I18n Micro</span>
        <div class="h-px flex-1 bg-border" />
        <span class="text-xl text-dimmed">s00d.github.io</span>
      </div>
    </div>
  </div>
</template>
