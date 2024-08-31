<template>
  <div>
    <h2 id="ok">
      ok
    </h2>
    <p>{{ $t('key1.key1.key1.key1.key1') }}</p>
    <p>Current Locale: {{ locale }}</p>

    <!-- Links for switching locales -->
    <div>
      <button
        v-for="value in locales"
        :key="value"
        :disabled="value === currentLocale"
        @click="switchLocale(value)"
      >
        Switch to {{ value }}
      </button>
    </div>

    <div>
      <NuxtLink :to="localeRoute({ name: 'page' })">
        Go to Page
      </NuxtLink>
    </div>

    <div
      v-for="key in generatedKeys"
      :key="key"
    >
      <p>{{ key }}: {{ $t(key) }}</p>
    </div>
  </div>
</template>

<script setup>
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
      for (let i = 0; i <= maxKeys; i++) {
        // Генерируем ключ с инкрементом по последнему элементу
        keys.push(`${prefix}key${i}`)
      }
      return
    }

    for (let i = 0; i <= maxKeys; i++) {
      // Добавляем к префиксу текущий элемент
      generate(`${prefix}key${i}.`, currentDepth - 1)
    }
  }

  generate()
  return keys
}

const generatedKeys = ref(generateKeys(4))
</script>
