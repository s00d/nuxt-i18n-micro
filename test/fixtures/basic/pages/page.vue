<template>
  <div>
    <test />
    <p id="content">
      {{ $t('page.content') }}
    </p>
    <p id="locale">
      Current Locale: {{ $getLocale() }}
    </p>
    <p id="locale-name">
      {{ $getLocaleName() }}
    </p>

    <!-- Display additional info for testing -->
    <p id="locales">
      {{ $getLocales().map(locale => locale.code).join(', ') }}
    </p>
    <p id="translation">
      {{ $t('page.example') }}
    </p>
    <p id="translation-global">
      {{ $t('generic.example') }}
    </p>
    <p id="plural">
      {{ $tc('page.apples', 2) }}
    </p>
    <p id="plural-component">
      <i18n-t
        keypath="page.apples"
        :plural="5"
      />
    </p>
    <p id="plural-component-custom">
      <i18n-t
        keypath="page.apples"
        :plural="5"
        :custom-plural-rule="customPluralRule"
      />
    </p>
    <p id="plural-component-custom-zero">
      <i18n-t
        keypath="page.apples"
        :plural="0"
        :custom-plural-rule="customPluralRule"
      />
    </p>
    <p id="localized-route">
      {{ $localeRoute({ name: 'page' }, 'de').path }}
    </p>

    <p id="localized-route-2">
      {{ $localeRoute('/news/aaa?info=1111').fullPath }}
    </p>

    <p id="localized-path">
      {{ $localePath('/news/aaa?info=1111') }}
    </p>

    <!-- Test $has method -->
    <p id="has-existing-key">
      {{ $has('page.example') ? 'true' : 'false' }}
    </p>
    <p id="has-missing-key">
      {{ $has('page.nonexistent') ? 'true' : 'false' }}
    </p>
    <p id="has-global-key">
      {{ $has('generic.example') ? 'true' : 'false' }}
    </p>
    <p id="has-with-routename">
      {{ $has('page.example', 'page') ? 'true' : 'false' }}
    </p>

    <div id="locale-switcher">
      <i18n-switcher />
    </div>

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

    <div>
      <i18n-link
        id="external-link"
        to="https://www.external-link.fr"
      >
        External Link
      </i18n-link>
    </div>

    <div>
      <i18n-link
        id="page-link"
        :to="{ name: 'index' }"
      >
        Go to Page
      </i18n-link>
    </div>
  </div>
</template>

<script setup>
import { useNuxtApp } from '#imports'

const { $t, $getLocale, $getLocaleName, $getLocales, $tc, $localeRoute, $localePath, $has } = useNuxtApp()

const customPluralRule = (key, count, _params, _locale, t) => {
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
