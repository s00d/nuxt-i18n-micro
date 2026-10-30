<template>
  <p id="content">{{ $t('key0') }}</p>
</template>

<script setup>
import { useNuxtApp } from '#imports'

// no page links here: generate has to find it without the crawler
const { $t } = useNuxtApp()
</script>
