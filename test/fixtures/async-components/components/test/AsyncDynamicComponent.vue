<template>
  <div class="async-dynamic-component">
    <h3>{{ $t('async-dynamic-component::title') }}</h3>
    <p>{{ $t('async-dynamic-component::description') }}</p>
  </div>
</template>

<script setup lang="ts">
import { useNuxtApp } from '#imports'

const { $defineI18nRoute, $t } = useNuxtApp()

$defineI18nRoute({
  locales: {
    en: {
      'async-dynamic-component::title': 'Dynamic Async Component Loaded',
      'async-dynamic-component::description': 'This component was loaded dynamically',
    },
    ru: {
      'async-dynamic-component::title': 'Динамический Асинхронный Компонент Загружен',
      'async-dynamic-component::description': 'Этот компонент был загружен динамически',
    },
    de: {
      'async-dynamic-component::title': 'Dynamische Async-Komponente Geladen',
      'async-dynamic-component::description': 'Diese Komponente wurde dynamisch geladen',
    },
  },
})
</script>

<style scoped>
.async-dynamic-component {
  padding: 15px;
  background: #e8f8e8;
  border-radius: 5px;
  margin: 10px 0;
}
</style>
