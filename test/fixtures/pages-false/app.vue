<script setup>
import { useNuxtApp } from '#imports'

const { $getLocale, $t, $switchLocale } = useNuxtApp()
</script>

<template>
  <div>
    <p id="locale">
      {{ $getLocale() }}
    </p>
    <p id="greeting">
      {{ $t('hello') }}
    </p>
    <button
      id="switch-zh"
      @click="$switchLocale('zh')"
    >
      Switch to Chinese
    </button>
    <button
      id="switch-en"
      @click="$switchLocale('en')"
    >
      Switch to English
    </button>
  </div>
</template>
