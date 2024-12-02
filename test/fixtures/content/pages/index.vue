<template>
  <div>
    <h1>{{ $t('title') }}</h1>
    <ul>
      <li>
        <nuxt-link :to="$localePath('about')">
          {{ $t('about.title') }}
        </nuxt-link>
      </li>
      <li>
        <nuxt-link :to="$localePath('services')">
          {{ $t('services.title') }}
        </nuxt-link>
      </li>
      <li>
        <nuxt-link :to="$localePath('contact')">
          {{ $t('contact.title') }}
        </nuxt-link>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from '#imports'

const { $t, $localePath } = useI18n()
</script>
