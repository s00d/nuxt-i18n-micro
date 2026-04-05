<template>
  <div>
    <p id="content">{{ $t('k') }}</p>
  </div>
</template>

<script setup>
import { useNuxtApp } from '#imports'

const { $t } = useNuxtApp()
</script>
