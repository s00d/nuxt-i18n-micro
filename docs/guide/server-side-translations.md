---
title: Server routes and API
description: Translate strings and read the request locale inside Nitro server routes and API handlers.
outline: [2, 3]
---

# Server routes and API

Server handlers in `server/api/` and `server/routes/` can translate strings and read the request's locale with two auto-imported helpers. Use them for API responses, emails, feeds or anything rendered outside a Vue page. They read the same translation files as your pages and detect the locale from the request.

## Translate in a handler

```ts
// server/api/greeting.get.ts
export default defineEventHandler(async (event) => {
  const t = await useTranslationServerMiddleware(event)
  return { message: t('greeting', { name: 'Ada' }) }
})
```

```bash
curl 'http://localhost:3000/api/greeting?locale=de'
# {"message":"Hallo, Ada!"}
```

`useTranslationServerMiddleware(event, defaultLocale?, locale?)` is async and returns `t(key, params?, defaultValue?)`. `t` returns the string, interpolates `{name}` params, and returns a non-empty `defaultValue`, otherwise the key, when the key is missing.

`t` sees the `index` chunk only: the root files (`locales/<locale>.json`) plus `locales/pages/index/` when it exists (root files only with `disablePageLocales`). Keys of other pages are not loaded. For those, load the chunk yourself:

```ts
const { data } = await loadTranslationsFromServer('de', 'about') // Translations object of the about page
```

## Read the request locale

```ts
// server/api/locale.get.ts
export default defineEventHandler((event) => {
  const { current, isDefault, locale } = useLocaleServerMiddleware(event)
  return { current, isDefault, dir: locale?.dir ?? 'ltr' }
})
```

`useLocaleServerMiddleware(event, defaultLocale?, locale?)` is synchronous and returns:

```ts
interface LocaleInfo {
  current: string // detected locale code
  default: string // defaultLocale, runtime overrides included (fixed at build under prefix_except_default / prefix_and_default)
  fallback: string // fallbackLocale, else the default
  available: string[] // enabled locale codes
  locale: Locale | null // the config entry of `current`
  isDefault: boolean
  isFallback: boolean
}
```

## How the locale is chosen

Both helpers use the same order on every server route, `/api` or not:

1. `?locale=` query (first value when repeated);
2. a `[locale]` route param, or a locale prefix in the path (`/de/...`);
3. the locale cookie, when [`localeCookie`](/api/module-options#localecookie) is set (`hash-locale` under `hashMode`);
4. `Accept-Language`, when `autoDetectLanguage` is on (q-values respected);
5. `defaultLocale`.

Invalid and disabled codes are skipped at every step. This is the API order; a page render ignores `?locale=` under the prefix strategies. Both orders are compared on [Locale detection](/guide/locale-detection).

## Force a locale

Pass the third argument to skip detection, for example in a job that sends mail in the user's language:

```ts
export default defineEventHandler(async (event) => {
  const user = await getUser(event) // your code
  const t = await useTranslationServerMiddleware(event, undefined, user.locale)
  return sendMail(user.email, t('mail.welcome.subject'))
})
```

The second argument replaces `defaultLocale` for this call's detection, so it has no effect when a locale is forced. Dictionaries are cached per request and per locale, and across requests in the server's translation cache, so calling a helper several times is cheap.

## Server components

A server component (`.server.vue`, `<NuxtIsland>`) renders from its own URL, `/__nuxt_island/...`, so it does not see the page's URL, and Nuxt passes it only its props. Pass the locale as a `locale` prop. It then renders in that locale, and a switch fetches it again, since the props are part of the island's URL and cache key:

```vue
<!-- components/Greeting.server.vue -->
<template><p>{{ $t('greeting') }}</p></template>
<script setup lang="ts">
defineProps<{ locale?: string }>()
</script>
```

```vue
<template>
  <Greeting :locale="$getLocale()" />
  <NuxtIsland name="Greeting" :props="{ locale: $getLocale() }" />
</template>
```

Without the prop it renders in the locale of the cookie, else the default locale, whatever the URL says, and it does not follow a switch. Its `$t` sees the `index` chunk: the root files plus `locales/pages/index/`.

## Related

- [Locale detection](/guide/locale-detection)
- [Translation files](/guide/translations)
- [Deployment](/guide/deployment) — where the server reads translations from
