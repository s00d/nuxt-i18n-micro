<template>
  <div>
    <p id="content">
      {{ $t('key0') }}
    </p>
    <h2 class="page-welcome">{{ $t('page.welcome') }}</h2>

    <i18n-link id="contact" :to="{ name: 'contact' }"> Contact </i18n-link>

    <i18n-link id="about" :to="{ name: 'about' }"> About </i18n-link>

    <i18n-link id="settings-profile" :to="{ name: 'settings-profile' }"> Settings Profile </i18n-link>

    <i18n-link id="settings-team" :to="{ name: 'settings-team' }"> Settings Team </i18n-link>

    <NuxtLink id="plain-about" to="/about"> Plain link </NuxtLink>

    <div id="locale-switcher">
      <i18n-switcher />
    </div>

    <p id="locale">{{ $getLocale() }}</p>
    <button id="switch-de" @click="$switchLocale('de')">Switch to German</button>
  </div>
</template>

<script setup>
import { useNuxtApp } from '#imports'

const { $t, $getLocale, $switchLocale } = useNuxtApp()
</script>
