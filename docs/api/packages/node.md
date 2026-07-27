---
title: '@i18n-micro/node'
description: 'Exported API of @i18n-micro/node, generated from the source.'
outline: 'deep'
---

# `@i18n-micro/node`

15 exports across 1 entry point.
Generated from the API snapshot that [`pnpm run api:surface`](/guide/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/node`

```ts
import { /* … */ } from '@i18n-micro/node'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `CleanTranslation` | type | `string \| number \| boolean \| Translations \| PluralTranslations \| null` |
| `createI18n` | function | `(options: I18nOptions) => I18n` |
| `FormatService` | class | 18 members |
| `Getter` | type | `(key: TranslationKey, params?: Record<string, string \| number \| boolean>, defaultValue?: string) => unknown` |
| `I18n` | class | 44 members |
| `I18nOptions` | interface | 7 members |
| `interpolate` | function | `(template: string, params: Params) => string` |
| `LoadedTranslations` | interface | 2 members |
| `loadRootTranslations` | function | `(dir: string, disablePageLocales?: boolean) => Promise<Record<string, Translations>>` |
| `loadTranslations` | function | `(dir: string, disablePageLocales?: boolean) => Promise<LoadedTranslations>` |
| `Locale` | interface | 10 members |
| `LocaleCode` | type | `string` |
| `Params` | type | `Record<string, string \| number \| boolean>` |
| `PluralFunc` | type | `(key: TranslationKey, count: number, params: Params, locale: string, getter: Getter) => string \| null` |
| `Translations` | interface | — |

<code>FormatService</code> — 18 members, identical to [`FormatService`](/api/packages/astro).
<details>
<summary><code>I18n</code> — 44 members</summary>

| Member | Type |
| --- | --- |
| `addRouteTranslations` | `(locale: string, routeName: string, translations: Translations, merge?: boolean) => void` |
| `addTranslations` | `(locale: string, translations: Translations, merge?: boolean) => void` |
| `clear` | `() => void` |
| `clearCache` | `() => void` |
| `currentRoute` | `string` |
| `disablePageLocales` | `boolean` |
| `fallbackLocale` | `string` |
| `formatter` | `FormatService` |
| `getCustomMissingHandler?` | `(() => MissingHandler \| null) \| undefined` |
| `getFallbackLocale` | `() => string` |
| `getLocale` | `() => string` |
| `getMissingContext` | `(routeContext?: unknown) => { locale: string; routeName: string; }` |
| `getRoute` | `() => string` |
| `has` | `(key: TranslationKey, routeContext?: unknown) => boolean` |
| `hasTranslation` | `(key: TranslationKey) => boolean` |
| `helper` | `{ hasCache(locale: string, page: string): boolean; getCache(locale: string, routeName: string): Translations \| undefined; setCache(_locale: string, _routeName: string, _cache: Map<string, unknown>): void; hasTranslation(locale: string, key: string): boolean; hasPageTranslation(locale: string, routeName: string): boolean; getTranslation<T = unknown>(locale: string, routeName: string, key: string): T \| null; loadTranslations(locale: string, data: Translations, routeName?: string): void; setTranslations(locale: string, data: Translations, routeName?: string): void; loadPageTranslations(locale: string, routeName: string, data: Translations): void; mergeTranslation(locale: string, routeName: string, newTranslations: Translations, _force?: boolean): void; clearCache(): void; }` |
| `keyRecorder` | `any` |
| `loadRouteTranslationsCore` | `(locale: string, routeName: string, translations: Translations, merge: boolean) => void` |
| `loadTranslations` | `(dir?: string) => Promise<void>` |
| `loadTranslationsCore` | `(locale: string, translations: Translations, merge: boolean, routeName?: string) => void` |
| `locale` | `string` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn` | `boolean` |
| `pluralFunc` | `PluralFunc` |
| `recordResolvedKey` | `(cacheKey: string, key: string, value: unknown) => void` |
| `reload` | `() => Promise<void>` |
| `resolveDateTimeFormatArgs` | `any` |
| `resolveHas` | `(key: TranslationKey, routeContext?: unknown) => boolean` |
| `resolveLookup` | `(key: TranslationKey, routeContext?: unknown) => unknown \| null` |
| `resolveNumberFormatArgs` | `any` |
| `resolveRouteName` | `(routeContext?: unknown) => string` |
| `setKeyRecorder` | `(recorder: ((cacheKey: string, key: string, value: unknown) => void) \| null) => void` |
| `setRoute` | `(routeName: string) => void` |
| `t` | `(key: TranslationKey, params?: Params, defaultValue?: string \| null, routeContext?: unknown) => CleanTranslation` |
| `tc` | `(key: TranslationKey, count: number \| Params, defaultValue?: string) => string` |
| `td` | `{ (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, overrides?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string; }` |
| `tdr` | `(value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string` |
| `tn` | `{ (value: number, options?: Intl.NumberFormatOptions): string; (value: number, key: string, overrides?: Intl.NumberFormatOptions): string; (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string; }` |
| `touch` | `() => void` |
| `translationDir?` | `string \| undefined` |
| `ts` | `(key: TranslationKey, params?: Params, defaultValue?: string, routeContext?: unknown) => string` |
| `warnDev` | `(message: string) => void` |
| `warnMissing` | `(key: TranslationKey, routeContext?: unknown) => void` |
| `warnMissingFormat` | `(kind: "number" \| "datetime", key: string, locale: string) => void` |

</details>
<details>
<summary><code>I18nOptions</code> — 7 members</summary>

| Member | Type |
| --- | --- |
| `disablePageLocales?` | `boolean \| undefined` |
| `fallbackLocale?` | `string \| undefined` |
| `locale` | `string` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn?` | `boolean \| undefined` |
| `plural?` | `PluralFunc \| undefined` |
| `translationDir?` | `string \| undefined` |

</details>
<code>LoadedTranslations</code> — 2 members, identical to [`LoadedTranslations`](/api/packages/astro).
<code>Locale</code> — 10 members, identical to [`Locale`](/api/packages/types).

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
