<script setup>
const { getLocale } = useI18n()
</script>

<template>
  <div>
    <div id="greeting">
      {{ $t('greeting') }}
    </div>
    <div id="locale">
      {{ getLocale() }}
    </div>
  </div>
</template>
