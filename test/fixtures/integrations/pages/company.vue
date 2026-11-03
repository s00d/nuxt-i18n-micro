<script setup lang="ts">
import { useNuxtApp } from '#imports'

const { $getLocale, $t } = useNuxtApp()
</script>

<template>
  <div>
    <p id="locale">
      {{ $getLocale() }}
    </p>
    <p id="about-title">
      {{ $t('aboutTitle') }}
    </p>
    <i18n-link id="home-link" to="/"> Home </i18n-link>
  </div>
</template>
