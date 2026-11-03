<script setup lang="ts">
const counts = [0, 1, 2, 3, 5, 10, 11, 21, 22, 25, 100, -1, 1.5, Number.NaN]
const keys = ['apples', 'files', 'marker_en', 'two_forms']
</script>

<template>
  <BenchPage name="t-plural">
    <template v-for="key in keys" :key="key">
      <R v-for="(count, index) in counts" :id="`tc-${key}-${count}`" :key="index" :v="$tc(key, count)" />
    </template>
    <R id="tc-object" :v="$tc('count_of', { count: 2, total: 5 })" />
    <R id="tc-default" :v="$tc('missing.key', 2, 'Fallback')" />
    <R id="tc-missing" :v="$tc('missing.key', 2)" />
    <R id="t-marker-raw" :v="$t('files')" />
  </BenchPage>
</template>
