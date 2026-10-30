---
title: 'Upgrading'
description: 'Breaking changes when upgrading nuxt-i18n-micro: the release after 3.30.2, and v2 to v3.'
outline: [2, 3]
---

# Upgrading

This page lists what changes for your app when you upgrade nuxt-i18n-micro and its `@i18n-micro/*` packages. Read the section for the version you come from before you bump the dependency. Each item says what changed and what to do; most apps need no code change.

::: tip Coming from `@nuxtjs/i18n`?
See [Migrating from @nuxtjs/i18n](/guide/migration).
:::

## After 3.30.2: routing, core, translations and detection rewrite

The module's public API (options, `$t`/`$localePath`/`$switchLocale`…, components, composables, server utilities) keeps its signatures. What changed is behaviour, mostly bugs fixed. The adapter packages have a few real breaks: see [Framework packages](#framework-packages).

### Requirements

- **Nuxt 3.18 or newer.** The module declares `compatibility: { nuxt: '>=3.18.0' }`.
- **Node 20 or newer.** `engines.node` is `>=20` in every package.
- **`@i18n-micro/test-utils` is no longer installed with the module.** If your tests import it, add it: `npm install -D @i18n-micro/test-utils`.
- **`@i18n-micro/hmr` is gone.** Translation HMR is built into the module. Remove the package if you installed it yourself.

### Routing

