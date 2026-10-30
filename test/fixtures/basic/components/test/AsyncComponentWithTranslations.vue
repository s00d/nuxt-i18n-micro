<template>
  <div class="async-component-with-translations">
    <h3>{{ $t('async-component-with-translations::title') }}</h3>
    <p>{{ $t('async-component-with-translations::description') }}</p>
  </div>
</template>

<script setup lang="ts">
import { useNuxtApp } from '#imports'

const { $defineI18nRoute, $t } = useNuxtApp()

$defineI18nRoute({
  locales: {
    en: {
      'async-component-with-translations::title': 'Async Component with Translations Loaded',
      'async-component-with-translations::description': 'This component has its own translations',
    },
    ru: {
      'async-component-with-translations::title': 'Асинхронный Компонент с Переводами Загружен',
      'async-component-with-translations::description': 'Этот компонент имеет свои переводы',
    },
    de: {
      'async-component-with-translations::title': 'Async-Komponente mit Übersetzungen Geladen',
      'async-component-with-translations::description': 'Diese Komponente hat ihre eigenen Übersetzungen',
    },
  },
})
</script>

<style scoped>
.async-component-with-translations {
  padding: 15px;
  background: #e8f4fd;
  border-radius: 5px;
  margin: 10px 0;
}
</style>
