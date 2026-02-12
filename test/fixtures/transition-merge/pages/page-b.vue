<template>
  <div id="page-b">
    <h1 id="page-b-title">{{ $t('pageB.title') }}</h1>
    <p id="page-b-body">{{ $t('pageB.body') }}</p>
    <p id="page-b-shared">{{ $t('shared') }}</p>
    <i18n-link id="go-to-a" :to="{ name: 'page-a' }">Go to A</i18n-link>
  </div>
</template>

<script setup>
import { useNuxtApp } from '#imports'
const { $t } = useNuxtApp()
</script>
