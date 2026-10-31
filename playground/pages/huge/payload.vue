<script setup lang="ts">
// A heavy Nuxt payload that is not a dictionary: useFetch data inlined in the HTML.
const route = useRoute()
const { data: rows } = await useFetch('/api/bench/heavy', { query: { rows: route.query.rows ?? 5000 } })
</script>

<template>
  <BenchPage name="huge-payload">
    <R id="payload-rows" :v="rows?.length" />
    <R id="payload-title" :v="$t('title')" />
    <div v-for="row in rows?.slice(0, 50)" :key="row.id" data-testid="payload-row">{{ row.title }}</div>
  </BenchPage>
</template>
