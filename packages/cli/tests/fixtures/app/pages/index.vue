<template>
  <main>
    <h1>{{ $t('home.title') }}</h1>
    <p>{{ $t('common.save') }}</p>
    <p>{{ $t(`dynamic.${kind}`) }}</p>
    <p>Hardcoded landing text</p>
    <SiteHeader />
    <img alt="Company logo" src="/logo.png" />
  </main>
</template>

<script setup lang="ts">
const { $t } = useNuxtApp()
const kind = 'a'
const tagline = $t('home.tagline')
</script>
