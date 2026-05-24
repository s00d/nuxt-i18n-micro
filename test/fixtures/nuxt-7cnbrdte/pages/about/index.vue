<template>
  <h1>about</h1>
</template>
<script setup lang="ts">
import { useNuxtApp } from '#imports'

const { $defineI18nRoute } = useNuxtApp()
$defineI18nRoute({
  locales: ['en'],
})
</script>
