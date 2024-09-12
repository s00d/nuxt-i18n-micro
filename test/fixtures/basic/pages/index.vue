<template>
  <div>
    <div id="locale">
      {{ $t('key0') }}
    </div>
    <p class="text_escaping">
      {{ $t('text_escaping') }}
    </p>
  </div>
</template>

<script setup>
import { useNuxtApp } from '#imports'

const { $t } = useNuxtApp()
</script>
