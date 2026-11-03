<script setup lang="ts">
// Thousands of $t in one render; ?n= changes how many. Keys come from huge-10k through routesLocaleLinks.
const route = useRoute()
const keys = computed(() => Array.from({ length: Number(route.query.n ?? 5000) }, (_, index) => `key_${index % 3 === 0 ? index + 1 : index}`))
</script>

<template>
  <BenchPage name="huge-many-t">
    <R id="many-count" :v="keys.length" />
    <div data-testid="many-list">
      <span v-for="key in keys" :key="key">{{ $t(key, { name: 'Ada' }) }} </span>
    </div>
  </BenchPage>
</template>
