<template>
  <div>
    <h1>{{ product.title }}</h1>
    <p>{{ $t('price') }}: {{ product.price }}</p>
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

<script setup lang="ts">
const { $t, $defineI18nRoute, $setI18nRouteParams, $switchLocalePath } = useNuxtApp()
definePageMeta({ name: 'product-slug' })

const route = useRoute()
const slug = Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug

const { data: product, error } = await useFetch(`/api/product/${slug}`)
if (error.value) throw createError({
  statusCode: error.value?.statusCode,
  statusMessage: error.value?.statusMessage,
  fatal: true,
})

$defineI18nRoute({
  localeRoutes: {
    en: '/our-products/[...slug]',
    es: '/nuestros-productos//[...slug]',
  },
})

// Set different slugs for different locales
$setI18nRouteParams({
  en: { slug: product.value.urlEn },
  es: { slug: product.value.urlEs },
})
</script>
