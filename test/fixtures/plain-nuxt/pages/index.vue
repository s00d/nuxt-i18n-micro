<template>
  <div>
    <h2 id="ok">
      ok
    </h2>
    <p>{{ t('key1.key1.key1.key1.key1') }}</p>
    <p>Current Locale: {{ locale }}</p>

    <div>
      <NuxtLink :to="locale === 'en' ? '/page' : `/${locale}/page`">
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

const locale = 'en'

// Load translations via API (same as i18n-micro does)
const { data: translations } = await useAsyncData(
  `translations-${locale}`,
  () => $fetch(`/api/translations/${locale}`),
)

// Translation function similar to $t
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
