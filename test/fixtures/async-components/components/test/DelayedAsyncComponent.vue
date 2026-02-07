<template>
  <div class="delayed-async-component">
    <h3>{{ $t('delayed-async-component::title') }}</h3>
    <p>{{ $t('delayed-async-component::description') }}</p>
    <div
      v-if="isLoading"
      class="loading-indicator"
    >
      {{ $t('delayed-async-component::loading') }}
    </div>
    <div
      v-else
      class="loaded-content"
    >
      {{ $t('delayed-async-component::loaded') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useNuxtApp } from '#imports'

const { $defineI18nRoute, $t } = useNuxtApp()

const isLoading = ref(true)

$defineI18nRoute({
  locales: {
    en: {
      'delayed-async-component::title': 'Delayed Async Component Loaded',
      'delayed-async-component::description': 'This component simulates a loading delay',
      'delayed-async-component::loading': 'Loading...',
      'delayed-async-component::loaded': 'Component loaded successfully!',
    },
    ru: {
      'delayed-async-component::title': 'Отложенный Асинхронный Компонент Загружен',
      'delayed-async-component::description': 'Этот компонент симулирует задержку загрузки',
      'delayed-async-component::loading': 'Загрузка...',
      'delayed-async-component::loaded': 'Компонент успешно загружен!',
    },
    de: {
      'delayed-async-component::title': 'Verzögerte Async-Komponente Geladen',
      'delayed-async-component::description': 'Diese Komponente simuliert eine Ladeverzögerung',
      'delayed-async-component::loading': 'Laden...',
      'delayed-async-component::loaded': 'Komponente erfolgreich geladen!',
    },
  },
})

onMounted(() => {
  // Симулируем задержку загрузки
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})
</script>

<style scoped>
.delayed-async-component {
  padding: 15px;
  background: #fff3cd;
  border-radius: 5px;
  margin: 10px 0;
}

.loading-indicator {
  color: #856404;
  font-style: italic;
}

.loaded-content {
  color: #155724;
  font-weight: bold;
}
</style>
