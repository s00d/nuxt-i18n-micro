<script setup lang="ts">
const { $defineI18nRoute } = useNuxtApp()

$defineI18nRoute({
  localeRoutes: { de: '/ueber-uns', fr: '/a-propos', ru: '/o-nas' },
})
</script>

<template>
  <BenchPage name="about">
    <R id="about-title" :v="$t('page_title')" />
    <R id="about-path-de" :v="$localePath('/about', 'de')" />
  </BenchPage>
</template>
