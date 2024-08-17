<template>
  <div>
    <p>{{ $t('key1.key1.key1.key1.key1') }}</p>
    <p>Current Locale: {{ $getLocale() }}</p>

    <!-- Ссылки для переключения локалей -->
    <div>
      <button
        v-for="locale in $getLocales()"
        :key="locale"
        :disabled="locale === $getLocale()"
        @click="$switchLocale(locale.code)"
      >
        Switch to {{ locale.code }}
      </button>
    </div>

    <p id="localized-route">
      {{ $localeRoute({ name: 'page' }, 'de').path }}
    </p>

    <div>
      <NuxtLink :to="$localeRoute({ name: 'page' })">
        Go to Page
      </NuxtLink>
    </div>
    <a href="/">test</a>

    <div
      v-for="key in generatedKeys"
      :key="key"
    >
      <p>{{ key }}: {{ $t(key) }}</p>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from '#imports'

const { $getLocale, $switchLocale, $getLocales, $localeRoute, $t } = useI18n()

function generateRandomPrefix(maxKeys = 10) {
  return `key${Math.floor(Math.random() * maxKeys)}`
}

// Function to generate keys with random prefix up to a certain depth
function generateKeys(depth, maxKeys = 10) {
  const keys = []
  const generate = (currentKey, currentDepth) => {
    if (currentDepth === 0) {
      keys.push(currentKey)
      return
    }
    for (let i = 0; i < maxKeys; i++) {
      const newKey = `key${i}`
      generate(`${currentKey}.${newKey}`, currentDepth - 1)
    }
  }

  // Start with a randomly generated prefix
  const prefix = generateRandomPrefix(maxKeys)
  generate(prefix, depth)
  return keys
}

// Generate keys up to the maximum depth defined in your translation structure
const generatedKeys = generateKeys(4)

// $defineI18nRoute({
//   locales: ['en', 'ru'],
// })
</script>
