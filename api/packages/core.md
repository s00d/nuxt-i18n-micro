---
url: 'https://s00d.github.io/nuxt-i18n-micro/api/packages/core.md'
description: 'Exported API of @i18n-micro/core, generated from the source.'
---

# `@i18n-micro/core`

53 exports across 3 entry points.
Generated from the API snapshot that [`pnpm run api:surface`](/guide/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/core`

```ts
import { /* … */ } from '@i18n-micro/core'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `BaseI18n` | class | 34 members |
| `BaseI18nOptions` | interface | 7 members |
| `collectTranslationPaths` | function | `(obj: Record<string, unknown>, paths: Set<string>, prefix?: string) => void` |
| `createReactiveI18nStore` | function | `(options: ReactiveI18nStoreOptions) => ReactiveI18nStore` |
| `DateTimeFormatsConfig` | type | `Record<string, Record<string, Intl.DateTimeFormatOptions>>` |
| `defaultPlural` | const | `PluralFunc` |
| `FormatService` | class | 19 members |
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
| `mergeTranslationLayers` | function | `(lower: Record<string, unknown>, upper: Record<string, unknown>) => Record<string, unknown>` |
| `NumberFormatsConfig` | type | `Record<string, Record<string, Intl.NumberFormatOptions>>` |
| `ReactiveI18nStore` | interface | 9 members |
| `resolveTranslation` | function | `(obj: Record<string, unknown> \| null \| undefined, key: string) => unknown \| null` |
| `setTranslationAtKey` | function | `(tree: Record<string, unknown>, key: string, value: unknown) => Record<string, unknown>` |
| `translationCacheKey` | function | `(locale: string, routeName?: string) => string` |
| `TranslationStorage` | interface | 1 members |
| `useTranslationHelper` | function | `(storage?: TranslationStorage) => { hasCache(locale: string, page: string): boolean; getCache(locale: string, routeName: string): Translations \| undefined; setCache(_locale: string, _routeName: string, _cache: Map<string, unknown>): void; hasTranslation(locale: string, key: string): boolean; hasPageTranslation(locale: string, routeName: string): boolean; getTranslation<T = unknown>(locale: string, routeName: string, key: string): T \| null; loadTranslations(locale: string, data: Translations, routeName?: string): void; setTranslations(locale: string, data: Translations, routeName?: string): void; loadPageTranslations(locale: string, routeName: string, data: Translations): void; mergeTranslation(locale: string, routeName: string, newTranslations: Translations, _force?: boolean): void; clearCache(): void; }` |
| `withPrefixStrategy` | function | `(strategy: Strategies) => strategy is "prefix" \| "prefix_and_default"` |

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
| `loadRouteTranslationsCore` | `(locale: string, routeName: string, translations: Translations, merge: boolean) => void` |
| `loadTranslationsCore` | `(locale: string, translations: Translations, merge: boolean, routeName?: string) => void` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn` | `boolean` |
| `new` | `abstract (options?: BaseI18nOptions): BaseI18n` |
| `onTranslationsChanged` | `protected () => void` |
| `pluralFunc` | `PluralFunc` |
| `resolveDateTimeFormatArgs` | `private (keyOrOptions?: string \| Intl.DateTimeFormatOptions, localeOrOverrides?: string \| Intl.DateTimeFormatOptions, overrides?: Intl.DateTimeFormatOptions) => { locale: string; options: Intl.DateTimeFormatOptions \| undefined; }` |
| `resolveHas` | `protected (key: TranslationKey, routeContext?: unknown) => boolean` |
| `resolveLookup` | `protected (key: TranslationKey, routeContext?: unknown) => unknown \| null` |
| `resolveNumberFormatArgs` | `private (keyOrOptions?: string \| Intl.NumberFormatOptions, localeOrOverrides?: string \| Intl.NumberFormatOptions, overrides?: Intl.NumberFormatOptions) => { locale: string; options: Intl.NumberFormatOptions \| undefined; }` |
| `resolveRouteName` | `protected (routeContext?: unknown) => string` |
| `resolveTranslations` | `(routeContext?: unknown) => Translations` |
| `resolveTranslationTree` | `protected (lower: Record<string, unknown>, upper: Record<string, unknown>) => Translations` |
| `setTranslation` | `(key: TranslationKey, value: unknown) => void` |
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

| Member | Type |
| --- | --- |
| `datetimeFormats?` | `DateTimeFormatsConfig \| undefined` |
| `getCustomMissingHandler?` | `(() => MissingHandler \| null) \| undefined` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn?` | `boolean \| undefined` |
| `numberFormats?` | `NumberFormatsConfig \| undefined` |
| `plural?` | `PluralFunc \| undefined` |
| `storage?` | `TranslationStorage \| undefined` |

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
| `new` | `(options?: FormatServiceOptions): FormatService` |
| `numberCache` | `private Map<string, Intl.NumberFormat>` |
| `numberFormats` | `private NumberFormatsConfig` |
| `relativeCache` | `private Map<string, Intl.RelativeTimeFormat>` |
| `resolveDateTimeFormat` | `(locale: string, key: string) => Intl.DateTimeFormatOptions \| undefined` |
| `resolveNumberFormat` | `(locale: string, key: string) => Intl.NumberFormatOptions \| undefined` |
| `setDateTimeFormats` | `(formats: DateTimeFormatsConfig) => void` |
| `setNumberFormats` | `(formats: NumberFormatsConfig) => void` |

| Member | Type |
| --- | --- |
| `datetimeFormats?` | `DateTimeFormatsConfig \| undefined` |
| `numberFormats?` | `NumberFormatsConfig \| undefined` |

| Member | Type |
| --- | --- |
| `preserveExisting?` | `boolean \| undefined` |

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

| Member | Type |
| --- | --- |
| `translations` | `Map<string, Translations>` |

```ts
import { /* … */ } from '@i18n-micro/core/devtools'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `buildInspectorState` | function | `(snapshot: I18nDevtoolsStateSnapshot) => Record<string, Array<{ key: string; value: unknown; editable?: boolean; }>>` |
| `buildInspectorTree` | function | `(options: BuildInspectorTreeOptions) => I18nDevtoolsInspectorNode[]` |
| `BuildInspectorTreeOptions` | interface | 6 members |
| `countTranslationKeys` | function | `(translations: Translations \| Record<string, unknown> \| undefined) => number` |
| `decodeInspectorPath` | function | `(encoded: string) => string[]` |
| `encodeInspectorPath` | function | `(segments: string[]) => string` |
| `flattenTranslationNode` | function | `(obj: Record<string, unknown>, parentSegments?: string[]) => I18nDevtoolsInspectorNode[]` |
| `getByInspectorPath` | function | `(obj: Record<string, unknown>, segments: string[]) => unknown` |
| `I18nDevtoolsInspectorNode` | interface | 4 members |
| `I18nDevtoolsStateSnapshot` | interface | 7 members |
| `parseInspectorNodeId` | function | `(nodeId: string) => { kind: "root" \| "active" \| "locale" \| "chunk" \| "key"; locale?: string; routeName?: string; path?: string; segments?: string[]; }` |

| Member | Type |
| --- | --- |
| `activeLocale` | `string` |
| `activeRouteName` | `string` |
| `activeTranslations?` | `Record<string, unknown> \| undefined` |
| `configuredLocales` | `Locale[]` |
| `nodeId` | `string` |
| `storage` | `TranslationStorage` |

| Member | Type |
| --- | --- |
| `children?` | `I18nDevtoolsInspectorNode[] \| undefined` |
| `id` | `string` |
| `label` | `string` |
| `tags?` | `{ label: string; textColor: number; backgroundColor: number; tooltip?: string; }[] \| undefined` |

| Member | Type |
| --- | --- |
| `cachedChunks` | `number` |
| `defaultLocale?` | `string \| undefined` |
| `fallbackLocale?` | `string \| undefined` |
| `locale` | `string` |
| `locales` | `{ code: string; displayName?: string; disabled?: boolean; }[]` |
| `routeName` | `string` |
| `strategy?` | `string \| undefined` |

```ts
import { /* … */ } from '@i18n-micro/core/helpers'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `collectTranslationPaths` | function | `(obj: Record<string, unknown>, paths: Set<string>, prefix?: string) => void` |
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
| `mergeTranslationLayers` | function | `(lower: Record<string, unknown>, upper: Record<string, unknown>) => Record<string, unknown>` |
| `resolveTranslation` | function | `(obj: Record<string, unknown> \| null \| undefined, key: string) => unknown \| null` |
| `setTranslationAtKey` | function | `(tree: Record<string, unknown>, key: string, value: unknown) => Record<string, unknown>` |
| `translationCacheKey` | function | `(locale: string, routeName?: string) => string` |
| `withPrefixStrategy` | function | `(strategy: Strategies) => strategy is "prefix" \| "prefix_and_default"` |

MergeTranslationChunkOptions — 1 members, identical to `MergeTranslationChunkOptions` above.

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
