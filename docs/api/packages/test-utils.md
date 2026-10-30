---
title: '@i18n-micro/test-utils'
description: 'Exported API of @i18n-micro/test-utils, generated from the source.'
outline: 'deep'
---

# `@i18n-micro/test-utils`

53 exports across 1 entry point.
Generated from the API snapshot that [`pnpm run api:surface`](/contributing/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/test-utils`

```ts
import { /* … */ } from '@i18n-micro/test-utils'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `_t` | function | `(route: unknown) => (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => import("@i18n-micro/types").Translation` |
| `_ts` | function | `(route: unknown) => (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => string` |
| `createFakeI18n` | function | `(options?: CreateFakeI18nOptions) => { $i18nStrategy: { getStrategy: () => TestStrategy; getDefaultLocale: () => string; getLocales: () => Locale[]; getLocalizedRouteNamePrefix: () => string; getRouteBaseName: () => null; pageLocales: () => null; isMetaDisabled: () => boolean; setRouter: () => void; shouldReturn404: () => null; getClientRedirect: () => null; resolveLocaleFromPath(path: string): string \| null; getLocaleFromPath(path: string): string \| null; getCurrentLocale: () => string; getPluginRouteName: () => string; getCurrentLocaleName: () => string \| null; localeRoute(targetLocale: string, routeOrPath: unknown): { path: string; fullPath: string; }; switchLocaleRoute(_fromLocale: string, toLocale: string, route?: unknown): { path: string; fullPath: string; }; }; $getI18nConfig: () => { locales: Locale[]; defaultLocale: string \| undefined; strategy: TestStrategy; }; $getLocale: () => string; $setLocale: (val: string) => void; $getLocaleName: () => string \| null; $setLocaleName: (val: string \| null) => void; $getLocales: () => Locale[]; $setLocales: (val: Locale[]) => void; $defaultLocale: () => string \| undefined; $setDefaultLocale: (val: string \| undefined) => void; $getRouteName: (_route?: unknown, _locale?: string) => string; $settRouteName: (val: string) => void; $setRouteName: (val: string) => void; $t: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null, routeContext?: unknown) => import("@i18n-micro/types").CleanTranslation; $_t: (route: unknown) => (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => import("@i18n-micro/types").Translation; $ts: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string, routeContext?: unknown) => string; $_ts: (route: unknown) => (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => string; $tc: (key: import("@i18n-micro/types").TranslationKey, count: number \| import("@i18n-micro/types").Params, defaultValue?: string) => string; $tn: { (value: number, options?: Intl.NumberFormatOptions): string; (value: number, key: string, overrides?: Intl.NumberFormatOptions): string; (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string; }; $td: { (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, overrides?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string; }; $tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; $has: (key: import("@i18n-micro/types").TranslationKey, routeContext?: unknown) => boolean; $resolveTranslations: (routeContext?: unknown) => import("@i18n-micro/types").Translations; $setTranslation: (key: import("@i18n-micro/types").TranslationKey, value: unknown) => void; $mergeTranslations: (newTranslations: import("@i18n-micro/types").Translations) => void; $switchLocaleRoute: (loc: string) => { path: string; name: string; }; $switchLocalePath: (loc: string) => string; $switchLocale: (val: string) => void; $switchRoute: (route: unknown, toLocale?: string) => void; $localeRoute: (to: unknown, loc?: string) => { name?: string \| symbol \| undefined; path: string; }; $localePath: (to: unknown, loc?: string) => string; $setI18nRouteParams: (value: unknown) => unknown; $loadPageTranslations: (locale: string, page: string, translations: import("@i18n-micro/types").Translations) => Promise<void>; $setMissingHandler: (handler: import("@i18n-micro/types").MissingHandler \| null) => void; $setTranslationsFromJson: (locale: string, translations: Record<string, unknown>) => Promise<void>; helper: import("@i18n-micro/core").TranslationHelper; }` |
| `CreateFakeI18nOptions` | interface | 10 members |
| `createI18nTestContext` | function | `(options?: CreateI18nTestContextOptions) => I18nTestContext` |
| `CreateI18nTestContextOptions` | type | `ResetI18nOptions` |
| `createIsolatedFakeI18n` | function | `(options?: CreateFakeI18nOptions) => IsolatedFakeI18n` |
| `defaultLocale` | const | `() => string \| undefined` |
| `getI18nConfig` | const | `() => { locales: Locale[]; defaultLocale: string \| undefined; strategy: TestStrategy; }` |
| `getLocale` | const | `() => string` |
| `getLocaleName` | const | `() => string \| null` |
| `getLocales` | const | `() => Locale[]` |
| `getRouteName` | const | `(_route?: unknown, _locale?: string \| undefined) => string` |
| `Getter` | type | `(key: TranslationKey, params?: Record<string, string \| number \| boolean>, defaultValue?: string) => unknown` |
| `has` | const | `(key: import("@i18n-micro/types").TranslationKey, routeContext?: unknown) => boolean` |
| `i18nStrategy` | const | `{ getStrategy: () => TestStrategy; getDefaultLocale: () => string; getLocales: () => Locale[]; getLocalizedRouteNamePrefix: () => string; getRouteBaseName: () => null; pageLocales: () => null; isMetaDisabled: () => boolean; setRouter: () => void; shouldReturn404: () => null; getClientRedirect: () => null; resolveLocaleFromPath(path: string): string \| null; getLocaleFromPath(path: string): string \| null; getCurrentLocale: () => string; getPluginRouteName: () => string; getCurrentLocaleName: () => string \| null; localeRoute(targetLocale: string, routeOrPath: unknown): { path: string; fullPath: string; }; switchLocaleRoute(_fromLocale: string, toLocale: string, route?: unknown): { path: string; fullPath: string; }; }` |
| `I18nTestContext` | class | 83 members |
| `i18nUtils` | const | `{ t: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null, routeContext?: unknown) => import("@i18n-micro/types").CleanTranslation; tc: (key: import("@i18n-micro/types").TranslationKey, count: number \| import("@i18n-micro/types").Params, defaultValue?: string) => string; ts: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string, routeContext?: unknown) => string; tn: { (value: number, options?: Intl.NumberFormatOptions): string; (value: number, key: string, overrides?: Intl.NumberFormatOptions): string; (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string; }; td: { (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, overrides?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string; }; tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; has: (key: import("@i18n-micro/types").TranslationKey, routeContext?: unknown) => boolean; resetI18n: (options?: ResetI18nOptions) => void; createFakeI18n: (options?: CreateFakeI18nOptions) => { $i18nStrategy: { getStrategy: () => TestStrategy; getDefaultLocale: () => string; getLocales: () => Locale[]; getLocalizedRouteNamePrefix: () => string; getRouteBaseName: () => null; pageLocales: () => null; isMetaDisabled: () => boolean; setRouter: () => void; shouldReturn404: () => null; getClientRedirect: () => null; resolveLocaleFromPath(path: string): string \| null; getLocaleFromPath(path: string): string \| null; getCurrentLocale: () => string; getPluginRouteName: () => string; getCurrentLocaleName: () => string \| null; localeRoute(targetLocale: string, routeOrPath: unknown): { path: string; fullPath: string; }; switchLocaleRoute(_fromLocale: string, toLocale: string, route?: unknown): { path: string; fullPath: string; }; }; $getI18nConfig: () => { locales: Locale[]; defaultLocale: string \| undefined; strategy: TestStrategy; }; $getLocale: () => string; $setLocale: (val: string) => void; $getLocaleName: () => string \| null; $setLocaleName: (val: string \| null) => void; $getLocales: () => Locale[]; $setLocales: (val: Locale[]) => void; $defaultLocale: () => string \| undefined; $setDefaultLocale: (val: string \| undefined) => void; $getRouteName: (_route?: unknown, _locale?: string) => string; $settRouteName: (val: string) => void; $setRouteName: (val: string) => void; $t: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null, routeContext?: unknown) => import("@i18n-micro/types").CleanTranslation; $_t: (route: unknown) => (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => import("@i18n-micro/types").Translation; $ts: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string, routeContext?: unknown) => string; $_ts: (route: unknown) => (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => string; $tc: (key: import("@i18n-micro/types").TranslationKey, count: number \| import("@i18n-micro/types").Params, defaultValue?: string) => string; $tn: { (value: number, options?: Intl.NumberFormatOptions): string; (value: number, key: string, overrides?: Intl.NumberFormatOptions): string; (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string; }; $td: { (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, overrides?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string; }; $tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; $has: (key: import("@i18n-micro/types").TranslationKey, routeContext?: unknown) => boolean; $resolveTranslations: (routeContext?: unknown) => import("@i18n-micro/types").Translations; $setTranslation: (key: import("@i18n-micro/types").TranslationKey, value: unknown) => void; $mergeTranslations: (newTranslations: import("@i18n-micro/types").Translations) => void; $switchLocaleRoute: (loc: string) => { path: string; name: string; }; $switchLocalePath: (loc: string) => string; $switchLocale: (val: string) => void; $switchRoute: (route: unknown, toLocale?: string) => void; $localeRoute: (to: unknown, loc?: string) => { name?: string \| symbol \| undefined; path: string; }; $localePath: (to: unknown, loc?: string) => string; $setI18nRouteParams: (value: unknown) => unknown; $loadPageTranslations: (locale: string, page: string, translations: import("@i18n-micro/types").Translations) => Promise<void>; $setMissingHandler: (handler: import("@i18n-micro/types").MissingHandler \| null) => void; $setTranslationsFromJson: (locale: string, translations: Record<string, unknown>) => Promise<void>; helper: import("@i18n-micro/core").TranslationHelper; }; createIsolatedFakeI18n: (options?: CreateFakeI18nOptions) => IsolatedFakeI18n; setupNuxtI18nMock: (options?: SetupNuxtI18nMockOptions) => NuxtI18nMockHarness; createI18nTestContext: (options?: CreateI18nTestContextOptions) => I18nTestContext; setTranslationsFromJson: (locale: string, translations: Record<string, unknown>) => Promise<void>; loadPageTranslations: (locale: string, page: string, translations: import("@i18n-micro/types").Translations) => Promise<void>; setMissingHandler: (handler: import("@i18n-micro/types").MissingHandler \| null) => void; getI18nConfig: () => { locales: Locale[]; defaultLocale: string \| undefined; strategy: TestStrategy; }; i18nStrategy: { getStrategy: () => TestStrategy; getDefaultLocale: () => string; getLocales: () => Locale[]; getLocalizedRouteNamePrefix: () => string; getRouteBaseName: () => null; pageLocales: () => null; isMetaDisabled: () => boolean; setRouter: () => void; shouldReturn404: () => null; getClientRedirect: () => null; resolveLocaleFromPath(path: string): string \| null; getLocaleFromPath(path: string): string \| null; getCurrentLocale: () => string; getPluginRouteName: () => string; getCurrentLocaleName: () => string \| null; localeRoute(targetLocale: string, routeOrPath: unknown): { path: string; fullPath: string; }; switchLocaleRoute(_fromLocale: string, toLocale: string, route?: unknown): { path: string; fullPath: string; }; }; getLocale: () => string; setLocale: (val: string) => void; getLocaleName: () => string \| null; setLocaleName: (val: string \| null) => void; getLocales: () => Locale[]; setLocales: (val: Locale[]) => void; defaultLocale: () => string \| undefined; setDefaultLocale: (val: string \| undefined) => void; getRouteName: (_route?: unknown, _locale?: string \| undefined) => string; settRouteName: (val: string) => void; setRouteName: (val: string) => void; _t: (route: unknown) => (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => import("@i18n-micro/types").Translation; _ts: (route: unknown) => (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => string; mergeTranslations: (newTranslations: import("@i18n-micro/types").Translations) => void; resolveTranslations: (routeContext?: unknown) => import("@i18n-micro/types").Translations; setTranslation: (key: import("@i18n-micro/types").TranslationKey, value: unknown) => void; switchLocaleRoute: (loc: string) => { path: string; name: string; }; switchLocalePath: (loc: string) => string; switchLocale: (val: string) => void; switchRoute: (route: unknown, toLocale?: string \| undefined) => void; localeRoute: (to: unknown, loc?: string \| undefined) => { name?: string \| symbol \| undefined; path: string; }; localePath: (to: unknown, loc?: string \| undefined) => string; setI18nRouteParams: (value: unknown) => unknown; }` |
| `IsolatedFakeI18n` | interface | 4 members |
| `loadPageTranslations` | function | `(locale: string, page: string, translations: import("@i18n-micro/types").Translations) => Promise<void>` |
| `Locale` | interface | 7 members |
| `LocaleCode` | type | `string` |
| `localePath` | const | `(to: unknown, loc?: string \| undefined) => string` |
| `localeRoute` | const | `(to: unknown, loc?: string \| undefined) => { name?: string \| symbol \| undefined; path: string; }` |
| `mergeTranslations` | const | `(newTranslations: import("@i18n-micro/types").Translations) => void` |
| `NuxtI18nMockHarness` | interface | 5 members |
| `resetI18n` | function | `(options?: ResetI18nOptions) => void` |
| `ResetI18nOptions` | interface | 8 members |
| `resolveTranslations` | const | `(routeContext?: unknown) => import("@i18n-micro/types").Translations` |
| `setDefaultLocale` | const | `(val: string \| undefined) => void` |
| `setI18nRouteParams` | const | `(value: unknown) => unknown` |
| `setLocale` | const | `(val: string) => void` |
| `setLocaleName` | const | `(val: string \| null) => void` |
| `setLocales` | const | `(val: Locale[]) => void` |
| `setMissingHandler` | const | `(handler: import("@i18n-micro/types").MissingHandler \| null) => void` |
| `setRouteName` | const | `(val: string) => void` |
| `setTranslation` | const | `(key: import("@i18n-micro/types").TranslationKey, value: unknown) => void` |
| `setTranslationsFromJson` | function | `(locale: string, translations: Record<string, unknown>) => Promise<void>` |
| `settRouteName` | const | `(val: string) => void` |
| `setupNuxtI18nMock` | function | `(options?: SetupNuxtI18nMockOptions) => NuxtI18nMockHarness` |
| `SetupNuxtI18nMockOptions` | interface | 12 members |
| `SpyFn` | type | `<T>(fn: T) => T` |
| `switchLocale` | const | `(val: string) => void` |
| `switchLocalePath` | const | `(loc: string) => string` |
| `switchLocaleRoute` | const | `(loc: string) => { path: string; name: string; }` |
| `switchRoute` | const | `(route: unknown, toLocale?: string \| undefined) => void` |
| `t` | const | `(key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null, routeContext?: unknown) => import("@i18n-micro/types").CleanTranslation` |
| `tc` | const | `(key: import("@i18n-micro/types").TranslationKey, count: number \| import("@i18n-micro/types").Params, defaultValue?: string) => string` |
| `td` | const | `{ (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, overrides?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string; }` |
| `tdr` | const | `(value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string` |
| `TestStrategy` | type | `'prefix' \| 'prefix_except_default' \| 'prefix_and_default' \| 'no_prefix'` |
| `tn` | const | `{ (value: number, options?: Intl.NumberFormatOptions): string; (value: number, key: string, overrides?: Intl.NumberFormatOptions): string; (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string; }` |
| `ts` | const | `(key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string, routeContext?: unknown) => string` |

<details>
<summary><code>CreateFakeI18nOptions</code> — 10 members</summary>

| Member | Type |
| --- | --- |
| `defaultLocale?` | `string \| undefined` |
| `isolated?` | `boolean \| undefined` |
| `locale?` | `string \| undefined` |
| `localeName?` | `string \| null \| undefined` |
| `locales?` | `Locale[] \| undefined` |
| `messages?` | `Record<string, Record<string, unknown>> \| undefined` |
| `routeName?` | `string \| undefined` |
| `spy?` | `SpyFn \| undefined` |
| `strategy?` | `TestStrategy \| undefined` |
| `translations?` | `Record<string, unknown> \| undefined` |

</details>

<details>
<summary><code>I18nTestContext</code> — 83 members</summary>

| Member | Type |
| --- | --- |
| `_t` | `(route: unknown) => (key: TranslationKey, params?: Params, defaultValue?: string \| null) => Translation` |
| `_ts` | `(route: unknown) => (key: TranslationKey, params?: Params, defaultValue?: string \| null) => string` |
| `activeKey` | `private any` |
| `activeRootKey` | `private any` |
| `addLocaleIso` | `(localeIso: Record<string, string>) => void` |
| `applyReset` | `private (options: ResetI18nOptions) => void` |
| `clearCache` | `() => void` |
| `createFake` | `(spy?: SpyFn) => { $i18nStrategy: { getStrategy: () => TestStrategy; getDefaultLocale: () => string; getLocales: () => Locale[]; getLocalizedRouteNamePrefix: () => string; getRouteBaseName: () => null; pageLocales: () => null; isMetaDisabled: () => boolean; setRouter: () => void; shouldReturn404: () => null; getClientRedirect: () => null; resolveLocaleFromPath(path: string): string \| null; getLocaleFromPath(path: string): string \| null; getCurrentLocale: () => string; getPluginRouteName: () => string; getCurrentLocaleName: () => string \| null; localeRoute(targetLocale: string, routeOrPath: unknown): { path: string; fullPath: string; }; switchLocaleRoute(_fromLocale: string, toLocale: string, route?: unknown): { path: string; fullPath: string; }; }; $getI18nConfig: () => { locales: Locale[]; defaultLocale: string \| undefined; strategy: TestStrategy; }; $getLocale: () => string; $setLocale: (val: string) => void; $getLocaleName: () => string \| null; $setLocaleName: (val: string \| null) => void; $getLocales: () => Locale[]; $setLocales: (val: Locale[]) => void; $defaultLocale: () => string \| undefined; $setDefaultLocale: (val: string \| undefined) => void; $getRouteName: (_route?: unknown, _locale?: string) => string; $settRouteName: (val: string) => void; $setRouteName: (val: string) => void; $t: (key: TranslationKey, params?: Params, defaultValue?: string \| null, routeContext?: unknown) => import("@i18n-micro/types").CleanTranslation; $_t: (route: unknown) => (key: TranslationKey, params?: Params, defaultValue?: string \| null) => Translation; $ts: (key: TranslationKey, params?: Params, defaultValue?: string, routeContext?: unknown) => string; $_ts: (route: unknown) => (key: TranslationKey, params?: Params, defaultValue?: string \| null) => string; $tc: (key: TranslationKey, count: number \| Params, defaultValue?: string) => string; $tn: { (value: number, options?: Intl.NumberFormatOptions): string; (value: number, key: string, overrides?: Intl.NumberFormatOptions): string; (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string; }; $td: { (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, overrides?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string; }; $tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; $has: (key: TranslationKey, routeContext?: unknown) => boolean; $resolveTranslations: (routeContext?: unknown) => Translations; $setTranslation: (key: TranslationKey, value: unknown) => void; $mergeTranslations: (newTranslations: Translations) => void; $switchLocaleRoute: (loc: string) => { path: string; name: string; }; $switchLocalePath: (loc: string) => string; $switchLocale: (val: string) => void; $switchRoute: (route: unknown, toLocale?: string) => void; $localeRoute: (to: unknown, loc?: string) => { name?: string \| symbol \| undefined; path: string; }; $localePath: (to: unknown, loc?: string) => string; $setI18nRouteParams: (value: unknown) => unknown; $loadPageTranslations: (locale: string, page: string, translations: Translations) => Promise<void>; $setMissingHandler: (handler: MissingHandler \| null) => void; $setTranslationsFromJson: (locale: string, translations: Record<string, unknown>) => Promise<void>; helper: import("@i18n-micro/core").TranslationHelper; }` |
| `customMissingHandler` | `private MissingHandler \| null` |
| `defaultLocale` | `() => string \| undefined` |
| `defLocale` | `private string \| undefined` |
| `extend` | `<M extends Record<string, unknown>>(methods: M & ThisType<I18nTestContext & M>) => I18nTestContext & M` |
| `fallbackKey` | `private any` |
| `fallbackRootKey` | `private any` |
| `formatArgs` | `private any` |
| `formatter` | `FormatService` |
| `getCustomMissingHandler?` | `(() => MissingHandler \| null) \| undefined` |
| `getFallbackLocale` | `() => string` |
| `getI18nConfig` | `() => { locales: Locale[]; defaultLocale: string \| undefined; strategy: TestStrategy; }` |
| `getLocale` | `() => string` |
| `getLocaleName` | `() => string \| null` |
| `getLocales` | `() => Locale[]` |
| `getMissingContext` | `protected (routeContext?: unknown) => { locale: string; routeName: string; }` |
| `getRoute` | `() => string` |
| `getRouteName` | `(_route?: unknown, _locale?: string) => string` |
| `has` | `(key: TranslationKey, routeContext?: unknown) => boolean` |
| `helper` | `TranslationHelper` |
| `i18nRouteParams` | `private unknown` |
| `i18nStrategy` | `{ getStrategy: () => TestStrategy; getDefaultLocale: () => string; getLocales: () => Locale[]; getLocalizedRouteNamePrefix: () => string; getRouteBaseName: () => null; pageLocales: () => null; isMetaDisabled: () => boolean; setRouter: () => void; shouldReturn404: () => null; getClientRedirect: () => null; resolveLocaleFromPath(path: string): string \| null; getLocaleFromPath(path: string): string \| null; getCurrentLocale: () => string; getPluginRouteName: () => string; getCurrentLocaleName: () => string \| null; localeRoute(targetLocale: string, routeOrPath: unknown): { path: string; fullPath: string; }; switchLocaleRoute(_fromLocale: string, toLocale: string, route?: unknown): { path: string; fullPath: string; }; }` |
| `initial` | `private Required<Pick<ResetI18nOptions, "strategy" \| "locale" \| "locales" \| "routeName" \| "localeName">> & Pick<ResetI18nOptions, "defaultLocale" \| "translations" \| "messages">` |
| `loadPageTranslations` | `(locale: string, page: string, translations: Translations) => Promise<void>` |
| `loadRouteTranslationsCore` | `(locale: string, routeName: string, translations: Translations, merge: boolean) => void` |
| `loadTranslationsCore` | `(locale: string, translations: Translations, merge: boolean, routeName?: string) => void` |
| `locale` | `private string` |
| `localeIso` | `protected Record<string, string>` |
| `localeName` | `private string \| null` |
| `localePath` | `(to: unknown, loc?: string) => string` |
| `localeRoute` | `(to: unknown, loc?: string) => { name?: string \| symbol \| undefined; path: string; }` |
| `locales` | `private Locale[]` |
| `lookupLocale` | `private any` |
| `mergeTranslations` | `(newTranslations: Translations) => void` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn` | `boolean` |
| `new` | `(options?: ResetI18nOptions): I18nTestContext` |
| `onTranslationsChanged` | `protected (_locale?: string) => void` |
| `ownsFormatter` | `private any` |
| `pagePath` | `string` |
| `pluralFunc` | `PluralFunc` |
| `pluralLocale` | `() => string` |
| `pluralTag` | `private any` |
| `reset` | `(options?: ResetI18nOptions & { reseed?: boolean; }) => void` |
| `resolveHas` | `protected (key: TranslationKey, routeContext?: unknown) => boolean` |
| `resolveLookup` | `protected (key: TranslationKey, routeContext?: unknown) => unknown \| null` |
| `resolveRouteName` | `protected (routeContext?: unknown) => string` |
| `resolveTranslations` | `(routeContext?: unknown) => Translations` |
| `resolveTranslationTree` | `protected (lower: Record<string, unknown>, upper: Record<string, unknown>) => Translations` |
| `routeName` | `private string` |
| `setDefaultLocale` | `(val: string \| undefined) => void` |
| `setI18nRouteParams` | `(value: unknown) => unknown` |
| `setLocale` | `(val: string) => void` |
| `setLocaleName` | `(val: string \| null) => void` |
| `setLocales` | `(val: Locale[]) => void` |
| `setMissingHandler` | `(handler: MissingHandler \| null) => void` |
| `setRouteName` | `(val: string) => void` |
| `setTranslation` | `(key: TranslationKey, value: unknown) => void` |
| `setTranslationsFromJson` | `(locale: string, translations: Record<string, unknown>) => Promise<void>` |
| `settRouteName` | `(val: string) => void` |
| `strategy` | `TestStrategy` |
| `switchLocale` | `(val: string) => void` |
| `switchLocalePath` | `(loc: string) => string` |
| `switchLocaleRoute` | `(loc: string) => { path: string; name: string; }` |
| `switchRoute` | `(route: unknown, toLocale?: string) => void` |
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
| `write` | `private any` |

</details>

<details>
<summary><code>IsolatedFakeI18n</code> — 4 members</summary>

| Member | Type |
| --- | --- |
| `context` | `I18nTestContext` |
| `i18n` | `{ $i18nStrategy: { getStrategy: () => TestStrategy; getDefaultLocale: () => string; getLocales: () => Locale[]; getLocalizedRouteNamePrefix: () => string; getRouteBaseName: () => null; pageLocales: () => null; isMetaDisabled: () => boolean; setRouter: () => void; shouldReturn404: () => null; getClientRedirect: () => null; resolveLocaleFromPath(path: string): string \| null; getLocaleFromPath(path: string): string \| null; getCurrentLocale: () => string; getPluginRouteName: () => string; getCurrentLocaleName: () => string \| null; localeRoute(targetLocale: string, routeOrPath: unknown): { path: string; fullPath: string; }; switchLocaleRoute(_fromLocale: string, toLocale: string, route?: unknown): { path: string; fullPath: string; }; }; $getI18nConfig: () => { locales: Locale[]; defaultLocale: string \| undefined; strategy: TestStrategy; }; $getLocale: () => string; $setLocale: (val: string) => void; $getLocaleName: () => string \| null; $setLocaleName: (val: string \| null) => void; $getLocales: () => Locale[]; $setLocales: (val: Locale[]) => void; $defaultLocale: () => string \| undefined; $setDefaultLocale: (val: string \| undefined) => void; $getRouteName: (_route?: unknown, _locale?: string) => string; $settRouteName: (val: string) => void; $setRouteName: (val: string) => void; $t: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null, routeContext?: unknown) => import("@i18n-micro/types").CleanTranslation; $_t: (route: unknown) => (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => import("@i18n-micro/types").Translation; $ts: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string, routeContext?: unknown) => string; $_ts: (route: unknown) => (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => string; $tc: (key: import("@i18n-micro/types").TranslationKey, count: number \| import("@i18n-micro/types").Params, defaultValue?: string) => string; $tn: { (value: number, options?: Intl.NumberFormatOptions): string; (value: number, key: string, overrides?: Intl.NumberFormatOptions): string; (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string; }; $td: { (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, overrides?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string; }; $tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; $has: (key: import("@i18n-micro/types").TranslationKey, routeContext?: unknown) => boolean; $resolveTranslations: (routeContext?: unknown) => import("@i18n-micro/types").Translations; $setTranslation: (key: import("@i18n-micro/types").TranslationKey, value: unknown) => void; $mergeTranslations: (newTranslations: import("@i18n-micro/types").Translations) => void; $switchLocaleRoute: (loc: string) => { path: string; name: string; }; $switchLocalePath: (loc: string) => string; $switchLocale: (val: string) => void; $switchRoute: (route: unknown, toLocale?: string) => void; $localeRoute: (to: unknown, loc?: string) => { name?: string \| symbol \| undefined; path: string; }; $localePath: (to: unknown, loc?: string) => string; $setI18nRouteParams: (value: unknown) => unknown; $loadPageTranslations: (locale: string, page: string, translations: import("@i18n-micro/types").Translations) => Promise<void>; $setMissingHandler: (handler: import("@i18n-micro/types").MissingHandler \| null) => void; $setTranslationsFromJson: (locale: string, translations: Record<string, unknown>) => Promise<void>; helper: import("@i18n-micro/core").TranslationHelper; }` |
| `reset` | `(options?: ResetI18nOptions & { reseed?: boolean; }) => void` |
| `setTranslationsFromJson` | `(locale: string, translations: Record<string, unknown>) => Promise<void>` |

</details>

<details>
<summary><code>Locale</code> — 7 members</summary>

| Member | Type |
| --- | --- |
| `baseDefault?` | `boolean \| undefined` |
| `baseUrl?` | `string \| undefined` |
| `code` | `string` |
| `dir?` | `"ltr" \| "rtl" \| "auto" \| undefined` |
| `disabled?` | `boolean \| undefined` |
| `displayName?` | `string \| undefined` |
| `iso?` | `string \| undefined` |

</details>

<details>
<summary><code>NuxtI18nMockHarness</code> — 5 members</summary>

| Member | Type |
| --- | --- |
| `context` | `I18nTestContext` |
| `i18n` | `{ $i18nStrategy: { getStrategy: () => TestStrategy; getDefaultLocale: () => string; getLocales: () => Locale[]; getLocalizedRouteNamePrefix: () => string; getRouteBaseName: () => null; pageLocales: () => null; isMetaDisabled: () => boolean; setRouter: () => void; shouldReturn404: () => null; getClientRedirect: () => null; resolveLocaleFromPath(path: string): string \| null; getLocaleFromPath(path: string): string \| null; getCurrentLocale: () => string; getPluginRouteName: () => string; getCurrentLocaleName: () => string \| null; localeRoute(targetLocale: string, routeOrPath: unknown): { path: string; fullPath: string; }; switchLocaleRoute(_fromLocale: string, toLocale: string, route?: unknown): { path: string; fullPath: string; }; }; $getI18nConfig: () => { locales: Locale[]; defaultLocale: string \| undefined; strategy: TestStrategy; }; $getLocale: () => string; $setLocale: (val: string) => void; $getLocaleName: () => string \| null; $setLocaleName: (val: string \| null) => void; $getLocales: () => Locale[]; $setLocales: (val: Locale[]) => void; $defaultLocale: () => string \| undefined; $setDefaultLocale: (val: string \| undefined) => void; $getRouteName: (_route?: unknown, _locale?: string) => string; $settRouteName: (val: string) => void; $setRouteName: (val: string) => void; $t: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null, routeContext?: unknown) => import("@i18n-micro/types").CleanTranslation; $_t: (route: unknown) => (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => import("@i18n-micro/types").Translation; $ts: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string, routeContext?: unknown) => string; $_ts: (route: unknown) => (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => string; $tc: (key: import("@i18n-micro/types").TranslationKey, count: number \| import("@i18n-micro/types").Params, defaultValue?: string) => string; $tn: { (value: number, options?: Intl.NumberFormatOptions): string; (value: number, key: string, overrides?: Intl.NumberFormatOptions): string; (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string; }; $td: { (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, overrides?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string; }; $tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; $has: (key: import("@i18n-micro/types").TranslationKey, routeContext?: unknown) => boolean; $resolveTranslations: (routeContext?: unknown) => import("@i18n-micro/types").Translations; $setTranslation: (key: import("@i18n-micro/types").TranslationKey, value: unknown) => void; $mergeTranslations: (newTranslations: import("@i18n-micro/types").Translations) => void; $switchLocaleRoute: (loc: string) => { path: string; name: string; }; $switchLocalePath: (loc: string) => string; $switchLocale: (val: string) => void; $switchRoute: (route: unknown, toLocale?: string) => void; $localeRoute: (to: unknown, loc?: string) => { name?: string \| symbol \| undefined; path: string; }; $localePath: (to: unknown, loc?: string) => string; $setI18nRouteParams: (value: unknown) => unknown; $loadPageTranslations: (locale: string, page: string, translations: import("@i18n-micro/types").Translations) => Promise<void>; $setMissingHandler: (handler: import("@i18n-micro/types").MissingHandler \| null) => void; $setTranslationsFromJson: (locale: string, translations: Record<string, unknown>) => Promise<void>; helper: import("@i18n-micro/core").TranslationHelper; }` |
| `reset` | `(options?: ResetI18nOptions & { reseed?: boolean; }) => void` |
| `setTranslationsFromJson` | `(locale: string, translations: Record<string, unknown>) => Promise<void>` |
| `useI18n` | `() => ReturnType<I18nTestContext["createFake"]>` |

</details>

<details>
<summary><code>ResetI18nOptions</code> — 8 members</summary>

| Member | Type |
| --- | --- |
| `defaultLocale?` | `string \| undefined` |
| `locale?` | `string \| undefined` |
| `localeName?` | `string \| null \| undefined` |
| `locales?` | `Locale[] \| undefined` |
| `messages?` | `Record<string, Record<string, unknown>> \| undefined` |
| `routeName?` | `string \| undefined` |
| `strategy?` | `TestStrategy \| undefined` |
| `translations?` | `Record<string, unknown> \| undefined` |

</details>

<details>
<summary><code>SetupNuxtI18nMockOptions</code> — 12 members</summary>

| Member | Type |
| --- | --- |
| `autoReset?` | `boolean \| undefined` |
| `beforeEach?` | `((fn: () => void) => void) \| undefined` |
| `defaultLocale?` | `string \| undefined` |
| `isolated?` | `boolean \| undefined` |
| `locale?` | `string \| undefined` |
| `localeName?` | `string \| null \| undefined` |
| `locales?` | `Locale[] \| undefined` |
| `messages?` | `Record<string, Record<string, unknown>> \| undefined` |
| `routeName?` | `string \| undefined` |
| `spy?` | `SpyFn \| undefined` |
| `strategy?` | `TestStrategy \| undefined` |
| `translations?` | `Record<string, unknown> \| undefined` |

</details>

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
