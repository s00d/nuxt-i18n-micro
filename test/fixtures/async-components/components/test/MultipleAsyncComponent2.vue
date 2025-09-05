<template>
  <div class="multiple-async-component-2">
    <h3>{{ $t('multiple-async-component-2::title') }}</h3>
    <p>{{ $t('multiple-async-component-2::description') }}</p>
    <div class="component-info">
      <p><strong>{{ $t('multiple-async-component-2::componentId') }}:</strong> Multiple Async Component 2</p>
      <p><strong>{{ $t('multiple-async-component-2::status') }}:</strong> {{ $t('multiple-async-component-2::loaded') }}</p>
    </div>
    <div class="actions">
      <button
        class="action-button"
        @click="performAction"
      >
        {{ $t('multiple-async-component-2::actionButton') }}
      </button>
      <div
        v-if="actionResult"
        class="action-result"
      >
        {{ actionResult }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNuxtApp } from '#imports'

const { $defineI18nRoute, $t } = useNuxtApp()

const actionResult = ref('')

$defineI18nRoute({
  locales: {
    en: {
      'multiple-async-component-2::title': 'Multiple Async Component 2 Loaded',
      'multiple-async-component-2::description': 'Second of multiple async components',
      'multiple-async-component-2::componentId': 'Component ID',
      'multiple-async-component-2::status': 'Status',
      'multiple-async-component-2::loaded': 'Loaded',
      'multiple-async-component-2::actionButton': 'Perform Action',
      'multiple-async-component-2::actionResult': 'Action completed successfully in Component 2',
    },
    ru: {
      'multiple-async-component-2::title': 'Множественный Асинхронный Компонент 2 Загружен',
      'multiple-async-component-2::description': 'Второй из множественных асинхронных компонентов',
      'multiple-async-component-2::componentId': 'ID Компонента',
      'multiple-async-component-2::status': 'Статус',
      'multiple-async-component-2::loaded': 'Загружен',
      'multiple-async-component-2::actionButton': 'Выполнить Действие',
      'multiple-async-component-2::actionResult': 'Действие успешно выполнено в Компоненте 2',
    },
    de: {
      'multiple-async-component-2::title': 'Mehrere Async-Komponente 2 Geladen',
      'multiple-async-component-2::description': 'Zweite von mehreren Async-Komponenten',
      'multiple-async-component-2::componentId': 'Komponenten-ID',
      'multiple-async-component-2::status': 'Status',
      'multiple-async-component-2::loaded': 'Geladen',
      'multiple-async-component-2::actionButton': 'Aktion Ausführen',
      'multiple-async-component-2::actionResult': 'Aktion erfolgreich in Komponente 2 ausgeführt',
    },
  },
})

const performAction = () => {
  actionResult.value = String($t('multiple-async-component-2::actionResult') || 'Action completed successfully')
}
</script>

<style scoped>
.multiple-async-component-2 {
  padding: 15px;
  background: #d1ecf1;
  border-radius: 5px;
  margin: 10px 0;
}

.component-info {
  margin-top: 10px;
  font-size: 0.9em;
}

.component-info p {
  margin: 5px 0;
}

.actions {
  margin-top: 15px;
}

.action-button {
  padding: 8px 16px;
  background: #17a2b8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.action-button:hover {
  background: #138496;
}

.action-result {
  margin-top: 10px;
  padding: 8px;
  background: #d4edda;
  color: #155724;
  border-radius: 4px;
  font-weight: bold;
}
</style>
