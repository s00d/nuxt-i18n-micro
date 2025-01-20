<template>
  <div>
    <div id="locale">
      {{ $t('key0') }}
    </div>
  </div>
</template>

<script setup>
const { $t } = useI18n()
</script>
