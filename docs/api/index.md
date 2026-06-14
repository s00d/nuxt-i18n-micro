---
title: "API Reference"
description: "Runtime methods, events, translation cache, and server middleware."
---

# API Reference

## Runtime API

- [Methods](./methods.md) — `$t`, `$ts`, `$_t`, `$_ts`, locale switching, routing helpers
- [Events](./events.md) — `i18n:register`, `i18n:beforeLocaleSwitch`, `i18n:afterLocaleSwitch`
- [Translations and Cache](./i18n-cache-api.md) — `TranslationStorage`, payload loading, `$clearCache`

## Server middleware

Server handlers use dedicated middleware (not the client `$t` helpers):

- [`useTranslationServerMiddleware`](/guide/server-side-translations#-using-translations-in-server-handlers) — translate in API routes and server handlers
- [`useLocaleServerMiddleware`](/guide/server-side-translations#-using-locale-information-in-server-handlers) — read detected locale and metadata

See the full [Server-Side Translations guide](/guide/server-side-translations) for setup, locale detection priority, and examples.

## Related

- [Composables](/composables/) — `useI18n`, `useI18nLocale`, `useLocaleHead`
- [Configuration Reference](/guide/configuration) — all `i18n` module options
