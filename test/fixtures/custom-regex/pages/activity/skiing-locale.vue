<script setup>
const { $defineI18nRoute } = useNuxtApp()
$defineI18nRoute({
  localeRoutes: {
    ['en-us']: '/book-activity/skiing',
    ['de-de']: '/aktivitaet-buchen/ski-fahren',
  },
})
</script>

<template>
  <div>
    <h1 id="title">
      Skiing Locale Subpage
    </h1>
    <p id="text">
      {{ $t('generic.welcome') }}
    </p>
    ⛷️⛷️⛷️
  </div>
</template>
