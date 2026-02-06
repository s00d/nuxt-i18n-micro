<template>
  <div>
    <h2 id="ok">
      ok
    </h2>
    <p>{{ t('key1.key1.key1.key1.key1') }}</p>
    <p>Current Locale: {{ locale }}</p>

    <div>
      {{ t('welcome', { username: 'Alice', unreadCount: 5 }) }}
    </div>

    <div>
      <NuxtLink to="/">
        Go to Index
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useAsyncData } from '#imports'

const locale = 'en'

const { data: translations } = await useAsyncData(
  `translations-page-${locale}`,
  () => $fetch(`/api/translations/page/${locale}`),
)

function t(path, params) {
  if (!translations.value) return path
  const result = path.split('.').reduce((o, k) => o?.[k], translations.value)
  if (result == null) return path
  if (params && typeof result === 'string') {
    return result.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`))
  }
  return result ?? path
}
</script>
