<template>
  <div>
    <h1>Test $loadPageTranslations Method</h1>

    <div>
      <h2>Current Locale: {{ $getLocale() }}</h2>
      <h2>Route Name: {{ $getRouteName() }}</h2>
    </div>

    <div>
      <h3>Translations before loading:</h3>
      <p>test_key: {{ $t('test_key') || 'NOT FOUND' }}</p>
      <p>dynamic_key: {{ $t('dynamic_key') || 'NOT FOUND' }}</p>
    </div>

    <div>
      <button @click="loadTestTranslations">
        Load Test Translations
      </button>
    </div>

    <div v-if="translationsLoaded">
      <h3>Translations after loading:</h3>
      <p>test_key: {{ $t('test_key') }}</p>
      <p>dynamic_key: {{ $t('dynamic_key') }}</p>
      <p>nested.key: {{ $t('nested.key') }}</p>
    </div>

    <div>
      <h3>Check translation existence:</h3>
      <p>has test_key: {{ $has('test_key') }}</p>
      <p>has dynamic_key: {{ $has('dynamic_key') }}</p>
      <p>has nested.key: {{ $has('nested.key') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNuxtApp } from '#imports'

const { $getLocale, $getRouteName, $t, $has, $loadPageTranslations } = useNuxtApp()

const translationsLoaded = ref(false)

const loadTestTranslations = async () => {
  const currentLocale = $getLocale()
  const routeName = $getRouteName()

  const testTranslations = {
    test_key: `Test key for ${currentLocale}`,
    dynamic_key: `Dynamic key loaded at ${new Date().toLocaleTimeString()}`,
    nested: {
      key: `Nested key for ${currentLocale}`,
    },
  }

  try {
    await $loadPageTranslations(currentLocale, routeName, testTranslations)
    translationsLoaded.value = true
    console.log('Translations loaded successfully:', testTranslations)
  }
  catch (error) {
    console.error('Error loading translations:', error)
  }
}

// Check if method is available
onMounted(() => {
  console.log('$loadPageTranslations method is available:', typeof $loadPageTranslations === 'function')
})
</script>
