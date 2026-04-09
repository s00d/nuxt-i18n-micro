<template>
  <div>
    <p id="vehicle-type">{{ $ts("vehicleType") }}</p>

    <div id="locale-links">
      <NuxtLink id="link-en" :to="$localeRoute({ name: 'inventory' }, 'en')">
        Switch to English
      </NuxtLink>
      <NuxtLink id="link-fr" :to="$localeRoute({ name: 'inventory' }, 'fr')">
        Switch to French
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNuxtApp } from "#imports";

const { $defineI18nRoute, $ts, $localeRoute } = useNuxtApp();

// Component-local keys.
// There are intentionally no base translation keys for `vehicleType`
// in the fixture locales — so if these keys get wiped during locale switch,
// UI falls back to rendering the key itself.
$defineI18nRoute({
  locales: {
    en: { vehicleType: "Vehicle type" },
    fr: { vehicleType: "Type de véhicule" },
    de: {},
    ru: {},
    ch: {},
  },
});
</script>
