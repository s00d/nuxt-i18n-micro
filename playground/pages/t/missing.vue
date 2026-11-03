<script setup lang="ts">
const { $setMissingHandler, $t } = useNuxtApp()
const seen = ref<string[]>([])
const installed = ref(false)
const install = () => {
  $setMissingHandler((locale, key, routeName) => seen.value.push(`${locale}|${key}|${routeName}`))
  installed.value = true
}
onBeforeUnmount(() => $setMissingHandler(null))
</script>

<template>
  <BenchPage name="t-missing">
    <button data-testid="missing-install" @click="install">install</button>
    <button data-testid="missing-remove" @click="($setMissingHandler(null), (installed = false))">remove</button>
    <button data-testid="missing-trigger" @click="$t('bench.not.there')">trigger</button>
    <R id="missing-installed" :v="installed" />
    <R id="missing-seen" :v="seen" />
    <R id="missing-raw" :v="$t('still.missing')" />
  </BenchPage>
</template>
