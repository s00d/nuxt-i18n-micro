<template>
  <div class="tabs">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      :class="['tab', { active: activeTab === tab.value }]"
      @click="activeTab = tab.value"
    >
      <span class="tab-icon">{{ getTabIcon(tab.value) }}</span>
      <span class="tab-label">{{ tab.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string // Активная вкладка
  tabs: { label: string, value: string }[] // Список вкладок
}>()

const emit = defineEmits(['update:modelValue'])

const activeTab = ref(props.modelValue)

// Следим за изменением активной вкладки
watch(activeTab, (newValue) => {
  emit('update:modelValue', newValue)
})

// Получаем иконку для вкладки
const getTabIcon = (value: string) => {
  const icons: Record<string, string> = {
    i18n: '🌍',
    settings: '⚙️',
    config: '📊',
  }
  return icons[value] || '📄'
}
</script>

<style scoped>
.tabs {
  @apply flex border-b border-slate-200 bg-white sticky top-0 z-10;
}

.tab {
  @apply flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600
  border-b-2 border-transparent transition-all duration-200 hover:text-slate-800 hover:bg-slate-50;
}

.tab.active {
  @apply text-blue-600 border-blue-500 bg-blue-50;
}

.tab-icon {
  @apply text-base;
}

.tab-label {
  @apply whitespace-nowrap;
}
</style>
