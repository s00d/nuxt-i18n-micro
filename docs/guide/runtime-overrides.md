---
title: 'Runtime i18n Overrides'
description: 'Per-environment locale defaults at runtime.'
---

# Runtime i18n Overrides

Use this guide when you need one build artifact to run with different locale defaults per environment (for example: different tenant instances).

## What can be overridden at runtime

The module supports safe runtime overrides for:

- `defaultLocale`
- `fallbackLocale`
- `disabledLocales`

These overrides are applied on top of the build-time config from `.nuxt/i18n.strategy.mjs` and `.nuxt/i18n.config.mjs`.

## What cannot be overridden at runtime

`strategy` (`no_prefix`, `prefix`, `prefix_except_default`, `prefix_and_default`) is a build-time concern because it affects generated route behavior.

If you pass a runtime strategy override, it is ignored and a warning is emitted.

Under `prefix_except_default` and `prefix_and_default` the **default locale** is fixed at build as well: its pages are the unprefixed routes generated for it. A runtime `defaultLocale` that differs from the build one, or a runtime `disabledLocales` entry naming it, is ignored with a warning. Under `prefix` and `no_prefix` a runtime `defaultLocale` applies.

## RuntimeConfig-based overrides

Provide runtime values under `runtimeConfig.public.i18nRuntime`:

```ts
export default defineNuxtConfig({
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

## Environment variable overrides

You can also configure overrides via environment variables (read once by the server; `runtimeConfig` values win over them):

- `NUXT_I18N_DEFAULT_LOCALE`
- `NUXT_I18N_FALLBACK_LOCALE`
- `NUXT_I18N_DISABLED_LOCALES` (comma-separated, e.g. `fr,it`)

Fallback aliases are also supported:

- `NUXT_PUBLIC_I18N_RUNTIME_DEFAULT_LOCALE`
- `NUXT_PUBLIC_I18N_RUNTIME_FALLBACK_LOCALE`
- `NUXT_PUBLIC_I18N_RUNTIME_DISABLED_LOCALES`

## Validation rules

At runtime, the module validates overrides to avoid broken state:

- You cannot disable all locales.
- Runtime `disabledLocales` add to the locales disabled at build (`locale.disabled: true`); they never re-enable one.
- `defaultLocale` must point to an enabled locale (and is fixed at build under `prefix_except_default` / `prefix_and_default`, see above).
- `fallbackLocale` must point to an enabled locale; otherwise the build `fallbackLocale` is kept when it is enabled, else there is no fallback.

If an override is invalid, the module keeps a safe value and logs a warning once.

## Where overrides apply

The overrides are resolved once on the server and used everywhere: routing (a runtime-disabled locale prefix answers 404, `/` redirects to the runtime default under `prefix`), redirects, the page render, `useI18nLocale()`, the server helpers and the payload route. The server sends the applied values to the browser in the payload, so the client routes and validates with the same config — environment variables included, which the browser cannot read itself.

## Notes for multi-instance deployments

This runtime feature is designed for per-instance locale activation and defaults without rebuilding.

If instances require different URL strategies (`no_prefix` vs `prefix`), use separate builds for each strategy.

## Disabled locales and static payloads

`runtimeConfig.public.i18nRuntime.disabledLocales` updates routing, switcher, and the Nitro payload **handler** — but Nitro serves files under `public/` **before** that handler.

If `translationPayloads.publicAssets` (or Node SSR’s forced public copy) already wrote `/_locales/{page}/{locale}/data.json`, a runtime disable cannot hide that file. Prefer `locale.disabled: true` at build so premerge does not emit that locale’s static payloads.
