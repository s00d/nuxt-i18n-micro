<script setup>
const { $defineI18nRoute } = useNuxtApp()
const { $t } = useI18n()
$defineI18nRoute({
  localeRoutes: {
    en: '/book-activity/hiking',
    de: '/aktivitaet-buchen/wandern',
  },
})
</script>

<template>
  <div>
    <h1 id="title">
      Hiking Locale Subpage
    </h1>
    <p id="text">
      {{ $t('generic.welcome') }}
    </p>
    🥾🥾🥾
  </div>
</template>
