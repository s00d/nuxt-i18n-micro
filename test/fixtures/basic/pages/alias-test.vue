<script setup>
import { useRoute } from '#app'
import { definePageMeta } from '#imports'

definePageMeta({
  name: 'alias-test-check',
  alias: ['/alias-test/:category/:slug/'],
})

const route = useRoute()
const { category, slug } = route.params
</script>

<template>
  <div>
    <h1>Alias Test Page</h1>
    <p>Current Locale: {{ $getLocale() }}</p>
    <p>Translated string: {{ $t('lang') }}</p>

    <p>Route params:</p>
    <ul>
      <li>category: <strong>{{ category }}</strong></li>
      <li>slug: <strong>{{ slug }}</strong></li>
    </ul>

    <hr>
    <p>Locale switcher:</p>
    <div>
      <button
        v-for="locale in $getLocales()"
        :key="locale.code"
        :disabled="locale.code === $getLocale()"
        @click="() => $switchLocale(locale.code)"
      >
        Switch to {{ locale.code }}
      </button>
    </div>

    <hr>
    <p>Direct links to localized alias routes:</p>
    <div>
      <p
        v-for="locale in $getLocales()"
        :key="locale.code"
      >
        Link to <a :href="`${locale.code === 'en' ? '': `/${locale.code}`}/alias-test/electronics/laptop`">alias route - {{ locale.code }}</a>
      </p>
    </div>
  </div>
</template>
