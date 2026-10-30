<template>
  <div>
    <h1>Custom alternates page</h1>
    <p data-testid="page-id">custom-alternates</p>
  </div>
</template>

<script setup lang="ts">
import { useI18nHead } from '#imports'

useI18nHead({
  disable: ['hreflang', 'x-default', 'og-alternates'],
  link: [
    { rel: 'alternate', hreflang: 'en', href: 'https://example.com/custom/en' },
    { rel: 'alternate', hreflang: 'fr', href: 'https://example.com/custom/fr' },
  ],
  replace: {
    ogAlternates: ['fr'],
  },
})
</script>
