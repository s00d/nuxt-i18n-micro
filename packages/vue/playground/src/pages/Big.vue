<template>
  <ul data-testid="page-big">
    <li data-testid="big-sample">{{ t(bigKey(1234), { x: 'y' }, undefined, 'big') }}</li>
    <li data-testid="big-count">{{ bigRows.length }}</li>
    <li v-for="n in bigRows" :key="n">{{ t(bigKey(n), { x: n }, undefined, 'big') }}</li>
  </ul>
</template>

<script setup lang="ts">
import { useI18n } from '@i18n-micro/vue'
import { bigKey, bigRows } from '../../../../../benchmark/integrations/catalogue'

const { t } = useI18n()
</script>
