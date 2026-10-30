---
title: 'Helpers'
description: 'Every runtime helper the module injects — $t, $tc, $localePath, $switchLocale and the rest — with its signature.'
outline: [2, 3]
---

# Helpers

The module injects its runtime helpers into the Nuxt app: `$t`, `$tc`, `$localePath`, `$switchLocale` and the rest. Use this page to look up a helper's signature and behaviour. Signatures and descriptions come from the `PluginsInjections` and `NuxtAppOnlyInjections` interfaces in `src/runtime/plugins/01.plugin.ts`.

## Access

| Where | How |
| --- | --- |
| Template | <code v-pre>{{ $t('title') }}</code> — every helper, with the `$` |
| `<script setup>` | `const { t, localePath } = useI18n()` — every helper in `PluginsInjections`, with and without the `$` |
| Plugin, middleware, `<script setup>` | `const { $t, $defineI18nRoute } = useNuxtApp()` — everything, `$` only |

`$defineI18nRoute` is typed on `useNuxtApp()` only. See [`useI18n`](/composables/useI18n).

```vue
<script setup lang="ts">
const { t, localePath } = useI18n()
</script>

<template>
  <NuxtLink :to="localePath('/about')">{{ t('nav.about') }}</NuxtLink>
</template>
```

<!-- generated:methods-index — do not edit; run `pnpm run docs:generate` -->

