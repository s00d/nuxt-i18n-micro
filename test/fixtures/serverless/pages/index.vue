<script setup>
import { useNuxtApp } from '#imports'

const { $t, $getLocale } = useNuxtApp()
</script>

<template>
  <div>
    <p id="locale">
      {{ $getLocale() }}
    </p>
    <p id="hello">
      {{ $t('hello') }}
    </p>
    <p id="welcome">
      {{ $t('welcome') }}
    </p>
    <p id="pageTitle">
      {{ $t('pageTitle') }}
    </p>
    <p id="pageContent">
      {{ $t('pageContent') }}
    </p>
  </div>
</template>
