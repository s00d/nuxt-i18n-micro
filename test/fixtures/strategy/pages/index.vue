<template>
  <div>
    <p id="content">
      {{ $t('key0') }}
    </p>

    <div id="locale-switcher">
      <i18n-switcher />
    </div>
  </div>
</template>

<script setup>
import { useNuxtApp } from '#imports'

const { $t } = useNuxtApp()
</script>