| Helper | Signature | Purpose |
| --- | --- | --- |
| [`$_t`](#_t) | `(route: RouteLocationNormalizedLoaded) => TranslationFn<CleanTranslation>` | Bind `$t` to a specific route, for translating outside the current page — a layout rendering a link to another route, for example. |
| [`$_ts`](#_ts) | `(route: RouteLocationNormalizedLoaded) => TranslationFn<string>` | Bind `$ts` to a specific route. |
| [`$clearCache`](#clearcache) | `() => void` | Drop every cached translation chunk and reload the current page's dictionary. |
| [`$defaultLocale`](#defaultlocale) | `() => string \| undefined` | Code of the configured default locale. |
| [`$getI18nConfig`](#geti18nconfig) | `() => ModuleOptionsExtend` | The resolved module configuration, as the runtime sees it. |
| [`$getLocale`](#getlocale) | `(route?: RouteLocationNormalizedLoaded \| RouteLocationResolvedGeneric) => string` | Code of the active locale. |
| [`$getLocaleName`](#getlocalename) | `() => string \| null` | The active locale's `displayName` from the config, or `null` when it has none. |
| [`$getLocales`](#getlocales) | `() => Locale[]` | Every configured locale, with its metadata. |
| [`$getRouteName`](#getroutename) | `(route?: RouteLocationNormalizedLoaded \| RouteLocationResolvedGeneric, locale?: string) => string` | Route name with the locale prefix stripped — the name translations are keyed by. |
| [`$has`](#has) | `(key: string) => boolean` | Whether a key resolves in the active locale. |
| `$i18nStrategy` | `PathStrategy` | The active routing strategy, resolving locales to and from paths. |
| [`$loadPageTranslations`](#loadpagetranslations) | `(locale: string, routeName: string, translations: Translations) => Promise<void>` | Load translations for a page at runtime, for content whose keys are not known at build time. |
| [`$localePath`](#localepath) | `(to: RouteLocationNamedRaw \| RouteLocationResolvedGeneric \| string, locale?: string) => string` | Resolve a path in the given locale, or the active one. |
| [`$localeRoute`](#localeroute) | `(to: RouteLocationNamedRaw \| RouteLocationResolvedGeneric \| string, locale?: string) => RouteLocationResolved` | Resolve a route in the given locale, or the active one. |
| [`$mergeTranslations`](#mergetranslations) | `(newTranslations: Translations) => void` | Merge translations into the active locale at runtime, overriding what is loaded. |
| [`$resolveTranslations`](#resolvetranslations) | `() => Translations` | Every translation currently in memory for the active locale and route, as a tree. |
| [`$setI18nRouteParams`](#seti18nrouteparams) | `(value: I18nRouteParams) => I18nRouteParams` | Set per-locale params for the current route, so a dynamic segment can differ per language. |
| [`$setMissingHandler`](#setmissinghandler) | `(handler: MissingHandler \| null) => void` | Install a callback invoked for every unresolved key. |
| [`$setTranslation`](#settranslation) | `(key: string, value: unknown) => void` | Replace the value at `key` in the active dictionary. |
| [`$switchLocale`](#switchlocale) | `(locale: string) => Promise<boolean>` | Navigate to the current page in another locale. |
| [`$switchLocalePath`](#switchlocalepath) | `(locale: string) => string` | The path of the current page in another locale, without navigating. |
| [`$switchLocaleRoute`](#switchlocaleroute) | `(locale: string) => RouteLocationRaw` | The route object for the current page in another locale, without navigating. |
| [`$switchRoute`](#switchroute) | `(route: RouteLocationNamedRaw \| RouteLocationResolvedGeneric \| string, toLocale?: string) => Promise<void>` | Navigate to another route, keeping the active locale or switching to `toLocale`. |
| [`$t`](#t) | `TranslationFn<CleanTranslation>` | Translate a key, interpolating `params` into it. |
| [`$tc`](#tc) | `(key: TranslationKey, params: number \| Params, defaultValue?: string) => string` | Translate with pluralization. |
| [`$td`](#td) | `{ (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions): string (value: Date \| number \| string, key: string, overrides?: Intl.DateTimeFormatOptions): string (value: Date \| number \| string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string }` | Format a date with `Intl.DateTimeFormat` in the active locale. |
| [`$tdr`](#tdr) | `(value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string` | Format a date as relative time ("3 days ago") with `Intl.RelativeTimeFormat`. |
| [`$tn`](#tn) | `{ (value: number, options?: Intl.NumberFormatOptions): string (value: number, key: string, overrides?: Intl.NumberFormatOptions): string (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string }` | Format a number with `Intl.NumberFormat` in the active locale. |
| [`$ts`](#ts) | `TranslationFn<string>` | Like `$t`, but always returns a string: the value goes through `toString()`, so a nested object becomes `'[object Object]'`. |

<!-- /generated:methods-index -->

## Locale

### `$getLocale`

<!-- generated:method:$getLocale — do not edit; run `pnpm run docs:generate` -->

```ts
(route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric) => string
```

Code of the active locale. Pass a route to read the locale that route belongs to.

<!-- /generated:method:$getLocale -->

```ts
$getLocale() // 'de' on /de/about
```

### `$getLocaleName`

<!-- generated:method:$getLocaleName — do not edit; run `pnpm run docs:generate` -->

```ts
() => string | null
```

The active locale's `displayName` from the config, or `null` when it has none.

<!-- /generated:method:$getLocaleName -->

### `$getLocales`

<!-- generated:method:$getLocales — do not edit; run `pnpm run docs:generate` -->

```ts
() => Locale[]
```

Every configured locale, with its metadata.

<!-- /generated:method:$getLocales -->

Custom properties on a locale object come back as written; type them with [module augmentation](/api/module-options#locales) of `Locale`.

### `$defaultLocale`

<!-- generated:method:$defaultLocale — do not edit; run `pnpm run docs:generate` -->

```ts
() => string | undefined
```

Code of the configured default locale.

<!-- /generated:method:$defaultLocale -->

### `$getI18nConfig`

<!-- generated:method:$getI18nConfig — do not edit; run `pnpm run docs:generate` -->

```ts
() => ModuleOptionsExtend
```

The resolved module configuration, as the runtime sees it.

<!-- /generated:method:$getI18nConfig -->

The value includes [runtime overrides](/guide/runtime-overrides) (`defaultLocale`, `fallbackLocale`, disabled locales).

```ts
const { strategy, localeCookie } = useNuxtApp().$getI18nConfig()
```

## Translation

### `$t`

<!-- generated:method:$t — do not edit; run `pnpm run docs:generate` -->

```ts
TranslationFn<CleanTranslation>
```

Translate a key, interpolating `params` into it. Returns `defaultValue` when the key is
missing, or the key itself when no default is given.

<!-- /generated:method:$t -->

```ts
// { "welcome": "Welcome, {name}!" }
$t('welcome', { name: 'Ada' }) // 'Welcome, Ada!'
$t('missing.key', {}, 'Fallback') // 'Fallback'
```

A key that points at a nested object returns that object, not a string. In a template it renders as `[object Object]`; use a leaf key.

### `$ts`

<!-- generated:method:$ts — do not edit; run `pnpm run docs:generate` -->

```ts
TranslationFn<string>
```

Like `$t`, but always returns a string: the value goes through `toString()`, so a nested
object becomes `'[object Object]'`. Point the key at a leaf.

<!-- /generated:method:$ts -->

### `$_t` {#_t}

<!-- generated:method:$_t — do not edit; run `pnpm run docs:generate` -->

```ts
(route: RouteLocationNormalizedLoaded) => TranslationFn<CleanTranslation>
```

Bind `$t` to a specific route, for translating outside the current page — a layout rendering
a link to another route, for example.

<!-- /generated:method:$_t -->

```ts
const route = useRoute()
const t = useNuxtApp().$_t(route)
t('page.title')
```

### `$_ts` {#_ts}

<!-- generated:method:$_ts — do not edit; run `pnpm run docs:generate` -->

```ts
(route: RouteLocationNormalizedLoaded) => TranslationFn<string>
```

Bind `$ts` to a specific route. See `$_t`.

<!-- /generated:method:$_ts -->

### `$tc`

<!-- generated:method:$tc — do not edit; run `pnpm run docs:generate` -->

```ts
(key: TranslationKey, params: number | Params, defaultValue?: string) => string
```

Translate with pluralization. `params` may be the count itself, or an object containing
`count`.

<!-- /generated:method:$tc -->

Forms are separated by `|`. With the built-in rule a whole count `n` picks form `n` (the last form past the end); a negative or fractional count takes the last form. `{count}` and the other params are interpolated into the picked form. For other languages set [`plural`](/api/module-options#plural).

```ts
// { "apples": "no apples | one apple | {count} apples" }
$tc('apples', 0) // 'no apples'
$tc('apples', 10) // '10 apples'
$tc('cart', { count: 2, name: 'Ada' }) // count and params in one object
```

The third argument is `defaultValue`, not params.

### `$has`

<!-- generated:method:$has — do not edit; run `pnpm run docs:generate` -->

```ts
(key: string) => boolean
```

Whether a key resolves in the active locale. Use it to branch on optional copy instead of
rendering a raw key. Like `$t`, it also sees the leaving page's keys during a same-locale
page transition.

<!-- /generated:method:$has -->

```ts
if ($has('promo.banner')) show.value = true
```

## Formatting

### `$tn`

<!-- generated:method:$tn — do not edit; run `pnpm run docs:generate` -->

```ts
{ (value: number, options?: Intl.NumberFormatOptions): string (value: number, key: string, overrides?: Intl.NumberFormatOptions): string (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string }
```

Format a number with `Intl.NumberFormat` in the active locale. A key selects a named format
from the config.

<!-- /generated:method:$tn -->

Named formats come from [`numberFormats`](/api/module-options#numberformats).

```ts
$tn(1234.5, { style: 'currency', currency: 'EUR' }) // '1.234,50 €' in de
$tn(1000, 'currency') // named format
$tn(1000, 'currency', 'de') // named format in another locale
```

### `$td`

<!-- generated:method:$td — do not edit; run `pnpm run docs:generate` -->

```ts
{ (value: Date | number | string, options?: Intl.DateTimeFormatOptions): string (value: Date | number | string, key: string, overrides?: Intl.DateTimeFormatOptions): string (value: Date | number | string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string }
```

Format a date with `Intl.DateTimeFormat` in the active locale. A key selects a named format
from the config.

<!-- /generated:method:$td -->

Named formats come from [`datetimeFormats`](/api/module-options#datetimeformats).

```ts
$td(new Date(), { dateStyle: 'long' })
$td(post.createdAt, 'short')
```

### `$tdr`

<!-- generated:method:$tdr — do not edit; run `pnpm run docs:generate` -->

```ts
(value: Date | number | string, options?: Intl.RelativeTimeFormatOptions) => string
```

Format a date as relative time ("3 days ago") with `Intl.RelativeTimeFormat`.

<!-- /generated:method:$tdr -->

```ts
$tdr(Date.now() - 5 * 60_000) // '5 minutes ago' in en
```

## Switching and links

### `$switchLocale`

<!-- generated:method:$switchLocale — do not edit; run `pnpm run docs:generate` -->

```ts
(locale: string) => Promise<boolean>
```

Navigate to the current page in another locale. Under `no_prefix` and hash mode it loads the
locale's translations before navigating; under `no_prefix` the route is replaced in place (no
new history entry). An unknown locale is ignored.
The call is async: `await` it to run code after the navigation. It resolves `true` when the
locale's dictionary is active, `false` when it is not: the chunk failed to load (the current
dictionary stays; call it again to retry) or a newer switch won.

<!-- /generated:method:$switchLocale -->

```ts
await $switchLocale('de')
```

### `$switchLocalePath`

<!-- generated:method:$switchLocalePath — do not edit; run `pnpm run docs:generate` -->

```ts
(locale: string) => string
```

The path of the current page in another locale, without navigating.

<!-- /generated:method:$switchLocalePath -->

```vue
<NuxtLink :to="$switchLocalePath('de')">Deutsch</NuxtLink>
```

### `$switchLocaleRoute`

<!-- generated:method:$switchLocaleRoute — do not edit; run `pnpm run docs:generate` -->

```ts
(locale: string) => RouteLocationRaw
```

The route object for the current page in another locale, without navigating. Under
`trailingSlash` its `path` and `fullPath` follow the rule, while a push by `name` does not:
link with `$switchLocalePath` there.

<!-- /generated:method:$switchLocaleRoute -->

### `$switchRoute`

<!-- generated:method:$switchRoute — do not edit; run `pnpm run docs:generate` -->

```ts
(route: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, toLocale?: string) => Promise<void>
```

Navigate to another route, keeping the active locale or switching to `toLocale`. Async like
`$switchLocale`.

<!-- /generated:method:$switchRoute -->

```ts
$switchRoute('/about') // active locale
$switchRoute({ name: 'about' }, 'de') // switch to de
```

### `$localePath`

<!-- generated:method:$localePath — do not edit; run `pnpm run docs:generate` -->

```ts
(to: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, locale?: string) => string
```

Resolve a path in the given locale, or the active one. A string with an `http(s):`, `mailto:`
or `tel:` scheme comes back as is: do not pass user input as a link target unchecked.

<!-- /generated:method:$localePath -->

A string path is read as the page it shows, so a locale's custom path is applied too.

```ts
$localePath('/about') // '/about' in en, '/de/ueber-uns' in de with localeRoutes
$localePath({ name: 'about' }, 'fr') // '/fr/about'
```

### `$localeRoute`

<!-- generated:method:$localeRoute — do not edit; run `pnpm run docs:generate` -->

```ts
(to: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, locale?: string) => RouteLocationResolved
```

Resolve a route in the given locale, or the active one.

<!-- /generated:method:$localeRoute -->

### `$getRouteName`

<!-- generated:method:$getRouteName — do not edit; run `pnpm run docs:generate` -->

```ts
(route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric, locale?: string) => string
```

Route name with the locale prefix stripped — the name translations are keyed by.

<!-- /generated:method:$getRouteName -->

```ts
$getRouteName() // 'about' on /de/about
```

## Page config

### `$defineI18nRoute`

<!-- generated:method:$defineI18nRoute — do not edit; run `pnpm run docs:generate` -->

```ts
(routeDefinition: DefineI18nRouteConfig) => Promise<void>
```

Register per-page locale configuration and translations from inside a component.
Merges into the active locale and re-applies when the locale changes.

<!-- /generated:method:$defineI18nRoute -->

Call it in a page's `<script setup>`, always destructured from `useNuxtApp()`. The build reads `locales`, `localeRoutes` and `disableMeta` from the call; at runtime only `locales` matters (inline translations are merged for the active locale). Full rules: [Page config](/guide/per-component-translations).

```vue
<script setup lang="ts">
const { $defineI18nRoute } = useNuxtApp()

$defineI18nRoute({
  locales: ['en', 'de'],
  localeRoutes: { en: '/about', de: '/ueber-uns' },
})
</script>
```

### `$setI18nRouteParams`

<!-- generated:method:$setI18nRouteParams — do not edit; run `pnpm run docs:generate` -->

```ts
(value: I18nRouteParams) => I18nRouteParams
```

Set per-locale params for the current route, so a dynamic segment can differ per language.
Call it during SSR, before the head is rendered.

<!-- /generated:method:$setI18nRouteParams -->

The params are cleared when the route name changes. Details: [Localized paths](/guide/custom-locale-routes).

```ts
$setI18nRouteParams({
  en: { slug: 'my-post' },
  de: { slug: 'mein-beitrag' },
})
```

## Runtime translations

### `$mergeTranslations`

<!-- generated:method:$mergeTranslations — do not edit; run `pnpm run docs:generate` -->

```ts
(newTranslations: Translations) => void
```

Merge translations into the active locale at runtime, overriding what is loaded.

<!-- /generated:method:$mergeTranslations -->

Deep-merges into the active locale's current page chunk; keys it does not mention survive.

```ts
$mergeTranslations({ banner: { title: 'Sale' } })
```

### `$setTranslation`

<!-- generated:method:$setTranslation — do not edit; run `pnpm run docs:generate` -->

```ts
(key: string, value: unknown) => void
```

Replace the value at `key` in the active dictionary. This is a replace, not a merge —
use `$mergeTranslations` when existing siblings should survive.

<!-- /generated:method:$setTranslation -->

```ts
$setTranslation('banner', { title: 'Sale' }) // drops other keys under banner
$setTranslation('banner.title', 'Sale') // dotted path
```

### `$loadPageTranslations`

<!-- generated:method:$loadPageTranslations — do not edit; run `pnpm run docs:generate` -->

```ts
(locale: string, routeName: string, translations: Translations) => Promise<void>
```

Load translations for a page at runtime, for content whose keys are not known at build time.

<!-- /generated:method:$loadPageTranslations -->

Merges into the in-memory `(locale, routeName)` chunk; no payload is fetched, so a chunk that is not loaded starts from these translations alone. The screen updates when that chunk is active.

```ts
await $loadPageTranslations('en', 'about', { title: 'About us' })
```

### `$resolveTranslations`

<!-- generated:method:$resolveTranslations — do not edit; run `pnpm run docs:generate` -->

```ts
() => Translations
```

Every translation currently in memory for the active locale and route, as a tree.
Read-only view of what `$t()` can resolve right now.

<!-- /generated:method:$resolveTranslations -->

Treat the result as read-only.

### `$setMissingHandler`

<!-- generated:method:$setMissingHandler — do not edit; run `pnpm run docs:generate` -->

```ts
(handler: MissingHandler | null) => void
```

Install a callback invoked for every unresolved key. Pass `null` to remove it.

<!-- /generated:method:$setMissingHandler -->

The handler runs instead of the dev warning.

```ts
$setMissingHandler((locale, key, routeName) => {
  console.error(`[i18n] missing ${key} in ${locale} (${routeName})`)
})
```

### `$clearCache`

<!-- generated:method:$clearCache — do not edit; run `pnpm run docs:generate` -->

```ts
() => void
```

Drop every cached translation chunk and reload the current page's dictionary. The page
keeps showing its current translations until the fresh ones arrive. Dev HMR calls it on
every translation file change.

<!-- /generated:method:$clearCache -->

```ts
const { clearCache } = useI18n()
clearCache()
```

A failed reload keeps the current dictionary.

## Related

- [`useI18n`](/composables/useI18n) — the same helpers in `<script setup>`
- [Module options](/api/module-options) — configuration the helpers read
- [Hooks](/api/events) — add translations from a plugin
- [Server routes](/guide/server-side-translations) — translations in Nitro handlers
