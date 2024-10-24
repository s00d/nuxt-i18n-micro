<script setup>
const { $defineI18nRoute } = useNuxtApp()

$defineI18nRoute({
  localeRoutes: {
    en: '/page/:id',
    de: '/page/:id',
  },
})
</script>

<template>
  <div>
    <h1>Subpage with route param</h1>
    <p>{{ useRoute().params.id }}</p>
    <NuxtLink to="/">
      Home
    </NuxtLink>
  </div>
</template>
