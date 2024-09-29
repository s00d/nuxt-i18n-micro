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

    <NuxtLink
      id="locale-en"
      :to="$switchLocaleRoute('en')"
    >
      Switch to en
    </NuxtLink>
    <NuxtLink
      id="locale-de"
      :to="$switchLocaleRoute('de')"
    >
      Switch to de
    </NuxtLink>

    <client-only>
      <div class="locale-route-data">
        {{ $localeRoute({ name: 'locale-conf' }, 'en') }}
      </div>
      <div class="locale-route-data">
        {{ $localeRoute({ name: 'locale-conf' }, 'de') }}
      </div>
    </client-only>
  </div>
</template>

<script setup>
import { useNuxtApp } from '#imports'

const { $defineI18nRoute } = useNuxtApp()

// Define translations directly on the page
$defineI18nRoute({
  locales: {
    en: {
      page: {
        title: 'Locale Test Page',
        content: 'This is a content area.',
        greeting: 'Hello, {name}!',
        items: 'You have {count} items.',
        htmlContent: '<strong>Bold Text</strong> with HTML content.',
      },
    },
    de: {
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
    de: '/locale-conf-modify',
  },
})

const itemCount = 2
</script>
