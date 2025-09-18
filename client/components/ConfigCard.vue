<template>
  <NCard class="config-card">
    <div class="config-card__header">
      <span class="config-card__icon">{{ icon }}</span>
      <h3 class="config-card__title">
        {{ title }}
      </h3>
    </div>

    <div class="config-card__content">
      <slot />
    </div>
  </NCard>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  icon: string
}>()
</script>

<style scoped>
.config-card {
  @apply !rounded-lg !shadow-sm !border border-slate-200 overflow-hidden;
}

.config-card__header {
  @apply flex items-center p-4 pb-3 border-b border-slate-100 bg-slate-50;
}

.config-card__icon {
  @apply text-lg mr-2;
}

.config-card__title {
  @apply text-lg font-semibold text-slate-800;
}

.config-card__content {
  @apply p-4;
}
</style>
