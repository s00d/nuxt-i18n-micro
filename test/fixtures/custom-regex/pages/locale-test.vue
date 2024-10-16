<template>
  <div>
    <h1>{{ $t('page.title') }}</h1>
    <p id="content">
      <i18n-t keypath="page.content" />
    </p>
    <p id="username">
      <i18n-t
        keypath="page.greeting"
        :params="{ name: 'John' }"
      />
    </p>
    <p id="plural">
      <i18n-t
        keypath="page.items"
        :plural="itemCount"
      />
    </p>
    <p id="html-content">
      <i18n-t
        keypath="page.htmlContent"
        :html="true"
      />
    </p>

    <div id="locale-links">
      <NuxtLink
        id="link-en"
        :to="$localeRoute({ name: 'locale-test' }, 'en-us')"
      >
        Switch to English
      </NuxtLink>
      <NuxtLink
        id="link-de"
        :to="$localeRoute({ name: 'locale-test' }, 'de-de')"
      >
        Switch to German
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useNuxtApp } from '#imports'

const { $defineI18nRoute } = useNuxtApp()

// Define translations directly on the page
$defineI18nRoute({
  locales: {
    ['en-us']: {
      page: {
        title: 'Locale Test Page',
        content: 'This is a content area.',
        greeting: 'Hello, {name}!',
        items: 'You have {count} items.',
        htmlContent: '<strong>Bold Text</strong> with HTML content.',
      },
    },
    ['de-de']: {
      page: {
        title: 'Sprachtestseite',
        content: 'Dies ist ein Inhaltsbereich.',
        greeting: 'Hallo, {name}!',
        items: 'Sie haben {count} Artikel.',
        htmlContent: '<strong>Fetter Text</strong> mit HTML-Inhalt.',
      },
    },
  },
  localeRoutes: {
    ['de-de']: '/locale-page-modify',
  },
})

const itemCount = 2
</script>
