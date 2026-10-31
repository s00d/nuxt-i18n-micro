<template>
  <p id="keep-page">{{ $t('keepPage.title') }}</p>
</template>

<script setup>
import { definePageMeta } from '#imports'

definePageMeta({ keepalive: true })
</script>
