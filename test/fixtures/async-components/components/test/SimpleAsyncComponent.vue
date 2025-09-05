<template>
  <div
    id="simple-async-component"
    class="simple-async-component"
  >
    <h3>{{ $t('simple-async-component::title') }}</h3>
    <p>{{ $t('simple-async-component::description') }}</p>

    <div class="component-info">
      <p><strong>{{ $t('simple-async-component::componentId') }}:</strong> Simple Async Component</p>
      <p><strong>{{ $t('simple-async-component::loadTime') }}:</strong> {{ loadTime }}</p>
    </div>

    <div class="test-content">
      <p>{{ $t('simple-async-component::testContent') }}</p>
      <button
        id="simple-counter-btn"
        class="counter-button"
        @click="incrementCounter"
      >
        {{ $t('simple-async-component::counterButton') }} ({{ counter }})
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#imports'

const { $defineI18nRoute, $t } = useNuxtApp()

// Определяем переводы для этого компонента
$defineI18nRoute({
  locales: {
    en: {
      'simple-async-component::title': 'Simple Async Component',
      'simple-async-component::description': 'This is a basic async component for testing',
      'simple-async-component::componentId': 'Component ID',
      'simple-async-component::loadTime': 'Load Time',
      'simple-async-component::testContent': 'This component was loaded asynchronously and should have access to translations',
      'simple-async-component::counterButton': 'Increment Counter',
    },
    ru: {
      'simple-async-component::title': 'Простой Асинхронный Компонент',
      'simple-async-component::description': 'Это базовый асинхронный компонент для тестирования',
      'simple-async-component::componentId': 'ID Компонента',
      'simple-async-component::loadTime': 'Время Загрузки',
      'simple-async-component::testContent': 'Этот компонент был загружен асинхронно и должен иметь доступ к переводам',
      'simple-async-component::counterButton': 'Увеличить Счетчик',
    },
    de: {
      'simple-async-component::title': 'Einfache Async-Komponente',
      'simple-async-component::description': 'Dies ist eine grundlegende Async-Komponente zum Testen',
      'simple-async-component::componentId': 'Komponenten-ID',
      'simple-async-component::loadTime': 'Ladezeit',
      'simple-async-component::testContent': 'Diese Komponente wurde asynchron geladen und sollte Zugang zu Übersetzungen haben',
      'simple-async-component::counterButton': 'Zähler Erhöhen',
    },
  },
})

const counter = ref(0)
const loadTime = ref('')

onMounted(() => {
  loadTime.value = new Date().toLocaleTimeString()
})

const incrementCounter = () => {
  counter.value++
}
</script>

<style scoped>
.simple-async-component {
  padding: 20px;
  border: 2px solid #27ae60;
  border-radius: 8px;
  background: #e8f5e8;
  margin: 10px 0;
}

.simple-async-component h3 {
  color: #229954;
  margin-bottom: 10px;
}

.component-info {
  background: white;
  padding: 15px;
  border-radius: 4px;
  margin: 15px 0;
}

.component-info p {
  margin: 5px 0;
  font-family: monospace;
}

.test-content {
  margin-top: 15px;
}

.counter-button {
  padding: 8px 16px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.counter-button:hover {
  background: #229954;
}
</style>
