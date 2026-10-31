<script setup lang="ts">
const i18n = useI18n() as unknown as Record<string, unknown>
const names = [
  '_t',
  '_ts',
  'clearCache',
  'defaultLocale',
  'getI18nConfig',
  'getLocale',
  'getLocaleName',
  'getLocales',
  'getRouteName',
  'has',
  'i18nStrategy',
  'loadPageTranslations',
  'localePath',
  'localeRoute',
  'mergeTranslations',
  'pluralFunc',
  'pluralLocale',
  'resolveTranslations',
  'setI18nRouteParams',
  'setMissingHandler',
  'setTranslation',
  'switchLocale',
  'switchLocalePath',
  'switchLocaleRoute',
  'switchRoute',
  't',
  'tc',
  'td',
  'tdr',
  'tn',
  'ts',
]
// read here: $setI18nRouteParams is a getter that binds to the page, so it belongs in setup
const shapes = Object.fromEntries(names.map((name) => [name, `${typeof i18n[name]} ${typeof i18n[`${name}`]}`]))
const { t, tc, tn, localePath, getLocale } = useI18n()
</script>

<template>
  <BenchPage name="composable-use-i18n">
    <R v-for="name in names" :id="`ui-${name}`" :key="name" :v="shapes[name]" />
    <R id="ui-call-t" :v="t('title')" />
    <R id="ui-call-tc" :v="tc('apples', 2)" />
    <R id="ui-call-tn" :v="tn(1.5)" />
    <R id="ui-call-path" :v="localePath('/static-page')" />
    <R id="ui-call-locale" :v="getLocale()" />
  </BenchPage>
</template>
