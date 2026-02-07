<template>
  <div class="tabs">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      :class="['tab', { active: activeTab === tab.value }]"
      @click="activeTab = tab.value"
    >
      <span
        v-if="tab.icon"
        class="tab-icon"
      >
        <component
          :is="typeof tab.icon === 'string' ? 'span' : tab.icon"
          v-if="typeof tab.icon !== 'string'"
        />
        <span
          v-else
          v-html="tab.icon"
        />
      </span>
      <span class="tab-label">{{ tab.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { type Component, ref, watch } from 'vue'

interface Tab {
  label: string
  value: string
  icon?: string | Component
}

const props = defineProps<{
  modelValue: string // Активная вкладка
  tabs: Tab[] // Список вкладок
}>()

const emit = defineEmits(['update:modelValue'])

const activeTab = ref(props.modelValue)

// Следим за изменением активной вкладки
watch(activeTab, (newValue) => {
  emit('update:modelValue', newValue)
})
</script>

<style scoped>
@reference "tailwindcss";

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
  @apply text-base flex items-center;
  width: 16px;
  height: 16px;
}

.tab-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.tab-label {
  @apply whitespace-nowrap;
}
</style>
