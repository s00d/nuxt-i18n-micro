<script setup lang="ts">
const { $defineI18nRoute } = useNuxtApp()
$defineI18nRoute({ disableMeta: ['de'] })
</script>

<template>
  <BenchPage name="head-no-meta-de"><R id="no-meta" :v="$t('title')" /></BenchPage>
</template>
