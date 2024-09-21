<template>
  <div>
    <div>11111</div>
    <p id="locale">
      {{ $getLocale() }}
    </p>

    <button
      v-for="locale in $getLocales()"
      :key="locale.code"
      :disabled="locale.code === $getLocale()"
      @click="() => $switchLocale(locale.code)"
    >
      Switch to {{ locale.code }}
    </button>

    <hr>

    <i18n-link :to="{ name: 'page' }">
      Go to Page
    </i18n-link>

    <div id="locale-links">
      <NuxtLink
        id="link-en"
        @click="() => $switchLocale('en')"
      >
        Switch to English
      </NuxtLink>
      <NuxtLink
        id="link-de"
        @click="() => $switchLocale('de')"
      >
        Switch to German
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useNuxtApp } from '#imports'

const { $getLocale, $getLocales, $switchLocale } = useNuxtApp()
</script>
