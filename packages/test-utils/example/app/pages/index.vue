<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
const { $t } = useI18n()

console.log(1111, $t('welcome'))
</script>

<template>
  <div>
    <div>{{ $t('welcome') }}</div>
    <TestComponent />
  </div>
</template>
