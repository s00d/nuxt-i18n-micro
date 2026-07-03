<script setup lang="ts">
import { useNuxtApp } from '#imports'

const { $getLocale, $t } = useNuxtApp()
</script>

<template>
  <div>
    <p id="locale">
      {{ $getLocale() }}
    </p>
    <p id="hello">
      {{ $t('hello') }}
    </p>
    <i18n-link id="about-link" to="/about"> About </i18n-link>
  </div>
</template>
