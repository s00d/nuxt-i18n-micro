<template>
  <main>
    <p id="text">{{ $t('hello') }}</p>
    <p id="root">{{ $t('root') }}</p>
    <button id="count" @click="count++">{{ count }}</button>
  </main>
</template>

<script setup lang="ts">
const count = ref(0)
</script>
