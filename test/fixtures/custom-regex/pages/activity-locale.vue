<script setup>
const { $defineI18nRoute } = useNuxtApp()
$defineI18nRoute({
  localeRoutes: {
    ['en-us']: '/change-activity',
    ['de-de']: '/change-buchen',
  },
})
</script>

<template>
  <div>
    <h1>Activity Parent Page</h1>

    <i18n-link
      id="activity-locale"
      :to="{ name: 'activity-locale' }"
    >
      Activity Parent
    </i18n-link>
    <i18n-link
      id="activity-locale-skiing"
      :to="{ name: 'activity-locale-skiing' }"
    >
      Skiing
    </i18n-link>
    <i18n-link
      id="activity-locale-hiking"
      :to="{ name: 'activity-locale-hiking' }"
    >
      Hiking
    </i18n-link>
    <NuxtPage />
  </div>
</template>
