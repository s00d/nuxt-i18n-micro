<template>
  <div>{{ $t('desc') }}</div>
</template>

<script lang="ts" setup>
import { useNuxtApp } from '#imports'

const { $defineI18nRoute } = useNuxtApp()

// Specifies to generate only en pages!!!
$defineI18nRoute({
  locales: ['en'],
})
</script>
