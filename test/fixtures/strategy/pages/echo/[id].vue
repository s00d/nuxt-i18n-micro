<template>
  <p id="echo">{{ id }}</p>
</template>

<script setup>
import { definePageMeta, useNuxtApp, useRoute } from '#imports'

// a record with no translated slug: the page hands the URL's own value to the params
definePageMeta({ layoutSwitcher: true })

const id = useRoute().params.id
useNuxtApp().$setI18nRouteParams({ en: { id }, de: { id }, ru: { id } })
</script>
