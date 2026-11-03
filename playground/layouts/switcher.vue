<script setup lang="ts">
// No hand-written $switchLocalePath here: a layout renders before the page's async setup, only <i18n-switcher> links are fixed up.
</script>

<template>
  <div data-testid="layout-switcher">
    <BenchState layout="switcher" :bar="false" />
    <i18n-switcher data-testid="layout-i18n-switcher" />
    <slot />
  </div>
</template>
