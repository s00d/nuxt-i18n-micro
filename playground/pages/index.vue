<template>
  <div>
    <p>{{ $t('key1.key1.key1.key1.key1') }}</p>
    <p>Current Locale: {{ $getLocale() }}</p>

    <!-- Ссылки для переключения локалей -->
    <div>
      <button
        v-for="locale in $getLocales()"
        :key="locale"
        :disabled="locale === $getLocale()"
        @click="$switchLocale(locale.code)"
      >
        Switch to {{ locale.code }}
      </button>
    </div>

    <div>
      <NuxtLink :to="$localeRoute({ name: 'page' })">Go to Page</NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useNuxtApp } from '#imports'

const { $getLocale, $switchLocale, $getLocales, $localeRoute, $t } = useNuxtApp()
</script>
