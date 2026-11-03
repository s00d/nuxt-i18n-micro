<template>
  <div>
    <slot />
  </div>
</template>

<script setup>
import { useI18nHead, useNuxtApp, useRouter, watch } from '#imports'

// outside <NuxtPage>: a layout is not left by a navigation, though its useRoute() lags behind it
const { $t, $setI18nRouteParams } = useNuxtApp()
const router = useRouter()
useI18nHead(() => ({ meta: [{ name: 'layout-head', content: String($t('layout.title')) }] }))
watch(
  () => router.currentRoute.value.path,
  (path) => $setI18nRouteParams({ de: { id: `layout-${path.split('/').pop()}` } }),
)
</script>