- **Localized route names are consistent.** A child under a shared locale record keeps the page's name, `no_prefix` honours `localizedRouteNamePrefix`, and a parent with an index child stays unnamed. Only code that hard-codes `localized-…` names in `router.push({ name })` is affected: pass the page's own name to `$localeRoute` / `<i18n-link>` instead.
- **`/en` and `/en/...` are a 404 under `prefix_except_default`** (`en` being the default), as documented.
- **A locale that does not serve a page links to its home.** `$localeRoute`, `$switchLocalePath` and the switcher no longer return another locale's page.
- **`hreflang` lists only the locales that serve the page**; `x-default` is emitted only when the default locale serves it.
- **`autoDetectPath: '*'` now applies the cookie and `Accept-Language` to unprefixed paths too** (`/about` → `/de/about`).
- **Under `prefix` an unprefixed URL keeps the visitor's locale.** With cookie `de`, `/about` and a plain `<NuxtLink to="/about">` go to `/de/about`, on every path, whatever `autoDetectPath` says.
- **Under `no_prefix` a custom path renders its own locale** (`/ueber-uns` is German with any preference), and a restricted page renders in a locale it serves.
- **A `routeRules` redirect without a page is not localized.** `/de/old` was an empty 200, now it is a 404: add a rule for the prefixed path if you need one.
- **Route rules reach custom paths.** `/blog/**` also applies to `/de/artikel/:slug` when `blog/[slug]` has that path, and rules are copied under `no_prefix` too. A static sibling such as `/de/artikel/news` matches that pattern as well.
- **A locale with `disabled: true` answers 404 on its prefix** at once, and links to it stay on the page.
- **Canonical and `hreflang` include `app.baseURL`** when the origin comes from the request. `metaBaseUrl` and `site.url` stay as written.
- **An unlocalized page has no `hreflang` or `og:locale:alternate`.**
- **`$localePath` returns a string with an `http(s):`, `mailto:` or `tel:` scheme as is, and the `path` and `fullPath` of `$localeRoute` carry it unchanged**, so do not pass an unchecked value (a `?next=` parameter) to them as a link target. `//host` and bare names like `x.com` stay paths, on this origin in every locale.
- **`$switchRoute` stays in the app.** A locale's own `baseUrl`, `mailto:` and `tel:` leave it; any other string is a path.
- **`locales[].baseUrl` now routes requests.** One build serves every domain: see [Layers and domains](/guide/layers#multiple-domains). With `baseUrl` set, a locale of another domain is a 404 on this host (`/en/about` on `example.de`), and links to a locale on the same host are relative. Requests on any other host, `localhost` included, behave as before, except that canonical and `hreflang` use `metaBaseUrl` if set, else the default locale's `baseUrl`, and not the request's origin.
- **Under `prefix`, a link to another domain keeps the locale prefix, with or without `baseDefault`.** `https://example.de/de/about`, not `https://example.de/about`, which only redirects.
- **Under `prefix_except_default` with `baseDefault` on a locale other than the build default, routes keep every prefix** so other domains can link to them. `/en` is still a 404. Only code reading `router.getRoutes()` sees the difference.
- **`@i18n-micro/path-strategy`: `createPathStrategy` no longer builds absolute URLs.** Use `new DomainPathStrategy(ctx)` when locales have `baseUrl`.
- **`customRegexMatcher` no longer 404s a real page** whose first segment looks like a locale.
- **`nuxi generate` prerenders every static page in each locale that serves it**, linked or not, unless a route rule sets `prerender: false`: more files in the output.
- **`$switchLocale` resolves `true` or `false`** (it resolved nothing), `false` when the locale's dictionary did not apply.
- **Under `no_prefix` the `Vary` header is set on every page**, and on the locale redirects of the other strategies: `Cookie` and, with `autoDetectLanguage`, `Accept-Language`. Check your CDN's cache key.
- **The locale cookie is written only by a served page**: not by a 404, not under `no_prefix` from a URL that looks prefixed.
- **Hash mode works under `prefix`.** The document is `/`, and `/en` or `/about` redirect into the hash.
- **Under `prefix_and_default` an unprefixed URL is the default locale.** `/contact` with `Accept-Language: de` used to render German and then hydrate English. It now renders the default locale; visitors reach German through `/de/...`.

### Locale detection

One precedence everywhere, described on [Locale detection](/guide/locale-detection).

- **`?locale=` counts on pages only under `no_prefix`.** Under the prefix strategies the URL decides; `/about?locale=de` no longer renders German under `lang="en"`.
- **`Accept-Language` honours `q` values** (`fr;q=0.1, de;q=0.9` → `de`; `q=0` excludes a language). Regional matching no longer depends on the order of `locales`, and never crosses Chinese scripts.
- **Server API helpers** (`useLocaleServerMiddleware`, `useTranslationServerMiddleware`) use one order on every route: `?locale` → `[locale]` param or prefix → cookie → header → default. They now respect `localeCookie: null` and `autoDetectLanguage: false`, and cache a dictionary per locale.
- **A malformed locale cookie is ignored** instead of failing every SSR page with a 500.
- **Runtime overrides reach routing.** `NUXT_I18N_DEFAULT_LOCALE` and runtime `disabledLocales` now change the generated strategy (a disabled locale stops routing). Under `prefix_except_default` and `prefix_and_default` a runtime `defaultLocale` is ignored with a warning, because that locale's unprefixed routes are generated at build. See [Runtime overrides](/guide/runtime-overrides).
- **The URL's locale goes first.** A plugin's `setLocale('de')` on `/en/...` no longer loads the `de` dictionary, and an unknown code in the state is ignored.
- **`excludePatterns`** match whole segments (`'/admin'` no longer matches `/administrator`), and globs are anchored (`/docs/*` no longer matches `/en/docs/x`). `RegExp` patterns now reach the runtime; they used to be lost there. Check your patterns against [Excluding paths](/guide/excluding-static-files).

### Translations

- **Merges are deep at every level.** Root, page and fallback files used a 2-level merge, so `a.b.c` from a fallback or the root was lost in source mode and in dev. All modes now give the same dictionary.
- **Fallback chains are followed to their end** (`fr` → `de` → `en`) in every mode.
- **Merging goes by locale, not by file kind.** The active locale's root file now beats a fallback locale's page file. See [Fallback locales](/guide/translations#fallback-locales).
- **A project's `locales` entry beats a layer's** for the same `code`; a layer only fills the gaps.
- **A page without its own `pages/<name>/` folder reads the root dictionary** in production builds. It used to get `{}` and show raw keys.
- **`disablePageLocales: true` reads the root files only;** `pages/index` is no longer merged in.
- **The leaving page's keys stop resolving after navigation** (at the end of the page transition, or `page:finish`). If a layout used keys that only the previous page's file had, move them to the root file.
- **`$clearCache()` reloads the current page's dictionary** and keeps the old one on screen until the new one lands. A failed reload keeps the old dictionary, a response requested before the clear is discarded, and a page in its leaving transition stays translated.
- **`$has(key, route)` honours the route.**
- **Translation HMR applies edits in place**, without a page reload; removed keys disappear and root edits reach every page.

### Plurals and formatting

- `$tc` with a negative, fractional or huge count takes the last form with the real count; `{ count: null }` no longer throws; a missing plural key reaches the missing handler.
- `$tdr` gives real future dates (`in 3 days`, or `tomorrow` with `numeric: 'auto'`) and `Invalid Date` for an invalid input.
- A `{param}` placeholder reads only the params you pass (`{constructor}` stays as written).
- `<i18n-t>` with `number`, `date` or `relativeDate` keeps `params`; they are merged in.
- **Plural templates keep their meaning, with one exception.** The table lists every shape. To get `Intl.PluralRules` categories, say so with the new [`=0 ` marker](/api/methods#tc): `=0 нет | яблоко | яблока | яблок`.

  | Shape | Example (`ru`) | Before | Now |
  | --- | --- | --- | --- |
  | Any template in a locale with one or two integer categories (`en`, `de`, `fr`, `es`, `ja`...) | `none \| one \| {count} many` | by index | **unchanged** |
  | One form per category | `яблоко \| яблока \| яблок` | by index: 21 → `яблок` | **unchanged**. Add the marker for 21 → `яблоко` |
  | Zero form first, three forms | `нет \| одно \| много` | by index | **unchanged** |
  | Other placeholders | `нет товаров \| {n} товар \| {n} товаров` | by index | **unchanged** |
  | `{count}` in every form | `{count} товаров \| {count} товар \| {count} товара` | by index | **unchanged** |
  | Fewer or more forms than below | `a \| b`, `нет \| один \| два \| {count} много` | by index | **unchanged** |
  | In `lv`, `prg`, `blo`, `cv`, `ksh`, `lag` | `nav \| viens \| {count} āboli` | by index | **unchanged** |
  | Marked with `=0 ` | `=0 нет \| одно \| много` | the marker was shown as text | zero form, then categories |
  | **A zero form with no placeholder, then one form per category, with `{count}` in each form several counts share** | `нет \| {count} яблоко \| {count} яблока \| {count} яблок` | by index: 3 → `3 яблок`, 21 → `21 яблок` | **by category**: 3 → `3 яблока`, 21 → `21 яблоко`. 0, 1, 2 and every count that stays in `many` give the same result |

  The last shape needs three or more categories (`ru`, `uk`, `pl`, `cs`, `sk`, `hr`, `sr`, `lt`, `ro`, `sl`, `he`, `ar`, `cy`...). In `ar`, `one` and `two` are single counts, so `واحد | اثنان` need no number.
- **A locale code `Intl` does not know gets the index rule**, with or without the marker's categories: `ua` no longer follows the machine's locale. Set `iso`: `{ code: 'ua', iso: 'uk-UA' }` plurals as Ukrainian, in the module and in `@i18n-micro/vue`.
- **A custom `plural` rule keeps its signature** and still gets the locale code. It reads the raw value, so a marked template reaches it with `=0 ` in place. Returning `null` falls back to the built-in rule, which honours the marker.
- `{placeholder}` names may hold any character but braces and spaces: `{имя}`, `{first-name}` and `{user.name}` are read from `params`. Without such a param they stay as written, as before.
- **`timeZone` option.** Set it (`Europe/Berlin`) to render one calendar date on the server and in every browser. It has no effect on `relativeDate`, which depends on the clock.

### `<i18n-t>`

This section covers `<i18n-t>` in the module and `I18nT` in `@i18n-micro/vue`. For the other frameworks see [Framework packages](#framework-packages).

- **`html` escapes `params`, in every case, and ignores all slots.** Only the translation is trusted markup. A param that held markup on purpose now shows as text: put the markup in the translation and pass the data as params, or use slots without `html`.
- **Slots work with `plural`, `number`, `date` and `relativeDate`,** and a `default` slot receives `{ translation }` in those cases too. Every `{name}` is filled, not only the first.
- **A slot beats a param of the same name.** A param value that looks like a placeholder stays text. With a `customPluralRule` or a custom `plural` the rule returns a finished string, so a param it interpolated can be taken for a placeholder there.
- **`null` means not set** for `plural`, `number`, `date` and `relativeDate`. `:plural="null"` used to fail the render, `:date="null"` rendered 1970.
- `plural` counts like `$tc`, with `Number`: `1.5` stays `1.5` and takes the last form, it used to be cut to `1`; `"2 items"` is `NaN`, it used to be `2`; `""` is `0`. A `customPluralRule` sees `1.5` too. Its other contract is unchanged: same arguments, its answer is used as is, `null` renders empty.
- `hideIfEmpty` applies to `plural`, `number`, `date` and `relativeDate`.
- `defaultValue` stands in for a missing key in every branch, not the key itself, and a `customPluralRule` gets it through its getter on a miss. It used to do something only after `hideIfEmpty`.
- `date` and `relativeDate` output carries `data-allow-mismatch="text"`: a clock or a time zone that differs between server and browser no longer warns during hydration. Next to a named slot, the text around the slot sits in a `<span>` of its own, because Vue checks the attribute only on an element's single text.
- `.innerHTML` and `textContent` attributes are dropped along with `innerHTML`.
- `<i18n-t>` and `<i18n-group>` read the active dictionary, as `$t` does, not the route's chunk. Evicted chunks (`cacheMaxSize`) no longer show raw keys. A page in its leaving transition now reads what `$t` reads there: the new page's dictionary, falling through to its own on a miss, so a key both pages define shows the new text, and after a locale switch its own keys show raw until it unmounts.

### `$t` and `$tc`

- A `defaultValue` is interpolated: `$t('missing', { n: 1 }, 'Got {n}')` gives `Got 1`, it used to give `Got {n}`. A default that is not a string comes back as it is.
- `$tc` on an empty translation answers `''`, as `$t` does. It used to answer the default value or the key.

### `<i18n-switcher>` and `<i18n-link>`

- **A click on a switcher link is one navigation.** It is a plain `<a>` calling `$switchLocale`, not a `NuxtLink` plus a click handler, so `router-link-active` classes are gone. The `href` still carries `app.baseURL`, and the current locale's link still has `aria-current="page"`. Ctrl/cmd-click opens a new tab and leaves this tab alone.
- The button is `type="button"`, so it no longer submits a surrounding form, and has `aria-expanded`. `aria-haspopup` is gone, in the module and in `@i18n-micro/vue`: it promised a menu, and the list is links. Escape and a click outside close the dropdown; two switchers no longer stay open together.
- The wrapper and dropdown have the classes `i18n-switcher-wrapper` and `i18n-switcher-dropdown`; the button has `i18n-switcher-button` as well as `language-switcher`. Default styles use logical CSS properties (`inset-inline-start`, `margin-inline-start`) and one set of values, and the caret is `▾`. Each link has `lang`, and `dir` when the locale sets it.
- `<i18n-link>`: `https://`, `mailto:` and `tel:` are matched in any case (`HTTPS://x.com`, `Mailto:`). A bare `report.pdf` or `index.html` is a route, not `https://report.pdf`; `example.com` and `example.com:8080` stay external. A file ending that is also a TLD (`example.md`, `x.zip`) counts as a file: write `https://`. `activeStyle` ignores a trailing slash, the query and the hash.

### Server cache

- **Bounded by default:** at most 1000 entries when `cacheMaxSize` is unset.
- **`cacheTtl` counts from when an entry was stored**; reads no longer extend it.
- **No Nitro route cache on `/{apiBaseUrl}/**`.** The `Cache-Control` headers stay. If you relied on that cache, put a CDN in front of the payload route.

### Hooks and types

- **`i18n:register` is a runtime hook:** register it with `nuxtApp.hook('i18n:register', …)` in a plugin, without `@ts-expect-error`. The exported type `ModuleHooks` is renamed `ModuleRuntimeHooks`. See [Hooks](/api/events).
- The `hooks` option no longer documents `i18n:beforeLocaleSwitch` / `i18n:afterLocaleSwitch`; they were never emitted.
- `const { $defineI18nRoute } = useNuxtApp()` in a page now works with configs that use variables.
- `$switchLocale` is typed `Promise<boolean>` and `$switchRoute` `Promise<void>`. `clearCache` is on the `useI18n()` type.
- `routeDisableMeta` set in `nuxt.config` is honoured.

### Framework packages

| Package | Change | Action |
| --- | --- | --- |
| `@i18n-micro/react`, `@i18n-micro/solid` | router adapters moved to the `/router` subpath | `import { createReactRouterAdapter } from '@i18n-micro/react/router'` (Solid: `createSolidRouterAdapter` from `@i18n-micro/solid/router`) |
| `@i18n-micro/react`, `@i18n-micro/preact` | a link to `/` or a locale root is active on an exact match only; `className` on the switcher adds to `i18n-switcher-wrapper` | check active-link styles |
| `@i18n-micro/react` (2.0.0) | React 18 or newer; `use-sync-external-store` is no longer a dependency | stay on 1.x for React 16 or 17 |
| `@i18n-micro/react`, `@i18n-micro/preact`, `@i18n-micro/solid` (2.0.0) | `I18nT` follows [`<i18n-t>`](#i18n-t) above: `html` escapes params, `plural` keeps fractions, `number` and `date` beat a param of their name, `hideIfEmpty` and `defaultValue` apply in every branch, a hidden value renders bare, with no element. `dangerouslySetInnerHTML`, `innerHTML` and `textContent` attributes are dropped | move markup from params into the translation or `components` |
| `@i18n-micro/react`, `@i18n-micro/preact`, `@i18n-micro/solid` (2.0.0) | new `components` prop on `I18nT` for rich text, children as Vue's default slot | see [Rich text](/integrations/#rich-text) |
| `@i18n-micro/react`, `@i18n-micro/preact`, `@i18n-micro/solid` (2.0.0) | `I18nSwitcher` matches the Vue one: `<a href>` items with `aria-current="page"` on the current locale, `▾` with a space before it, logical CSS, `language-switcher` on the button, no `aria-haspopup`, clicks bubble, Escape closes it. A caller's `getLocaleName` wins over the list in Solid too | check styles and tests that looked for `li button` or `▼` |
| `@i18n-micro/react`, `@i18n-micro/preact`, `@i18n-micro/solid` (2.0.0) | `I18nLink`: a user `onClick` and `style` are kept, a modified click or `target` is left to the browser, query and hash do not count for the active check. Without a router a click is the browser's own and no link is active | — |
| `@i18n-micro/react`, `@i18n-micro/preact` (2.0.0) | `I18nLocalesContext`, `I18nDefaultLocaleContext` and `I18nRouterContext` are one `I18nConfigContext`; `I18nContext` still holds the instance | use `I18nProvider`, or the `useI18nLocales`-style hooks |
| `@i18n-micro/solid` (2.0.0) | one context: `I18nContext` holds `{ i18n, locales, defaultLocale, router }`; the other three are gone | use `I18nProvider`, or the `useI18nLocales`-style hooks |
| `@i18n-micro/react`, `@i18n-micro/preact`, `@i18n-micro/solid` (2.0.0) | `getCurrentPath` of the adapters has the query and hash, so `switchLocale` keeps them; `resolvePath` keeps them too. `getRoute().fullPath` has them as well | custom strategies: return the full path, links compare by page |
| `@i18n-micro/react`, `@i18n-micro/preact` (2.0.0) | `ReactI18n` and `PreactI18n` are the runtime's `I18n`; `t` from `useI18n()` keeps its identity until the store changes; `defaultLocale()` without a value is `fallbackLocale`, it used to follow the locale | — |
| `@i18n-micro/react`, `@i18n-micro/preact`, `@i18n-micro/solid` (2.0.0) | a nested `I18nProvider` without `i18n` keeps the outer instance; a provider with no instance at all throws. In React and Preact it may instead get the `createI18n` options as props. `locales` add their `iso` to `localeIso` | — |
| `@i18n-micro/preact` (2.0.0) | `createBrowserHistoryAdapter` moved to `@i18n-micro/preact/router`; `createPreactRouterAdapter` is removed | change the import |
| `@i18n-micro/solid` (2.0.0) | `SolidI18n` is built on the runtime: `routeMessages`, `loadFromUrl`, `hasTranslation`, `clear` and a `fallbackLocale` setter are new. `getCurrentPathAccessor` is removed: read a signal in `getCurrentPath`. `useI18n()` no longer throws without `locales`, `useI18nLocales` and `useI18nDefaultLocale` answer `undefined`. The adapter no longer needs a reactive owner | remove the accessor from custom strategies |
| `@i18n-micro/runtime` | a write to a locale that is neither active nor fallback does not notify; new `timeZone`, `now` and `localeIso` options | a listener that wants every preload: read the store when the locale changes |
| `@i18n-micro/vue` (2.0.0) | canonical / `og:url` keep `canonicalQueryWhitelist` params with the vue-router adapter | — |
| `@i18n-micro/vue` (2.0.0) | `I18nT` is a functional component and follows [`<i18n-t>`](#i18n-t) above; `I18nSwitcher` and `I18nLink` follow [the section above](#i18n-switcher-and-i18n-link) | a `ref` on `<I18nT>` no longer gives a component instance |
| `@i18n-micro/vue` (2.0.0) | `I18nLink` and `createVueRouterAdapter` resolve `name`, `query` and `hash`; `#top` stays on this page; `switchLocale` and the switcher keep the query and hash | check tests that pinned `/de` for a named target. An unknown `name` now throws, as `RouterLink` does |
| `@i18n-micro/vue` (2.0.0) | `useLocaleHead` no longer builds `//de/` with the default `baseUrl: '/'`; canonical and `hreflang` of one page agree (`/de`, was `/de/`), and whitelisted query params reach `hreflang` and `x-default`, as in Nuxt | — |
| `@i18n-micro/vue` (2.0.0) | `I18nRoutingStrategy`: `resolvePath` may get a location object and a path with a query and hash; new optional `toHref` | custom strategies: keep what follows the path |
| `@i18n-micro/vitepress` (2.0.0) | links, the switcher, `push` and `replace` carry `site.base`; `resolvePath` and `localizePath` stay relative to it; `numberFormats`, `datetimeFormats` and `timeZone` reach `createI18n` | — |
| `@i18n-micro/node` | loads translations on Node 24 (`dirent.path` is gone there) | — |
| `@i18n-micro/astro` | `client/vue` no longer bundles its own Vue: reactivity works, and `vue` must be installed | — |
| `@i18n-micro/astro` | the URL decides the page locale; `autoDetect` is a 302 from `/` to the preferred locale's home; new `localeCookie` middleware option; `redirectToDefault` is implemented | see [Astro](/integrations/astro-package) |
| `@i18n-micro/astro` | `i18nIntegration` no longer takes `messages`, `plural`, `missingHandler`, `disablePageLocales`, `routingStrategy` and no longer sets the global routing strategy | pass them to `createI18n` / `createI18nMiddleware` in `src/middleware.ts` |
| `@i18n-micro/devtools-ui` | `createBridge` takes a `base` option; a failed save to a reachable endpoint throws and rolls back | pass `base` if you changed the plugin's `base` |
| `@i18n-micro/devtools-ui` | `/save` and `/file` accept only an existing `.json` inside `translationDir`; `/save` no longer creates files | create new locale files yourself |
| `@i18n-micro/core` (2.0.0) | `TranslationHelper` drops `setCache`, `getGeneration`, `lookupIn` (use `lookup(chunkKey, key)`); `BaseI18n` drops `ensurePinnedChunk`, `invalidatePin`; route chunks hold only their own keys and lookups fall through to the root chunk | only for custom adapters |
| `@i18n-micro/utils` | subpaths `./route`, `./route-pattern`, `./build`, `./payload-stats`, `./payload-config` removed | they were module internals |

## From v2 to v3

### Removed options

```diff
 i18n: {
-  includeDefaultLocaleRoute: true,
+  strategy: 'prefix',
-  fallbackRedirectComponentPath: '~/components/MyRedirect.vue',
-  experimental: { hmr: true, previousPageFallback: true },
+  hmr: true,
 }
```

- `includeDefaultLocaleRoute: true` is `strategy: 'prefix'`; `false` is the default `prefix_except_default`.
- `fallbackRedirectComponentPath` is gone: redirects happen on the server before render and in a client route middleware. Custom redirect logic goes into a plugin that sets the locale, see [Custom locale detection](/guide/custom-auto-detect).
- `experimental.hmr` is the root `hmr` option (on by default).
- `previousPageFallback` is gone: the leaving page's keys resolve until its transition ends, with no option.

### Locale state

Use `useI18nLocale()` instead of `useState('i18n-locale')` and `useCookie('user-locale')`:

```diff
- useState('i18n-locale').value = 'fr'
- useCookie('user-locale').value = 'fr'
+ useI18nLocale().setLocale('fr') // state and cookie together
```

### Config at runtime

Read the config, runtime overrides included, with `$getI18nConfig()`:

```diff
- const cookieName = useRuntimeConfig().public.i18nConfig?.localeCookie
+ const { $getI18nConfig } = useNuxtApp()
+ const cookieName = $getI18nConfig().localeCookie
```

### Internal type aliases

If your IDE or `vue-tsc` cannot resolve `#i18n-internal/*` imports, map them in your `package.json`. Nuxt resolves them at build time, so this is rarely needed:

```json
{
  "imports": {
    "#i18n-internal/plural": "nuxt-i18n-micro/internals",
    "#i18n-internal/strategy": "nuxt-i18n-micro/internals",
    "#i18n-internal/config": "nuxt-i18n-micro/internals"
  }
}
```

## Related

- Next: [Translation files](/guide/translations)
- [Locale detection](/guide/locale-detection)
- [Module options](/api/module-options)
- [Changelog](https://github.com/s00d/nuxt-i18n-micro/blob/main/CHANGELOG.md)
