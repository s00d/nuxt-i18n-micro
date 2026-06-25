<template>
  <div>
    <h1>Landing page</h1>
    <p data-testid="page-id">landing</p>
  </div>
</template>

<script setup lang="ts">
import { useI18nHead } from '#imports'

useI18nHead({
  meta: [
    { property: 'og:title', content: 'Landing OG title' },
    { property: 'og:description', content: 'Landing OG description' },
  ],
})
</script>
