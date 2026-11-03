<template>
  <p id="layout-page">layout-{{ $route.params.id }}</p>
</template>

<script setup>
import { definePageMeta } from '#imports'

definePageMeta({ layout: 'probe', layoutSwitcher: true })
</script>
