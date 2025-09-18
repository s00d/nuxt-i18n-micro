<template>
  <div class="settings-card">
    <div class="settings-card__header">
      <span class="settings-card__icon">{{ icon }}</span>
      <h3 class="settings-card__title">
        {{ title }}
      </h3>
    </div>

    <div class="settings-card__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  icon: string
}

defineProps<Props>()
</script>

<style scoped>
.settings-card {
  @apply bg-white rounded-lg p-4 shadow-sm border border-slate-200 transition-all duration-200 hover:shadow-md;
}

.settings-card__header {
  @apply flex items-center mb-4 pb-3 border-b border-slate-100;
}

.settings-card__icon {
  @apply text-lg mr-2;
}

.settings-card__title {
  @apply text-lg font-semibold text-slate-800;
}

.settings-card__content {
  @apply space-y-4;
}
</style>
