<template>
  <div>
    <h2 id="ok">
      ok
    </h2>
    <p>{{ getValue(data, 'key1.key1.key1.key1.key1') }}</p>
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
      <p>{{ key }}: {{ getValue(data, key) }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import indexData from '../data/index/en.json'

const locale = 'en'
const data = indexData

function getValue(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj) ?? path
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
