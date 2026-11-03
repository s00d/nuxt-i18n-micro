<script setup lang="ts">
const rows = useState('bench-heavy-state', () => Array.from({ length: 20000 }, (_, id) => ({ id, label: `State row ${id}` })))
</script>

<template>
  <BenchPage name="huge-state">
    <R id="state-rows" :v="rows.length" />
    <R id="state-title" :v="$t('title')" />
  </BenchPage>
</template>
