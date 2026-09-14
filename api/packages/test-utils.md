---
url: 'https://s00d.github.io/nuxt-i18n-micro/api/packages/test-utils.md'
description: 'Exported API of @i18n-micro/test-utils, generated from the source.'
---

# `@i18n-micro/test-utils`

50 exports across 2 entry points.
Generated from the API snapshot that [`pnpm run api:surface`](/guide/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/test-utils`

```ts
import { /* … */ } from '@i18n-micro/test-utils'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `_t` | function | `(route: unknown) => (key: TranslationKey, params?: Params, defaultValue?: string \| null) => Translation` |
| `_ts` | function | `(route: unknown) => (key: TranslationKey, params?: Params, defaultValue?: string \| null) => string` |
| `createFakeI18n` | function | `(options?: CreateFakeI18nOptions) => { $i18nStrategy: { localizePath(path: string, loc?: string): string; }; $getI18nConfig: () => { locales: Locale[]; defaultLocale: string \| undefined; strategy: "prefix"; }; $getLocale: (_route?: unknown) => string; $setLocale: (val: string) => void; $getLocaleName: () => string \| null; $setLocaleName: (val: string \| null) => void; $getLocales: () => Locale[]; $setLocales: (val: Locale[]) => void; $defaultLocale: () => string \| undefined; $setDefaultLocale: (val: string \| undefined) => void; $getRouteName: (_route?: unknown, _locale?: string) => string; $settRouteName: (val: string) => void; $setRouteName: (val: string) => void; $t: (key: TranslationKey, params?: Params, defaultValue?: string \| null) => Translation; $_t: (route: unknown) => (key: TranslationKey, params?: Params, defaultValue?: string \| null) => Translation; $ts: (key: TranslationKey, params?: Params, defaultValue?: string \| null) => string; $_ts: (route: unknown) => (key: TranslationKey, params?: Params, defaultValue?: string \| null) => string; $tc: (key: TranslationKey, params: number \| Params, defaultValue?: string) => string; $tn: (value: number, options?: Intl.NumberFormatOptions) => string; $td: (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions) => string; $tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; $has: (key: TranslationKey) => boolean; $resolveTranslations: () => Record<string, unknown>; $setTranslation: (key: TranslationKey, value: unknown) => void; $mergeTranslations: (newTranslations: Translations) => void; $switchLocaleRoute: (loc: string) => { path: string; name: string; }; $switchLocalePath: (loc: string) => string; $switchLocale: (val: string) => void; $switchRoute: (route: unknown, toLocale?: string) => void; $localeRoute: (to: unknown, loc?: string) => { name?: string \| symbol \| undefined; path: string; }; $localePath: (to: unknown, loc?: string) => string; $setI18nRouteParams: (value: unknown) => unknown; $loadPageTranslations: (loc: string, page: string, translations: Translations) => Promise<void>; $setMissingHandler: (handler: MissingHandler \| null) => void; $setTranslationsFromJson: (loc: string, translations: Record<string, unknown>) => Promise<void>; }` |
| `CreateFakeI18nOptions` | interface | 1 members |
| `defaultLocale` | const | `() => string \| undefined` |
| `getI18nConfig` | function | `() => { locales: Locale[]; defaultLocale: string \| undefined; strategy: "prefix"; }` |
| `getLocale` | const | `(_route?: unknown) => string` |
| `getLocaleName` | const | `() => string \| null` |
| `getLocales` | const | `() => Locale[]` |
| `getRouteName` | const | `(_route?: unknown, _locale?: string) => string` |
| `Getter` | type | `(key: TranslationKey, params?: Record<string, string \| number \| boolean>, defaultValue?: string) => unknown` |
| `has` | const | `(key: TranslationKey) => boolean` |
| `i18nStrategy` | const | `{ localizePath(path: string, loc?: string): string; }` |
| `i18nUtils` | const | `{ t: (key: TranslationKey, params?: Params, defaultValue?: string \| null) => Translation; tc: (key: TranslationKey, params: number \| Params, defaultValue?: string) => string; ts: (key: TranslationKey, params?: Params, defaultValue?: string \| null) => string; tn: (value: number, options?: Intl.NumberFormatOptions) => string; td: (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions) => string; tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; has: (key: TranslationKey) => boolean; resetI18n: (options?: ResetI18nOptions) => void; createFakeI18n: (options?: CreateFakeI18nOptions) => { $i18nStrategy: { localizePath(path: string, loc?: string): string; }; $getI18nConfig: () => { locales: Locale[]; defaultLocale: string \| undefined; strategy: "prefix"; }; $getLocale: (_route?: unknown) => string; $setLocale: (val: string) => void; $getLocaleName: () => string \| null; $setLocaleName: (val: string \| null) => void; $getLocales: () => Locale[]; $setLocales: (val: Locale[]) => void; $defaultLocale: () => string \| undefined; $setDefaultLocale: (val: string \| undefined) => void; $getRouteName: (_route?: unknown, _locale?: string) => string; $settRouteName: (val: string) => void; $setRouteName: (val: string) => void; $t: (key: TranslationKey, params?: Params, defaultValue?: string \| null) => Translation; $_t: (route: unknown) => (key: TranslationKey, params?: Params, defaultValue?: string \| null) => Translation; $ts: (key: TranslationKey, params?: Params, defaultValue?: string \| null) => string; $_ts: (route: unknown) => (key: TranslationKey, params?: Params, defaultValue?: string \| null) => string; $tc: (key: TranslationKey, params: number \| Params, defaultValue?: string) => string; $tn: (value: number, options?: Intl.NumberFormatOptions) => string; $td: (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions) => string; $tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; $has: (key: TranslationKey) => boolean; $resolveTranslations: () => Record<string, unknown>; $setTranslation: (key: TranslationKey, value: unknown) => void; $mergeTranslations: (newTranslations: Translations) => void; $switchLocaleRoute: (loc: string) => { path: string; name: string; }; $switchLocalePath: (loc: string) => string; $switchLocale: (val: string) => void; $switchRoute: (route: unknown, toLocale?: string) => void; $localeRoute: (to: unknown, loc?: string) => { name?: string \| symbol \| undefined; path: string; }; $localePath: (to: unknown, loc?: string) => string; $setI18nRouteParams: (value: unknown) => unknown; $loadPageTranslations: (loc: string, page: string, translations: Translations) => Promise<void>; $setMissingHandler: (handler: MissingHandler \| null) => void; $setTranslationsFromJson: (loc: string, translations: Record<string, unknown>) => Promise<void>; }; setTranslationsFromJson: (loc: string, translations: Record<string, unknown>) => Promise<void>; loadPageTranslations: (loc: string, page: string, translations: Translations) => Promise<void>; setMissingHandler: (handler: MissingHandler \| null) => void; getI18nConfig: () => { locales: Locale[]; defaultLocale: string \| undefined; strategy: "prefix"; }; i18nStrategy: { localizePath(path: string, loc?: string): string; }; getLocale: (_route?: unknown) => string; setLocale: (val: string) => void; getLocaleName: () => string \| null; setLocaleName: (val: string \| null) => void; getLocales: () => Locale[]; setLocales: (val: Locale[]) => void; defaultLocale: () => string \| undefined; setDefaultLocale: (val: string \| undefined) => void; getRouteName: (_route?: unknown, _locale?: string) => string; settRouteName: (val: string) => void; setRouteName: (val: string) => void; _t: (route: unknown) => (key: TranslationKey, params?: Params, defaultValue?: string \| null) => Translation; _ts: (route: unknown) => (key: TranslationKey, params?: Params, defaultValue?: string \| null) => string; mergeTranslations: (newTranslations: Translations) => void; resolveTranslations: () => Record<string, unknown>; setTranslation: (key: TranslationKey, value: unknown) => void; switchLocaleRoute: (loc: string) => { path: string; name: string; }; switchLocalePath: (loc: string) => string; switchLocale: (val: string) => void; switchRoute: (route: unknown, toLocale?: string) => void; localeRoute: (to: unknown, loc?: string) => { name?: string \| symbol \| undefined; path: string; }; localePath: (to: unknown, loc?: string) => string; setI18nRouteParams: (value: unknown) => unknown; }` |
| `loadPageTranslations` | function | `(loc: string, page: string, translations: Translations) => Promise<void>` |
| `Locale` | interface | 7 members |
| `localePath` | function | `(to: unknown, loc?: string) => string` |
| `localeRoute` | function | `(to: unknown, loc?: string) => { name?: string \| symbol \| undefined; path: string; }` |
| `mergeTranslations` | const | `(newTranslations: Translations) => void` |
| `resetI18n` | function | `(options?: ResetI18nOptions) => void` |
| `ResetI18nOptions` | interface | 5 members |
| `resolveTranslations` | const | `() => Record<string, unknown>` |
| `setDefaultLocale` | const | `(val: string \| undefined) => void` |
| `setI18nRouteParams` | function | `(value: unknown) => unknown` |
| `setLocale` | const | `(val: string) => void` |
| `setLocaleName` | const | `(val: string \| null) => void` |
| `setLocales` | const | `(val: Locale[]) => void` |
| `setMissingHandler` | function | `(handler: MissingHandler \| null) => void` |
| `setRouteName` | const | `(val: string) => void` |
| `setTranslation` | const | `(key: TranslationKey, value: unknown) => void` |
| `setTranslationsFromJson` | function | `(loc: string, translations: Record<string, unknown>) => Promise<void>` |
| `settRouteName` | const | `(val: string) => void` |
| `SpyFn` | type | `<T>(fn: T) => T` |
| `switchLocale` | function | `(val: string) => void` |
| `switchLocalePath` | function | `(loc: string) => string` |
| `switchLocaleRoute` | function | `(loc: string) => { path: string; name: string; }` |
| `switchRoute` | function | `(route: unknown, toLocale?: string) => void` |
| `t` | function | `(key: TranslationKey, params?: Params, defaultValue?: string \| null) => Translation` |
| `tc` | function | `(key: TranslationKey, params: number \| Params, defaultValue?: string) => string` |
| `td` | const | `(value: Date \| number \| string, options?: Intl.DateTimeFormatOptions) => string` |
| `tdr` | function | `(value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string` |
| `tn` | const | `(value: number, options?: Intl.NumberFormatOptions) => string` |
| `ts` | const | `(key: TranslationKey, params?: Params, defaultValue?: string \| null) => string` |

| Member | Type |
| --- | --- |
| `spy?` | `SpyFn \| undefined` |

| Member | Type |
| --- | --- |
| `baseDefault?` | `boolean \| undefined` |
| `baseUrl?` | `string \| undefined` |
| `code` | `string` |
| `dir?` | `"ltr" \| "rtl" \| "auto" \| undefined` |
| `disabled?` | `boolean \| undefined` |
| `displayName?` | `string \| undefined` |
| `iso?` | `string \| undefined` |

| Member | Type |
| --- | --- |
| `defaultLocale?` | `string \| undefined` |
| `locale?` | `string \| undefined` |
| `localeName?` | `string \| null \| undefined` |
| `locales?` | `Locale[] \| undefined` |
| `routeName?` | `string \| undefined` |

```ts
import { /* … */ } from '@i18n-micro/test-utils/publish-smoke'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `ExportTarget` | interface | 3 members |
| `getLoadedModule` | function | `(mods: Record<string, Record<string, unknown>>, key: string) => Record<string, unknown>` |
| `loadResolvedExport` | function | `(item: ResolvedExport, packageRequire: NodeRequire) => Promise<Record<string, unknown>>` |
| `packageRootFromImportMeta` | function | `(importMetaUrl: string, levelsUp?: number) => string` |
| `PublishFormat` | type | `'esm' \| 'cjs'` |
| `resolveExportTargets` | function | `(pkg: { exports?: unknown; }, targets: ExportTarget[], packageRoot: string) => ResolvedExport[]` |
| `smokeLoadExports` | function | `(packageRoot: string, pkg: { exports?: unknown; }, targets: ExportTarget[]) => Promise<Record<string, Record<string, unknown>>>` |

| Member | Type |
| --- | --- |
| `condition?` | `"import" \| "require" \| "default" \| undefined` |
| `formats?` | `PublishFormat[] \| undefined` |
| `subpath` | `string` |

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
