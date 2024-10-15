<template>
  <div>
    <p>{{ $t("key1.key1.key1.key1.key1") }}</p>
    <p>Current Locale: {{ $getLocale() }}</p>
    <p>Current route without locale: {{ $getRouteName() }}</p>

    <!-- Ссылки для переключения локалей -->
    <h1>Switch locale</h1>
    <div>
      <button
        v-for="locale in $getLocales()"
        :key="locale.code"
        :disabled="locale.code === $getLocale()"
        @click="() => $switchLocale(locale.code)"
      >
        Switch to {{ locale.code }}
      </button>
    </div>
    <h1>localized route</h1>
    <p id="localized-route">
      {{ $localeRoute({ name: "page" }, "de").path }}
    </p>

    <h1>Display name</h1>
    <p
      v-for="(locale, index) of $getLocales()"
      :key="index"
    >
      {{ locale.displayName }}
    </p>
    <h1>Tests for {{ "<a></a>" }} and {{ "<nuxt-link></nuxt-link>" }} tags</h1>
    <div>
      <i18n-link
        style="margin-right: 24px"
        :to="{ name: 'page' }"
      >
        NuxtLink
      </i18n-link>

      <a href="/">tag a</a>
    </div>

    <h1>Dynamic translation by passing variables</h1>
    <p>
      <i18n-switcher
        :custom-labels="{ en: 'English', de: 'Deutsch', ru: 'Русский' }"
      />
    </p>
    <div
      v-for="key in generatedKeys"
      :key="key"
    >
      <p>
        {{ key }}: <span v-if="$has(key)">{{ $t(key) }}</span>
      </p>
    </div>
  </div>
</template>

<script setup>
const { $localeRoute } = useNuxtApp()
// Function to generate keys with a fixed pattern
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
