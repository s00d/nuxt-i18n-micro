<template>
  <div>
    <h2 id="ok">
      ok
    </h2>
    <p>{{ t('key1.key1.key1.key1.key1') }}</p>
    <p>Current Locale: ru</p>

    <div>
      <NuxtLink to="/ru/page">
        Go to Page
      </NuxtLink>
    </div>

    <div
      v-for="key in generatedKeys"
      :key="key"
    >
      <p>{{ key }}: {{ t(key) }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAsyncData } from '#imports'

const locale = 'ru'

const { data: translations } = await useAsyncData(
  `translations-${locale}`,
  () => $fetch(`/api/translations/${locale}`),
)

function t(path) {
  if (!translations.value) return path
  const result = path.split('.').reduce((o, k) => o?.[k], translations.value)
  return result ?? path
}

function generateKeys(depth, maxKeys = 4) {
  const keys = []

  const generate = (prefix = '', currentDepth = depth) => {
    if (currentDepth === 0) {
      for (let i = 0; i <= maxKeys; i++) {
        keys.push(`${prefix}key${i}`)
      }
      return
    }

    for (let i = 0; i <= maxKeys; i++) {
      generate(`${prefix}key${i}.`, currentDepth - 1)
    }
  }

  generate()
  return keys
}

const generatedKeys = ref(generateKeys(4))
</script>
