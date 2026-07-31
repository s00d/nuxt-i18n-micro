<template>
  <div>
    <h2 id="ok">{{ t('title') }}</h2>
    <p>{{ t('heading') }}</p>
    <p>{{ t('key1.key1.key1.key1.key1') }}</p>
    <p>Current Locale: {{ locale }}</p>
    <p>{{ t('welcome') }}</p>

    <nav>
      <NuxtLink
        v-for="p in pages"
        :key="p"
        :to="locale === 'en' ? (p === 'index' ? '/' : `/${p}`) : p === 'index' ? `/${locale}` : `/${locale}/${p}`"
      >
        {{ p }}
      </NuxtLink>
    </nav>

    <div v-for="key in generatedKeys" :key="key">
      <p>{{ key }}: {{ t(key) }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAsyncData } from '#imports'

const props = defineProps({
  pageName: { type: String, required: true },
  locale: { type: String, default: 'en' },
})

const pages = ['index', 'page', 'catalog', 'about', 'dashboard']
const locale = props.locale
const pageName = props.pageName

const { data: translations } = await useAsyncData(`translations-${pageName}-${locale}`, () =>
  $fetch(`/translations/${pageName}/${locale}.json`),
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
      for (let i = 0; i <= maxKeys; i++) keys.push(`${prefix}key${i}`)
      return
    }
    for (let i = 0; i <= maxKeys; i++) generate(`${prefix}key${i}.`, currentDepth - 1)
  }
  generate()
  return keys
}

// Secondary pages still render a deep key fan-out for SSR/CPU stress
const generatedKeys = ref(generateKeys(4, pageName === 'index' ? 4 : 2))
</script>
