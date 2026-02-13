<script setup>
import { useNuxtApp } from '#imports'

const { $getLocale, $t, $switchLocale, $mergeTranslations } = useNuxtApp()

// For no_prefix with pages: false, we need to manually reload translations
async function switchToZh() {
  // Load Chinese translations
  const data = await $fetch('/locales/zh.json')
  $mergeTranslations(data)
  $switchLocale('zh')
}

async function switchToEn() {
  // Load English translations
  const data = await $fetch('/locales/en.json')
  $mergeTranslations(data)
  $switchLocale('en')
}
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
      @click="switchToZh"
    >
      Switch to Chinese
    </button>
    <button
      id="switch-en"
      @click="switchToEn"
    >
      Switch to English
    </button>
  </div>
</template>
