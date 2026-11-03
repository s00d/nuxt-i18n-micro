<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{ error: NuxtError }>()
const { $t, $getLocale, $localePath } = useNuxtApp()
</script>

<template>
  <main data-testid="page" data-page="error">
    <h1 data-testid="error-title">{{ $t('error_title') }}</h1>
    <R id="error-status" :v="error.statusCode" />
    <R id="error-message" :v="error.message" />
    <R id="error-locale" :v="$getLocale()" />
    <NuxtLink data-testid="error-home" :to="$localePath('/')">{{ $t('nav.home') }}</NuxtLink>
    <button data-testid="error-clear" @click="clearError({ redirect: $localePath('/') })">clearError</button>
  </main>
</template>
