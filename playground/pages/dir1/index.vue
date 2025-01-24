<template>
  <div>
    <p>{{ $t('key2') }}</p>

    <test-component />
    <test-sub-component />
  </div>
</template>

<script setup lang="ts">
import { useNuxtApp } from '#imports'

const { $t } = useNuxtApp()
</script>
