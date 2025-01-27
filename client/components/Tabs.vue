<template>
  <div class="tabs">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      :class="['tab', { active: activeTab === tab.value }]"
      @click="activeTab = tab.value"
    >
      {{ tab.label }}
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
</script>

<style scoped>
.tabs {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  background: white;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 2;
}

.tab {
  padding: 10px 20px;
  cursor: pointer;
  border: none;
  background: none;
  font-size: 14px;
  color: #4a5568; /* Цвет текста */
  transition: all 0.2s ease;

}

.tab:hover {
  background-color: #f7fafc; /* Фон при наведении */
}

.tab.active {
  border-bottom: 2px solid #3b82f6; /* Активная вкладка */
  color: #3b82f6; /* Цвет текста активной вкладки */
  font-weight: 500;
}
</style>
