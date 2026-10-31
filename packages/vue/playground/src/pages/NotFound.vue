<template>
  <p data-testid="not-found">{{ t('no.such.page', undefined, 'not found') }}</p>
</template>

<script setup lang="ts">
import { useI18n } from '@i18n-micro/vue'

const { t } = useI18n()
</script>
