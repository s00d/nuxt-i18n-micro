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

    <!-- Links for switching locales -->
    <div id="locale-links">
      <NuxtLink
        id="link-en"
        :to="$localeRoute({ name: 'page2' }, 'en')"
      >
        Switch to English
      </NuxtLink>
      <NuxtLink
        id="link-de"
        :to="$localeRoute({ name: 'page2' }, 'de')"
      >
        Switch to German
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const { $t, $getLocale, $getLocales, $localeRoute } = useI18n()
</script>
