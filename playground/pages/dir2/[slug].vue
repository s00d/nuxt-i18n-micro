<template>
  <div>
    index slug dir2
    <p>{{ $t('key2') }}</p>
  </div>
</template>

<script setup lang="ts">
import { useNuxtApp } from '#imports'

const { $t } = useNuxtApp()
</script>
