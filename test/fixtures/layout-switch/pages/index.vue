<template>
  <div class="page-content">
    <h2 class="page-welcome">
      {{ $t('page.welcome') }}
    </h2>
    <p class="page-description">
      {{ $t('page.description') }}
    </p>
  </div>
</template>

<script setup>
const { $t } = useI18n()
</script>
