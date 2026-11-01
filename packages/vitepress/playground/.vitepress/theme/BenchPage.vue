<script setup lang="ts">
import { getLocaleFromPath, I18nGroup, I18nLink, I18nSwitcher, I18nT, routeNameFromPath, stripSiteBase, useI18n } from '@i18n-micro/vitepress'
import { useData, withBase } from 'vitepress'
import { computed } from 'vue'
import { caseRows, type I18nLike, messages, routeMessages, row, routingRows } from '../../../../../benchmark/integrations/catalogue'

const i18n = useI18n()
const { locale, getLocales, getRoute, switchLocale, localePath, addTranslations, addRouteTranslations } = i18n
const { page, lang } = useData()

for (const code of ['en', 'de', 'fr']) {
  addTranslations(code, messages[code] as never)
  for (const [route, perLocale] of Object.entries(routeMessages)) addRouteTranslations(code, route, (perLocale[code] ?? {}) as never)
}

const rows = computed(() => caseRows(i18n as unknown as I18nLike))
const routing = computed(() => (locale.value ? routingRows(i18n as never) : []))
const helpers = computed(() =>
  [
    ['with-base', () => withBase(localePath('/guide/demo', 'de'))],
    ['locale-from-path', () => getLocaleFromPath('/de/guide/demo', ['en', 'de', 'fr'], 'en')],
    ['route-from-path', () => routeNameFromPath('de/guide/demo.md', ['en', 'de', 'fr'])],
    ['strip-base', () => stripSiteBase('/docs/de/x', '/docs/')],
    ['vp-lang', () => lang.value],
    ['vp-page', () => page.value.relativePath],
  ].map(([id, run]) => ({ id: id as string, value: row(run as () => unknown) })),
)
</script>

<template>
  <ul data-testid="page-bench">
    <li data-testid="current-locale">{{ locale }}</li>
    <li data-testid="current-route">{{ getRoute() }}</li>
    <li v-for="item in getLocales()" :key="item.code">
      <button :data-testid="`switch-${item.code}`" @click="switchLocale(item.code)">{{ item.code }}</button>
    </li>
    <li v-for="item in [...rows, ...routing, ...helpers]" :key="item.id" :data-testid="item.id">{{ item.value }}</li>
    <li data-testid="it-basic"><I18nT keypath="welcome" /></li>
    <li data-testid="it-params"><I18nT keypath="greeting" :params="{ name: 'Ada' }" /></li>
    <li data-testid="it-plural-2"><I18nT keypath="apples" :plural="2" /></li>
    <li data-testid="it-hide-empty"><I18nT keypath="empty" hide-if-empty /></li>
    <li data-testid="group-basic">
      <I18nGroup prefix="section"
        ><template #default="{ t }">{{ t('title') }}</template></I18nGroup
      >
    </li>
    <li data-testid="link-home"><I18nLink to="/">home</I18nLink></li>
    <li data-testid="link-demo"><I18nLink to="/guide/demo">demo</I18nLink></li>
    <li data-testid="link-query"><I18nLink to="/guide/demo?a=1#b">query</I18nLink></li>
    <li data-testid="link-external"><I18nLink to="https://example.test/x">external</I18nLink></li>
    <li data-testid="switcher"><I18nSwitcher /></li>
    <li data-testid="global-t">{{ $t('welcome') }}</li>
  </ul>
</template>
