<template>
  <div>
    <h1>{{ t('home.title') }}</h1>
    <p>{{ t('home.description') }}</p>
    <p>{{ t('greeting', { name: 'World' }) }}</p>
    <p>{{ tc('apples', 5) }}</p>
    <I18nT keypath="welcome" />
  </div>
</template>

<script setup lang="ts">
import { I18nT, useI18n } from '@i18n-micro/vue'

const { t, tc } = useI18n()
</script>
