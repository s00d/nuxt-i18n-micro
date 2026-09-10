---
url: 'https://s00d.github.io/nuxt-i18n-micro/api/packages/node.md'
description: 'Exported API of @i18n-micro/node, generated from the source.'
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
| `FormatService` | class | 19 members |
| `Getter` | type | `(key: TranslationKey, params?: Record<string, string \| number \| boolean>, defaultValue?: string) => unknown` |
| `I18n` | class | 46 members |
| `I18nOptions` | interface | 7 members |
| `interpolate` | function | `(template: string, params: Params) => string` |
| `LoadedTranslations` | interface | 2 members |
| `loadRootTranslations` | function | `(dir: string, disablePageLocales?: boolean) => Promise<Record<string, Translations>>` |
| `loadTranslations` | function | `(dir: string, disablePageLocales?: boolean) => Promise<LoadedTranslations>` |
| `Locale` | interface | 11 members |
| `LocaleCode` | type | `string` |
| `Params` | type | `Record<string, string \| number \| boolean>` |
| `PluralFunc` | type | `(key: TranslationKey, count: number, params: Params, locale: string, getter: Getter) => string \| null` |
| `Translations` | interface | 1 members |

FormatService — 19 members, identical to [`FormatService`](/api/packages/astro).

| Member | Type |
| --- | --- |
| `addRouteTranslations` | `(locale: string, routeName: string, translations: Translations, merge?: boolean) => void` |
| `addTranslations` | `(locale: string, translations: Translations, merge?: boolean) => void` |
| `clear` | `() => void` |
| `clearCache` | `() => void` |
| `currentRoute` | `string` |
| `disablePageLocales` | `private boolean` |
| `fallbackLocale` | `string` |
| `formatter` | `FormatService` |
| `getCustomMissingHandler?` | `(() => MissingHandler \| null) \| undefined` |
| `getFallbackLocale` | `() => string` |
| `getLocale` | `() => string` |
| `getMissingContext` | `protected (routeContext?: unknown) => { locale: string; routeName: string; }` |
| `getRoute` | `() => string` |
| `has` | `(key: TranslationKey, routeContext?: unknown) => boolean` |
| `hasTranslation` | `(key: TranslationKey) => boolean` |
| `helper` | `{ hasCache(locale: string, page: string): boolean; getCache(locale: string, routeName: string): Translations \| undefined; setCache(_locale: string, _routeName: string, _cache: Map<string, unknown>): void; hasTranslation(locale: string, key: string): boolean; hasPageTranslation(locale: string, routeName: string): boolean; getTranslation<T = unknown>(locale: string, routeName: string, key: string): T \| null; loadTranslations(locale: string, data: Translations, routeName?: string): void; setTranslations(locale: string, data: Translations, routeName?: string): void; loadPageTranslations(locale: string, routeName: string, data: Translations): void; mergeTranslation(locale: string, routeName: string, newTranslations: Translations, _force?: boolean): void; clearCache(): void; }` |
| `loadRouteTranslationsCore` | `(locale: string, routeName: string, translations: Translations, merge: boolean) => void` |
| `loadTranslations` | `(dir?: string) => Promise<void>` |
| `loadTranslationsCore` | `(locale: string, translations: Translations, merge: boolean, routeName?: string) => void` |
| `locale` | `string` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn` | `boolean` |
| `new` | `(options: I18nOptions): I18n` |
| `onTranslationsChanged` | `protected () => void` |
| `pluralFunc` | `PluralFunc` |
| `reload` | `() => Promise<void>` |
| `resolveDateTimeFormatArgs` | `private any` |
| `resolveHas` | `protected (key: TranslationKey, routeContext?: unknown) => boolean` |
| `resolveLookup` | `protected (key: TranslationKey, routeContext?: unknown) => unknown \| null` |
| `resolveNumberFormatArgs` | `private any` |
| `resolveRouteName` | `protected (routeContext?: unknown) => string` |
| `resolveTranslations` | `(routeContext?: unknown) => Translations` |
| `resolveTranslationTree` | `protected (lower: Record<string, unknown>, upper: Record<string, unknown>) => Translations` |
| `setRoute` | `(routeName: string) => void` |
| `setTranslation` | `(key: TranslationKey, value: unknown) => void` |
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

| Member | Type |
| --- | --- |
| `disablePageLocales?` | `boolean \| undefined` |
| `fallbackLocale?` | `string \| undefined` |
| `locale` | `string` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn?` | `boolean \| undefined` |
| `plural?` | `PluralFunc \| undefined` |
| `translationDir?` | `string \| undefined` |

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
