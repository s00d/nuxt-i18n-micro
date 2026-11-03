<script setup lang="ts">
// One bench reading: `id = value`, addressable by id and data-testid.
const props = defineProps<{ id: string; v?: unknown }>()
const text = computed(() => (typeof props.v === 'string' ? props.v : JSON.stringify(props.v)))
</script>

<template>
  <div>
    <code>{{ id }}</code> =
    <span :id="id" :data-testid="id"
      ><slot>{{ text }}</slot></span
    >
  </div>
</template>
