---
title: 'useI18nLocale'
description: 'useI18nLocale reads and writes the locale state and the locale cookie — the entry point for custom locale detection.'
outline: [2, 3]
---

# `useI18nLocale`

`useI18nLocale()` gives access to the locale the app has chosen: the `i18n-locale` state and the locale cookie. Use it in a plugin that detects the locale itself (domain, user profile, header) instead of writing `useState('i18n-locale')` or the cookie by hand. Its validity checks use the enabled locales, runtime overrides included.

## Signature

<!-- generated:symbol:useI18nLocale — do not edit; run `pnpm run docs:generate` -->

```ts
useI18nLocale(): { getEffectiveLocale: (route: unknown, getLocaleFromRoute: GetLocaleFromRoute) => string; getLocale: () => string | null; getLocaleWithServerFallback: (serverLocale?: string | null) => string | null; getPreferredLocale: () => string | null; hashCookie: any; isValidLocale: (locale: string | null | undefined) => locale is string; locale: any; localeCookie: any; resolveInitialLocale: (options: ResolveInitialLocaleOptions) => string; setLocale: (locale: string | null) => void; syncLocale: (locale: string | null) => void; validLocales: string[] }
```

Centralized entry point for i18n locale management.
Combines useState('i18n-locale'), locale cookie, and sync utilities.

<!-- /generated:symbol:useI18nLocale -->

## Returned values

| Member | Type | Description |
| --- | --- | --- |
| `locale` | `Ref<string \| null>` | The `useState('i18n-locale')` ref. |
| `localeCookie` | `Ref<string \| null>` | The [`localeCookie`](/api/module-options#localecookie) cookie; a plain `{ value: null }` when the option is `null`. |
| `hashCookie` | `Ref<string \| null>` | The `hash-locale` cookie under hash routing; `{ value: null }` otherwise. |
| `validLocales` | `string[]` | Codes of the enabled locales. |
| `setLocale(locale)` | `(locale: string \| null) => void` | Write the state and the cookies. Does not validate and does not load translations. |
| `syncLocale(locale)` | `(locale: string \| null) => void` | Write the cookies only. |
| `getLocale()` | `() => string \| null` | State, then the preference cookie (hash cookie under hash routing). Not validated. |
| `getPreferredLocale()` | `() => string \| null` | The first **valid** of state and preference cookie, or `null`. |
| `getLocaleWithServerFallback(serverLocale?)` | `(serverLocale?: string \| null) => string \| null` | State, cookie, then `serverLocale`. |
| `getEffectiveLocale(route, getLocaleFromRoute)` | `(route, fn) => string` | The state under hash routing when set; otherwise `getLocaleFromRoute(route)`. |
| `resolveInitialLocale(options)` | `(options: ResolveInitialLocaleOptions) => string` | `options.urlLocale`, then a valid state, then `options.serverLocale`, then the route's locale. Stores the result in the state when the state is not valid; on the client it also writes the cookie. |
| `isValidLocale(locale)` | `(locale) => locale is string` | Whether `locale` is in `validLocales`. |

The cookies last one year, with `path: '/'` and `sameSite: 'lax'`.

## Example

```ts
// plugins/locale-from-domain.server.ts
export default defineNuxtPlugin({
  name: 'locale-from-domain',
  enforce: 'pre',
  setup() {
    const { setLocale, isValidLocale } = useI18nLocale()
    const host = useRequestURL().hostname // e.g. de.example.com
    const code = host.split('.')[0]
    if (isValidLocale(code)) setLocale(code)
  },
})
```

The module's loader plugin reads the state when it starts, so a plugin that sets it must run first (`enforce: 'pre'`). How the state competes with the URL, the cookie and `Accept-Language`: [Locale detection](/guide/locale-detection). Full walkthrough: [Custom detection](/guide/custom-auto-detect).

`setLocale()` does not switch the translations on screen. To change the locale of the current page, call [`$switchLocale()`](/api/methods#switchlocale).

## Related

- [Custom detection](/guide/custom-auto-detect)
- [Locale detection](/guide/locale-detection)
- [`useI18n`](/composables/useI18n)
