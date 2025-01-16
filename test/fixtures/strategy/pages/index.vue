<template>
  <div>
    <p id="content">
      {{ $t('key0') }}
    </p>

    <i18n-link
      id="activity"
      :to="{ name: 'contact' }"
    >
      Contact
    </i18n-link>

    <i18n-link
      id="activity"
      :to="{ name: 'about' }"
    >
      About
    </i18n-link>

    <div id="locale-switcher">
      <i18n-switcher />
    </div>
  </div>
</template>

<script setup>
import { useNuxtApp } from '#imports'

const { $t } = useNuxtApp()
</script>
