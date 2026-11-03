<script setup lang="ts">
// SSR and client both go through these; ?locale= and the headers drive detection.
const { $getLocale } = useNuxtApp()
const locale = computed(() => $getLocale())
const query = computed(() => ({ locale: locale.value }))
const { data: greeting } = await useFetch('/api/bench/greeting', { query })
const { data: info } = await useFetch('/api/bench/locale', { query })
const { data: forced } = await useFetch('/api/bench/forced')
const { data: defaultArg } = await useFetch('/api/bench/default-arg')
const { data: chunk } = await useFetch('/api/bench/chunk', { query })
const { data: byParam } = await useFetch('/api/bench/by/de')
const { data: feed } = await useFetch<string>('/bench-feed', { query, responseType: 'text' })
</script>

<template>
  <BenchPage name="server-api">
    <R id="api-greeting" :v="greeting" />
    <R id="api-locale" :v="info" />
    <R id="api-forced" :v="forced" />
    <R id="api-default-arg" :v="defaultArg" />
    <R id="api-chunk" :v="chunk" />
    <R id="api-by-param" :v="byParam" />
    <R id="api-feed" :v="feed" />
  </BenchPage>
</template>
