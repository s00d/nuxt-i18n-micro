---
title: 'Hooks'
description: 'The i18n:register runtime hook: add translations from a Nuxt plugin on load and on navigation.'
outline: [2, 3]
---

# Hooks

The module calls one runtime (app) hook, `i18n:register`. Use it when a plugin or a module adds translations that are not in your `locales/` files. Your callback gets a `register` function that merges translations into the page that is being shown.

## `i18n:register`

```ts
'i18n:register': (
  register: (translations: unknown, locale?: string) => void,
  locale: string,
) => HookResult
```

| Argument | Description |
| --- | --- |
| `register(translations, locale?)` | Deep-merges `translations` into the page chunk of the route being loaded, for `locale` (default: the hook's `locale`). Keys already there are overridden. |
| `locale` | The locale of the route being loaded. |

The hook is typed through `RuntimeNuxtHooks`, so `nuxtApp.hook('i18n:register', …)` needs no cast.

## When it fires

The loader plugin (`i18n-plugin-loader`) calls it:

1. once on startup, when every plugin has run (`app:created`) and before the app renders;
2. in its `router.beforeEach`, after the target page's translations are loaded, when the path changes — on every navigation under `no_prefix`.

Every callback and every `register` call is awaited before the app renders or the navigation goes on, so the page renders with the merged keys. With [`hooks: false`](/api/module-options#hooks) the hook is never called.

## Example

```ts
// plugins/i18n-extra.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('i18n:register', async (register, locale) => {
    const extra = await $fetch<Record<string, unknown>>(`/api/cms-strings/${locale}`)
    register(extra, locale)
  })
})
```

This is a runtime hook: register it with `nuxtApp.hook` in a plugin, not with `nuxt.hook` in `nuxt.config` or a module's `setup`. A module adds such a plugin with `addPlugin`.

## Related

- [Helpers](/api/methods#mergetranslations) — `$mergeTranslations` and `$loadPageTranslations` for one-off merges
- [Translation files](/guide/translations) — where translations normally come from
- [Module options](/api/module-options#hooks) — `hooks`
