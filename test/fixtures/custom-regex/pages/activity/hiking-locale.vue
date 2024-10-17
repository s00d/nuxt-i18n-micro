<script setup>
const { $defineI18nRoute } = useNuxtApp()
$defineI18nRoute({
  localeRoutes: {
    ['en-us']: '/book-activity/hiking',
    ['de-de']: '/aktivitaet-buchen/wandern',
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
