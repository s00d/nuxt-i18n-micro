<script setup lang="ts">
const route = useRoute()
const { locale, localeCookie, hashCookie, validLocales, getLocale, getPreferredLocale, getEffectiveLocale, isValidLocale, setLocale, syncLocale } =
  useI18nLocale()
</script>

<template>
  <BenchPage name="composable-use-i18n-locale">
    <R id="ul-locale" :v="locale" />
    <R id="ul-cookie" :v="localeCookie" />
    <R id="ul-hash-cookie" :v="hashCookie" />
    <R id="ul-valid" :v="validLocales" />
    <R id="ul-get" :v="getLocale()" />
    <R id="ul-preferred" :v="getPreferredLocale()" />
    <R id="ul-effective" :v="getEffectiveLocale(route, () => 'route-locale')" />
    <R id="ul-valid-en" :v="isValidLocale('en')" />
    <R id="ul-valid-es" :v="isValidLocale('es')" />
    <R id="ul-valid-xx" :v="isValidLocale('xx')" />
    <button data-testid="ul-set-de" @click="setLocale('de')">setLocale</button>
    <button data-testid="ul-sync-de" @click="syncLocale('de')">syncLocale</button>
  </BenchPage>
</template>
