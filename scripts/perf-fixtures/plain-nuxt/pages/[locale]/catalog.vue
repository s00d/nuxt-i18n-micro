<template>
  <PerfPage page-name="catalog" :locale="locale" />
</template>

<script setup>
const route = useRoute()
const locale = String(route.params.locale || 'en')
</script>
