<script setup lang="ts">
// Header of every layout: what the app thinks it is showing. state-hydrated flips once the client took over.
withDefaults(defineProps<{ layout: string; bar?: boolean }>(), { bar: true })
const route = useRoute()
const { $getLocale, $getLocaleName, $defaultLocale, $getRouteName, $getLocales, $getI18nConfig, $switchLocalePath, $localePath, $switchLocale } =
  useNuxtApp()
const hydrated = ref(false)
onMounted(() => (hydrated.value = true))
const enabled = computed(() => $getLocales().filter((locale) => !locale.disabled))
</script>

<template>
  <section data-testid="state">
    <R id="state-layout" :v="layout" />
    <R id="state-locale" :v="$getLocale()" />
    <R id="state-locale-name" :v="$getLocaleName()" />
    <R id="state-default-locale" :v="$defaultLocale()" />
    <R id="state-route-name" :v="String(route.name)" />
    <R id="state-i18n-route-name" :v="$getRouteName()" />
    <R id="state-path" :v="route.fullPath" />
    <R id="state-strategy" :v="$getI18nConfig().strategy" />
    <R id="state-hydrated" :v="hydrated" />
    <nav v-if="bar" data-testid="locale-bar">
      <NuxtLink data-testid="nav-home" :to="$localePath('/')">home</NuxtLink>
      <template v-for="locale in enabled" :key="locale.code">
        | <NuxtLink :data-testid="`link-${locale.code}`" :to="$switchLocalePath(locale.code)">{{ locale.code }}</NuxtLink>
        <button :data-testid="`switch-${locale.code}`" @click="$switchLocale(locale.code)">{{ locale.code }}</button>
      </template>
    </nav>
  </section>
</template>
