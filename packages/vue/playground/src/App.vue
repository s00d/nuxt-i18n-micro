<template>
  <div id="app">
    <nav>
      <I18nLink to="/">
        {{ t('nav.home') }}
      </I18nLink>
      <I18nLink to="/about">
        {{ t('nav.about') }}
      </I18nLink>
      <I18nLink to="/components">
        {{ t('nav.components') }}
      </I18nLink>
    </nav>
    <div class="locale-switcher-container">
      <I18nSwitcher />
    </div>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { I18nLink, I18nSwitcher, useI18n } from '@i18n-micro/vue'

const { t } = useI18n()
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
