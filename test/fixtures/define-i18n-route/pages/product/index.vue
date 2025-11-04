<script setup lang="ts">
const { $t, $defineI18nRoute, $getLocale, $switchLocalePath } = useNuxtApp()

const { data: products, error } = await useFetch('/api/product')
if (error.value) throw createError({
  statusCode: error.value?.statusCode,
  statusMessage: error.value?.statusMessage,
  fatal: true,
})

$defineI18nRoute({
  locales: {
    en: {
      title: 'Our Product Range',
      description: 'Discover our collection of high-quality products designed to meet your needs and exceed your expectations.',
    },
    es: {
      title: 'Nuestra Gama de Productos',
      description: 'Descubra nuestra colección de productos de alta calidad diseñados para satisfacer sus necesidades y superar sus expectativas.',
    },
  },
  localeRoutes: {
    en: '/our-products',
    es: '/nuestros-productos',
  },
})
</script>

<template>
  <div>
    <h1>{{ $t('title') }}</h1>
    <p>{{ $t('description') }}</p>
    <ul>
      <li
        v-for="product in products[$getLocale()]"
        :key="product.id"
      >
        <I18nLink :to="{ name: 'product-slug', params: { slug: product.url } }">
          {{ product.title }} – {{ product.price }}
        </I18nLink>
      </li>
    </ul>
    <I18nLink to="/">
      Home
    </I18nLink>
    <div class="locale-switcher">
      <a
        :href="$switchLocalePath('en')"
        class="en"
      >English</a>
      <a
        :href="$switchLocalePath('es')"
        class="es"
      >Español</a>
    </div>
  </div>
</template>
