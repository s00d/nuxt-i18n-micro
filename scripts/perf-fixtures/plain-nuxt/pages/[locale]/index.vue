<template>
  <PerfPage :page-name="pageName" :locale="locale" />
</template>

<script setup>
const route = useRoute()
const locale = String(route.params.locale || 'en')
const pageName = 'index'
</script>
