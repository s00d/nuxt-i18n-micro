---
url: 'https://s00d.github.io/nuxt-i18n-micro/api/packages/test-utils.md'
description: 'Exported API of @i18n-micro/test-utils, generated from the source.'
---

# `@i18n-micro/test-utils`

36 exports across 2 entry points.
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
| `i18nUtils` | const | `{ t: (key: TranslationKey, params?: Params, defaultValue?: string) => Translation; tc: (key: TranslationKey, params: number \| Params, defaultValue?: string) => string; setTranslationsFromJson: (locale: string, translations: Record<string, unknown>) => Promise<void>; getLocale: () => string; setLocale: (val: string) => string; getLocaleName: () => string \| null; setLocaleName: (val: string \| null) => string \| null; getLocales: () => Locale[]; setLocales: (val: Locale[]) => Locale[]; defaultLocale: () => string \| undefined; setDefaultLocale: (val: string \| undefined) => string \| undefined; getRouteName: (_route?: unknown, _locale?: string) => string; settRouteName: (val: string) => string; ts: (key: TranslationKey, params?: Params, defaultValue?: string) => string; tn: (value: number, options?: Intl.NumberFormatOptions) => string; td: (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions) => string; has: (key: TranslationKey) => boolean; mergeTranslations: (newTranslations: Translations) => void; resolveTranslations: () => Record<string, unknown>; setTranslation: (key: TranslationKey, value: unknown) => void; switchLocaleRoute: (val: string) => string; switchLocalePath: (val: string) => string; switchLocale: (val: string) => string; switchRoute: (_route: unknown, _toLocale?: string) => void; localeRoute: (_to: unknown, _locale?: string) => void; localePath: (_to: unknown, _locale?: string) => string; setI18nRouteParams: (_value: unknown) => void; }` |
| `localePath` | const | `(_to: unknown, _locale?: string) => string` |
| `localeRoute` | const | `(_to: unknown, _locale?: string) => void` |
| `mergeTranslations` | const | `(newTranslations: Translations) => void` |
| `resolveTranslations` | const | `() => Record<string, unknown>` |
| `setDefaultLocale` | const | `(val: string \| undefined) => string \| undefined` |
| `setI18nRouteParams` | const | `(_value: unknown) => void` |
| `setLocale` | const | `(val: string) => string` |
| `setLocaleName` | const | `(val: string \| null) => string \| null` |
| `setLocales` | const | `(val: Locale[]) => Locale[]` |
| `setTranslation` | const | `(key: TranslationKey, value: unknown) => void` |
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

## `@i18n-micro/test-utils/publish-smoke`

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
