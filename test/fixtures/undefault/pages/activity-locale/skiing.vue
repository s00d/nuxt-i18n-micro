<script setup>
const { $defineI18nRoute } = useNuxtApp()
const { $t } = useI18n()
$defineI18nRoute({
  localeRoutes: {
    en: '/book-activity/skiing',
    de: '/aktivitaet-buchen/ski-fahren',
  },
})
</script>

<template>
  <div>
    <h1 id="title">
      Skiing Subpage
    </h1>
    <p id="text">
      {{ $t('generic.welcome') }}
    </p>
    ⛷️⛷️⛷️
  </div>
</template>
