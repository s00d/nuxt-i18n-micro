<template>
  <div>
    <h1>No hreflang page</h1>
    <p data-testid="page-id">no-hreflang</p>
  </div>
</template>

<script setup lang="ts">
import { useI18nHead } from '#imports'

useI18nHead({
  disable: ['hreflang', 'x-default'],
})
</script>
