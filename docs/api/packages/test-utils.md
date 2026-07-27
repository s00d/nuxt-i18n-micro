---
title: '@i18n-micro/test-utils'
description: 'Exported API of @i18n-micro/test-utils, generated from the source.'
outline: 'deep'
---

# `@i18n-micro/test-utils`

27 exports across 1 entry point.
Generated from the API snapshot that [`pnpm run api:surface`](/guide/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/test-utils`

```ts
import { /* … */ } from '@i18n-micro/test-utils'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `defaultLocale` | const | `() => string \| undefined` |
| `getLocale` | const | `() => string` |
| `getLocaleName` | const | `() => string \| null` |
| `getLocales` | const | `() => Locale[]` |
| `getRouteName` | const | `(_route?: unknown, _locale?: string) => string` |
| `Getter` | type | `(key: TranslationKey, params?: Record<string, string \| number \| boolean>, defaultValue?: string) => unknown` |
| `has` | const | `(key: TranslationKey) => boolean` |
| `i18nUtils` | const | `{ t: (key: TranslationKey, params?: Params, defaultValue?: string) => Translation; tc: (key: TranslationKey, params: number \| Params, defaultValue?: string) => string; setTranslationsFromJson: (locale: string, translations: Record<string, unknown>) => Promise<void>; getLocale: () => string; setLocale: (val: string) => string; getLocaleName: () => string \| null; setLocaleName: (val: string \| null) => string \| null; getLocales: () => Locale[]; setLocales: (val: Locale[]) => Locale[]; defaultLocale: () => string \| undefined; setDefaultLocale: (val: string \| undefined) => string \| undefined; getRouteName: (_route?: unknown, _locale?: string) => string; settRouteName: (val: string) => string; ts: (key: TranslationKey, params?: Params, defaultValue?: string) => string; tn: (value: number, options?: Intl.NumberFormatOptions) => string; td: (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions) => string; has: (key: TranslationKey) => boolean; mergeTranslations: (newTranslations: Translations) => void; switchLocaleRoute: (val: string) => string; switchLocalePath: (val: string) => string; switchLocale: (val: string) => string; switchRoute: (_route: unknown, _toLocale?: string) => void; localeRoute: (_to: unknown, _locale?: string) => void; localePath: (_to: unknown, _locale?: string) => string; setI18nRouteParams: (_value: unknown) => void; }` |
| `localePath` | const | `(_to: unknown, _locale?: string) => string` |
| `localeRoute` | const | `(_to: unknown, _locale?: string) => void` |
| `mergeTranslations` | const | `(newTranslations: Translations) => void` |
| `setDefaultLocale` | const | `(val: string \| undefined) => string \| undefined` |
| `setI18nRouteParams` | const | `(_value: unknown) => void` |
| `setLocale` | const | `(val: string) => string` |
| `setLocaleName` | const | `(val: string \| null) => string \| null` |
| `setLocales` | const | `(val: Locale[]) => Locale[]` |
| `setTranslationsFromJson` | function | `(locale: string, translations: Record<string, unknown>) => Promise<void>` |
| `settRouteName` | const | `(val: string) => string` |
| `switchLocale` | const | `(val: string) => string` |
| `switchLocalePath` | const | `(val: string) => string` |
| `switchLocaleRoute` | const | `(val: string) => string` |
| `switchRoute` | const | `(_route: unknown, _toLocale?: string) => void` |
| `t` | function | `(key: TranslationKey, params?: Params, defaultValue?: string) => Translation` |
| `tc` | function | `(key: TranslationKey, params: number \| Params, defaultValue?: string) => string` |
| `td` | const | `(value: Date \| number \| string, options?: Intl.DateTimeFormatOptions) => string` |
| `tn` | const | `(value: number, options?: Intl.NumberFormatOptions) => string` |
| `ts` | const | `(key: TranslationKey, params?: Params, defaultValue?: string) => string` |


Back to [all packages](/api/packages) · [Integration guides](/integrations/)
