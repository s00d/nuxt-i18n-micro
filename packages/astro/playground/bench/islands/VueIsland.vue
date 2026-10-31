<template><VueBody /></template>

<script setup lang="ts">
import type { I18nClientProps } from '@i18n-micro/astro'
import { provideI18n } from '@i18n-micro/astro/client/vue'
import VueBody from './VueBody.vue'

const props = defineProps<{ i18n: I18nClientProps }>()
provideI18n(() => props.i18n)
</script>
