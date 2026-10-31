<template>
  <ul data-testid="page-cases">
    <li v-for="item in rows" :key="item.id" :data-testid="item.id">{{ item.value }}</li>
    <li data-testid="global-t">{{ $t('welcome') }}</li>
    <li data-testid="global-ts">{{ $ts('section.deep') }}</li>
    <li data-testid="global-tc">{{ $tc('apples', 2) }}</li>
    <li data-testid="global-tn">{{ $tn(1234.5) }}</li>
    <li data-testid="global-td">{{ $td(0) }}</li>
    <li data-testid="global-tdr">{{ $tdr(Date.now() - 3600000) }}</li>
    <li data-testid="global-has">{{ $has('welcome') }}</li>
    <li data-testid="global-i18n">{{ $i18n.getLocale() }}</li>
    <li data-testid="route-only-title">{{ useRouteTitle }}</li>
  </ul>
</template>

<script setup lang="ts">
import { useI18n } from '@i18n-micro/vue'
import { computed } from 'vue'
import { caseRows, type I18nLike } from '../../../../../benchmark/integrations/catalogue'

const i18n = useI18n()
const rows = computed(() => caseRows(i18n as unknown as I18nLike))
const useRouteTitle = computed(() => i18n.t('title'))
</script>
