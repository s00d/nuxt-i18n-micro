<template>
  <p id="layout-fade">fade</p>
</template>

<script setup>
import { definePageMeta } from '#imports'

// the layout's leave is what keeps the old page on screen here
definePageMeta({ layout: 'slow', layoutTransition: { name: 'layout-fade', mode: 'out-in' } })
</script>

<style>
.layout-fade-leave-active {
  transition: opacity 0.3s;
}
.layout-fade-leave-to {
  opacity: 0;
}
</style>
