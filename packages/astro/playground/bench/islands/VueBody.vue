<template>
  <span data-testid="vue-t">{{ t('welcome') }}</span>
  <span data-testid="vue-param">{{ t('greeting', { name: 'Ada' }) }}</span>
  <span data-testid="vue-nested">{{ t('section.title') }}</span>
  <span data-testid="vue-tc">{{ tc('apples', 2) }}</span>
  <span data-testid="vue-tn">{{ tn(1234.5) }}</span>
  <span data-testid="vue-td">{{ td(0) }}</span>
  <span data-testid="vue-tdr">{{ tdr(Date.now() - 3600000) }}</span>
  <span data-testid="vue-has">{{ has('welcome') }} {{ has('not.passed') }}</span>
  <span data-testid="vue-missing">{{ t('not.passed') }}</span>
  <span data-testid="vue-locale">{{ locale }}</span>
</template>

<script setup lang="ts">
import { useAstroI18n } from '@i18n-micro/astro/client/vue'

const { t, tc, tn, td, tdr, has, locale } = useAstroI18n()
</script>
