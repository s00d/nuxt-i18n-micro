<template>
  <p id="layout-source">{{ $t('layoutSource.title') }}</p>
</template>

<script setup>
import { definePageMeta } from '#imports'

// a layout's own transition, and a page in a real layout, so the leave has something to run on
definePageMeta({ layout: 'fading', layoutTransition: { name: 'layout-fade' } })
</script>
