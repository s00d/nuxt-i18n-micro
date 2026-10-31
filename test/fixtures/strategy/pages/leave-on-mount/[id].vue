<template>
  <p id="leave-page">leave-{{ id }}</p>
</template>

<script setup>
import { onMounted, useI18nHead, useRoute, useRouter } from '#imports'

// one route name, one chunk: the navigation needs no fetch, so it commits before the head's first render
const route = useRoute()
const router = useRouter()
const { id } = route.params
if (id === '1') {
  useI18nHead({ meta: [{ property: 'og:title', content: 'LEAVE-1' }] })
  onMounted(() => router.push(route.path.replace(/1$/, '2')))
}
</script>
