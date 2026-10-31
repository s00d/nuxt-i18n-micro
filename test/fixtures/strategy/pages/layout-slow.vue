<template>
  <p id="layout-slow">{{ $t('layoutSlow.title') }}</p>
</template>

<script setup>
import { definePageMeta } from '#imports'

definePageMeta({ layout: 'slow' })
</script>
