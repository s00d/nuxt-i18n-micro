<template>
  <div>
    <p id="ro-held">{{ held.fullPath }}</p>
    <p id="ro-state">{{ state.name ?? 'path form' }}|{{ state.fullPath }}</p>
    <i18n-link id="ro-i18n-link" :to="held">i18n-link</i18n-link>
    <NuxtLink id="ro-ref" :to="held">ref</NuxtLink>
    <NuxtLink id="ro-reactive" :to="kept">reactive</NuxtLink>
    <NuxtLink id="ro-spread" :to="{ ...route }">spread</NuxtLink>
    <NuxtLink id="ro-json" :to="copied">JSON</NuxtLink>
    <NuxtLink id="ro-usestate" :to="state">useState</NuxtLink>
    <button id="ro-navigate" @click="navigateTo(held)">navigateTo</button>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { navigateTo, useNuxtApp, useRoute, useState } from '#imports'

// one route object, however an app may keep it: every form has to render the same on both sides and lead to the same URL
const { $localeRoute } = useNuxtApp()
const id = useRoute().query.id ?? 'a b'
const route = $localeRoute({ name: 'echo-id', params: { id } })
const held = ref(route)
const kept = reactive(route)
const copied = JSON.parse(JSON.stringify(route))
const state = useState(`route-object-${id}`, () => route)
</script>
