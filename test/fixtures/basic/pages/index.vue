<template>
  <div>
    <div id="locale">
      {{ $t('key0') }}
    </div>
    <p class="text_escaping">
      {{ $t('text_escaping') }}
    </p>
  </div>

  <div>
    <i18n-link id="page-link" :to="{ name: 'page' }"> Go to Page </i18n-link>
    <i18n-link id="home-link" :to="{ name: 'index' }" :active-style="{ color: 'rgb(255, 0, 0)' }"> Home </i18n-link>
    <i18n-link id="page-link-styled" :to="{ name: 'page' }" :active-style="{ color: 'rgb(255, 0, 0)' }"> Page </i18n-link>
  </div>
</template>

<script setup>
import { useNuxtApp } from '#imports'

const { $t } = useNuxtApp()
</script>
