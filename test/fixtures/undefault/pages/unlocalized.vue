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
import { useNuxtApp } from '#imports'

const { $t, $getLocale, $getLocales, $tc, $localeRoute } = useNuxtApp()

const customPluralRule = (key, count, _locale, t) => {
  const translation = t(key)
  if (!translation) {
    return null
  }
  const forms = translation.toString().split('|')
  if (count === 0 && forms.length > 2) {
    return forms[0].trim() // Case for "no apples"
  }
  if (count === 1 && forms.length > 1) {
    return forms[1].trim() // Case for "one apple"
  }
  return (forms.length > 2 ? forms[2].trim() : forms[forms.length - 1].trim()).replace('{count}', count.toString())
}
</script>
