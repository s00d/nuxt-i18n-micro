<template>
  <div>
    <p id="current-locale">{{ $getLocale() }}</p>
    <p id="current-flag">{{ currentLocale?.flag }}</p>
    <p id="current-currency">{{ currentLocale?.currency }}</p>
    <ul id="locale-list">
      <li
        v-for="loc in $getLocales()"
        :key="loc.code"
        :data-code="loc.code"
        :data-flag="loc.flag"
        :data-currency="loc.currency"
      >
        {{ loc.displayName }} {{ loc.flag }} {{ loc.currency }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useNuxtApp } from '#imports'

const { $getLocale, $getLocales } = useNuxtApp()

const currentLocale = computed(() => {
  const code = $getLocale()
  return $getLocales().find((l) => l.code === code)
})
</script>
