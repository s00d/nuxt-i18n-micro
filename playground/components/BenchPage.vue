<script setup lang="ts">
defineProps<{ name: string }>()
</script>

<template>
  <main data-testid="page" :data-page="name">
    <h1>{{ name }}</h1>
    <slot />
  </main>
</template>
