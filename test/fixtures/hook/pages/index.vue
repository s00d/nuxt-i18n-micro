<script setup>
import { useNuxtApp } from '#imports'

const { $t } = useNuxtApp()
</script>

<template>
  <div>
    <h1>Index</h1>

    <NuxtLink
      id="test-page"
      class="underline"
      to="/test"
    >
      Test
    </NuxtLink>

    <p id="hook">
      {{ $t('hook') }}
    </p>
  </div>
</template>
