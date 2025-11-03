<template>
  <div>
    <h1>{{ $t('title') }}</h1>
    <p id="content">
      {{ $t('description') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useNuxtApp } from '#imports'

const { $t, $defineI18nRoute } = useNuxtApp()

$defineI18nRoute({
  locales: {
    en: {
      title: 'Our Products',
      description: 'Discover our collection of high-quality products.',
    },
    es: {
      title: 'Nuestros Productos',
      description: 'Descubre nuestra colección de productos de alta calidad.',
    },
  },
  localeRoutes: {
    en: '/our-products',
    es: '/nuestros-productos',
  },
})
</script>
