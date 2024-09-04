<script setup>
const { $localeRoute } = useI18n()

function navigateBroken() {
  navigateTo($localeRoute({ name: 'page', params: { id: 'my-id' } }))
}

function navigateWorking() {
  navigateTo({ name: 'page', params: { id: 'my-id' } })
}

function navigateBrokenDefaultNuxtPageNaming() {
  navigateTo($localeRoute({ name: 'test-id', params: { id: 'my-id' } }))
}
</script>

<template>
  <div>
    <h1>Index</h1>
    <p>{{ $t('generic.welcome') }}</p>

    <!-- $localeRoute() with params not working -->

    <NuxtLink
      id="link1"
      :to="$localeRoute({ name: 'page', params: { id: 'my-id' } })"
    >
      Link with param
    </NuxtLink>

    <NuxtLink
      id="link2"
      :to="$localeRoute({ name: 'test-id', params: { id: 'my-id' } })"
    >
      Link
    </NuxtLink>

    <button
      id="link3"
      @click="navigateBroken"
    >
      Navigate
    </button>
    <button
      id="link4"
      @click="navigateBrokenDefaultNuxtPageNaming"
    >
      Navigate
    </button>
    <button
      id="link5"
      @click="navigateWorking"
    >
      Navigate
    </button>

    <NuxtLink
      id="link6"
      :to="$localeRoute('/page/id-123')"
    >
      Navigate
    </NuxtLink>
  </div>
</template>
