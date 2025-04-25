<template>
  <div>section</div>
  <div id="name">
    {{ $ts("name") }}
  </div>
  <div id="name-page">
    {{ $ts("name-page") }}
  </div>
</template>

<script setup>
const { $ts } = useI18n()
</script>
