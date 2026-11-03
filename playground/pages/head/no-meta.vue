<script setup lang="ts">
const { $defineI18nRoute } = useNuxtApp()
$defineI18nRoute({ disableMeta: true })
</script>

<template>
  <BenchPage name="head-no-meta"><R id="no-meta" :v="$t('title')" /></BenchPage>
</template>
