<template>
  <main>
    <h1 id="error-status">{{ error.statusCode }}</h1>
    <p id="error-locale">{{ $getLocale() }}</p>
    <NuxtLink id="error-home" :to="$localePath('/')">home</NuxtLink>
    <button id="error-clear" @click="clearError({ redirect: $localePath('/') })">clear</button>
  </main>
</template>

<script setup>
import { clearError, useNuxtApp } from '#imports'

defineProps({ error: { type: Object, required: true } })

const { $getLocale, $localePath } = useNuxtApp()
</script>
