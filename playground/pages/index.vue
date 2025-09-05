<template>
  <div>
    <Navigation />

    <p>{{ $t('key1.key1.key1.key1.key1') }}</p>
    <p>{{ $t('hook') }}</p>
    <p>Current Locale: {{ currentLocale }}</p>
    <p>Current route without locale: {{ currentRouteName }}</p>

    <!-- Ссылки для переключения локалей -->
    <div>
      <button
        v-for="locale in currentLocales"
        :key="locale.code"
        :disabled="locale.code === currentLocale"
        :class="{ disabled: locale.code === currentLocale }"
        @click="() => $switchLocale(locale.code)"
      >
        Switch to {{ locale.code }}
      </button>
    </div>

    <div>
      <i18n-switcher
        :custom-labels="{ en: 'English', de: 'Deutsch', ru: 'Русский' }"
      />
    </div>

    <p id="localized-route">
      {{ localeRoute({ name: 'page' }, 'de').path }}
    </p>

    <p id="localized-route-path">
      {{ localeRoute('/page') }}
      <br>
      <button
        type="button"
        @click="toCreationByStr"
      >
        toCreationByStr
      </button>
    </p>

    <p id="localized-route-path">
      {{ localeRoute({ name: 'page' }) }}
      <br>
      <button
        type="button"
        @click="toCreationByObj"
      >
        toCreationByObj
      </button>
    </p>

    <p class="localized-route-path-locale">
      localized-route-path-locale
      {{ localeRoute({ name: 'contact' }, 'de') }}

      <NuxtLink :to="localeRoute({ name: 'contact' }, 'de')">
        {{ $t("navigation.contact") }}
      </NuxtLink>
    </p>

    <p id="localized-route-path">
      {{ localeRoute({ name: 'subpage' }) }}
      <br>
      <button
        type="button"
        @click="toCreationByObjSubPage"
      >
        toCreationByObj
      </button>
    </p>

    <p id="localized-route-2">
      {{ localeRoute({ name: 'page' }, 'de').path }}
    </p>

    <p id="localized-route-3">
      {{ localeRoute('/news/aaa?info=1111').fullPath }}
    </p>

    <p id="localized-path">
      {{ localePath('/news/aaa?info=1111') }}
    </p>

    <button @click="$switchRoute('/page')">
      switchRoute
    </button>

    <div>
      <i18n-link :to="{ name: 'page' }">
        Go to Page
      </i18n-link>
    </div>

    <div>
      <i18n-link :to="{ name: 'async-components-test' }">
        🧪 Async Components Test 1
      </i18n-link>
    </div>

    <div>
      <i18n-link :to="{ name: 'async-components-test-2' }">
        🧪 Async Components Test 2
      </i18n-link>
    </div>

    <a href="/">test</a>

    <div
      v-for="key in generatedKeys"
      :key="key"
    >
      <p>{{ key }}: <span v-if="$has(key)">{{ $t(key) }}</span></p>
    </div>
  </div>
</template>

<script setup>
import Navigation from '~/components/navigation.vue'

const { localeRoute, localePath, $getLocales, $getLocale, $switchLocale, $t, $has, $getRouteName, $switchRoute } = useI18n()
const { $defineI18nRoute } = useNuxtApp()

const currentLocales = ref($getLocales())
const currentLocale = computed(() => $getLocale())
const currentRouteName = computed(() => $getRouteName())

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

const toCreationByStr = () => {
  $switchRoute('/page')
}

const toCreationByObj = () => {
  $switchRoute({ name: 'page' })
}

const toCreationByObjSubPage = () => {
  $switchRoute({ name: 'subpage' })
}

const generatedKeys = ref(generateKeys(4))

$defineI18nRoute({
  locales: {
    en: {
      navigation: {
        contact: 'Contect en',
      },
    },
    de: {
      navigation: {
        contact: 'Contect de',
      },
    },
    ru: {},
    fr: {},
    ch: {},
  },
})
</script>
