<template>
  <div class="conditional-async-component">
    <h3>{{ $t('conditional-async-component::title') }}</h3>
    <p>{{ $t('conditional-async-component::description') }}</p>
    <div class="component-info">
      <p><strong>{{ $t('conditional-async-component::componentId') }}:</strong> Conditional Async Component</p>
      <p><strong>{{ $t('conditional-async-component::status') }}:</strong> {{ $t('conditional-async-component::active') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNuxtApp } from '#imports'

const { $defineI18nRoute, $t } = useNuxtApp()

$defineI18nRoute({
  locales: {
    en: {
      'conditional-async-component::title': 'Conditional Async Component Loaded',
      'conditional-async-component::description': 'This component loads conditionally',
      'conditional-async-component::componentId': 'Component ID',
      'conditional-async-component::status': 'Status',
      'conditional-async-component::active': 'Active',
    },
    ru: {
      'conditional-async-component::title': 'Условный Асинхронный Компонент Загружен',
      'conditional-async-component::description': 'Этот компонент загружается условно',
      'conditional-async-component::componentId': 'ID Компонента',
      'conditional-async-component::status': 'Статус',
      'conditional-async-component::active': 'Активен',
    },
    de: {
      'conditional-async-component::title': 'Bedingte Async-Komponente Geladen',
      'conditional-async-component::description': 'Diese Komponente wird bedingt geladen',
      'conditional-async-component::componentId': 'Komponenten-ID',
      'conditional-async-component::status': 'Status',
      'conditional-async-component::active': 'Aktiv',
    },
  },
})
</script>

<style scoped>
.conditional-async-component {
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
</style>
