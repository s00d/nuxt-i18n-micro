---
title: '@i18n-micro/preact'
description: 'Exported API of @i18n-micro/preact, generated from the source.'
outline: 'deep'
---

# `@i18n-micro/preact`

39 exports across 1 entry point.
Generated from the API snapshot that [`pnpm run api:surface`](/guide/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/preact`

```ts
import { /* … */ } from '@i18n-micro/preact'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `CleanTranslation` | type | `string \| number \| boolean \| Translations \| PluralTranslations \| null` |
| `createBrowserHistoryAdapter` | value | `unknown` |
| `createI18n` | function | `(options: PreactI18nOptions) => PreactI18n` |
| `createPreactRouterAdapter` | value | `unknown` |
| `defaultPlural` | const | `PluralFunc` |
| `FormatService` | class | 18 members |
| `Getter` | type | `(key: TranslationKey, params?: Record<string, string \| number \| boolean>, defaultValue?: string) => unknown` |
| `I18nContext` | const | `import("preact/src/index").Context<PreactI18n \| null>` |
| `I18nDefaultLocaleContext` | const | `import("preact/src/index").Context<string \| null>` |
| `I18nGroup` | value | `unknown` |
| `I18nGroupProps` | value | `unknown` |
| `I18nLink` | value | `unknown` |
| `I18nLinkProps` | value | `unknown` |
| `I18nLocalesContext` | const | `import("preact/src/index").Context<Locale[] \| null>` |
| `I18nProvider` | value | `unknown` |
| `I18nProviderProps` | value | `unknown` |
| `I18nRouterContext` | const | `import("preact/src/index").Context<I18nRoutingStrategy \| null>` |
| `I18nRoutingStrategy` | interface | 6 members |
| `I18nSwitcher` | value | `unknown` |
| `I18nSwitcherProps` | value | `unknown` |
| `I18nT` | value | `unknown` |
| `I18nTProps` | value | `unknown` |
| `interpolate` | function | `(template: string, params: Params) => string` |
| `Locale` | interface | 10 members |
| `LocaleCode` | type | `string` |
| `ModuleOptions` | interface | 45 members |
| `Params` | type | `Record<string, string \| number \| boolean>` |
| `PluralFunc` | type | `(key: TranslationKey, count: number, params: Params, locale: string, getter: Getter) => string \| null` |
| `PreactI18n` | class | 42 members |
| `PreactI18nOptions` | interface | 6 members |
| `TranslationKey` | type | `keyof DefineLocaleMessage extends never ? string : keyof DefineLocaleMessage \| string` |
| `Translations` | interface | — |
| `useI18n` | value | `unknown` |
| `useI18nContext` | const | `() => PreactI18n` |
| `useI18nDefaultLocale` | const | `() => string \| null` |
| `useI18nLocales` | const | `() => Locale[] \| null` |
| `UseI18nOptions` | value | `unknown` |
| `UseI18nReturn` | value | `unknown` |
| `useI18nRouter` | const | `() => I18nRoutingStrategy \| null` |

<code>FormatService</code> — 18 members, identical to [`FormatService`](/api/packages/astro).
<details>
<summary><code>I18nRoutingStrategy</code> — 6 members</summary>

| Member | Type |
| --- | --- |
| `getCurrentPath` | `() => string` |
| `getRoute?` | `(() => { fullPath: string; query: Record<string, unknown>; }) \| undefined` |
| `linkComponent?` | `string \| React.ComponentType<{ [key: string]: unknown; href: string; children?: React.ReactNode; style?: React.CSSProperties; className?: string; }> \| undefined` |
| `push` | `(target: { path: string; }) => void` |
| `replace` | `(target: { path: string; }) => void` |
| `resolvePath?` | `((to: string \| { path?: string; }, locale: string) => string \| { path?: string; }) \| undefined` |

</details>
<code>Locale</code> — 10 members, identical to [`Locale`](/api/packages/types).
<code>ModuleOptions</code> — 45 members, identical to [`ModuleOptions`](/api/packages/types).
<details>
<summary><code>PreactI18n</code> — 42 members</summary>

| Member | Type |
| --- | --- |
| `addRouteTranslations` | `(locale: string, routeName: string, translations: Translations, merge?: boolean) => void` |
| `addTranslations` | `(locale: string, translations: Translations, merge?: boolean) => void` |
| `clearCache` | `() => void` |
| `currentRoute` | `string` |
| `fallbackLocale` | `string` |
| `formatter` | `FormatService` |
| `getCustomMissingHandler?` | `(() => MissingHandler \| null) \| undefined` |
| `getFallbackLocale` | `() => string` |
| `getLocale` | `() => string` |
| `getMissingContext` | `protected (routeContext?: unknown) => { locale: string; routeName: string; }` |
| `getRoute` | `() => string` |
| `getSnapshot` | `() => string` |
| `has` | `(key: TranslationKey, routeContext?: unknown) => boolean` |
| `helper` | `{ hasCache(locale: string, page: string): boolean; getCache(locale: string, routeName: string): Translations \| undefined; setCache(_locale: string, _routeName: string, _cache: Map<string, unknown>): void; hasTranslation(locale: string, key: string): boolean; hasPageTranslation(locale: string, routeName: string): boolean; getTranslation<T = unknown>(locale: string, routeName: string, key: string): T \| null; loadTranslations(locale: string, data: Translations, routeName?: string): void; setTranslations(locale: string, data: Translations, routeName?: string): void; loadPageTranslations(locale: string, routeName: string, data: Translations): void; mergeTranslation(locale: string, routeName: string, newTranslations: Translations, _force?: boolean): void; clearCache(): void; }` |
| `keyRecorder` | `private any` |
| `loadRouteTranslationsCore` | `(locale: string, routeName: string, translations: Translations, merge: boolean) => void` |
| `loadTranslationsCore` | `(locale: string, translations: Translations, merge: boolean, routeName?: string) => void` |
| `locale` | `string` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn` | `boolean` |
| `pluralFunc` | `PluralFunc` |
| `recordResolvedKey` | `protected (cacheKey: string, key: string, value: unknown) => void` |
| `resolveDateTimeFormatArgs` | `private any` |
| `resolveHas` | `protected (key: TranslationKey, routeContext?: unknown) => boolean` |
| `resolveLookup` | `protected (key: TranslationKey, routeContext?: unknown) => unknown \| null` |
| `resolveNumberFormatArgs` | `private any` |
| `resolveRouteName` | `protected (routeContext?: unknown) => string` |
| `setKeyRecorder` | `(recorder: ((cacheKey: string, key: string, value: unknown) => void) \| null) => void` |
| `setRoute` | `(routeName: string) => void` |
| `storage` | `TranslationStorage` |
| `store` | `private ReactiveI18nStore` |
| `subscribe` | `(listener: () => void) => () => void` |
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
<summary><code>PreactI18nOptions</code> — 6 members</summary>

| Member | Type |
| --- | --- |
| `fallbackLocale?` | `string \| undefined` |
| `locale` | `string` |
| `messages?` | `Record<string, Translations> \| undefined` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn?` | `boolean \| undefined` |
| `plural?` | `PluralFunc \| undefined` |

</details>

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
