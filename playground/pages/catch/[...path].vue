<script setup lang="ts">
const { $defineI18nRoute } = useNuxtApp()

$defineI18nRoute({
  localeRoutes: { de: '/alles/[...path]' },
})
const route = useRoute()
</script>

<template>
  <BenchPage name="catch-path">
    <R id="catch-path" :v="route.params.path" />
    <R id="catch-switch-de" :v="$switchLocalePath('de')" />
  </BenchPage>
</template>
