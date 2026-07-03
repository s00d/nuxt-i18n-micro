<template>
  <div id="content">home ({{ $getLocale() }})</div>
</template>

<script setup lang="ts">
import { useNuxtApp } from '#imports'

const { $getLocale } = useNuxtApp()
</script>
