<template>
  <PerfPage page-name="about" :locale="locale" />
</template>

<script setup>
const route = useRoute()
const locale = String(route.params.locale || 'en')
</script>
