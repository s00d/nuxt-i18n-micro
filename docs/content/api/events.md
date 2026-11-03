---
title: 'Hooks'
description: 'The i18n:register runtime hook: add translations from a Nuxt plugin on load and on navigation.'
outline: [2, 3]
navigation:
  order: 50
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

::card-group
  :::card{title="Helpers" icon="i-lucide-braces" to="/api/methods#mergetranslations"}
  `$mergeTranslations` and `$loadPageTranslations` for one-off merges
  :::
  :::card{title="Translation files" icon="i-lucide-book-open" to="/guide/translations"}
  Where translations normally come from
  :::
  :::card{title="Module options" icon="i-lucide-braces" to="/api/module-options#hooks"}
  `hooks`
  :::
::
