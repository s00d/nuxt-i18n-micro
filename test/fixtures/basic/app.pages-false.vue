<script setup>
import { useNuxtApp } from '#imports'

const { $getLocale, $localePath, $switchLocale, $switchLocalePath, $t } = useNuxtApp()
</script>

<template>
  <div>
    <p id="locale">
      {{ $getLocale() }}
    </p>
    <p id="greeting">
      {{ $t('greeting') }}
    </p>
    <a id="link-zh" :href="$switchLocalePath('zh')">zh</a>
    <p id="path-zh">
      {{ $localePath('/about', 'zh') }}
    </p>
    <button id="switch-zh" @click="$switchLocale('zh')">zh</button>
  </div>
</template>
