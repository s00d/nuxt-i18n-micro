<template>
  <div>{{ $t('title') }}</div>
</template>

<script setup lang="ts">
import { useNuxtApp } from '#imports'

const { $t } = useNuxtApp()
</script>
