<script setup lang="ts">
defineProps<{ locale?: string; variant: string }>()
</script>

<template>
  <div :data-testid="`island-${variant}`">
    {{ $t('title') }} / {{ $getLocale() }}
    <BenchIslandClient nuxt-client :variant="variant" />
    <slot name="extra" />
  </div>
</template>
