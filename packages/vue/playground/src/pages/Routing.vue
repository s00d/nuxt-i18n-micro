<template>
  <ul data-testid="page-routing">
    <li v-for="item in [...rows, ...extraRows]" :key="item.id" :data-testid="item.id">{{ item.value }}</li>
    <li data-testid="head">{{ JSON.stringify(metaObject) }}</li>
    <li data-testid="persisted">{{ stored }}</li>
    <li><button data-testid="act-switch-query" data-action @click="switchLocale('de')">switch keeps query</button></li>
  </ul>
</template>

<script setup lang="ts">
import { useI18n, useLocaleHead } from '@i18n-micro/vue'
import { computed, onMounted, ref, watch } from 'vue'
import { persisted, row, routingRows } from '../../../../../benchmark/integrations/catalogue'

const { switchLocale, instance, locale } = useI18n()
const { metaObject, updateMeta } = useLocaleHead({ baseUrl: 'https://bench.test', hreflangBaseLanguage: true })
const stored = ref('')

const i18n = useI18n()
const rows = computed(() => (locale.value ? routingRows(i18n as never) : []))
const extras: Array<[string, () => unknown]> = [
  ['path-name', () => i18n.localePath({ name: 'routing' }, 'de')],
  ['route-cache-keys', () => Object.keys(instance.getRouteCache()).length > 0],
  ['storage-map', () => instance.getStorage().translations.size > 0],
]
const extraRows = computed(() => (locale.value ? extras.map(([id, run]) => ({ id, value: row(run) })) : []))

onMounted(() => {
  updateMeta(['a'])
  stored.value = persisted.read() ?? ''
})
watch(locale, () => updateMeta(['a']))
</script>
