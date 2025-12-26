<template>
  <div id="app">
    <nav>
      <I18nLink
        to="/"
        :locale-route="localeRoute"
      >
        {{ t('nav.home') }}
      </I18nLink>
      <I18nLink
        to="/about"
        :locale-route="localeRoute"
      >
        {{ t('nav.about') }}
      </I18nLink>
      <I18nLink
        to="/components"
        :locale-route="localeRoute"
      >
        {{ t('nav.components') }}
      </I18nLink>
    </nav>
    <div class="locale-switcher-container">
      <I18nSwitcher
        :locales="getLocales()"
        :current-locale="locale"
        :get-locale-name="() => getLocaleName()"
        :switch-locale="switchLocale"
        :locale-route="localeRoute"
      />
    </div>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { I18nLink, I18nSwitcher, useI18n } from '@i18n-micro/vue'
import { defaultLocale } from './app-config'

const route = useRoute()
console.log('[playground] App.vue setup started')
console.log('[playground] route:', route)

let i18nResult: ReturnType<typeof useI18n>
try {
  i18nResult = useI18n()
  console.log('[playground] useI18n() succeeded:', i18nResult)
}
catch (error) {
  console.error('[playground] useI18n() failed:', error)
  throw error
}

// All these variables are used in template, but linter doesn't see it
const { t, getLocales, locale, getLocaleName, localeRoute: baseLocaleRoute, switchLocale: baseSwitchLocale } = i18nResult

// Create reactive localeRoute that always uses current locale
const localeRoute = computed(() => {
  return (to: string | { path?: string }) => {
    return baseLocaleRoute(to, locale.value)
  }
})

const switchLocale = (newLocale: string) => {
  baseSwitchLocale(newLocale)
}

// Sync locale from URL params
watch(
  () => route.params.locale,
  (newLocale) => {
    const targetLocale = (typeof newLocale === 'string' ? newLocale : defaultLocale) || defaultLocale
    if (locale.value !== targetLocale) {
      locale.value = targetLocale
    }
  },
  { immediate: true },
)
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 20px;
}

nav {
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
}

nav a {
  text-decoration: none;
  color: #42b983;
  font-weight: 500;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

nav a:hover {
  background-color: #f0f0f0;
}

nav a.router-link-active {
  font-weight: bold;
  background-color: #e8f5e9;
}

.locale-switcher-container {
  margin-bottom: 20px;
}

main {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
}
</style>
