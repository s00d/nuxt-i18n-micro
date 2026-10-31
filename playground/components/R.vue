<script setup lang="ts">
// One bench reading: `id = value`, addressable by id and data-testid.
// `loose`: a value that differs between server and client on purpose (a clock, a client-side counter).
const props = defineProps<{ id: string; v?: unknown; loose?: boolean }>()
const text = computed(() => (typeof props.v === 'string' ? props.v : JSON.stringify(props.v)))
</script>

<template>
  <div>
    <code>{{ id }}</code> =
    <span :id="id" :data-testid="id" :data-allow-mismatch="loose ? '' : undefined"
      ><slot>{{ text }}</slot></span
    >
  </div>
</template>
