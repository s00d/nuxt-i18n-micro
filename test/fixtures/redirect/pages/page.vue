<template>
  <div>
    <div id="locale">
      {{ $t('key1') }}
    </div>
  </div>
</template>

<script setup>
import { useNuxtApp } from '#imports'

const { $t } = useNuxtApp()
</script>
