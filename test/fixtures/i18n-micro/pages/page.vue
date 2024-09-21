<template>
  <div>
    <h2 id="ok">
      ok
    </h2>
    <p>{{ $t('key1.key1.key1.key1.key1') }}</p>

    <p>Current Locale: {{ $getLocale() }}</p>

    <div>
      {{ $t('welcome', { username: 'Alice', unreadCount: 5 }) }}
    </div>

    <!-- Ссылки для переключения локалей -->
    <div>
      <button
        v-for="locale in $getLocales()"
        :key="locale"
        :disabled="locale === $getLocale()"
        @click="() => $switchLocale(locale.code)"
      >
        Switch to {{ locale.code }}
      </button>
    </div>

    <div>
      <NuxtLink :to="$localeRoute({ name: 'index' })">
        Go to Index
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useNuxtApp } from '#imports'

const head = useLocaleHead({
  addDirAttribute: true,
  identifierAttribute: 'id',
  addSeoAttributes: true,
})

useHead(head)

const { $getLocale, $switchLocale, $getLocales, $localeRoute, $t } = useNuxtApp()
</script>
