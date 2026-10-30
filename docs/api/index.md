---
title: 'API reference'
description: 'Map of the nuxt-i18n-micro reference: module options, helpers, hooks, composables, components and package APIs.'
---

# API reference

This section lists every option, helper, hook, composable and component of the Nuxt module, plus the exported API of each `@i18n-micro/*` package. Use it to look up a signature or a default; the [Guide](/guide/getting-started) explains how to use them. Most tables here are generated from the source, so they match the code.

## Nuxt module

| Page | Covers |
| --- | --- |
| [Module options](/api/module-options) | Every `i18n` key in `nuxt.config`, with type and default |
| [Helpers](/api/methods) | `$t`, `$tc`, `$tn`, `$td`, `$localePath`, `$switchLocale`, `$defineI18nRoute` and the rest |
| [Hooks](/api/events) | The `i18n:register` runtime hook |

## Composables

| Composable | Use it for |
| --- | --- |
| [`useI18n`](/composables/useI18n) | The helpers in `<script setup>` |
| [`useI18nLocale`](/composables/useI18nLocale) | Locale state and cookie in a custom detection plugin |
| [`useI18nHead`](/composables/useI18nHead) | Per-page overrides of the generated SEO tags |
| [`useLocaleHead`](/composables/useLocaleHead) | The SEO tags as an object, for your own `useHead` |

## Components

| Component | Renders |
| --- | --- |
| [`<i18n-t>`](/components/i18n-t) | One translation, with plural, formatting and slot interpolation |
| [`<i18n-link>`](/components/i18n-link) | A `NuxtLink` to the localized route |
| [`<i18n-switcher>`](/components/i18n-switcher) | A locale dropdown |
| [`<i18n-group>`](/components/i18n-group) | A block with a shared key prefix |

## Server

Nitro handlers use `useTranslationServerMiddleware` and `useLocaleServerMiddleware`, not the client helpers. See [Server routes](/guide/server-side-translations).

## Packages

[Package APIs](/api/packages) lists the exports of every `@i18n-micro/*` package, one generated page each.

## Related

- [Getting started](/guide/getting-started)
- [Framework packages](/integrations/)
