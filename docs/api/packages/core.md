---
title: '@i18n-micro/core'
description: 'Exported API of @i18n-micro/core, generated from the source.'
outline: 'deep'
---

# `@i18n-micro/core`

91 exports across 4 entry points.
Generated from the API snapshot that [`pnpm run api:surface`](/contributing/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/core`

```ts
import { /* … */ } from '@i18n-micro/core'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `BaseI18n` | class | 40 members |
| `BaseI18nOptions` | interface | 8 members |
| `collectTranslationPaths` | function | `(obj: Tree, paths: Set<string>, prefix?: string, ancestors?: Set<object>) => void` |
| `createReactiveI18nStore` | function | `(options: ReactiveI18nStoreOptions) => ReactiveI18nStore` |
| `DateTimeFormatsConfig` | type | `Record<string, Record<string, Intl.DateTimeFormatOptions>>` |
| `defaultPlural` | const | `PluralFunc` |
| `escapeHtml` | const | `(text: string) => string` |
| `externalLinkHref` | function | `(to: unknown) => string \| undefined` |
| `FormatService` | class | 20 members |
| `FormatServiceOptions` | interface | 3 members |
| `getByPath` | function | `(obj: Tree \| null \| undefined, path: string) => unknown` |
| `hasTranslationValue` | function | `(obj: Tree \| null \| undefined, key: string) => boolean` |
| `interpolate` | function | `(template: string, params: Params) => string` |
| `isNoPrefixStrategy` | const | `(strategy: Strategies) => strategy is "no_prefix"` |
| `isPlainClick` | function | `(event: MouseEvent) => boolean` |
| `isPrefixAndDefaultStrategy` | const | `(strategy: Strategies) => strategy is "prefix_and_default"` |
| `isPrefixExceptDefaultStrategy` | const | `(strategy: Strategies) => strategy is "prefix_except_default"` |
| `isPrefixStrategy` | const | `(strategy: Strategies) => strategy is "prefix"` |
| `isSamePage` | const | `(a: string, b: string) => boolean` |
| `mergeTranslationChunk` | function | `(existing: Tree, incoming: Tree, options?: MergeTranslationChunkOptions) => Tree` |
| `MergeTranslationChunkOptions` | interface | 1 members |
| `mergeTranslationLayers` | function | `(lower: Tree, upper: Tree) => Tree` |
| `NumberFormatsConfig` | type | `Record<string, Record<string, Intl.NumberFormatOptions>>` |
| `ownValue` | function | `(obj: object, key: string) => unknown` |
| `pluralForm` | function | `(translation: string, count: number, locale: string) => string` |
| `ReactiveI18nStore` | interface | 9 members |
| `ReactiveI18nStoreOptions` | interface | 3 members |
| `resolveCachedTranslation` | function | `(tree: Tree \| null \| undefined, key: string) => unknown \| null` |
| `ResolvedText` | interface | 2 members |
| `resolveText` | function | `(i18n: TextHost, options: ResolveTextOptions) => ResolvedText \| null` |
| `ResolveTextOptions` | interface | 9 members |
| `resolveTranslation` | function | `(obj: Tree \| null \| undefined, key: string) => unknown \| null` |
| `setTranslationAtKey` | function | `(tree: Tree, key: string, value: unknown) => Tree` |
| `TextHost` | interface | 7 members |
| `tokenize` | function | `(template: string) => readonly string[]` |
| `translationCacheKey` | function | `(locale: string, routeName?: string) => string` |
| `TranslationHelper` | class | 16 members |
| `TranslationStorage` | interface | 1 members |
| `Tree` | type | `Record<string, unknown>` |
| `useTranslationHelper` | function | `(storage?: TranslationStorage) => TranslationHelper` |
| `withPrefixStrategy` | const | `(strategy: Strategies) => strategy is "prefix" \| "prefix_and_default"` |

<details>
<summary><code>BaseI18n</code> — 40 members</summary>

| Member | Type |
| --- | --- |
| `activeKey` | `private ChunkKey` |
| `activeRootKey` | `private ChunkKey` |
| `clearCache` | `() => void` |
| `extend` | `<M extends Record<string, unknown>>(methods: M & ThisType<BaseI18n & M>) => BaseI18n & M` |
| `fallbackKey` | `private ChunkKey` |
| `fallbackRootKey` | `private ChunkKey` |
| `formatArgs` | `private <O extends object>(kind: "number" \| "datetime", [keyOrOptions, localeOrOverrides, overrides]: FormatArgs<O>) => [string, O \| undefined]` |
| `formatter` | `FormatService` |
| `getCustomMissingHandler?` | `(() => MissingHandler \| null) \| undefined` |
| `getFallbackLocale` | `() => string` |
| `getLocale` | `() => string` |
| `getMissingContext` | `protected (routeContext?: unknown) => { locale: string; routeName: string; }` |
| `getRoute` | `() => string` |
| `has` | `(key: TranslationKey, routeContext?: unknown) => boolean` |
| `helper` | `TranslationHelper` |
| `loadRouteTranslationsCore` | `(locale: string, routeName: string, translations: Translations, merge: boolean) => void` |
| `loadTranslationsCore` | `(locale: string, translations: Translations, merge: boolean, routeName?: string) => void` |
| `lookupLocale` | `private (locale: string, route: string, name: string, page: ChunkKey, root: ChunkKey) => unknown \| null` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn` | `boolean` |
| `new` | `abstract (options?: BaseI18nOptions): BaseI18n` |
| `onTranslationsChanged` | `protected () => void` |
| `pluralFunc` | `PluralFunc` |
| `resolveHas` | `protected (key: TranslationKey, routeContext?: unknown) => boolean` |
| `resolveLookup` | `protected (key: TranslationKey, routeContext?: unknown) => unknown \| null` |
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
| `write` | `private (locale: string, routeName: string, translations: Translations, merge: boolean) => void` |

</details>

<details>
<summary><code>BaseI18nOptions</code> — 8 members</summary>

| Member | Type |
| --- | --- |
| `datetimeFormats?` | `DateTimeFormatsConfig \| undefined` |
| `getCustomMissingHandler?` | `(() => MissingHandler \| null) \| undefined` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn?` | `boolean \| undefined` |
| `numberFormats?` | `NumberFormatsConfig \| undefined` |
| `plural?` | `PluralFunc \| undefined` |
| `storage?` | `TranslationStorage \| undefined` |
| `timeZone?` | `string \| undefined` |

</details>

<details>
<summary><code>FormatService</code> — 20 members</summary>

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
| `timeZone?` | `private string \| undefined` |

</details>

<details>
<summary><code>FormatServiceOptions</code> — 3 members</summary>

| Member | Type |
| --- | --- |
| `datetimeFormats?` | `DateTimeFormatsConfig \| undefined` |
| `numberFormats?` | `NumberFormatsConfig \| undefined` |
| `timeZone?` | `string \| undefined` |

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
<summary><code>ReactiveI18nStoreOptions</code> — 3 members</summary>

| Member | Type |
| --- | --- |
| `fallbackLocale?` | `string \| undefined` |
| `locale` | `string` |
| `route?` | `string \| undefined` |

</details>

<details>
<summary><code>ResolvedText</code> — 2 members</summary>

| Member | Type |
| --- | --- |
| `params` | `Params` |
| `template` | `string` |

</details>

<details>
<summary><code>ResolveTextOptions</code> — 9 members</summary>

| Member | Type |
| --- | --- |
| `customPluralRule?` | `PluralFunc \| null \| undefined` |
| `date?` | `string \| number \| Date \| null \| undefined` |
| `hideIfEmpty?` | `boolean \| undefined` |
| `html?` | `boolean \| undefined` |
| `keypath` | `string` |
| `number?` | `string \| number \| null \| undefined` |
| `params?` | `Params \| undefined` |
| `plural?` | `string \| number \| null \| undefined` |
| `relativeDate?` | `string \| number \| Date \| null \| undefined` |

</details>

<details>
<summary><code>TextHost</code> — 7 members</summary>

| Member | Type |
| --- | --- |
| `getLocale` | `() => string` |
| `pluralFunc` | `PluralFunc` |
| `t` | `(key: TranslationKey, params?: Params, defaultValue?: string \| null) => CleanTranslation` |
| `tc` | `(key: TranslationKey, count: number \| Params, defaultValue?: string) => string` |
| `td` | `(value: Date \| number \| string) => string` |
| `tdr` | `(value: Date \| number \| string) => string` |
| `tn` | `(value: number) => string` |

</details>

<details>
<summary><code>TranslationHelper</code> — 16 members</summary>

| Member | Type |
| --- | --- |
| `clearCache` | `() => void` |
| `getCache` | `(locale: string, routeName: string) => Translations \| undefined` |
| `getTranslation` | `<T = unknown>(locale: string, routeName: string, key: string) => T \| null` |
| `hasCache` | `(locale: string, routeName: string) => boolean` |
| `hasPageTranslation` | `(locale: string, routeName: string) => boolean` |
| `hasTranslation` | `(locale: string, key: string) => boolean` |
| `lastLeaves` | `private Map<string, unknown>` |
| `lastTree` | `private Translations \| undefined` |
| `leavesOf` | `private (tree: Translations) => Map<string, unknown>` |
| `loadPageTranslations` | `(locale: string, routeName: string, data: Translations) => void` |
| `loadTranslations` | `(locale: string, data: Translations, routeName?: string) => void` |
| `lookup` | `(chunkKey: string, key: string) => unknown \| null` |
| `mergeTranslation` | `(locale: string, routeName: string, incoming: Translations, _force?: boolean) => void` |
| `new` | `(storage?: TranslationStorage \| undefined): TranslationHelper` |
| `setTranslations` | `(locale: string, data: Translations, routeName?: string) => void` |
| `translations` | `Map<string, Translations>` |

</details>

<details>
<summary><code>TranslationStorage</code> — 1 members</summary>

| Member | Type |
| --- | --- |
| `translations` | `Map<string, Translations>` |

</details>
## `@i18n-micro/core/devtools`

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

<details>
<summary><code>BuildInspectorTreeOptions</code> — 6 members</summary>

| Member | Type |
| --- | --- |
| `activeLocale` | `string` |
| `activeRouteName` | `string` |
| `activeTranslations?` | `Record<string, unknown> \| undefined` |
| `configuredLocales` | `Locale[]` |
| `nodeId` | `string` |
| `storage` | `TranslationStorage` |

</details>

<details>
<summary><code>I18nDevtoolsInspectorNode</code> — 4 members</summary>

| Member | Type |
| --- | --- |
| `children?` | `I18nDevtoolsInspectorNode[] \| undefined` |
| `id` | `string` |
| `label` | `string` |
| `tags?` | `{ label: string; textColor: number; backgroundColor: number; tooltip?: string; }[] \| undefined` |

</details>

<details>
<summary><code>I18nDevtoolsStateSnapshot</code> — 7 members</summary>

| Member | Type |
| --- | --- |
| `cachedChunks` | `number` |
| `defaultLocale?` | `string \| undefined` |
| `fallbackLocale?` | `string \| undefined` |
| `locale` | `string` |
| `locales` | `{ code: string; displayName?: string; disabled?: boolean; }[]` |
| `routeName` | `string` |
| `strategy?` | `string \| undefined` |

</details>
## `@i18n-micro/core/helpers`

```ts
import { /* … */ } from '@i18n-micro/core/helpers'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `collectTranslationPaths` | function | `(obj: Tree, paths: Set<string>, prefix?: string, ancestors?: Set<object>) => void` |
| `defaultPlural` | const | `PluralFunc` |
| `escapeHtml` | const | `(text: string) => string` |
| `externalLinkHref` | function | `(to: unknown) => string \| undefined` |
| `getByPath` | function | `(obj: Tree \| null \| undefined, path: string) => unknown` |
| `hasTranslationValue` | function | `(obj: Tree \| null \| undefined, key: string) => boolean` |
| `interpolate` | function | `(template: string, params: Params) => string` |
| `isNoPrefixStrategy` | const | `(strategy: Strategies) => strategy is "no_prefix"` |
| `isPlainClick` | function | `(event: MouseEvent) => boolean` |
| `isPrefixAndDefaultStrategy` | const | `(strategy: Strategies) => strategy is "prefix_and_default"` |
| `isPrefixExceptDefaultStrategy` | const | `(strategy: Strategies) => strategy is "prefix_except_default"` |
| `isPrefixStrategy` | const | `(strategy: Strategies) => strategy is "prefix"` |
| `isSamePage` | const | `(a: string, b: string) => boolean` |
| `mergeTranslationChunk` | function | `(existing: Tree, incoming: Tree, options?: MergeTranslationChunkOptions) => Tree` |
| `MergeTranslationChunkOptions` | interface | 1 members |
| `mergeTranslationLayers` | function | `(lower: Tree, upper: Tree) => Tree` |
| `ownValue` | function | `(obj: object, key: string) => unknown` |
| `pluralForm` | function | `(translation: string, count: number, locale: string) => string` |
| `ResolvedText` | interface | 2 members |
| `resolveText` | function | `(i18n: TextHost, options: ResolveTextOptions) => ResolvedText \| null` |
| `ResolveTextOptions` | interface | 9 members |
| `resolveTranslation` | function | `(obj: Tree \| null \| undefined, key: string) => unknown \| null` |
| `setTranslationAtKey` | function | `(tree: Tree, key: string, value: unknown) => Tree` |
| `TextHost` | interface | 7 members |
| `tokenize` | function | `(template: string) => readonly string[]` |
| `translationCacheKey` | function | `(locale: string, routeName?: string) => string` |
| `Tree` | type | `Record<string, unknown>` |
| `withPrefixStrategy` | const | `(strategy: Strategies) => strategy is "prefix" \| "prefix_and_default"` |

<code>MergeTranslationChunkOptions</code> — 1 members, identical to `MergeTranslationChunkOptions` above.

<code>ResolvedText</code> — 2 members, identical to `ResolvedText` above.

<code>ResolveTextOptions</code> — 9 members, identical to `ResolveTextOptions` above.

<code>TextHost</code> — 7 members, identical to `TextHost` above.
## `@i18n-micro/core/render`

```ts
import { /* … */ } from '@i18n-micro/core/render'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `createLocaleSwitcher` | function | `(vue: SwitcherVue, adapter: SwitcherAdapter, props: SwitcherProps, slots: RenderSlots) => () => unknown` |
| `I18nTRenderProps` | interface | 11 members |
| `RenderApi` | interface | 2 members |
| `renderI18nT` | function | `(api: RenderApi, i18n: TextHost, props: I18nTRenderProps, slots: RenderSlots, attrs: Record<string, unknown>) => unknown` |
| `RenderSlot` | type | `(props?: Record<string, unknown>) => unknown` |
| `RenderSlots` | type | `Readonly<Record<string, RenderSlot \| undefined>>` |
| `ResolveTextOptions` | interface | 9 members |
| `SwitcherAdapter` | interface | 7 members |
| `SwitcherProps` | interface | 9 members |
| `SwitcherVue` | interface | 5 members |
| `TextHost` | interface | 7 members |

<details>
<summary><code>I18nTRenderProps</code> — 11 members</summary>

| Member | Type |
| --- | --- |
| `customPluralRule?` | `PluralFunc \| null \| undefined` |
| `date?` | `string \| number \| Date \| null \| undefined` |
| `defaultValue?` | `string \| undefined` |
| `hideIfEmpty?` | `boolean \| undefined` |
| `html?` | `boolean \| undefined` |
| `keypath` | `string` |
| `number?` | `string \| number \| null \| undefined` |
| `params?` | `Params \| undefined` |
| `plural?` | `string \| number \| null \| undefined` |
| `relativeDate?` | `string \| number \| Date \| null \| undefined` |
| `tag?` | `string \| undefined` |

</details>

<details>
<summary><code>RenderApi</code> — 2 members</summary>

| Member | Type |
| --- | --- |
| `Fragment` | `unknown` |
| `h` | `(type: any, props?: any, children?: any) => any` |

</details>

<code>ResolveTextOptions</code> — 9 members, identical to `ResolveTextOptions` above.

<details>
<summary><code>SwitcherAdapter</code> — 7 members</summary>

| Member | Type |
| --- | --- |
| `href` | `(code: string) => string` |
| `keepList?` | `boolean \| undefined` |
| `locale` | `() => string` |
| `localeName?` | `(() => string \| null) \| undefined` |
| `locales` | `() => Locale[]` |
| `onMissingLabel?` | `((code: string) => void) \| undefined` |
| `select` | `(code: string) => void` |

</details>

<details>
<summary><code>SwitcherProps</code> — 9 members</summary>

| Member | Type |
| --- | --- |
| `customActiveLinkStyle?` | `object \| undefined` |
| `customButtonStyle?` | `object \| undefined` |
| `customDisabledLinkStyle?` | `object \| undefined` |
| `customDropdownStyle?` | `object \| undefined` |
| `customIconStyle?` | `object \| undefined` |
| `customItemStyle?` | `object \| undefined` |
| `customLabels?` | `Record<string, string> \| undefined` |
| `customLinkStyle?` | `object \| undefined` |
| `customWrapperStyle?` | `object \| undefined` |

</details>

<details>
<summary><code>SwitcherVue</code> — 5 members</summary>

| Member | Type |
| --- | --- |
| `Fragment` | `unknown` |
| `h` | `(type: any, props?: any, children?: any) => any` |
| `onMounted` | `(hook: () => void) => void` |
| `onUnmounted` | `(hook: () => void) => void` |
| `ref` | `<T>(value: T) => { value: T; }` |

</details>

<code>TextHost</code> — 7 members, identical to `TextHost` above.

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
