<template>
  <div>
    <h1>{{ t('about.title') }}</h1>
    <p>{{ t('about.description') }}</p>
    <p>{{ t('welcome') }}</p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@i18n-micro/vue'

const { t } = useI18n()
</script>
