<template>
  <p id="layout-fade">fade</p>
</template>

<script setup>
import { definePageMeta } from '#imports'

definePageMeta({ layout: 'slow', layoutTransition: { name: 'layout-fade' } })
</script>

<style>
.layout-fade-leave-active {
  transition: opacity 0.4s;
}
.layout-fade-leave-to {
  opacity: 0;
}
</style>
