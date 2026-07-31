<template>
  <div>
    <h2 id="ok">{{ $t('title') }}</h2>
    <p>{{ $t('heading') }}</p>
    <p>{{ $t('key1.key1.key1.key1.key1') }}</p>
    <p>Current Locale: {{ $getLocale() }}</p>
    <p>{{ $t('welcome', { username: 'Alice', unreadCount: 5 }) }}</p>

    <div>
      <button v-for="locale in $getLocales()" :key="locale.code" :disabled="locale.code === $getLocale()" @click="() => $switchLocale(locale.code)">
        Switch to {{ locale.code }}
      </button>
    </div>

    <nav>
      <i18n-link v-for="p in pages" :key="p" :to="{ name: p }">{{ p }}</i18n-link>
    </nav>

    <div v-for="key in generatedKeys" :key="key">
      <p>{{ key }}: {{ $t(key) }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from '#imports'

const props = defineProps({
  /** When true, render the full index key fan-out (heavier). */
  heavy: { type: Boolean, default: false },
})

const { $getLocale, $switchLocale, $getLocales, $t } = useI18n()
const pages = ['index', 'page', 'catalog', 'about', 'dashboard']

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

const generatedKeys = ref(generateKeys(4, props.heavy ? 4 : 2))
</script>
