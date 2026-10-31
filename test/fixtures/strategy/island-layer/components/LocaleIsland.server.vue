<template>
  <p id="island">{{ $t('shared') }}|{{ $getLocale() }}</p>
</template>

<script setup>
defineProps({ locale: { type: String, default: undefined } })
</script>
