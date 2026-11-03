<template>
  <PerfPage page-name="page" :locale="locale" />
</template>

<script setup>
const route = useRoute()
const locale = String(route.params.locale || 'en')
</script>
