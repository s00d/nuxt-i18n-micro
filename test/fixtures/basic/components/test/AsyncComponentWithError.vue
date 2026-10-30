<template>
  <div class="async-component-with-error">
    <h3>{{ $t('async-component-with-error::title') }}</h3>
    <p>{{ $t('async-component-with-error::description') }}</p>
  </div>
</template>

<script setup lang="ts">
import { useNuxtApp } from '#imports'

const { $defineI18nRoute, $t } = useNuxtApp()

$defineI18nRoute({
  locales: {
    en: {
      'async-component-with-error::title': 'Error loading component',
      'async-component-with-error::description': 'This component simulates an error',
    },
    ru: {
      'async-component-with-error::title': 'Ошибка загрузки компонента',
      'async-component-with-error::description': 'Этот компонент симулирует ошибку',
    },
    de: {
      'async-component-with-error::title': 'Fehler beim Laden der Komponente',
      'async-component-with-error::description': 'Diese Komponente simuliert einen Fehler',
    },
  },
})
</script>

<style scoped>
.async-component-with-error {
  padding: 15px;
  background: #ffe8e8;
  border-radius: 5px;
  margin: 10px 0;
}
</style>
