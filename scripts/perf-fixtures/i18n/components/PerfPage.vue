<template>
  <div>
    <h2 id="ok">{{ $t(titleKey) }}</h2>
    <p>{{ $t(headingKey) }}</p>
    <p>{{ $t(keyPath) }}</p>
    <p>Current Locale: {{ currentLocale }}</p>
    <p>{{ $t(welcomeKey, { username: 'Alice', unreadCount: 5 }) }}</p>

    <div>
      <button v-for="value in locales" :key="value" :disabled="value === currentLocale" @click="switchLocale(value)">Switch to {{ value }}</button>
    </div>

    <nav>
      <NuxtLink v-for="p in pages" :key="p" :to="localeRoute({ name: p })">{{ p }}</NuxtLink>
    </nav>

    <div v-for="key in generatedKeys" :key="key">
      <p>{{ key }}: {{ $t(ns ? `${ns}.${key}` : key) }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  pageName: { type: String, default: 'index' },
  heavy: { type: Boolean, default: false },
})

const head = useLocaleHead({
  addDirAttribute: true,
  identifierAttribute: 'id',
  addSeoAttributes: true,
})
useHead(head)

const { locale, availableLocales, setLocale } = useI18n()
const router = useRouter()
const localeRoute = useLocalePath()

const currentLocale = locale.value
const locales = availableLocales
const pages = ['index', 'page', 'catalog', 'about', 'dashboard']

const ns = computed(() => (props.pageName === 'index' ? '' : props.pageName))
const titleKey = computed(() => (ns.value ? `${ns.value}.title` : 'title'))
const headingKey = computed(() => (ns.value ? `${ns.value}.heading` : 'heading'))
const welcomeKey = computed(() => (ns.value ? `${ns.value}.welcome` : 'welcome'))
const keyPath = computed(() => (ns.value ? `${ns.value}.key1.key1.key1.key1.key1` : 'key1.key1.key1.key1.key1'))

const switchLocale = async (newLocale) => {
  if (newLocale !== currentLocale) {
    await setLocale(newLocale)
    const path = useSwitchLocalePath(newLocale)
    router.push(path)
  }
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

const generatedKeys = ref(generateKeys(4, props.heavy ? 4 : 2))
</script>
