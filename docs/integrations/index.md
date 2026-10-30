---
title: 'Frameworks'
description: 'Which @i18n-micro package to use outside Nuxt, and the instance, router adapter and component model they share.'
outline: 'deep'
---

# Frameworks

The `@i18n-micro/*` packages bring the translation core of Nuxt I18n Micro to Vue, React, Preact, Solid, Astro, VitePress and plain JavaScript. Use them when your app is not a Nuxt app, or when a script or server outside Nuxt needs the same translation files. Every package shares one instance model, one router adapter contract and the same four components, described once on this page.

## Packages

| Stack | Package | Page |
| --- | --- | --- |
| Vue 3 SPA | `@i18n-micro/vue` (+ `@i18n-micro/vue/router`) | [Vue](./vue-package) |
| React | `@i18n-micro/react` (+ `@i18n-micro/react/router`) | [React and Preact](./react-package) |
| Preact | `@i18n-micro/preact` | [React and Preact](./react-package#preact) |
| SolidJS | `@i18n-micro/solid` (+ `@i18n-micro/solid/router`) | [Solid](./solid-package) |
| Astro (SSR, islands) | `@i18n-micro/astro` | [Astro](./astro-package), [Astro islands](./astro-islands) |
| VitePress | `@i18n-micro/vitepress` | [VitePress](./vitepress-package) |
| Browser or edge, no framework | `@i18n-micro/runtime` | [Runtime](./runtime-package) |
| Node.js server, CLI | `@i18n-micro/node` | [Node.js](./nodejs-package) |
| Typed keys (Vite or Nuxt) | `@i18n-micro/types-generator` | [Types generator](./types-generator) |
| Translation editor in dev | `@i18n-micro/devtools-ui` | [DevTools UI](./devtools-ui-package) |

`@i18n-micro/core`, `@i18n-micro/types` and `@i18n-micro/utils` are installed with these packages; you rarely import them directly. Signatures of every export are on the generated [package reference](/api/packages).

Each package has a playground under `packages/<name>/playground` in the repository.

## The instance {#create-i18n-options}

`createI18n(options)` returns one instance that holds the dictionaries, the current locale and the current route. The options are the same in every package:

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `locale` | `string` | required | Active locale. |
| `fallbackLocale` | `string` | `locale` | Looked up when a key is missing in `locale`. |
| `messages` | `Record<locale, Translations>` | `{}` | Root dictionaries (`'index'` route). |
| `routeMessages` | `Record<route, Record<locale, Translations>>` | `{}` | Route dictionaries. Runtime, React, Preact, Node and VitePress only. |
| `plural` | `PluralFunc` | `defaultPlural` | Custom plural rule. |
| `missingWarn` | `boolean` | `true` | Dev-only `console.warn` in the browser for a missing key. |
| `missingHandler` | `(locale, key, routeName) => void` | — | Called instead of the warning. |
| `numberFormats` | `Record<locale, Record<name, Intl.NumberFormatOptions>>` | — | Named formats: `tn(9.5, 'currency')`. |
| `datetimeFormats` | `Record<locale, Record<name, Intl.DateTimeFormatOptions>>` | — | Named formats: `td(date, 'short')`. |
| `timeZone` | `string` | runtime's zone | IANA zone for dates. Set it so server and browser render one date. |
| `now` | `() => number` | `Date.now` | The clock of `tdr`. Hand hydration the server's time so both render one text. |
| `localeIso` | `Record<code, string>` | — | BCP 47 tag of a locale code that is none (`ua` → `uk-UA`), for plurals. React, Preact and Solid take it from `iso` in the provider's `locales`. |

The dictionaries live in `i18n.storage.translations`, a `Map` keyed `locale:route` (`en:index`, `en:about`).

A key is looked up in the current route's dictionary, then in the root dictionary, first for `locale`, then for `fallbackLocale`. A missing key returns the key itself (or the `defaultValue` you pass).

```ts
i18n.addTranslations('en', { nav: { home: 'Home' } }) // root, deep-merged
i18n.addRouteTranslations('en', 'about', { title: 'About us' }) // route chunk
i18n.addTranslations('en', { nav: { home: 'Start' } }, false) // replace instead of merge
i18n.setRoute('about')
i18n.t('title') // 'About us'
i18n.t('nav.home') // 'Start' (root key, still visible on the route)
```

### Translate and format

| Method | Returns |
| --- | --- |
| `t(key, params?, defaultValue?, routeName?)` | The value (string, number, object) with `{param}` interpolated. |
| `ts(...)` | Same as `t`, as a string. |
| `tc(key, count \| params, defaultValue?)` | Plural form. |
| `tn(value, options \| name)` | `Intl.NumberFormat` in the active locale. |
| `td(value, options \| name)` | `Intl.DateTimeFormat`. |
| `tdr(value, options?)` | Relative time (`3 days ago`). |
| `has(key, routeName?)` | `true` when the active locale has the key (route or root dictionary; the fallback is not checked). |

`defaultPlural` splits the value on `|` and picks the form at index `count`, clamped to the last one; a negative, fractional or `NaN` count picks the last form.

A custom `plural` receives `(key, count, params, locale, getter)`. Read the value through `getter(key)`; do not split the key:

```ts
import type { PluralFunc } from '@i18n-micro/vue'

const plural: PluralFunc = (key, count, params, _locale, getter) => {
  const value = getter(key)
  if (typeof value !== 'string') return null
  const forms = value.split('|').map((form) => form.trim())
  return (count === 1 ? forms[0] : forms[1] ?? forms[0])!.replace('{count}', String(count))
}
```

## Router adapter

The SPA packages do not depend on a router. A router adapter (`I18nRoutingStrategy`) tells them how to read the current path, navigate and build a localized path. The built-in adapters prefix every locale except `defaultLocale` (`/about`, `/de/about`).

| Member | Required | Used by |
| --- | --- | --- |
| `getCurrentPath(): string` | yes | active link check (by page, query and hash do not count), `switchLocale` (keeps them) |
| `push({ path }): void` | yes | `switchLocale`, `<I18nLink>` without `linkComponent`, `<I18nSwitcher>` |
| `replace({ path }): void` | yes | — |
| `resolvePath(to, locale)` | no | `localePath`, `localeRoute`, `<I18nLink>`; without it paths are returned as is |
| `linkComponent` | no | `<I18nLink>` renders it (e.g. `RouterLink`) instead of `<a>` |
| `getRoute()` | no | `{ fullPath, query }` for SEO helpers |

`push` and `replace` are required in Vue, React, Preact and Solid. Astro has its own, server-side adapter with optional `push`/`replace` (see [Astro](./astro-package#router-adapter)).

A minimal adapter for any history-based router:

```ts
import type { I18nRoutingStrategy } from '@i18n-micro/react'

const locales = ['en', 'de']
const stripLocale = (path: string) => path.replace(/^\/(en|de)(?=\/|$)/, '') || '/'

export const historyAdapter: I18nRoutingStrategy = {
  getCurrentPath: () => window.location.pathname + window.location.search + window.location.hash,
  push: ({ path }) => window.history.pushState({}, '', path),
  replace: ({ path }) => window.history.replaceState({}, '', path),
  resolvePath: (to, locale) => {
    const path = stripLocale(typeof to === 'string' ? to : to.path || '/')
    return locale === 'en' ? path : `/${locale}${path === '/' ? '' : path}`
  },
}
```

## Components

Vue, React, Preact and Solid ship the same four components. Their props match; React, Preact and Solid pass other props through to the root element.

### `<I18nT>`

| Prop | Type | Notes |
| --- | --- | --- |
| `keypath` | `string` | required |
| `params` | `object` | interpolation values |
| `plural` | `number \| string` | renders `tc(keypath, count)` |
| `number` | `number \| string` | passes `tn(number)` as `{number}` |
| `date` | `Date \| string \| number` | passes `td(date)` as `{date}` |
| `relativeDate` | `Date \| string \| number` | passes `tdr(relativeDate)` as `{relativeDate}` |
| `tag` | `string` | wrapper element, default `span` |
| `html` | `boolean` | render the translation as HTML; it must be trusted, params are escaped |
| `defaultValue` | `string` | stands in for a missing key, and is rendered bare when `hideIfEmpty` hides an empty value |
| `hideIfEmpty` | `boolean` | render nothing for an empty translation |
| `customPluralRule` | `PluralFunc` | plural rule for this element |

Only one formatting prop applies, checked in this order: `number`, `date`, `relativeDate`, `plural`.

#### Rich text

A `{placeholder}` can hold an element. In Vue it is a named slot; in React, Preact and Solid the `components` prop gives elements, or functions returning one, by name. Either way it beats a param of the same name, works in every branch, and survives a locale that reorders the placeholders.

```tsx
// { "terms": "I accept the {link} of {company}" }
<I18nT keypath="terms" params={{ company: 'ACME' }} components={{ link: <a href="/terms">terms</a> }} />
```

In Solid pass a function when a placeholder repeats: one node stands in one place. `children` replace the text, as a function they get `{ translation }`, like Vue's default slot. `html` ignores all of these.

### `<I18nLink>`

| Prop | Type | Notes |
| --- | --- | --- |
| `to` | `string \| { path }` | localized through the adapter's `resolvePath` |
| `activeStyle` | style object | merged over `style` when the link is the current page or a section above it |
| `localeRoute` | function | overrides `resolvePath` for this link |

External URLs (`https://`, `mailto:`, `tel:`) render as `<a target="_blank" rel="noopener noreferrer">`; a `target` or `rel` of your own wins. `onClick` always runs. A modified click, another mouse button or a `target` stays with the browser.

### `<I18nSwitcher>`

A dropdown of enabled locales (`disabled: true` locales are hidden) with inline default styles. Its items are links, with `lang`, `hreflang` and `dir` from the locale. Clicking one sets the locale and calls the adapter's `push` with the localized current path; Escape or a click outside closes it.

| Prop | Notes |
| --- | --- |
| `locales`, `currentLocale`, `getLocaleName` | override the provided values |
| `switchLocale(code)` | replaces the built-in switch |
| `localeRoute` | replaces `resolvePath` |
| `customLabels` | `{ de: 'DE' }` |
| `customWrapperStyle`, `customButtonStyle`, `customDropdownStyle`, `customItemStyle`, `customLinkStyle`, `customActiveLinkStyle`, `customDisabledLinkStyle`, `customIconStyle` | style overrides |

### `<I18nGroup>`

A `<div class="i18n-group">` that hands a prefixed `t` to its children. It does **not** prefix `<I18nT>` or `t()` calls inside it; only the `t` it passes down is prefixed.

| Prop | Notes |
| --- | --- |
| `prefix` | required, e.g. `'profile'` |
| `groupClass` | extra class on the wrapper |

The prefixed `t` comes through a scoped slot in Vue (`v-slot="{ t }"`) and a render-prop child in React, Preact and Solid (`{({ t }) => …}`).

## Typed keys

`t()` accepts any string. To get autocomplete for your keys, generate a declaration with the [types generator](./types-generator). Keys are suggested, not enforced, and params are not typed.

## Compared with the Nuxt module

The packages have no file-based routing, no server middleware and no translation loader: you decide when to load JSON (`import`, `fetch`, or `@i18n-micro/node` on the server) and which router adapter to use. Locale detection, SEO meta and route generation are Nuxt features; Astro has its own middleware for detection and `useLocaleHead` for SEO.

## Related

- [Package reference](/api/packages) — every export and signature
- [Translations](/guide/translations) — the file layout these packages read
- [Getting started with Nuxt](/guide/getting-started)
