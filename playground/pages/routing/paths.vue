<script setup lang="ts">
const { $localePath, $localeRoute, $switchLocalePath, $switchLocaleRoute, $getLocale, $getLocales, $getI18nConfig, $i18nStrategy, $getRouteName } =
  useNuxtApp()
const brief = (route: unknown) => {
  if (typeof route === 'string') return route
  const { name, path, fullPath } = route as { name?: unknown; path?: string; fullPath?: string }
  return { name, path, fullPath }
}
const rows: Record<string, () => unknown> = {
  'lp-string': () => $localePath('/static-page'),
  'lp-string-de': () => $localePath('/static-page', 'de'),
  'lp-custom': () => $localePath('/about', 'de'),
  'lp-named': () => $localePath({ name: 'about' }, 'fr'),
  'lp-params': () => $localePath({ name: 'products-id', params: { id: 1 } }, 'de'),
  'lp-query': () => $localePath('/static-page?x=1#h', 'de'),
  'lp-external': () => $localePath('https://example.com/'),
  'lp-unknown-locale': () => $localePath('/static-page', 'xx'),
  'lp-disabled-locale': () => $localePath('/static-page', 'es'),
  'lp-missing-page': () => $localePath('/no/such/page', 'de'),
  'lr-string': () => brief($localeRoute('/static-page')),
  'lr-de': () => brief($localeRoute('/about', 'de')),
  'lr-named': () => brief($localeRoute({ name: 'contact' }, 'de')),
  'slp-de': () => $switchLocalePath('de'),
  'slp-es': () => $switchLocalePath('es'),
  'slr-de': () => brief($switchLocaleRoute('de')),
  'get-locale-route': () => $getLocale($localeRoute('/static-page', 'de')),
  'get-route-name-route': () => $getRouteName($localeRoute('/static-page', 'de')),
  locales: () => $getLocales().map((locale) => `${locale.code}${locale.disabled ? ':disabled' : ''}`),
  'locale-custom-prop': () => ($getLocales().find((locale) => locale.code === 'pt') as { flag?: string } | undefined)?.flag,
  config: () => {
    const { strategy, defaultLocale, fallbackLocale, localeCookie, hashMode, apiBaseUrl, dateBuild, translationPayloadMode } =
      $getI18nConfig() as unknown as Record<string, unknown>
    return { strategy, defaultLocale, fallbackLocale, localeCookie, hashMode, apiBaseUrl, dateBuild, translationPayloadMode }
  },
  strategy: () => typeof $i18nStrategy,
}
</script>

<template>
  <BenchPage name="routing-paths">
    <R v-for="(read, id) in rows" :id="id" :key="id" :v="safe(read)" />
    <button data-testid="go-de" @click="$switchLocale('de')">$switchLocale de</button>
    <button data-testid="go-unknown" @click="$switchLocale('xx')">$switchLocale xx</button>
    <button data-testid="route-about" @click="$switchRoute('/about')">$switchRoute</button>
    <button data-testid="route-about-de" @click="$switchRoute({ name: 'about' }, 'de')">$switchRoute de</button>
    <NuxtLink data-testid="nuxtlink-route" :to="$localeRoute('/static-page', 'de')">NuxtLink + $localeRoute</NuxtLink>
    <NuxtLink data-testid="nuxtlink-path" :to="$localePath('/static-page', 'de')">NuxtLink + $localePath</NuxtLink>
  </BenchPage>
</template>
