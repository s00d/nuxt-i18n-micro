---
title: '@i18n-micro/test-utils'
description: 'Exported API of @i18n-micro/test-utils, generated from the source.'
outline: 'deep'
---

# `@i18n-micro/test-utils`

60 exports across 2 entry points.
Generated from the API snapshot that [`pnpm run api:surface`](/guide/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/test-utils`

```ts
import { /* … */ } from '@i18n-micro/test-utils'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `_t` | function | `(route: unknown) => (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => import("@i18n-micro/types").Translation` |
| `_ts` | function | `(route: unknown) => (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => string` |
| `createFakeI18n` | function | `(options?: CreateFakeI18nOptions) => { $i18nStrategy: { getStrategy: () => import("./context").TestStrategy; getDefaultLocale: () => string; getLocales: () => import("./context").Locale[]; getLocalizedRouteNamePrefix: () => string; getGlobalLocaleRoutes: () => undefined; getRouteLocales: () => undefined; getRoutesLocaleLinks: () => undefined; getNoPrefixRedirect: () => undefined; getRouteBaseName: () => null; formatPathForResolve: (path: string) => string; setRouter: () => void; getCanonicalPath: () => null; getRedirect: () => null; shouldReturn404: () => null; getClientRedirect: () => null; resolveLocaleFromPath(path: string): string \| null; getLocaleFromPath(path: string): string \| null; getCurrentLocale: () => string; getPluginRouteName: () => string; getCurrentLocaleName: () => string \| null; localeRoute(targetLocale: string, routeOrPath: unknown): { path: string; fullPath: string; }; switchLocaleRoute(_fromLocale: string, toLocale: string, route?: unknown): { path: string; fullPath: string; }; }; $getI18nConfig: () => { locales: import("./context").Locale[]; defaultLocale: string \| undefined; strategy: import("./context").TestStrategy; }; $getLocale: (_route?: unknown) => string; $setLocale: (val: string) => void; $getLocaleName: () => string \| null; $setLocaleName: (val: string \| null) => void; $getLocales: () => import("./context").Locale[]; $setLocales: (val: import("./context").Locale[]) => void; $defaultLocale: () => string \| undefined; $setDefaultLocale: (val: string \| undefined) => void; $getRouteName: (_route?: unknown, _locale?: string) => string; $settRouteName: (val: string) => void; $setRouteName: (val: string) => void; $t: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => import("@i18n-micro/types").Translation; $_t: (route: unknown) => (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => import("@i18n-micro/types").Translation; $ts: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => string; $_ts: (route: unknown) => (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => string; $tc: (key: import("@i18n-micro/types").TranslationKey, params: number \| import("@i18n-micro/types").Params, defaultValue?: string) => string; $tn: (value: number, options?: Intl.NumberFormatOptions) => string; $td: (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions) => string; $tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; $has: (key: import("@i18n-micro/types").TranslationKey) => boolean; $resolveTranslations: () => Record<string, unknown>; $setTranslation: (key: import("@i18n-micro/types").TranslationKey, value: unknown) => void; $mergeTranslations: (newTranslations: import("@i18n-micro/types").Translations) => void; $switchLocaleRoute: (loc: string) => { path: string; name: string; }; $switchLocalePath: (loc: string) => string; $switchLocale: (val: string) => void; $switchRoute: (route: unknown, toLocale?: string) => void; $localeRoute: (to: unknown, loc?: string) => { name?: string \| symbol \| undefined; path: string; }; $localePath: (to: unknown, loc?: string) => string; $setI18nRouteParams: (value: unknown) => unknown; $loadPageTranslations: (loc: string, page: string, translations: import("@i18n-micro/types").Translations) => Promise<void>; $setMissingHandler: (handler: import("@i18n-micro/types").MissingHandler \| null) => void; $setTranslationsFromJson: (loc: string, translations: Record<string, unknown>) => Promise<void>; helper: { hasCache(locale: string, page: string): boolean; getCache(locale: string, routeName: string): import("@i18n-micro/types").Translations \| undefined; setCache(_locale: string, _routeName: string, _cache: Map<string, unknown>): void; hasTranslation(locale: string, key: string): boolean; hasPageTranslation(locale: string, routeName: string): boolean; getTranslation<T = unknown>(locale: string, routeName: string, key: string): T \| null; loadTranslations(locale: string, data: import("@i18n-micro/types").Translations, routeName?: string): void; setTranslations(locale: string, data: import("@i18n-micro/types").Translations, routeName?: string): void; loadPageTranslations(locale: string, routeName: string, data: import("@i18n-micro/types").Translations): void; mergeTranslation(locale: string, routeName: string, newTranslations: import("@i18n-micro/types").Translations, _force?: boolean): void; clearCache(): void; }; }` |
| `CreateFakeI18nOptions` | interface | 10 members |
| `createI18nTestContext` | function | `(options?: CreateI18nTestContextOptions) => I18nTestContext` |
| `CreateI18nTestContextOptions` | interface | 9 members |
| `createIsolatedFakeI18n` | function | `(options?: CreateFakeI18nOptions) => IsolatedFakeI18n` |
| `defaultLocale` | const | `() => string \| undefined` |
| `getI18nConfig` | const | `() => { locales: import("./context").Locale[]; defaultLocale: string \| undefined; strategy: import("./context").TestStrategy; }` |
| `getLocale` | const | `(_route?: unknown) => string` |
| `getLocaleName` | const | `() => string \| null` |
| `getLocales` | const | `() => import("./context").Locale[]` |
| `getRouteName` | const | `(_route?: unknown, _locale?: string \| undefined) => string` |
| `Getter` | type | `(key: TranslationKey, params?: Record<string, string \| number \| boolean>, defaultValue?: string) => unknown` |
| `has` | const | `(key: string) => boolean` |
| `i18nStrategy` | const | `{ getStrategy: () => import("./context").TestStrategy; getDefaultLocale: () => string; getLocales: () => import("./context").Locale[]; getLocalizedRouteNamePrefix: () => string; getGlobalLocaleRoutes: () => undefined; getRouteLocales: () => undefined; getRoutesLocaleLinks: () => undefined; getNoPrefixRedirect: () => undefined; getRouteBaseName: () => null; formatPathForResolve: (path: string) => string; setRouter: () => void; getCanonicalPath: () => null; getRedirect: () => null; shouldReturn404: () => null; getClientRedirect: () => null; resolveLocaleFromPath(path: string): string \| null; getLocaleFromPath(path: string): string \| null; getCurrentLocale: () => string; getPluginRouteName: () => string; getCurrentLocaleName: () => string \| null; localeRoute(targetLocale: string, routeOrPath: unknown): { path: string; fullPath: string; }; switchLocaleRoute(_fromLocale: string, toLocale: string, route?: unknown): { path: string; fullPath: string; }; }` |
| `I18nTestContext` | class | 50 members |
| `i18nUtils` | const | `{ t: (key: string, params?: import("@i18n-micro/types").Params \| undefined, defaultValue?: string \| null \| undefined) => unknown; tc: (key: string, params: number \| import("@i18n-micro/types").Params, defaultValue?: string \| undefined) => string; ts: (key: string, params?: import("@i18n-micro/types").Params \| undefined, defaultValue?: string \| null \| undefined) => string; tn: (value: number, options?: Intl.NumberFormatOptions \| undefined) => string; td: (value: string \| number \| Date, options?: Intl.DateTimeFormatOptions \| undefined) => string; tdr: (value: string \| number \| Date, options?: Intl.RelativeTimeFormatOptions \| undefined) => string; has: (key: string) => boolean; resetI18n: (options?: ResetI18nOptions) => void; createFakeI18n: (options?: CreateFakeI18nOptions) => { $i18nStrategy: { getStrategy: () => import("./context").TestStrategy; getDefaultLocale: () => string; getLocales: () => import("./context").Locale[]; getLocalizedRouteNamePrefix: () => string; getGlobalLocaleRoutes: () => undefined; getRouteLocales: () => undefined; getRoutesLocaleLinks: () => undefined; getNoPrefixRedirect: () => undefined; getRouteBaseName: () => null; formatPathForResolve: (path: string) => string; setRouter: () => void; getCanonicalPath: () => null; getRedirect: () => null; shouldReturn404: () => null; getClientRedirect: () => null; resolveLocaleFromPath(path: string): string \| null; getLocaleFromPath(path: string): string \| null; getCurrentLocale: () => string; getPluginRouteName: () => string; getCurrentLocaleName: () => string \| null; localeRoute(targetLocale: string, routeOrPath: unknown): { path: string; fullPath: string; }; switchLocaleRoute(_fromLocale: string, toLocale: string, route?: unknown): { path: string; fullPath: string; }; }; $getI18nConfig: () => { locales: import("./context").Locale[]; defaultLocale: string \| undefined; strategy: import("./context").TestStrategy; }; $getLocale: (_route?: unknown) => string; $setLocale: (val: string) => void; $getLocaleName: () => string \| null; $setLocaleName: (val: string \| null) => void; $getLocales: () => import("./context").Locale[]; $setLocales: (val: import("./context").Locale[]) => void; $defaultLocale: () => string \| undefined; $setDefaultLocale: (val: string \| undefined) => void; $getRouteName: (_route?: unknown, _locale?: string) => string; $settRouteName: (val: string) => void; $setRouteName: (val: string) => void; $t: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => import("@i18n-micro/types").Translation; $_t: (route: unknown) => (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => import("@i18n-micro/types").Translation; $ts: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => string; $_ts: (route: unknown) => (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => string; $tc: (key: import("@i18n-micro/types").TranslationKey, params: number \| import("@i18n-micro/types").Params, defaultValue?: string) => string; $tn: (value: number, options?: Intl.NumberFormatOptions) => string; $td: (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions) => string; $tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; $has: (key: import("@i18n-micro/types").TranslationKey) => boolean; $resolveTranslations: () => Record<string, unknown>; $setTranslation: (key: import("@i18n-micro/types").TranslationKey, value: unknown) => void; $mergeTranslations: (newTranslations: import("@i18n-micro/types").Translations) => void; $switchLocaleRoute: (loc: string) => { path: string; name: string; }; $switchLocalePath: (loc: string) => string; $switchLocale: (val: string) => void; $switchRoute: (route: unknown, toLocale?: string) => void; $localeRoute: (to: unknown, loc?: string) => { name?: string \| symbol \| undefined; path: string; }; $localePath: (to: unknown, loc?: string) => string; $setI18nRouteParams: (value: unknown) => unknown; $loadPageTranslations: (loc: string, page: string, translations: import("@i18n-micro/types").Translations) => Promise<void>; $setMissingHandler: (handler: import("@i18n-micro/types").MissingHandler \| null) => void; $setTranslationsFromJson: (loc: string, translations: Record<string, unknown>) => Promise<void>; helper: { hasCache(locale: string, page: string): boolean; getCache(locale: string, routeName: string): import("@i18n-micro/types").Translations \| undefined; setCache(_locale: string, _routeName: string, _cache: Map<string, unknown>): void; hasTranslation(locale: string, key: string): boolean; hasPageTranslation(locale: string, routeName: string): boolean; getTranslation<T = unknown>(locale: string, routeName: string, key: string): T \| null; loadTranslations(locale: string, data: import("@i18n-micro/types").Translations, routeName?: string): void; setTranslations(locale: string, data: import("@i18n-micro/types").Translations, routeName?: string): void; loadPageTranslations(locale: string, routeName: string, data: import("@i18n-micro/types").Translations): void; mergeTranslation(locale: string, routeName: string, newTranslations: import("@i18n-micro/types").Translations, _force?: boolean): void; clearCache(): void; }; }; createIsolatedFakeI18n: (options?: CreateFakeI18nOptions) => IsolatedFakeI18n; setupNuxtI18nMock: (options?: SetupNuxtI18nMockOptions) => NuxtI18nMockHarness; createI18nTestContext: (options?: import("./context").CreateI18nTestContextOptions) => I18nTestContext; setTranslationsFromJson: (loc: string, translations: Record<string, unknown>) => Promise<void>; loadPageTranslations: (loc: string, page: string, translations: import("@i18n-micro/types").Translations) => Promise<void>; setMissingHandler: (handler: import("@i18n-micro/types").MissingHandler \| null) => void; getI18nConfig: () => { locales: import("./context").Locale[]; defaultLocale: string \| undefined; strategy: import("./context").TestStrategy; }; i18nStrategy: { getStrategy: () => import("./context").TestStrategy; getDefaultLocale: () => string; getLocales: () => import("./context").Locale[]; getLocalizedRouteNamePrefix: () => string; getGlobalLocaleRoutes: () => undefined; getRouteLocales: () => undefined; getRoutesLocaleLinks: () => undefined; getNoPrefixRedirect: () => undefined; getRouteBaseName: () => null; formatPathForResolve: (path: string) => string; setRouter: () => void; getCanonicalPath: () => null; getRedirect: () => null; shouldReturn404: () => null; getClientRedirect: () => null; resolveLocaleFromPath(path: string): string \| null; getLocaleFromPath(path: string): string \| null; getCurrentLocale: () => string; getPluginRouteName: () => string; getCurrentLocaleName: () => string \| null; localeRoute(targetLocale: string, routeOrPath: unknown): { path: string; fullPath: string; }; switchLocaleRoute(_fromLocale: string, toLocale: string, route?: unknown): { path: string; fullPath: string; }; }; getLocale: (_route?: unknown) => string; setLocale: (val: string) => void; getLocaleName: () => string \| null; setLocaleName: (val: string \| null) => void; getLocales: () => import("./context").Locale[]; setLocales: (val: import("./context").Locale[]) => void; defaultLocale: () => string \| undefined; setDefaultLocale: (val: string \| undefined) => void; getRouteName: (_route?: unknown, _locale?: string \| undefined) => string; settRouteName: (val: string) => void; setRouteName: (val: string) => void; _t: (route: unknown) => (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => import("@i18n-micro/types").Translation; _ts: (route: unknown) => (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => string; mergeTranslations: (newTranslations: import("@i18n-micro/types").Translations) => void; resolveTranslations: () => Record<string, unknown>; setTranslation: (key: string, value: unknown) => void; switchLocaleRoute: (loc: string) => { path: string; name: string; }; switchLocalePath: (loc: string) => string; switchLocale: (val: string) => void; switchRoute: (route: unknown, toLocale?: string \| undefined) => void; localeRoute: (to: unknown, loc?: string \| undefined) => { name?: string \| symbol \| undefined; path: string; }; localePath: (to: unknown, loc?: string \| undefined) => string; setI18nRouteParams: (value: unknown) => unknown; }` |
| `IsolatedFakeI18n` | interface | 4 members |
| `loadPageTranslations` | function | `(loc: string, page: string, translations: import("@i18n-micro/types").Translations) => Promise<void>` |
| `Locale` | interface | 7 members |
| `LocaleCode` | type | `string` |
| `localePath` | const | `(to: unknown, loc?: string \| undefined) => string` |
| `localeRoute` | const | `(to: unknown, loc?: string \| undefined) => { name?: string \| symbol \| undefined; path: string; }` |
| `mergeTranslations` | const | `(newTranslations: import("@i18n-micro/types").Translations) => void` |
| `NuxtI18nMockHarness` | interface | 5 members |
| `resetI18n` | function | `(options?: ResetI18nOptions) => void` |
| `ResetI18nOptions` | interface | 8 members |
| `resolveTranslations` | const | `() => Record<string, unknown>` |
| `setDefaultLocale` | const | `(val: string \| undefined) => void` |
| `setI18nRouteParams` | const | `(value: unknown) => unknown` |
| `setLocale` | const | `(val: string) => void` |
| `setLocaleName` | const | `(val: string \| null) => void` |
| `setLocales` | const | `(val: import("./context").Locale[]) => void` |
| `setMissingHandler` | const | `(handler: import("@i18n-micro/types").MissingHandler \| null) => void` |
| `setRouteName` | const | `(val: string) => void` |
| `setTranslation` | const | `(key: string, value: unknown) => void` |
| `setTranslationsFromJson` | function | `(loc: string, translations: Record<string, unknown>) => Promise<void>` |
| `settRouteName` | const | `(val: string) => void` |
| `setupNuxtI18nMock` | function | `(options?: SetupNuxtI18nMockOptions) => NuxtI18nMockHarness` |
| `SetupNuxtI18nMockOptions` | interface | 12 members |
| `SpyFn` | type | `<T>(fn: T) => T` |
| `switchLocale` | const | `(val: string) => void` |
| `switchLocalePath` | const | `(loc: string) => string` |
| `switchLocaleRoute` | const | `(loc: string) => { path: string; name: string; }` |
| `switchRoute` | const | `(route: unknown, toLocale?: string \| undefined) => void` |
| `t` | function | `(key: string, params?: import("@i18n-micro/types").Params \| undefined, defaultValue?: string \| null \| undefined) => unknown` |
| `tc` | function | `(key: string, params: number \| import("@i18n-micro/types").Params, defaultValue?: string \| undefined) => string` |
| `td` | const | `(value: string \| number \| Date, options?: Intl.DateTimeFormatOptions \| undefined) => string` |
| `tdr` | const | `(value: string \| number \| Date, options?: Intl.RelativeTimeFormatOptions \| undefined) => string` |
| `TestStrategy` | type | `'prefix' \| 'prefix_except_default' \| 'prefix_and_default' \| 'no_prefix'` |
| `tn` | const | `(value: number, options?: Intl.NumberFormatOptions \| undefined) => string` |
| `ts` | function | `(key: string, params?: import("@i18n-micro/types").Params \| undefined, defaultValue?: string \| null \| undefined) => string` |

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
<summary><code>CreateI18nTestContextOptions</code> — 9 members</summary>

| Member | Type |
| --- | --- |
| `defaultLocale?` | `string \| undefined` |
| `isolated?` | `boolean \| undefined` |
| `locale?` | `string \| undefined` |
| `localeName?` | `string \| null \| undefined` |
| `locales?` | `Locale[] \| undefined` |
| `messages?` | `Record<string, Record<string, unknown>> \| undefined` |
| `routeName?` | `string \| undefined` |
| `strategy?` | `TestStrategy \| undefined` |
| `translations?` | `Record<string, unknown> \| undefined` |

</details>
<details>
<summary><code>I18nTestContext</code> — 50 members</summary>

| Member | Type |
| --- | --- |
| `_t` | `(route: unknown) => (key: TranslationKey, params?: Params, defaultValue?: string \| null) => Translation` |
| `_ts` | `(route: unknown) => (key: TranslationKey, params?: Params, defaultValue?: string \| null) => string` |
| `applyReset` | `private (options: ResetI18nOptions) => void` |
| `createFake` | `(spy?: SpyFn) => { $i18nStrategy: { getStrategy: () => TestStrategy; getDefaultLocale: () => string; getLocales: () => Locale[]; getLocalizedRouteNamePrefix: () => string; getGlobalLocaleRoutes: () => undefined; getRouteLocales: () => undefined; getRoutesLocaleLinks: () => undefined; getNoPrefixRedirect: () => undefined; getRouteBaseName: () => null; formatPathForResolve: (path: string) => string; setRouter: () => void; getCanonicalPath: () => null; getRedirect: () => null; shouldReturn404: () => null; getClientRedirect: () => null; resolveLocaleFromPath(path: string): string \| null; getLocaleFromPath(path: string): string \| null; getCurrentLocale: () => string; getPluginRouteName: () => string; getCurrentLocaleName: () => string \| null; localeRoute(targetLocale: string, routeOrPath: unknown): { path: string; fullPath: string; }; switchLocaleRoute(_fromLocale: string, toLocale: string, route?: unknown): { path: string; fullPath: string; }; }; $getI18nConfig: () => { locales: Locale[]; defaultLocale: string \| undefined; strategy: TestStrategy; }; $getLocale: (_route?: unknown) => string; $setLocale: (val: string) => void; $getLocaleName: () => string \| null; $setLocaleName: (val: string \| null) => void; $getLocales: () => Locale[]; $setLocales: (val: Locale[]) => void; $defaultLocale: () => string \| undefined; $setDefaultLocale: (val: string \| undefined) => void; $getRouteName: (_route?: unknown, _locale?: string) => string; $settRouteName: (val: string) => void; $setRouteName: (val: string) => void; $t: (key: TranslationKey, params?: Params, defaultValue?: string \| null) => Translation; $_t: (route: unknown) => (key: TranslationKey, params?: Params, defaultValue?: string \| null) => Translation; $ts: (key: TranslationKey, params?: Params, defaultValue?: string \| null) => string; $_ts: (route: unknown) => (key: TranslationKey, params?: Params, defaultValue?: string \| null) => string; $tc: (key: TranslationKey, params: number \| Params, defaultValue?: string) => string; $tn: (value: number, options?: Intl.NumberFormatOptions) => string; $td: (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions) => string; $tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; $has: (key: TranslationKey) => boolean; $resolveTranslations: () => Record<string, unknown>; $setTranslation: (key: TranslationKey, value: unknown) => void; $mergeTranslations: (newTranslations: Translations) => void; $switchLocaleRoute: (loc: string) => { path: string; name: string; }; $switchLocalePath: (loc: string) => string; $switchLocale: (val: string) => void; $switchRoute: (route: unknown, toLocale?: string) => void; $localeRoute: (to: unknown, loc?: string) => { name?: string \| symbol \| undefined; path: string; }; $localePath: (to: unknown, loc?: string) => string; $setI18nRouteParams: (value: unknown) => unknown; $loadPageTranslations: (loc: string, page: string, translations: Translations) => Promise<void>; $setMissingHandler: (handler: MissingHandler \| null) => void; $setTranslationsFromJson: (loc: string, translations: Record<string, unknown>) => Promise<void>; helper: { hasCache(locale: string, page: string): boolean; getCache(locale: string, routeName: string): Translations \| undefined; setCache(_locale: string, _routeName: string, _cache: Map<string, unknown>): void; hasTranslation(locale: string, key: string): boolean; hasPageTranslation(locale: string, routeName: string): boolean; getTranslation<T = unknown>(locale: string, routeName: string, key: string): T \| null; loadTranslations(locale: string, data: Translations, routeName?: string): void; setTranslations(locale: string, data: Translations, routeName?: string): void; loadPageTranslations(locale: string, routeName: string, data: Translations): void; mergeTranslation(locale: string, routeName: string, newTranslations: Translations, _force?: boolean): void; clearCache(): void; }; }` |
| `defaultLocale` | `() => string \| undefined` |
| `defLocale` | `private string \| undefined` |
| `getI18nConfig` | `() => { locales: Locale[]; defaultLocale: string \| undefined; strategy: TestStrategy; }` |
| `getLocale` | `(_route?: unknown) => string` |
| `getLocaleName` | `() => string \| null` |
| `getLocales` | `() => Locale[]` |
| `getRouteName` | `(_route?: unknown, _locale?: string) => string` |
| `has` | `(key: TranslationKey) => boolean` |
| `helper` | `{ hasCache(locale: string, page: string): boolean; getCache(locale: string, routeName: string): Translations \| undefined; setCache(_locale: string, _routeName: string, _cache: Map<string, unknown>): void; hasTranslation(locale: string, key: string): boolean; hasPageTranslation(locale: string, routeName: string): boolean; getTranslation<T = unknown>(locale: string, routeName: string, key: string): T \| null; loadTranslations(locale: string, data: Translations, routeName?: string): void; setTranslations(locale: string, data: Translations, routeName?: string): void; loadPageTranslations(locale: string, routeName: string, data: Translations): void; mergeTranslation(locale: string, routeName: string, newTranslations: Translations, _force?: boolean): void; clearCache(): void; }` |
| `i18nRouteParams` | `private unknown` |
| `i18nStrategy` | `{ getStrategy: () => TestStrategy; getDefaultLocale: () => string; getLocales: () => Locale[]; getLocalizedRouteNamePrefix: () => string; getGlobalLocaleRoutes: () => undefined; getRouteLocales: () => undefined; getRoutesLocaleLinks: () => undefined; getNoPrefixRedirect: () => undefined; getRouteBaseName: () => null; formatPathForResolve: (path: string) => string; setRouter: () => void; getCanonicalPath: () => null; getRedirect: () => null; shouldReturn404: () => null; getClientRedirect: () => null; resolveLocaleFromPath(path: string): string \| null; getLocaleFromPath(path: string): string \| null; getCurrentLocale: () => string; getPluginRouteName: () => string; getCurrentLocaleName: () => string \| null; localeRoute(targetLocale: string, routeOrPath: unknown): { path: string; fullPath: string; }; switchLocaleRoute(_fromLocale: string, toLocale: string, route?: unknown): { path: string; fullPath: string; }; }` |
| `initial` | `private Required<Pick<ResetI18nOptions, "locale" \| "locales" \| "routeName" \| "localeName" \| "strategy">> & Pick<ResetI18nOptions, "defaultLocale" \| "translations" \| "messages">` |
| `loadPageTranslations` | `(loc: string, page: string, translations: Translations) => Promise<void>` |
| `locale` | `private string` |
| `localeName` | `private string \| null` |
| `localePath` | `(to: unknown, loc?: string) => string` |
| `localeRoute` | `(to: unknown, loc?: string) => { name?: string \| symbol \| undefined; path: string; }` |
| `locales` | `private Locale[]` |
| `mergeTranslations` | `(newTranslations: Translations) => void` |
| `missingHandler` | `private MissingHandler \| null` |
| `new` | `(options?: CreateI18nTestContextOptions): I18nTestContext` |
| `pagePath` | `string` |
| `reset` | `(options?: ResetI18nOptions & { reseed?: boolean; }) => void` |
| `resolveTranslations` | `() => Record<string, unknown>` |
| `routeName` | `private string` |
| `setDefaultLocale` | `(val: string \| undefined) => void` |
| `setI18nRouteParams` | `(value: unknown) => unknown` |
| `setLocale` | `(val: string) => void` |
| `setLocaleName` | `(val: string \| null) => void` |
| `setLocales` | `(val: Locale[]) => void` |
| `setMissingHandler` | `(handler: MissingHandler \| null) => void` |
| `setRouteName` | `(val: string) => void` |
| `setTranslation` | `(key: TranslationKey, value: unknown) => void` |
| `setTranslationsFromJson` | `(loc: string, translations: Record<string, unknown>) => Promise<void>` |
| `settRouteName` | `(val: string) => void` |
| `strategy` | `TestStrategy` |
| `switchLocale` | `(val: string) => void` |
| `switchLocalePath` | `(loc: string) => string` |
| `switchLocaleRoute` | `(loc: string) => { path: string; name: string; }` |
| `switchRoute` | `(route: unknown, toLocale?: string) => void` |
| `t` | `(key: TranslationKey, params?: Params, defaultValue?: string \| null) => Translation` |
| `tc` | `(key: TranslationKey, params: number \| Params, defaultValue?: string) => string` |
| `td` | `(value: Date \| number \| string, options?: Intl.DateTimeFormatOptions) => string` |
| `tdr` | `(value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string` |
| `tn` | `(value: number, options?: Intl.NumberFormatOptions) => string` |
| `ts` | `(key: TranslationKey, params?: Params, defaultValue?: string \| null) => string` |

</details>
<details>
<summary><code>IsolatedFakeI18n</code> — 4 members</summary>

| Member | Type |
| --- | --- |
| `context` | `I18nTestContext` |
| `i18n` | `{ $i18nStrategy: { getStrategy: () => import("./context").TestStrategy; getDefaultLocale: () => string; getLocales: () => import("./context").Locale[]; getLocalizedRouteNamePrefix: () => string; getGlobalLocaleRoutes: () => undefined; getRouteLocales: () => undefined; getRoutesLocaleLinks: () => undefined; getNoPrefixRedirect: () => undefined; getRouteBaseName: () => null; formatPathForResolve: (path: string) => string; setRouter: () => void; getCanonicalPath: () => null; getRedirect: () => null; shouldReturn404: () => null; getClientRedirect: () => null; resolveLocaleFromPath(path: string): string \| null; getLocaleFromPath(path: string): string \| null; getCurrentLocale: () => string; getPluginRouteName: () => string; getCurrentLocaleName: () => string \| null; localeRoute(targetLocale: string, routeOrPath: unknown): { path: string; fullPath: string; }; switchLocaleRoute(_fromLocale: string, toLocale: string, route?: unknown): { path: string; fullPath: string; }; }; $getI18nConfig: () => { locales: import("./context").Locale[]; defaultLocale: string \| undefined; strategy: import("./context").TestStrategy; }; $getLocale: (_route?: unknown) => string; $setLocale: (val: string) => void; $getLocaleName: () => string \| null; $setLocaleName: (val: string \| null) => void; $getLocales: () => import("./context").Locale[]; $setLocales: (val: import("./context").Locale[]) => void; $defaultLocale: () => string \| undefined; $setDefaultLocale: (val: string \| undefined) => void; $getRouteName: (_route?: unknown, _locale?: string) => string; $settRouteName: (val: string) => void; $setRouteName: (val: string) => void; $t: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => import("@i18n-micro/types").Translation; $_t: (route: unknown) => (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => import("@i18n-micro/types").Translation; $ts: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => string; $_ts: (route: unknown) => (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => string; $tc: (key: import("@i18n-micro/types").TranslationKey, params: number \| import("@i18n-micro/types").Params, defaultValue?: string) => string; $tn: (value: number, options?: Intl.NumberFormatOptions) => string; $td: (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions) => string; $tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; $has: (key: import("@i18n-micro/types").TranslationKey) => boolean; $resolveTranslations: () => Record<string, unknown>; $setTranslation: (key: import("@i18n-micro/types").TranslationKey, value: unknown) => void; $mergeTranslations: (newTranslations: import("@i18n-micro/types").Translations) => void; $switchLocaleRoute: (loc: string) => { path: string; name: string; }; $switchLocalePath: (loc: string) => string; $switchLocale: (val: string) => void; $switchRoute: (route: unknown, toLocale?: string) => void; $localeRoute: (to: unknown, loc?: string) => { name?: string \| symbol \| undefined; path: string; }; $localePath: (to: unknown, loc?: string) => string; $setI18nRouteParams: (value: unknown) => unknown; $loadPageTranslations: (loc: string, page: string, translations: import("@i18n-micro/types").Translations) => Promise<void>; $setMissingHandler: (handler: import("@i18n-micro/types").MissingHandler \| null) => void; $setTranslationsFromJson: (loc: string, translations: Record<string, unknown>) => Promise<void>; helper: { hasCache(locale: string, page: string): boolean; getCache(locale: string, routeName: string): import("@i18n-micro/types").Translations \| undefined; setCache(_locale: string, _routeName: string, _cache: Map<string, unknown>): void; hasTranslation(locale: string, key: string): boolean; hasPageTranslation(locale: string, routeName: string): boolean; getTranslation<T = unknown>(locale: string, routeName: string, key: string): T \| null; loadTranslations(locale: string, data: import("@i18n-micro/types").Translations, routeName?: string): void; setTranslations(locale: string, data: import("@i18n-micro/types").Translations, routeName?: string): void; loadPageTranslations(locale: string, routeName: string, data: import("@i18n-micro/types").Translations): void; mergeTranslation(locale: string, routeName: string, newTranslations: import("@i18n-micro/types").Translations, _force?: boolean): void; clearCache(): void; }; }` |
| `reset` | `(options?: ResetI18nOptions & { reseed?: boolean; }) => void` |
| `setTranslationsFromJson` | `(loc: string, translations: Record<string, unknown>) => Promise<void>` |

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
| `i18n` | `{ $i18nStrategy: { getStrategy: () => import("./context").TestStrategy; getDefaultLocale: () => string; getLocales: () => import("./context").Locale[]; getLocalizedRouteNamePrefix: () => string; getGlobalLocaleRoutes: () => undefined; getRouteLocales: () => undefined; getRoutesLocaleLinks: () => undefined; getNoPrefixRedirect: () => undefined; getRouteBaseName: () => null; formatPathForResolve: (path: string) => string; setRouter: () => void; getCanonicalPath: () => null; getRedirect: () => null; shouldReturn404: () => null; getClientRedirect: () => null; resolveLocaleFromPath(path: string): string \| null; getLocaleFromPath(path: string): string \| null; getCurrentLocale: () => string; getPluginRouteName: () => string; getCurrentLocaleName: () => string \| null; localeRoute(targetLocale: string, routeOrPath: unknown): { path: string; fullPath: string; }; switchLocaleRoute(_fromLocale: string, toLocale: string, route?: unknown): { path: string; fullPath: string; }; }; $getI18nConfig: () => { locales: import("./context").Locale[]; defaultLocale: string \| undefined; strategy: import("./context").TestStrategy; }; $getLocale: (_route?: unknown) => string; $setLocale: (val: string) => void; $getLocaleName: () => string \| null; $setLocaleName: (val: string \| null) => void; $getLocales: () => import("./context").Locale[]; $setLocales: (val: import("./context").Locale[]) => void; $defaultLocale: () => string \| undefined; $setDefaultLocale: (val: string \| undefined) => void; $getRouteName: (_route?: unknown, _locale?: string) => string; $settRouteName: (val: string) => void; $setRouteName: (val: string) => void; $t: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => import("@i18n-micro/types").Translation; $_t: (route: unknown) => (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => import("@i18n-micro/types").Translation; $ts: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => string; $_ts: (route: unknown) => (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null) => string; $tc: (key: import("@i18n-micro/types").TranslationKey, params: number \| import("@i18n-micro/types").Params, defaultValue?: string) => string; $tn: (value: number, options?: Intl.NumberFormatOptions) => string; $td: (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions) => string; $tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; $has: (key: import("@i18n-micro/types").TranslationKey) => boolean; $resolveTranslations: () => Record<string, unknown>; $setTranslation: (key: import("@i18n-micro/types").TranslationKey, value: unknown) => void; $mergeTranslations: (newTranslations: import("@i18n-micro/types").Translations) => void; $switchLocaleRoute: (loc: string) => { path: string; name: string; }; $switchLocalePath: (loc: string) => string; $switchLocale: (val: string) => void; $switchRoute: (route: unknown, toLocale?: string) => void; $localeRoute: (to: unknown, loc?: string) => { name?: string \| symbol \| undefined; path: string; }; $localePath: (to: unknown, loc?: string) => string; $setI18nRouteParams: (value: unknown) => unknown; $loadPageTranslations: (loc: string, page: string, translations: import("@i18n-micro/types").Translations) => Promise<void>; $setMissingHandler: (handler: import("@i18n-micro/types").MissingHandler \| null) => void; $setTranslationsFromJson: (loc: string, translations: Record<string, unknown>) => Promise<void>; helper: { hasCache(locale: string, page: string): boolean; getCache(locale: string, routeName: string): import("@i18n-micro/types").Translations \| undefined; setCache(_locale: string, _routeName: string, _cache: Map<string, unknown>): void; hasTranslation(locale: string, key: string): boolean; hasPageTranslation(locale: string, routeName: string): boolean; getTranslation<T = unknown>(locale: string, routeName: string, key: string): T \| null; loadTranslations(locale: string, data: import("@i18n-micro/types").Translations, routeName?: string): void; setTranslations(locale: string, data: import("@i18n-micro/types").Translations, routeName?: string): void; loadPageTranslations(locale: string, routeName: string, data: import("@i18n-micro/types").Translations): void; mergeTranslation(locale: string, routeName: string, newTranslations: import("@i18n-micro/types").Translations, _force?: boolean): void; clearCache(): void; }; }` |
| `reset` | `(options?: ResetI18nOptions & { reseed?: boolean; }) => void` |
| `setTranslationsFromJson` | `(loc: string, translations: Record<string, unknown>) => Promise<void>` |
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

<details>
<summary><code>ExportTarget</code> — 3 members</summary>

| Member | Type |
| --- | --- |
| `condition?` | `"import" \| "require" \| "default" \| undefined` |
| `formats?` | `PublishFormat[] \| undefined` |
| `subpath` | `string` |

</details>

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
