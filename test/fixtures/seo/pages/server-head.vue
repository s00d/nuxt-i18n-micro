<script setup lang="ts">
import { useI18nHead } from '#imports'

if (import.meta.server) useI18nHead({ disable: ['canonical'], meta: [{ name: 'x-server-head', content: 'server' }] })
</script>

<template>
  <div data-testid="server-head">server-only head</div>
</template>
