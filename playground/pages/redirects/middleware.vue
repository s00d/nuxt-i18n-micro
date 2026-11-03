<script setup lang="ts">
definePageMeta({
  middleware: [() => navigateTo(useNuxtApp().$localePath('/static-page'))],
})
</script>

<template><div /></template>
