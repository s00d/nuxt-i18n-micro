<template>
  <div>
    <h1>Activity Parent Page</h1>
    <i18n-link
      id="activity"
      :to="{ name: 'activity' }"
    >
      Activity Parent
    </i18n-link>
    <i18n-link
      id="activity-skiing"
      :to="{ name: 'activity-skiing' }"
    >
      Skiing
    </i18n-link>
    <i18n-link
      id="activity-hiking"
      :to="{ name: 'activity-hiking' }"
    >
      Hiking
    </i18n-link>

    <i18n-link
      id="activity-skiing-locale"
      :to="{ name: 'activity-skiing-locale' }"
    >
      Skiing Locale
    </i18n-link>
    <i18n-link
      id="activity-hiking-locale"
      :to="{ name: 'activity-hiking-locale' }"
    >
      Hiking Locale
    </i18n-link>

    <i18n-link
      id="activity-locale"
      :to="{ name: 'activity-locale' }"
    >
      activity locale
    </i18n-link>

    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
</script>
