---
title: 'Hooks'
description: 'The i18n:register and i18n:beforeLocaleSwitch runtime hooks: add translations, and confirm, redirect or cancel a locale switch.'
outline: [2, 3]
navigation:
  order: 50
---

# Hooks

The module calls two runtime (app) hooks. `i18n:register` adds translations that are not in your `locales/` files. `i18n:beforeLocaleSwitch` runs before the page switches to another locale, and can send it to another locale or stop it.

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

### Example

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

## `i18n:beforeLocaleSwitch`

```ts
'i18n:beforeLocaleSwitch': (ctx: { from: string; to: string; cancel: boolean }) => HookResult
```

| Field | Description |
| --- | --- |
| `from` | The locale the page shows now. |
| `to` | The locale it switches to. Set another enabled locale to switch there instead; a locale that is not enabled is ignored. |
| `cancel` | Set `true` to stay: the page, its dictionary and the stored preference do not change. |

```ts
// plugins/confirm-locale.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('i18n:beforeLocaleSwitch', async (ctx) => {
    if (hasUnsavedChanges() && !confirm('Leave without saving?')) ctx.cancel = true
    // a regional locale the app does not have yet
    if (ctx.to === 'de-at') ctx.to = 'de'
  })
})
```

It is called once per switch, on the client, after the first load:

- for a navigation into another locale: `$switchLocale`, `<i18n-switcher>`, a link or `router.push` to a page of another locale (prefix strategies). A cancel aborts the navigation, as a guard returning `false`; another `to` redirects to the same page in that locale, and that navigation is not asked again;
- under `no_prefix` and in hash mode, by `$switchLocale` before the dictionary loads (there the dictionary moves first, and no guard could undo it).

`$switchLocale` resolves `false` when the switch is cancelled. A switch to a locale on another domain (`locales[].baseUrl`) leaves the app and is not asked. With nobody subscribed the hook costs one lookup per switch, and with [`hooks: false`](/api/module-options#hooks) it is never called.

### After a switch

There is no hook after a switch: watch the locale. A `watch` of `$getLocale()` fires once the new locale is applied, its dictionary loaded and in place:

```ts
// plugins/locale-analytics.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  watch(
    () => nuxtApp.$getLocale(),
    (locale) => track('locale', locale),
  )
})
```

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
