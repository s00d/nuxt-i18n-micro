<template>
  <div>
    <header>
      <h1 class="layout-title">{{ $t('layout.title') }}</h1>
      <nav>
        <span class="nav-home">{{ $t('layout.nav.home') }}</span>
        <span class="nav-about">{{ $t('layout.nav.about') }}</span>
      </nav>
      <button v-for="locale in $getLocales()" :key="locale.code" :data-locale="locale.code" @click="$switchLocale(locale.code)">
        {{ locale.code.toUpperCase() }}
      </button>
      <span class="locale-value">{{ $getLocale() }}</span>
    </header>
    <NuxtPage />
  </div>
</template>

<script setup>
import { useNuxtApp } from '#imports'

const { $t, $getLocale, $getLocales, $switchLocale } = useNuxtApp()
</script>
