---
title: 'API reference'
description: 'Map of the nuxt-i18n-micro reference: module options, helpers, hooks, composables, components and package APIs.'
navigation:
  order: 10
---

# API reference

This section lists every option, helper, hook, composable and component of the Nuxt module, plus the exported API of each `@i18n-micro/*` package. Use it to look up a signature or a default; the [Guide](/guide/getting-started) explains how to use them. Most of it is generated from the source, so it matches the code.

## Nuxt module

- [Module options](/api/module-options) — every `i18n` key in `nuxt.config`, with type and default
- [Helpers](/api/methods) — `$t`, `$tc`, `$tn`, `$td`, `$localePath`, `$switchLocale`, `$defineI18nRoute` and the rest
- [Hooks](/api/events) — the `i18n:register` and `i18n:beforeLocaleSwitch` runtime hooks

## Composables

- [`useI18n`](/composables/useI18n) — the helpers in `<script setup>`
- [`useI18nLocale`](/composables/useI18nLocale) — locale state and cookie in a custom detection plugin
- [`useI18nHead`](/composables/useI18nHead) — per-page overrides of the generated SEO tags
- [`useLocaleHead`](/composables/useLocaleHead) — the SEO tags as an object, for your own `useHead`

## Components

- [`<i18n-t>`](/components/i18n-t) — one translation, with plural, formatting and slot interpolation
- [`<i18n-link>`](/components/i18n-link) — a `NuxtLink` to the localized route
- [`<i18n-switcher>`](/components/i18n-switcher) — a locale dropdown
- [`<i18n-group>`](/components/i18n-group) — a block with a shared key prefix

## Server

Nitro handlers use `useTranslationServerMiddleware` and `useLocaleServerMiddleware`, not the client helpers. See [Server routes](/guide/server-side-translations).

## Packages

[Package APIs](/api/packages) lists the exports of every `@i18n-micro/*` package, one generated page each.

## Related

::card-group
  :::card{title="Getting started" icon="i-lucide-book-open" to="/guide/getting-started"}
  :::
  :::card{title="Framework packages" icon="i-lucide-boxes" to="/integrations/"}
  :::
::
