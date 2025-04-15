<template>
  <div>
    <Navigation />
    <div>
      <i18n-switcher
        :custom-labels="{ en: 'English', de: 'Deutsch', ru: 'Русский' }"
      />
    </div>
    <div><h1>{{ $t('contact.title') }}</h1></div>

    <p>{{ $t('fallbackPage.value') }}</p>
    <p>{{ $t('fallback.value') }}</p>
  </div>
</template>

<script setup>
import { useNuxtApp } from '#imports'
import Navigation from '~/components/navigation.vue'

const route = useRoute()

const { $_t, $defineI18nRoute } = useNuxtApp()

const $t = $_t(route)

definePageMeta({ name: 'contact' })

$defineI18nRoute({
  localeRoutes: {
    en: '/contact',
    de: '/kontakt',
  },
})
</script>

<style></style>
