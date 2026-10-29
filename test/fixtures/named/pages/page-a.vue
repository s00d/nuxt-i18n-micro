<template>
  <div id="page-a">
    <h1 id="page-a-title">{{ $t('pageA.title') }}</h1>
    <p id="page-a-body">{{ $t('pageA.body') }}</p>
    <p id="page-a-shared">{{ $t('shared') }}</p>
    <p id="page-a-common">{{ $t('common.fromA') }}</p>
    <i18n-link id="go-to-b" :to="{ name: 'page-b' }">Go to B</i18n-link>
  </div>
</template>

<script setup>
import { definePageMeta, useNuxtApp } from '#imports'

// Per-page transition (was app.pageTransition in the old transition-merge fixture).
definePageMeta({ pageTransition: { name: 'page', mode: 'default' } })

const { $t } = useNuxtApp()
</script>
