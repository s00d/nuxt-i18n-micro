<script setup lang="ts">
const { $defineI18nRoute } = useNuxtApp()
$defineI18nRoute({ locales: ['en', 'de'] })
</script>

<template>
  <BenchPage name="routing-restricted">
    <R id="restricted-fr" :v="$localePath('/routing/restricted', 'fr')" />
    <R id="restricted-switch-fr" :v="$switchLocalePath('fr')" />
    <i18n-switcher />
  </BenchPage>
</template>
