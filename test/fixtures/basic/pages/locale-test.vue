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
    <p id="plural-0">
      <i18n-t
        keypath="page.items"
        :plural="0"
      />
    </p>
    <p id="plural-1">
      <i18n-t
        keypath="page.items"
        :plural="1"
      />
    </p>
    <p id="plural-2">
      <i18n-t
        keypath="page.items"
        :plural="2"
      />
    </p>
    <p id="plural-3">
      <i18n-t
        keypath="page.items"
        :plural="3"
      />
    </p>

    <p id="number-tn">
      {{ $tn(1234567.89) }}
    </p>
    <p id="number-tn-component">
      <i18n-t
        keypath="page.number"
        :number="1234567.89"
      />
    </p>

    <div id="date-td">
      {{ $td(oneYearAgo) }}
    </div>
    <p id="date-td-component">
      <i18n-t
        keypath="page.date"
        :date="oneYearAgo"
      />
    </p>

    <div id="date-tdr">
      {{ $tdr(oneYearAgo) }}
    </div>
    <p id="date-tdr-component">
      <i18n-t
        keypath="page.relativeDate"
        :relative-date="oneYearAgo"
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
        :to="$localeRoute({ name: 'locale-test' }, 'en')"
      >
        Switch to English
      </NuxtLink>
      <NuxtLink
        id="link-de"
        :to="$localeRoute({ name: 'locale-test' }, 'de')"
      >
        Switch to German
      </NuxtLink>
      <NuxtLink
        id="link-ru"
        :to="$localeRoute({ name: 'locale-test' }, 'ru')"
      >
        Switch to Russian
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useNuxtApp } from '#imports'

const { $defineI18nRoute, $tn, $td, $tdr } = useNuxtApp()

// Calculate date approximately 1 year ago (13-14 months to ensure it's always >= 1 year)
const oneYearAgo = computed(() => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 1)
  date.setMonth(date.getMonth() - 2) // Subtract 2 more months to ensure >= 1 year
  date.setDate(1)
  return date.toISOString().split('T')[0]
})

// Define translations directly on the page
$defineI18nRoute({
  locales: {
    en: {
      page: {
        title: 'Locale Test Page',
        content: 'This is a content area.',
        greeting: 'Hello, {name}!',
        items: 'Nothing|You have {count} item|You have {count} items',
        htmlContent: '<strong>Bold Text</strong> with HTML content.',
        number: 'The number is: {number}',
        date: 'The date is: {date}',
        relativeDate: 'The relative date is: {relativeDate}',
      },
    },
    de: {
      page: {
        title: 'Sprachtestseite',
        content: 'Dies ist ein Inhaltsbereich.',
        greeting: 'Hallo, {name}!',
        items: 'Nichts|Sie haben {count} Artikel|Sie haben {count} Artikel',
        htmlContent: '<strong>Fetter Text</strong> mit HTML-Inhalt.',
        number: 'Die Zahl ist: {number}',
        date: 'Das Datum ist: {date}',
        relativeDate: 'Das relative Datum ist: {relativeDate}',
      },
    },
    ru: {
      page: {
        title: 'Страница теста языка',
        content: 'Это раздел содержимого.',
        greeting: 'Привет, {name}!',
        items: 'Ничего нет|У вас {count} предмет|У вас {count} предмета',
        htmlContent: '<strong>Жирный текст</strong> с HTML-содержимым.',
        number: 'Число: {number}',
        date: 'Дата: {date}',
        relativeDate: 'Относительная дата: {relativeDate}',
      },
    },
  },
  localeRoutes: {
    de: '/locale-page-modify',
    ru: '/locale-page-modify-ru',
  },
})
</script>
