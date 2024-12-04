<script setup lang="ts">
const { $t } = useI18n()

console.log(1111, $t('welcome'))
</script>

<template>
  <div>
    <div>{{ $t('welcome') }}</div>
    <TestComponent />
  </div>
</template>
