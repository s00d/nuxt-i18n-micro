<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <BenchPage name="products-id">
    <R id="product-id" :v="route.params.id" />
    <R id="product-title" :v="$t('page_title', { id: route.params.id as string })" />
    <!-- wraps around: `generate` crawls every link it finds -->
    <i18n-link data-testid="product-next" :to="`/products/${(Number(route.params.id) % 3) + 1}`">next</i18n-link>
    <i18n-link data-testid="product-named" :to="{ name: 'products-id', params: { id: 42 } }">42</i18n-link>
  </BenchPage>
</template>
