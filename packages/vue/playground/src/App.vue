<template>
  <header data-testid="locale-state">
    <span data-testid="current-locale">{{ locale }}</span>
    <span data-testid="locale-name">{{ getLocaleName() }}</span>
    <span data-testid="current-route">{{ getRoute() }}</span>
    <span data-testid="current-get-locale">{{ getLocale() }}</span>
  </header>
  <nav>
    <button v-for="item in getLocales()" :key="item.code" :data-testid="`switch-${item.code}`" @click="change(item.code)">{{ item.code }}</button>
    <template v-if="routed">
      <I18nLink v-for="path in pagePaths" :key="path" :to="path" :data-testid="`link-${path}`">{{ path }}</I18nLink>
      <I18nLink to="/nothing/here" data-testid="link-404">404</I18nLink>
    </template>
    <I18nSwitcher />
  </nav>
  <main>
    <RouterView v-if="routed" />
    <template v-else>
      <Cases />
      <Components />
      <Dictionaries />
      <Routing />
      <Big />
    </template>
  </main>
</template>

<script setup lang="ts">
import { I18nLink, I18nSwitcher, useI18n } from '@i18n-micro/vue'
import { onMounted, watch } from 'vue'
import { dirOf, pagePaths, persisted } from '../../../../benchmark/integrations/catalogue'
import Big from './pages/Big.vue'
import Cases from './pages/Cases.vue'
import Components from './pages/Components.vue'
import Dictionaries from './pages/Dictionaries.vue'
import Routing from './pages/Routing.vue'

const routed = import.meta.env.VITE_ROUTER !== '0'
const { locale, getLocale, getLocaleName, getLocales, getRoute, switchLocale } = useI18n()

const change = (code: string) => {
  persisted.write(code)
  switchLocale(code)
}

const applyDocument = () => {
  document.documentElement.lang = locale.value
  document.documentElement.dir = dirOf(locale.value)
}
onMounted(applyDocument)
watch(locale, applyDocument)
</script>
