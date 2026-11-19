# Helpers

The module injects its runtime helpers into the Nuxt app: `$t`, `$tc`, `$localePath`, `$switchLocale` and the rest. Use this page to look up a helper's signature and behaviour. Signatures and descriptions come from the `PluginsInjections` and `NuxtAppOnlyInjections` interfaces in `src/runtime/plugins/01.plugin.ts`.

## Access

- **Template** — ``: every helper, with the `$`.
- **<script setup>** — `const { t, localePath } = useI18n()`: every helper in `PluginsInjections`, with and without the `$`.
- **Plugin, middleware, <script setup>** — `const { $t, $defineI18nRoute } = useNuxtApp()`: everything, `$` only.

`$defineI18nRoute` is typed on `useNuxtApp()` only. See [`useI18n`](/composables/useI18n).

```vue
<script setup lang="ts">
const { t, localePath } = useI18n()
</script>

<template>
  <NuxtLink :to="localePath('/about')">{{ t('nav.about') }}</NuxtLink>
</template>
```

- [`$_t`](#_t) — Bind `$t` to a specific route, for translating outside the current page — a layout rendering a link to another route, for example.
- [`$_ts`](#_ts) — Bind `$ts` to a specific route.
- [`$clearCache`](#clearcache) — Drop every cached translation chunk and reload the current page's dictionary.
- [`$defaultLocale`](#defaultlocale) — Code of the configured default locale.
- [`$getI18nConfig`](#geti18nconfig) — The resolved module configuration, as the runtime sees it.
- [`$getLocale`](#getlocale) — Code of the active locale.
- [`$getLocaleName`](#getlocalename) — The active locale's `displayName` from the config, or `null` when it has none.
- [`$getLocales`](#getlocales) — Every configured locale, with its metadata.
- [`$getRouteName`](#getroutename) — Route name with the locale prefix stripped — the name translations are keyed by.
- [`$has`](#has) — Whether a key resolves in the active locale.
- `$i18nStrategy` — The active routing strategy, resolving locales to and from paths.
- [`$loadPageTranslations`](#loadpagetranslations) — Load translations for a page at runtime, for content whose keys are not known at build time.
- [`$localePath`](#localepath) — Resolve a path in the given locale, or the active one.
- [`$localeRoute`](#localeroute) — Resolve a route in the given locale, or the active one.
- [`$mergeTranslations`](#mergetranslations) — Merge translations into the active locale at runtime, overriding what is loaded.
- `$pluralFunc` — The plural rule `$tc` uses: `<i18n-t>` asks for it to pick a form from the raw translation.
- `$pluralLocale` — The tag `$tc` plurals by: the locale's `iso` when it has one, else its code.
- [`$resolveTranslations`](#resolvetranslations) — Every translation currently in memory for the active locale and route, as a tree.
- [`$setI18nRouteParams`](#seti18nrouteparams) — Set per-locale params for the current route, so a dynamic segment can differ per language.
- [`$setMissingHandler`](#setmissinghandler) — Install a callback invoked for every unresolved key.
- [`$setTranslation`](#settranslation) — Replace the value at `key` in the active dictionary.
- [`$switchLocale`](#switchlocale) — Navigate to the current page in another locale.
- [`$switchLocalePath`](#switchlocalepath) — The path of the current page in another locale, without navigating.
- [`$switchLocaleRoute`](#switchlocaleroute) — The route object for the current page in another locale, without navigating, or a URL string for a locale on its own `baseUrl`.
- [`$switchRoute`](#switchroute) — Navigate to another route, keeping the active locale or switching to `toLocale`.
- [`$t`](#t) — Translate a key, interpolating `params` into it.
- [`$tc`](#tc) — Translate with pluralization.
- [`$td`](#td) — Format a date with `Intl.DateTimeFormat` in the active locale.
- [`$tdr`](#tdr) — Format a date as relative time ("3 days ago") with `Intl.RelativeTimeFormat`.
- [`$tn`](#tn) — Format a number with `Intl.NumberFormat` in the active locale.
- [`$ts`](#ts) — Like `$t`, but always returns a string: the value goes through `toString()`, so a nested object becomes `'[object Object]'`.

## Locale

### `$getLocale`

```ts
(route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric) => string
```

Code of the active locale. Pass a route to read the locale that route belongs to.

```ts
$getLocale() // 'de' on /de/about
```

### `$getLocaleName`

```ts
() => string | null
```

The active locale's `displayName` from the config, or `null` when it has none.

### `$getLocales`

```ts
() => Locale[]
```

Every configured locale, with its metadata.

Custom properties on a locale object come back as written; type them with [module augmentation](/api/module-options#locales) of `Locale`.

### `$defaultLocale`

```ts
() => string | undefined
```

Code of the configured default locale.

### `$getI18nConfig`

```ts
() => ResolvedI18nConfig
```

The resolved module configuration, as the runtime sees it.

The value includes [runtime overrides](/guide/runtime-overrides) (`defaultLocale`, `fallbackLocale`, disabled locales).

```ts
const { strategy, localeCookie } = useNuxtApp().$getI18nConfig()
```

## Translation

### `$t`

```ts
TranslationFn<CleanTranslation>
```

Translate a key, interpolating `params` into it. Returns `defaultValue` when the key is
missing, or the key itself when no default is given.

```ts
// { "welcome": "Welcome, {name}!" }
$t('welcome', { name: 'Ada' }) // 'Welcome, Ada!'
$t('missing.key', {}, 'Fallback') // 'Fallback'
```

A key that points at a nested object returns that object, not a string. In a template it renders as `[object Object]`; use a leaf key.

### `$ts`

```ts
TranslationFn<string>
```

Like `$t`, but always returns a string: the value goes through `toString()`, so a nested
object becomes `'[object Object]'`. Point the key at a leaf.

### `$_t`

```ts
(route: RouteLocationNormalizedLoaded) => TranslationFn<CleanTranslation>
```

Bind `$t` to a specific route, for translating outside the current page — a layout rendering
a link to another route, for example.

```ts
const route = useRoute()
const t = useNuxtApp().$_t(route)
t('page.title')
```

### `$_ts`

```ts
(route: RouteLocationNormalizedLoaded) => TranslationFn<string>
```

Bind `$ts` to a specific route. See `$_t`.

### `$tc`

```ts
(key: TranslationKey, params: number | Params, defaultValue?: string) => string
```

Translate with pluralization. `params` may be the count itself, or an object containing
`count`.

Forms are separated by `|`. With the built-in rule a non-negative integer count `n` picks form `n`, clamped to the last form; a negative, fractional or `NaN` count takes the last form. `{count}` and the other params are interpolated into the picked form.

For languages whose plurals do not follow the count, start the template with `=0 `. The first form is then for 0, and the others go by [`Intl.PluralRules`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules) category, in the order `zero, one, two, few, many, other`:

```json
{
  "apples": "=0 no apples | one apple | {count} apples",
  "files": "=0 no files | {count} one | {count} few | {count} many"
}
```

```ts
$tc('apples', 0) // 'no apples'
$tc('apples', 1) // 'one apple'
$tc('apples', 7) // '7 apples'

// In `uk` (categories `one, few, many, other`) the forms after the zero form follow those categories:
$tc('files', 21) // '21 one'
$tc('files', 22) // '22 few'
$tc('files', 25) // '25 many'
$tc('files', 2.5) // '2.5 many': no form for `other`, so the last one
```

- `=0 ` counts only at the very start of the value, with the space. `$t` shows it as text: it belongs to plurals.
- A category with no form of its own takes the last form. A negative or fractional count takes the last form too.
- It works in any locale: `=0 none | one | {count} many` in English.
- The category comes from the locale's `iso`, else its code. A code `Intl` does not know falls back to the index rule, the marker still removed, so the result never depends on the machine.
- `<i18n-t :plural>` follows the same rule. A custom [`plural`](/api/module-options#plural) or `customPluralRule` gets the raw value, marker included, and decides for itself; `plural` returning `null` hands the call back to the built-in rule, which honours the marker.

Without the marker a template stays on the index rule, with one exception that only reads one way: a zero form with no placeholder, then one form per category, with `{count}` in each form several counts share (`no files | {count} one | {count} few | {count} many` in `uk`).

For rules of your own set [`plural`](/api/module-options#plural).

```ts
// { "apples": "no apples | one apple | {count} apples" }
$tc('apples', 0) // 'no apples'
$tc('apples', 10) // '10 apples'
$tc('cart', { count: 2, name: 'Ada' }) // count and params in one object
```

The third argument is `defaultValue`, not params.

### `$has`

```ts
(key: string) => boolean
```

Whether a key resolves in the active locale. Use it to branch on optional copy instead of
rendering a raw key. Like `$t`, it also sees the leaving page's keys during a same-locale
page transition.

```ts
if ($has('promo.banner')) show.value = true
```

## Formatting

### `$tn`

```ts
{ (value: number, options?: Intl.NumberFormatOptions): string (value: number, key: string, overrides?: Intl.NumberFormatOptions): string (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string }
```

Format a number with `Intl.NumberFormat` in the active locale. A key selects a named format
from the config.

Named formats come from [`numberFormats`](/api/module-options#numberformats).

```ts
$tn(1234.5, { style: 'currency', currency: 'EUR' }) // '1.234,50 €' in de
$tn(1000, 'currency') // named format
$tn(1000, 'currency', 'de') // named format in another locale
```

### `$td`

```ts
{ (value: Date | number | string, options?: Intl.DateTimeFormatOptions): string (value: Date | number | string, key: string, overrides?: Intl.DateTimeFormatOptions): string (value: Date | number | string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string }
```

Format a date with `Intl.DateTimeFormat` in the active locale. A key selects a named format
from the config.

Named formats come from [`datetimeFormats`](/api/module-options#datetimeformats).

```ts
$td(new Date(), { dateStyle: 'long' })
$td(post.createdAt, 'short')
```

### `$tdr`

```ts
(value: Date | number | string, options?: Intl.RelativeTimeFormatOptions) => string
```

Format a date as relative time ("3 days ago") with `Intl.RelativeTimeFormat`.

```ts
$tdr(Date.now() - 5 * 60_000) // '5 minutes ago' in en
```

## Switching and links

### `$switchLocale`

```ts
(locale: string) => Promise<boolean>
```

Navigate to the current page in another locale. Under `no_prefix` and hash mode it loads the
locale's translations before navigating; under `no_prefix` the route is replaced in place (no
new history entry). An unknown locale is ignored.
The call is async: `await` it to run code after the navigation. It resolves `true` when the
locale's dictionary is active, `false` when it is not: the chunk failed to load (the current
dictionary stays; call it again to retry) or a newer switch won.

```ts
await $switchLocale('de')
```

### `$switchLocalePath`

```ts
(locale: string) => string
```

The path of the current page in another locale, without navigating.

```vue
<NuxtLink :to="$switchLocalePath('de')">Deutsch</NuxtLink>
```

### `$switchLocaleRoute`

```ts
(locale: string) => RouteLocationRaw
```

The route object for the current page in another locale, without navigating, or a URL string
for a locale on its own `baseUrl`. Under `trailingSlash` the object has `path` and `fullPath`,
following the rule, with the `query` and `hash` as they are, and `router.push` or a link keeps them.

### `$switchRoute`

```ts
(route: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, toLocale?: string) => Promise<void>
```

Navigate to another route, keeping the active locale or switching to `toLocale`. Async like
`$switchLocale`.

```ts
$switchRoute('/about') // active locale
$switchRoute({ name: 'about' }, 'de') // switch to de
```

### `$localePath`

```ts
(to: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, locale?: string) => string
```

Resolve a path in the given locale, or the active one. A string with an `http(s):`, `mailto:`
or `tel:` scheme comes back as is: do not pass user input as a link target unchecked.

A string path is read as the page it shows, so a locale's custom path is applied too.

```ts
$localePath('/about') // '/about' in en, '/de/ueber-uns' in de with localeRoutes
$localePath({ name: 'about' }, 'fr') // '/fr/about'
```

### `$localeRoute`

```ts
(to: RouteLocationNamedRaw | RouteLocationResolvedGeneric | string, locale?: string) => RouteLocationResolved
```

Resolve a route in the given locale, or the active one. A plain object, safe to keep in state. When a param needs
escaping it has `path`, `fullPath`, `query` and `hash` but no `name` or `params`: the path is what gives the router
the encoded URL. For a locale on another domain `path` and `fullPath` are absolute, which the router cannot take:
such a link goes through `<i18n-link>`, or `$localePath`.

### `$getRouteName`

```ts
(route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric, locale?: string) => string
```

Route name with the locale prefix stripped — the name translations are keyed by.

```ts
$getRouteName() // 'about' on /de/about
```

## Page config

### `$defineI18nRoute`

```ts
(routeDefinition: DefineI18nRouteConfig | false) => Promise<void>
```

Register per-page locale configuration and translations from inside a component.
Merges into the active locale and re-applies when the locale changes.

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

```ts
(value: I18nRouteParams) => I18nRouteParams
```

Set per-locale params for the current route, so a dynamic segment can differ per language.
Call it during SSR, before the head is rendered.

The params are cleared when a navigation to another path commits, including `/news/1` to `/news/4`, which keeps the route name. Details: [Localized paths](/guide/custom-locale-routes).

```ts
$setI18nRouteParams({
  en: { slug: 'my-post' },
  de: { slug: 'mein-beitrag' },
})
```

## Runtime translations

### `$mergeTranslations`

```ts
(newTranslations: Translations) => void
```

Merge translations into the active locale at runtime, overriding what is loaded.

Deep-merges into the active locale's current page chunk; keys it does not mention survive.

```ts
$mergeTranslations({ banner: { title: 'Sale' } })
```

### `$setTranslation`

```ts
(key: string, value: unknown) => void
```

Replace the value at `key` in the active dictionary. This is a replace, not a merge —
use `$mergeTranslations` when existing siblings should survive.

```ts
$setTranslation('banner', { title: 'Sale' }) // drops other keys under banner
$setTranslation('banner.title', 'Sale') // dotted path
```

### `$loadPageTranslations`

```ts
(locale: string, routeName: string, translations: Translations) => Promise<void>
```

Load translations for a page at runtime, for content whose keys are not known at build time.

Merges into the in-memory `(locale, routeName)` chunk, and the screen updates when that chunk is active. No payload is fetched here: for a page not loaded yet the translations wait, and when its file loads they stay on top of it.

```ts
await $loadPageTranslations('en', 'about', { title: 'About us' })
```

### `$resolveTranslations`

```ts
() => Translations
```

Every translation currently in memory for the active locale and route, as a tree.
Read-only view of what `$t()` can resolve right now.

Treat the result as read-only.

### `$setMissingHandler`

```ts
(handler: MissingHandler | null) => void
```

Install a callback invoked for every unresolved key. Pass `null` to remove it.

The handler runs instead of the dev warning.

```ts
$setMissingHandler((locale, key, routeName) => {
  console.error(`[i18n] missing ${key} in ${locale} (${routeName})`)
})
```

### `$clearCache`

```ts
() => void
```

Drop every cached translation chunk and reload the current page's dictionary. The page
keeps showing its current translations until the fresh ones arrive. Dev HMR calls it on
every translation file change.

```ts
const { clearCache } = useI18n()
clearCache()
```

A failed reload keeps the current dictionary.

## Related

<card-group>
<card icon="i-lucide-braces" title="useI18n" to="/composables/useI18n">

The same helpers in `<script setup>`

</card>

<card icon="i-lucide-braces" title="Module options" to="/api/module-options">

Configuration the helpers read

</card>

<card icon="i-lucide-braces" title="Hooks" to="/api/events">

Add translations from a plugin

</card>

<card icon="i-lucide-book-open" title="Server routes" to="/guide/server-side-translations">

Translations in Nitro handlers

</card>
</card-group>
