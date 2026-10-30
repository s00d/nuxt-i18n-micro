<template>
  <div class="async-component-with-i18n-route">
    <h3>{{ $t('async-component-with-i18n-route::title') }}</h3>
    <p>{{ $t('async-component-with-i18n-route::description') }}</p>
    <div class="route-info">
      <p>{{ $t('async-component-with-i18n-route::routeInfo.currentRoute') }}: {{ $getRouteName() }}</p>
      <p>{{ $t('async-component-with-i18n-route::routeInfo.localeRoute') }}: {{ $getLocale() }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNuxtApp } from '#imports'

const { $defineI18nRoute, $getRouteName, $getLocale, $t } = useNuxtApp()

$defineI18nRoute({
  locales: {
    en: {
      'async-component-with-i18n-route::title': 'Async Component with defineI18nRoute Loaded',
      'async-component-with-i18n-route::description': 'This component uses defineI18nRoute function',
      'async-component-with-i18n-route::routeInfo.currentRoute': 'Current Route',
      'async-component-with-i18n-route::routeInfo.localeRoute': 'Current Locale',
    },
    ru: {
      'async-component-with-i18n-route::title': 'Асинхронный Компонент с defineI18nRoute Загружен',
      'async-component-with-i18n-route::description': 'Этот компонент использует функцию defineI18nRoute',
      'async-component-with-i18n-route::routeInfo.currentRoute': 'Текущий Маршрут',
      'async-component-with-i18n-route::routeInfo.localeRoute': 'Текущая Локаль',
    },
    de: {
      'async-component-with-i18n-route::title': 'Async-Komponente mit defineI18nRoute Geladen',
      'async-component-with-i18n-route::description': 'Diese Komponente verwendet die defineI18nRoute-Funktion',
      'async-component-with-i18n-route::routeInfo.currentRoute': 'Aktuelle Route',
      'async-component-with-i18n-route::routeInfo.localeRoute': 'Aktuelle Lokale',
    },
  },
})
</script>

<style scoped>
.async-component-with-i18n-route {
  padding: 15px;
  background: #f0f8ff;
  border-radius: 5px;
  margin: 10px 0;
}

.route-info {
  margin-top: 10px;
  font-size: 0.9em;
  color: #666;
}
</style>
