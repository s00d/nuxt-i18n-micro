---
title: "Runtime i18n Overrides"
description: "Use this guide when you need one build artifact to run with different locale defaults per environment (for example: different tenant instances)."
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

You can also configure overrides via environment variables:

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
- `defaultLocale` must point to an enabled locale.
- `fallbackLocale` must exist in declared locales.

If an override is invalid, the module keeps a safe value and logs a warning.

## Notes for multi-instance deployments

This runtime feature is designed for per-instance locale activation and defaults without rebuilding.

If instances require different URL strategies (`no_prefix` vs `prefix`), use separate builds for each strategy.
