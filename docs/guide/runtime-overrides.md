---
title: Runtime overrides
description: Change the default locale, fallback locale or disabled locales per instance of one build, with environment variables or runtimeConfig.
outline: [2, 3]
---

# Runtime overrides

Runtime overrides let one build artifact run with different locale settings per environment or tenant, without rebuilding. You can change the default locale, the fallback locale and which locales are disabled. Routing, redirects, rendering and server helpers use the overridden values, and so does the browser on a server-rendered page.

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

Treat it as read-only: it is shared by every request and frozen in development. Importing the config from `#build/i18n.strategy.mjs` gives the build values without overrides.

## Disabled locales and static files

A runtime-disabled locale answers 404 on its routes and payload route, but its payload files are still in `.output/public/_locales/` and a static file server returns them. When those files must not be reachable, disable the locale at build time with `disabled: true`.

## Related

- [Deployment](/guide/deployment)
- [Layers and domains](/guide/layers)
- [Routing strategies](/guide/strategy)
