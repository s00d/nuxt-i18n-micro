---
title: API Reference
description: Runtime methods, events, translation cache, and server middleware.
navigation:
  title: Overview
  order: 10
---

## Runtime API

- [Methods](/v3/api/methods) — `$t`, `$ts`, `$_t`, `$_ts`, locale switching, routing helpers
- [Events](/v3/api/events) — `i18n:register`, `i18n:beforeLocaleSwitch`, `i18n:afterLocaleSwitch`
- [Translations and Cache](/v3/api/i18n-cache-api) — `TranslationStorage`, payload loading, `$clearCache`

## Server middleware

Server handlers use dedicated middleware (not the client `$t` helpers):

- [`useTranslationServerMiddleware`](/v3/guide/server-side-translations#-using-translations-in-server-handlers) — translate in API routes and server handlers
- [`useLocaleServerMiddleware`](/v3/guide/server-side-translations#-using-locale-information-in-server-handlers) — read detected locale and metadata

See the full [Server-Side Translations guide](/v3/guide/server-side-translations) for setup, locale detection priority, and examples.

## Related

- [Composables](/v3/composables) — `useI18n`, `useI18nLocale`, `useLocaleHead`
- [Configuration Reference](/v3/guide/configuration) — all `i18n` module options
