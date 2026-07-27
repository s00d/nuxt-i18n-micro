---
title: '@i18n-micro/core'
description: 'Exported API of @i18n-micro/core, generated from the source.'
outline: 'deep'
---

# `@i18n-micro/core`

36 exports across 2 entry points.
Generated from the API snapshot that [`pnpm run api:surface`](/guide/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/core`

```ts
import { /* … */ } from '@i18n-micro/core'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `BaseI18n` | class | 32 members |
| `BaseI18nOptions` | interface | 7 members |
| `createReactiveI18nStore` | function | `(options: ReactiveI18nStoreOptions) => ReactiveI18nStore` |
| `DateTimeFormatsConfig` | type | `Record<string, Record<string, Intl.DateTimeFormatOptions>>` |
| `defaultPlural` | const | `PluralFunc` |
| `FormatService` | class | 18 members |
| `FormatServiceOptions` | interface | 2 members |
| `getByPath` | function | `(obj: Record<string, unknown> \| null \| undefined, path: string) => unknown` |
| `hasTranslationValue` | function | `(obj: Record<string, unknown> \| null \| undefined, key: string) => boolean` |
| `interpolate` | function | `(template: string, params: Params) => string` |
| `isNoPrefixStrategy` | function | `(strategy: Strategies) => strategy is "no_prefix"` |
| `isPrefixAndDefaultStrategy` | function | `(strategy: Strategies) => strategy is "prefix_and_default"` |
| `isPrefixExceptDefaultStrategy` | function | `(strategy: Strategies) => strategy is "prefix_except_default"` |
| `isPrefixStrategy` | function | `(strategy: Strategies) => strategy is "prefix"` |
| `mergeTranslationChunk` | function | `(existing: Record<string, unknown>, incoming: Record<string, unknown>, options?: MergeTranslationChunkOptions) => Record<string, unknown>` |
| `MergeTranslationChunkOptions` | interface | 1 members |
| `NumberFormatsConfig` | type | `Record<string, Record<string, Intl.NumberFormatOptions>>` |
| `ReactiveI18nStore` | interface | 9 members |
| `resolveTranslation` | function | `(obj: Record<string, unknown> \| null \| undefined, key: string) => unknown \| null` |
| `translationCacheKey` | function | `(locale: string, routeName?: string) => string` |
| `TranslationStorage` | interface | 1 members |
| `useTranslationHelper` | function | `(storage?: TranslationStorage) => { hasCache(locale: string, page: string): boolean; getCache(locale: string, routeName: string): Translations \| undefined; setCache(_locale: string, _routeName: string, _cache: Map<string, unknown>): void; hasTranslation(locale: string, key: string): boolean; hasPageTranslation(locale: string, routeName: string): boolean; getTranslation<T = unknown>(locale: string, routeName: string, key: string): T \| null; loadTranslations(locale: string, data: Translations, routeName?: string): void; setTranslations(locale: string, data: Translations, routeName?: string): void; loadPageTranslations(locale: string, routeName: string, data: Translations): void; mergeTranslation(locale: string, routeName: string, newTranslations: Translations, _force?: boolean): void; clearCache(): void; }` |
| `withPrefixStrategy` | function | `(strategy: Strategies) => strategy is "prefix" \| "prefix_and_default"` |

<details>
<summary><code>BaseI18n</code> — 32 members</summary>

| Member | Type |
| --- | --- |
| `clearCache` | `() => void` |
| `formatter` | `FormatService` |
| `getCustomMissingHandler?` | `(() => MissingHandler \| null) \| undefined` |
| `getFallbackLocale` | `() => string` |
| `getLocale` | `() => string` |
| `getMissingContext` | `protected (routeContext?: unknown) => { locale: string; routeName: string; }` |
| `getRoute` | `() => string` |
| `has` | `(key: TranslationKey, routeContext?: unknown) => boolean` |
| `helper` | `{ hasCache(locale: string, page: string): boolean; getCache(locale: string, routeName: string): Translations \| undefined; setCache(_locale: string, _routeName: string, _cache: Map<string, unknown>): void; hasTranslation(locale: string, key: string): boolean; hasPageTranslation(locale: string, routeName: string): boolean; getTranslation<T = unknown>(locale: string, routeName: string, key: string): T \| null; loadTranslations(locale: string, data: Translations, routeName?: string): void; setTranslations(locale: string, data: Translations, routeName?: string): void; loadPageTranslations(locale: string, routeName: string, data: Translations): void; mergeTranslation(locale: string, routeName: string, newTranslations: Translations, _force?: boolean): void; clearCache(): void; }` |
| `keyRecorder` | `private ((cacheKey: string, key: string, value: unknown) => void) \| null` |
| `loadRouteTranslationsCore` | `(locale: string, routeName: string, translations: Translations, merge: boolean) => void` |
| `loadTranslationsCore` | `(locale: string, translations: Translations, merge: boolean, routeName?: string) => void` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn` | `boolean` |
| `pluralFunc` | `PluralFunc` |
| `recordResolvedKey` | `protected (cacheKey: string, key: string, value: unknown) => void` |
| `resolveDateTimeFormatArgs` | `private (keyOrOptions?: string \| Intl.DateTimeFormatOptions, localeOrOverrides?: string \| Intl.DateTimeFormatOptions, overrides?: Intl.DateTimeFormatOptions) => { locale: string; options: Intl.DateTimeFormatOptions \| undefined; }` |
| `resolveHas` | `protected (key: TranslationKey, routeContext?: unknown) => boolean` |
| `resolveLookup` | `protected (key: TranslationKey, routeContext?: unknown) => unknown \| null` |
| `resolveNumberFormatArgs` | `private (keyOrOptions?: string \| Intl.NumberFormatOptions, localeOrOverrides?: string \| Intl.NumberFormatOptions, overrides?: Intl.NumberFormatOptions) => { locale: string; options: Intl.NumberFormatOptions \| undefined; }` |
| `resolveRouteName` | `protected (routeContext?: unknown) => string` |
| `setKeyRecorder` | `(recorder: ((cacheKey: string, key: string, value: unknown) => void) \| null) => void` |
| `t` | `(key: TranslationKey, params?: Params, defaultValue?: string \| null, routeContext?: unknown) => CleanTranslation` |
| `tc` | `(key: TranslationKey, count: number \| Params, defaultValue?: string) => string` |
| `td` | `{ (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, overrides?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string; }` |
| `tdr` | `(value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string` |
| `tn` | `{ (value: number, options?: Intl.NumberFormatOptions): string; (value: number, key: string, overrides?: Intl.NumberFormatOptions): string; (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string; }` |
| `touch` | `protected () => void` |
| `ts` | `(key: TranslationKey, params?: Params, defaultValue?: string, routeContext?: unknown) => string` |
| `warnDev` | `protected (message: string) => void` |
| `warnMissing` | `protected (key: TranslationKey, routeContext?: unknown) => void` |
| `warnMissingFormat` | `protected (kind: "number" \| "datetime", key: string, locale: string) => void` |

</details>
<details>
<summary><code>BaseI18nOptions</code> — 7 members</summary>

| Member | Type |
| --- | --- |
| `datetimeFormats?` | `DateTimeFormatsConfig \| undefined` |
| `getCustomMissingHandler?` | `(() => MissingHandler \| null) \| undefined` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn?` | `boolean \| undefined` |
| `numberFormats?` | `NumberFormatsConfig \| undefined` |
| `plural?` | `PluralFunc \| undefined` |
| `storage?` | `TranslationStorage \| undefined` |

</details>
<details>
<summary><code>FormatService</code> — 18 members</summary>

| Member | Type |
| --- | --- |
| `clearCache` | `() => void` |
| `dateCache` | `private Map<string, Intl.DateTimeFormat>` |
| `datetimeFormats` | `private DateTimeFormatsConfig` |
| `formatDate` | `(value: Date \| number \| string, locale: string, options?: Intl.DateTimeFormatOptions) => string` |
| `formatNumber` | `(value: number, locale: string, options?: Intl.NumberFormatOptions) => string` |
| `formatRelativeTime` | `(value: Date \| number \| string, locale: string, options?: Intl.RelativeTimeFormatOptions) => string` |
| `getDateTimeFormats` | `() => DateTimeFormatsConfig` |
| `getDateTimeFormatter` | `(locale: string, options?: Intl.DateTimeFormatOptions) => Intl.DateTimeFormat` |
| `getNumberFormats` | `() => NumberFormatsConfig` |
| `getNumberFormatter` | `(locale: string, options?: Intl.NumberFormatOptions) => Intl.NumberFormat` |
| `getRelativeTimeFormatter` | `(locale: string, options?: Intl.RelativeTimeFormatOptions) => Intl.RelativeTimeFormat` |
| `numberCache` | `private Map<string, Intl.NumberFormat>` |
| `numberFormats` | `private NumberFormatsConfig` |
| `relativeCache` | `private Map<string, Intl.RelativeTimeFormat>` |
| `resolveDateTimeFormat` | `(locale: string, key: string) => Intl.DateTimeFormatOptions \| undefined` |
| `resolveNumberFormat` | `(locale: string, key: string) => Intl.NumberFormatOptions \| undefined` |
| `setDateTimeFormats` | `(formats: DateTimeFormatsConfig) => void` |
| `setNumberFormats` | `(formats: NumberFormatsConfig) => void` |

</details>
<details>
<summary><code>FormatServiceOptions</code> — 2 members</summary>

| Member | Type |
| --- | --- |
| `datetimeFormats?` | `DateTimeFormatsConfig \| undefined` |
| `numberFormats?` | `NumberFormatsConfig \| undefined` |

</details>
<details>
<summary><code>MergeTranslationChunkOptions</code> — 1 members</summary>

| Member | Type |
| --- | --- |
| `preserveExisting?` | `boolean \| undefined` |

</details>
<details>
<summary><code>ReactiveI18nStore</code> — 9 members</summary>

| Member | Type |
| --- | --- |
| `getFallbackLocale` | `() => string` |
| `getLocale` | `() => string` |
| `getRoute` | `() => string` |
| `getSnapshot` | `() => string` |
| `notify` | `() => void` |
| `setFallbackLocale` | `(locale: string) => void` |
| `setLocale` | `(locale: string) => void` |
| `setRoute` | `(routeName: string) => void` |
| `subscribe` | `(listener: () => void) => () => void` |

</details>
<details>
<summary><code>TranslationStorage</code> — 1 members</summary>

| Member | Type |
| --- | --- |
| `translations` | `Map<string, Translations>` |

</details>
## `@i18n-micro/core/helpers`

```ts
import { /* … */ } from '@i18n-micro/core/helpers'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `defaultPlural` | const | `PluralFunc` |
| `getByPath` | function | `(obj: Record<string, unknown> \| null \| undefined, path: string) => unknown` |
| `hasTranslationValue` | function | `(obj: Record<string, unknown> \| null \| undefined, key: string) => boolean` |
| `interpolate` | function | `(template: string, params: Params) => string` |
| `isNoPrefixStrategy` | function | `(strategy: Strategies) => strategy is "no_prefix"` |
| `isPrefixAndDefaultStrategy` | function | `(strategy: Strategies) => strategy is "prefix_and_default"` |
| `isPrefixExceptDefaultStrategy` | function | `(strategy: Strategies) => strategy is "prefix_except_default"` |
| `isPrefixStrategy` | function | `(strategy: Strategies) => strategy is "prefix"` |
| `mergeTranslationChunk` | function | `(existing: Record<string, unknown>, incoming: Record<string, unknown>, options?: MergeTranslationChunkOptions) => Record<string, unknown>` |
| `MergeTranslationChunkOptions` | interface | 1 members |
| `resolveTranslation` | function | `(obj: Record<string, unknown> \| null \| undefined, key: string) => unknown \| null` |
| `translationCacheKey` | function | `(locale: string, routeName?: string) => string` |
| `withPrefixStrategy` | function | `(strategy: Strategies) => strategy is "prefix" \| "prefix_and_default"` |

<code>MergeTranslationChunkOptions</code> — 1 members, documented above.

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
