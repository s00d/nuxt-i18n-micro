---
title: Runtime overrides
description: Change the default locale, fallback locale, disabled locales or the public origins per instance of one build, with environment variables or runtimeConfig.
outline: [2, 3]
navigation:
  order: 70
  group: Core concepts
---

# Runtime overrides

Runtime overrides let one build artifact run with different locale settings per environment or tenant, without rebuilding. You can change the default locale, the fallback locale, which locales are disabled, the SEO origin (`metaBaseUrl`) and, in a build with locale domains, each locale's `baseUrl`. Routing, redirects, rendering and server helpers use the overridden values, and so does the browser on a server-rendered page.

## Set overrides with environment variables

```bash
NUXT_I18N_DEFAULT_LOCALE=de \
NUXT_I18N_FALLBACK_LOCALE=en \
NUXT_I18N_DISABLED_LOCALES=fr,it \
node .output/server/index.mjs
```

| Variable | Alias |
| --- | --- |
| `NUXT_I18N_DEFAULT_LOCALE` | `NUXT_PUBLIC_I18N_RUNTIME_DEFAULT_LOCALE` |
| `NUXT_I18N_FALLBACK_LOCALE` | `NUXT_PUBLIC_I18N_RUNTIME_FALLBACK_LOCALE` |
| `NUXT_I18N_DISABLED_LOCALES` (comma-separated) | `NUXT_PUBLIC_I18N_RUNTIME_DISABLED_LOCALES` |
| `NUXT_I18N_META_BASE_URL` | `NUXT_PUBLIC_I18N_RUNTIME_META_BASE_URL` |
| `NUXT_I18N_LOCALE_BASE_URLS` (`de=https://de.example.com,fr=https://fr.example.com`) | `NUXT_PUBLIC_I18N_RUNTIME_LOCALE_BASE_URLS` |

The server reads them once at start; restart to apply a change. On a server-rendered page the browser gets the resolved values from the server. With `ssr: false` there is no server render and the browser has no environment: only `runtimeConfig.public.i18nRuntime` applies there, and the browser logs the warnings below.

## Set overrides in runtimeConfig

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  runtimeConfig: {
    public: {
      i18nRuntime: {
        defaultLocale: 'de',
        fallbackLocale: 'en',
        disabledLocales: ['fr'],
        metaBaseUrl: 'https://staging.example.com',
        // a string as in the variable, or an object
        localeBaseUrls: { de: 'https://de.staging.example.com' },
      },
    },
  },
})
```

A value set in `runtimeConfig.public.i18nRuntime` wins over the `NUXT_I18N_*` variable for the same field.

Not to be confused with the build-time `DEFAULT_LOCALE` variable, which replaces `defaultLocale` while building and needs no runtime support.

## What can and cannot change

| Setting | At runtime |
| --- | --- |
| `defaultLocale` | Yes under `prefix` and `no_prefix`. Under `prefix_except_default` and `prefix_and_default` it is fixed at build (its pages are the unprefixed routes); an override is ignored with a warning. |
| `fallbackLocale` | Yes. |
| `disabledLocales` | Adds to the locales disabled at build; never re-enables one. The build default cannot be disabled under `prefix_except_default` / `prefix_and_default`. |
| `strategy` | No. A runtime strategy is ignored with a warning; build one artifact per strategy. |
| `metaBaseUrl` | Yes: canonical and hreflang take it in place of the build value. On a host of a locale domain the host's own origin still applies. |
| `locales[].baseUrl` | Only in a build that already has locale domains (some `locales[].baseUrl` at build): the path strategy for domains is chosen at build. Without them the override is ignored with a warning. A code that is no locale, or a value that is not an absolute URL, is ignored with a warning. A locale with no domain at build can get one. |

Invalid values never break the app. Each case logs one warning per server process:

- disabling every locale is ignored;
- a `defaultLocale` that is not enabled falls back to the first enabled locale;
- a `fallbackLocale` that is not enabled keeps the build value if it is enabled, otherwise there is no fallback.

## Read the effective config

```vue
<script setup lang="ts">
const { $getI18nConfig } = useNuxtApp()
const config = $getI18nConfig() // build config with overrides applied
</script>
```

Treat it as read-only: on the server it is shared by every request and frozen in development; the browser copy is not frozen. Importing the config from `#build/i18n.strategy.mjs` gives the build values without overrides.

## Origins at runtime

One build can serve staging and production on different hosts:

```bash
NUXT_I18N_LOCALE_BASE_URLS=en=https://staging.example.com,de=https://staging.example.de \
NUXT_I18N_META_BASE_URL=https://staging.example.com \
node .output/server/index.mjs
```

The hosts of the build then are unknown hosts: they get the build config, as any other host. `metaBaseUrl` (the origin of an unknown host's canonical and hreflang) does not move with them: set `NUXT_I18N_META_BASE_URL` too when the default locale's domain moves. The browser of a server-rendered page gets the changed origins with the page.

`nuxt generate` per host (`NUXT_I18N_DOMAIN`) is build time: the prerendered pages keep the origins of the build, and runtime `baseUrl`s do not reach them.

## Disabled locales and static files

A runtime-disabled locale answers 404 on its routes and payload route, but its payload files are still in `.output/public/_locales/` and a static file server returns them. When those files must not be reachable, disable the locale at build time with `disabled: true`.

## Related

::card-group
  :::card{title="Deployment" icon="i-lucide-book-open" to="/guide/deployment"}
  :::
  :::card{title="Layers and domains" icon="i-lucide-book-open" to="/guide/layers"}
  :::
  :::card{title="Routing strategies" icon="i-lucide-book-open" to="/guide/strategy"}
  :::
::
