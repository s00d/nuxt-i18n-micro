<script setup>
import { useNuxtApp } from '#imports'

const { $getLocale, $t } = useNuxtApp()
</script>

<template>
  <div>
    <p id="locale">
      {{ $getLocale() }}
    </p>
    <p id="greeting">
      {{ $t('greeting') }}
    </p>
  </div>
</template>
