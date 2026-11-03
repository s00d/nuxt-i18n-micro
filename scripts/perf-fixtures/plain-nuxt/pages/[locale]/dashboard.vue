<template>
  <PerfPage page-name="dashboard" :locale="locale" />
</template>

<script setup>
const route = useRoute()
const locale = String(route.params.locale || 'en')
</script>
