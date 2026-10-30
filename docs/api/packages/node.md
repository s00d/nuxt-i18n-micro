---
title: '@i18n-micro/node'
description: 'Exported API of @i18n-micro/node, generated from the source.'
outline: 'deep'
---

# `@i18n-micro/node`

16 exports across 1 entry point.
Generated from the API snapshot that [`pnpm run api:surface`](/contributing/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/node`

```ts
import { /* … */ } from '@i18n-micro/node'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `CleanTranslation` | type | `string \| number \| boolean \| Translations \| PluralTranslations \| null` |
| `createI18n` | function | `(options: I18nOptions) => I18n` |
| `FormatService` | class | 21 members |
| `Getter` | type | `(key: TranslationKey, params?: Record<string, string \| number \| boolean>, defaultValue?: string) => unknown` |
| `I18n` | class | 68 members |
| `I18nOptions` | interface | 15 members |
| `interpolate` | function | `(template: string, params: Params) => string` |
| `LoadedTranslations` | interface | 2 members |
| `loadRootTranslations` | function | `(dir: string, disablePageLocales?: boolean) => Promise<Record<string, Translations>>` |
| `loadTranslations` | function | `(dir: string, disablePageLocales?: boolean) => Promise<LoadedTranslations>` |
| `Locale` | interface | 11 members |
| `LocaleCode` | type | `string` |
| `localeIsoMap` | const | `(locales: readonly { code: string; iso?: string; }[]) => Record<string, string>` |
| `Params` | type | `Record<string, string \| number \| boolean>` |
| `PluralFunc` | type | `(key: TranslationKey, count: number, params: Params, locale: string, getter: Getter) => string \| null` |
| `Translations` | interface | 1 members |

<code>FormatService</code> — 21 members, identical to [`FormatService`](/api/packages/astro).

<details>
<summary><code>I18n</code> — 68 members</summary>

| Member | Type |
| --- | --- |
| `activeKey` | `private any` |
| `activeRootKey` | `private any` |
| `addRouteTranslations` | `(locale: string, routeName: string, translations: Translations, merge?: boolean) => void` |
| `addTranslations` | `(locale: string, translations: Translations, merge?: boolean) => void` |
| `clear` | `() => void` |
| `clearCache` | `() => void` |
| `currentRoute` | `string` |
| `disablePageLocales` | `private boolean` |
| `extend` | `<M extends Record<string, unknown>>(methods: M & ThisType<import("../../node/src").I18n & M>) => import("../../node/src").I18n & M` |
| `fallbackKey` | `private any` |
| `fallbackLocale` | `string` |
| `fallbackRootKey` | `private any` |
| `fork` | `(locale?: string) => import("../../node/src").I18n` |
| `forked` | `private boolean` |
| `formatArgs` | `private any` |
| `formatter` | `FormatService` |
| `getCustomMissingHandler?` | `(() => MissingHandler \| null) \| undefined` |
| `getFallbackLocale` | `() => string` |
| `getLocale` | `() => string` |
| `getMissingContext` | `protected (routeContext?: unknown) => { locale: string; routeName: string; }` |
| `getRoute` | `() => string` |
| `getSnapshot` | `() => string` |
| `has` | `(key: TranslationKey, routeContext?: unknown) => boolean` |
| `hasTranslation` | `(key: TranslationKey) => boolean` |
| `helper` | `TranslationHelper` |
| `loadFromUrl` | `(url: string, options?: LoadFromUrlOptions) => Promise<void>` |
| `loadFromUrls` | `(entries: LoadFromUrlEntry[]) => Promise<void>` |
| `loadMessages` | `(messages?: Record<string, Translations>, routeMessages?: Record<string, Record<string, Translations>>) => void` |
| `loadRouteTranslationsCore` | `(locale: string, routeName: string, translations: Translations, merge: boolean) => void` |
| `loadTranslations` | `(dir?: string) => Promise<void>` |
| `loadTranslationsCore` | `(locale: string, translations: Translations, merge: boolean, routeName?: string) => void` |
| `locale` | `string` |
| `localeIso` | `protected Record<string, string>` |
| `lookupLocale` | `private any` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn` | `boolean` |
| `new` | `(options: I18nOptions): I18n` |
| `onTranslationsChanged` | `protected (locale?: string) => void` |
| `ownStore` | `protected ReactiveI18nStore` |
| `pluralFunc` | `PluralFunc` |
| `pluralLocale` | `() => string` |
| `pluralTag` | `private any` |
| `reload` | `() => Promise<void>` |
| `resolveHas` | `protected (key: TranslationKey, routeContext?: unknown) => boolean` |
| `resolveLookup` | `protected (key: TranslationKey, routeContext?: unknown) => unknown \| null` |
| `resolveRouteName` | `protected (routeContext?: unknown) => string` |
| `resolveTranslations` | `(routeContext?: unknown) => Translations` |
| `resolveTranslationTree` | `protected (lower: Record<string, unknown>, upper: Record<string, unknown>) => Translations` |
| `run` | `<T>(locale: string, fn: (i18n: I18n) => T) => T` |
| `scope` | `private AsyncLocalStorage<I18n>` |
| `setLocaleIso` | `(localeIso: Record<string, string>) => void` |
| `setRoute` | `(routeName: string) => void` |
| `setTranslation` | `(key: TranslationKey, value: unknown) => void` |
| `storage` | `TranslationStorage` |
| `store` | `protected ReactiveI18nStore` |
| `subscribe` | `(listener: () => void) => () => void` |
| `t` | `(key: TranslationKey, params?: Params, defaultValue?: string \| null, routeContext?: unknown) => CleanTranslation` |
| `tc` | `(key: TranslationKey, count: number \| Params, defaultValue?: string) => string` |
| `td` | `{ (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, overrides?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string; }` |
| `tdr` | `(value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string` |
| `tn` | `{ (value: number, options?: Intl.NumberFormatOptions): string; (value: number, key: string, overrides?: Intl.NumberFormatOptions): string; (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string; }` |
| `touch` | `protected () => void` |
| `translationDir?` | `string \| undefined` |
| `ts` | `(key: TranslationKey, params?: Params, defaultValue?: string, routeContext?: unknown) => string` |
| `warnDev` | `protected (message: string) => void` |
| `warnMissing` | `protected (key: TranslationKey, routeContext?: unknown) => void` |
| `warnMissingFormat` | `protected (kind: "number" \| "datetime", key: string, locale: string) => void` |
| `write` | `private any` |

</details>

<details>
<summary><code>I18nOptions</code> — 15 members</summary>

| Member | Type |
| --- | --- |
| `datetimeFormats?` | `DateTimeFormatsConfig \| undefined` |
| `disablePageLocales?` | `boolean \| undefined` |
| `fallbackLocale?` | `string \| undefined` |
| `locale` | `string` |
| `localeIso?` | `Record<string, string> \| undefined` |
| `messages?` | `Record<string, Translations> \| undefined` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn?` | `boolean \| undefined` |
| `now?` | `(() => number) \| undefined` |
| `numberFormats?` | `NumberFormatsConfig \| undefined` |
| `parent?` | `I18n \| undefined` |
| `plural?` | `PluralFunc \| undefined` |
| `routeMessages?` | `Record<string, Record<string, Translations>> \| undefined` |
| `timeZone?` | `string \| undefined` |
| `translationDir?` | `string \| undefined` |

</details>

<code>LoadedTranslations</code> — 2 members, identical to [`LoadedTranslations`](/api/packages/astro).

<code>Locale</code> — 11 members, identical to [`Locale`](/api/packages/types).

<code>Translations</code> — 1 members, identical to [`Translations`](/api/packages/types).

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
