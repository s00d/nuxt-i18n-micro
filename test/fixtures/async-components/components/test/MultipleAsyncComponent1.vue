<template>
  <div class="multiple-async-component-1">
    <h3>{{ $t('multiple-async-component-1::title') }}</h3>
    <p>{{ $t('multiple-async-component-1::description') }}</p>
    <div class="component-info">
      <p><strong>{{ $t('multiple-async-component-1::componentId') }}:</strong> Multiple Async Component 1</p>
      <p><strong>{{ $t('multiple-async-component-1::status') }}:</strong> {{ $t('multiple-async-component-1::loaded') }}</p>
    </div>
    <div class="actions">
      <button
        class="action-button"
        @click="performAction"
      >
        {{ $t('multiple-async-component-1::actionButton') }}
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
      'multiple-async-component-1::title': 'Multiple Async Component 1 Loaded',
      'multiple-async-component-1::description': 'First of multiple async components',
      'multiple-async-component-1::componentId': 'Component ID',
      'multiple-async-component-1::status': 'Status',
      'multiple-async-component-1::loaded': 'Loaded',
      'multiple-async-component-1::actionButton': 'Perform Action',
      'multiple-async-component-1::actionResult': 'Action completed successfully in Component 1',
    },
    ru: {
      'multiple-async-component-1::title': 'Множественный Асинхронный Компонент 1 Загружен',
      'multiple-async-component-1::description': 'Первый из множественных асинхронных компонентов',
      'multiple-async-component-1::componentId': 'ID Компонента',
      'multiple-async-component-1::status': 'Статус',
      'multiple-async-component-1::loaded': 'Загружен',
      'multiple-async-component-1::actionButton': 'Выполнить Действие',
      'multiple-async-component-1::actionResult': 'Действие успешно выполнено в Компоненте 1',
    },
    de: {
      'multiple-async-component-1::title': 'Mehrere Async-Komponente 1 Geladen',
      'multiple-async-component-1::description': 'Erste von mehreren Async-Komponenten',
      'multiple-async-component-1::componentId': 'Komponenten-ID',
      'multiple-async-component-1::status': 'Status',
      'multiple-async-component-1::loaded': 'Geladen',
      'multiple-async-component-1::actionButton': 'Aktion Ausführen',
      'multiple-async-component-1::actionResult': 'Aktion erfolgreich in Komponente 1 ausgeführt',
    },
  },
})

const performAction = () => {
  actionResult.value = String($t('multiple-async-component-1::actionResult') || 'Action completed successfully')
}
</script>

<style scoped>
.multiple-async-component-1 {
  padding: 15px;
  background: #f8d7da;
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
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.action-button:hover {
  background: #c82333;
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
