<template>
  <div>
    <h1>Import with Static Config</h1>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable */
// @ts-nocheck
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { someUtility } from './utils/helpers'

// Static configuration - should be parsed correctly
$defineI18nRoute({
  locales: ['en', 'de', 'fr'],
  localeRoutes: {
    en: '/welcome',
    de: '/willkommen',
    fr: '/bienvenue',
  },
})

const router = useRouter()
const count = ref(0)
const doubleCount = computed(() => count.value * 2)

function increment() {
  count.value++
  someUtility()
}
</script>
