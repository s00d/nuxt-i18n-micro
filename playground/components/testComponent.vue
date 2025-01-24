<template>
  <div>
    <p>{{ $t('key3') }}</p>
  </div>
</template>

<script setup lang="ts">
import { useNuxtApp } from '#imports'

const { $t } = useNuxtApp()
</script>
