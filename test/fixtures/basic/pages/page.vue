<template>
  <div>
    <p id="content">
      {{ $t('page.content') }}
    </p>
    <p id="locale">
      Current Locale: {{ $getLocale() }}
    </p>

    <!-- Display additional info for testing -->
    <p id="locales">
      {{ $getLocales().map(locale => locale.code).join(', ') }}
    </p>
    <p id="translation">
      {{ $t('page.example') }}
    </p>
    <p id="plural">
      {{ $tc('page.items', 2) }}
    </p>
    <p id="localized-route">
      {{ $localeRoute({ name: 'page' }, 'de').path }}
    </p>

    <!-- Links for switching locales -->
    <div id="locale-links">
      <NuxtLink
        id="link-en"
        :to="$localeRoute({ name: 'page' }, 'en')"
      >
        Switch to English
      </NuxtLink>
      <NuxtLink
        id="link-de"
        :to="$localeRoute({ name: 'page' }, 'de')"
      >
        Switch to German
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useNuxtApp } from '#imports'

const { $t, $getLocale, $getLocales, $tc, $localeRoute } = useNuxtApp()
</script>
