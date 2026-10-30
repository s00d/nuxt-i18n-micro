---
title: 'useI18n'
description: 'useI18n returns the runtime helpers ($t, $tc, $localePath, …) as a plain object, with and without the $ prefix.'
outline: [2, 3]
---

# `useI18n`

`useI18n()` returns the module's runtime helpers as a plain object. Use it in `<script setup>`, composables and plugins instead of reaching for `useNuxtApp()`. Every helper comes under its `$` name and a bare alias: `t` and `$t` are the same function.

## Signature

<!-- generated:symbol:useI18n — do not edit; run `pnpm run docs:generate` -->

```ts
useI18n(): PluginsInjectionsWithAliases
```

Every runtime helper, as a plain object.

The same functions the plugin injects as `$t`, `$tc` and so on, available under both
the dollar-prefixed name and a bare alias — so `const { t } = useI18n()` and
`const { $t } = useI18n()` both work.

**Returns** — the helpers described in the [methods reference](/api/methods)

```ts
const { t, tc, switchLocale, getLocale } = useI18n()

t('welcome', { name: 'Ada' })
tc('items', 3)
switchLocale('de')
```

<!-- /generated:symbol:useI18n -->

The returned object holds every helper of [`PluginsInjections`](/api/methods). Each one is documented on the [Helpers](/api/methods) page.

## Example

```vue
<script setup lang="ts">
const { t, tc, localePath, switchLocale, getLocale } = useI18n()

const title = computed(() => t('page.title'))
</script>

<template>
  <h1>{{ title }}</h1>
  <p>{{ tc('items', 3) }}</p>
  <NuxtLink :to="localePath('/about')">{{ t('nav.about') }}</NuxtLink>
  <button @click="switchLocale(getLocale() === 'en' ? 'de' : 'en')">{{ t('nav.switch') }}</button>
</template>
```

## Not in the type

`$defineI18nRoute` and `$clearCache` are typed on `useNuxtApp()` only:

```ts
const { $defineI18nRoute, $clearCache } = useNuxtApp()
```

## Related

- [Helpers](/api/methods) — every helper with its signature
- [`useI18nLocale`](/composables/useI18nLocale) — locale state and cookie
