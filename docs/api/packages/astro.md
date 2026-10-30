---
title: '@i18n-micro/astro'
description: 'Exported API of @i18n-micro/astro, generated from the source.'
outline: 'deep'
---

# `@i18n-micro/astro`

50 exports across 8 entry points.
Generated from the API snapshot that [`pnpm run api:surface`](/contributing/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/astro`

```ts
import { /* … */ } from '@i18n-micro/astro'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `AstroI18n` | class | 68 members |
| `AstroI18nOptions` | type | `I18nOptions` |
| `CleanTranslation` | type | `string \| number \| boolean \| Translations \| PluralTranslations \| null` |
| `createAstroRouterAdapter` | function | `(locales: Locale[], defaultLocale: string, getCurrentUrl?: () => URL) => I18nRoutingStrategy` |
| `createI18n` | function | `(options: AstroI18nOptions) => AstroI18n` |
| `createI18nMiddleware` | function | `(options: I18nMiddlewareOptions) => MiddlewareHandler` |
| `defaultPlural` | const | `PluralFunc` |
| `detectLocale` | function | `(pathname: string, cookies: { get: (name: string) => { value: string; } \| undefined; }, headers: Headers, defaultLocale: string, locales: string[], localeCookie?: string \| null, routingStrategy?: I18nRoutingStrategy \| null, autoDetect?: boolean) => string` |
| `FormatService` | class | 21 members |
| `getDefaultLocale` | function | `(astro: Pick<AstroGlobal, "locals">) => string` |
| `getI18n` | function | `(astro: Pick<AstroGlobal, "locals">) => AstroI18n` |
| `getI18nProps` | function | `(astro: Pick<AstroGlobal, "locals">, keys?: string[]) => I18nClientProps` |
| `getLocale` | function | `(astro: Pick<AstroGlobal, "locals">) => string` |
| `getLocaleRewritePath` | function | `(astro: AstroGlobal) => string` |
| `getLocales` | function | `(astro: Pick<AstroGlobal, "locals">) => Locale[]` |
| `Getter` | type | `(key: TranslationKey, params?: Record<string, string \| number \| boolean>, defaultValue?: string) => unknown` |
| `I18nClientProps` | interface | 6 members |
| `i18nIntegration` | function | `(options: I18nIntegrationOptions) => AstroIntegration` |
| `I18nIntegrationOptions` | interface | 10 members |
| `I18nMiddlewareOptions` | interface | 9 members |
| `I18nRoutingStrategy` | interface | 10 members |
| `interpolate` | function | `(template: string, params: Params) => string` |
| `Locale` | interface | 11 members |
| `LocaleCode` | type | `string` |
| `LocaleHeadOptions` | interface | 4 members |
| `LocaleHeadResult` | type | `LocaleHead` |
| `localeIsoMap` | const | `(locales: readonly { code: string; iso?: string; }[]) => Record<string, string>` |
| `Params` | type | `Record<string, string \| number \| boolean>` |
| `PluralFunc` | type | `(key: TranslationKey, count: number, params: Params, locale: string, getter: Getter) => string \| null` |
| `prepareLocaleRewrite` | function | `(astro: AstroGlobal) => Response \| string` |
| `Translations` | interface | 1 members |
| `useI18n` | function | `(astro: Astro) => { locale: string; defaultLocale: string; locales: Locale[]; t: (key: TranslationKey, params?: Params, defaultValue?: string \| null, routeName?: string) => CleanTranslation; ts: (key: TranslationKey, params?: Params, defaultValue?: string, routeName?: string) => string; tc: (key: TranslationKey, count: number \| Params, defaultValue?: string) => string; tn: { (value: number, options?: Intl.NumberFormatOptions): string; (value: number, key: string, overrides?: Intl.NumberFormatOptions): string; (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string; }; td: { (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, overrides?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string; }; tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; has: (key: TranslationKey, routeName?: string) => boolean; getRoute: () => string; getRouteName: (path?: string) => string; getLocaleFromPath: (path?: string) => string; switchLocalePath: (newLocale: string) => string; localizePath: (path: string, targetLocale?: string) => string; getI18n: () => AstroI18n; getBasePath: (url?: URL) => string; addTranslations: (locale: string, translations: Record<string, unknown>, merge?: boolean) => void; addRouteTranslations: (locale: string, routeName: string, translations: Record<string, unknown>, merge?: boolean) => void; mergeTranslations: (locale: string, routeName: string, translations: Record<string, unknown>) => void; clearCache: () => void; }` |
| `useLocaleHead` | function | `(astro: Astro, options?: LocaleHeadOptions) => LocaleHeadResult` |

<details>
<summary><code>AstroI18n</code> — 68 members</summary>

| Member | Type |
| --- | --- |
| `activeKey` | `private any` |
| `activeRootKey` | `private any` |
| `addLocaleIso` | `(localeIso: Record<string, string>) => void` |
| `addRouteTranslations` | `(locale: string, routeName: string, translations: Translations, merge?: boolean) => void` |
| `addTranslations` | `(locale: string, translations: Translations, merge?: boolean) => void` |
| `clear` | `() => void` |
| `clearCache` | `() => void` |
| `currentRoute` | `string` |
| `extend` | `<M extends Record<string, unknown>>(methods: M & ThisType<AstroI18n & M>) => AstroI18n & M` |
| `fallbackKey` | `private any` |
| `fallbackLocale` | `string` |
| `fallbackRootKey` | `private any` |
| `fork` | `(locale?: string) => AstroI18n` |
| `formatArgs` | `private any` |
| `formatter` | `FormatService` |
| `getCustomMissingHandler?` | `(() => MissingHandler \| null) \| undefined` |
| `getFallbackLocale` | `() => string` |
| `getLocale` | `() => string` |
| `getLocaleIso` | `() => Record<string, string>` |
| `getMissingContext` | `protected (routeContext?: unknown) => { locale: string; routeName: string; }` |
| `getRoute` | `() => string` |
| `getRouteTranslations` | `(locale: string, routeName: string) => Translations \| null` |
| `getSnapshot` | `() => string` |
| `has` | `(key: TranslationKey, routeContext?: unknown) => boolean` |
| `hasTranslation` | `(key: TranslationKey) => boolean` |
| `helper` | `TranslationHelper` |
| `initialMessages` | `private Record<string, Translations>` |
| `initialRouteMessages` | `private Record<string, Record<string, Translations>>` |
| `keepMessages` | `(messages: Record<string, Translations>, routeMessages: Record<string, Record<string, Translations>>) => void` |
| `loadFromUrl` | `(url: string, options?: LoadFromUrlOptions) => Promise<void>` |
| `loadFromUrls` | `(entries: LoadFromUrlEntry[]) => Promise<void>` |
| `loadMessages` | `(messages?: Record<string, Translations>, routeMessages?: Record<string, Record<string, Translations>>) => void` |
| `loadRouteTranslationsCore` | `(locale: string, routeName: string, translations: Translations, merge: boolean) => void` |
| `loadTranslationsCore` | `(locale: string, translations: Translations, merge: boolean, routeName?: string) => void` |
| `locale` | `string` |
| `localeIso` | `protected Record<string, string>` |
| `lookupLocale` | `private any` |
| `mergeTranslations` | `(locale: string, routeName: string, translations: Translations) => void` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn` | `boolean` |
| `new` | `(options: I18nOptions): AstroI18n` |
| `onTranslationsChanged` | `protected (locale?: string) => void` |
| `ownsFormatter` | `private any` |
| `ownStore` | `protected ReactiveI18nStore` |
| `pluralFunc` | `PluralFunc` |
| `pluralLocale` | `() => string` |
| `pluralTag` | `private any` |
| `resolveHas` | `protected (key: TranslationKey, routeContext?: unknown) => boolean` |
| `resolveLookup` | `protected (key: TranslationKey, routeContext?: unknown) => unknown \| null` |
| `resolveRouteName` | `protected (routeContext?: unknown) => string` |
| `resolveTranslations` | `(routeContext?: unknown) => Translations` |
| `resolveTranslationTree` | `protected (lower: Record<string, unknown>, upper: Record<string, unknown>) => Translations` |
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
| `ts` | `(key: TranslationKey, params?: Params, defaultValue?: string, routeContext?: unknown) => string` |
| `warnDev` | `protected (message: string) => void` |
| `warnMissing` | `protected (key: TranslationKey, routeContext?: unknown) => void` |
| `warnMissingFormat` | `protected (kind: "number" \| "datetime", key: string, locale: string) => void` |
| `write` | `private any` |

</details>

<details>
<summary><code>FormatService</code> — 21 members</summary>

| Member | Type |
| --- | --- |
| `clearCache` | `() => void` |
| `dateCache` | `private any` |
| `datetimeFormats` | `private any` |
| `formatDate` | `(value: Date \| number \| string, locale: string, options?: Intl.DateTimeFormatOptions) => string` |
| `formatNumber` | `(value: number, locale: string, options?: Intl.NumberFormatOptions) => string` |
| `formatRelativeTime` | `(value: Date \| number \| string, locale: string, options?: Intl.RelativeTimeFormatOptions) => string` |
| `getDateTimeFormats` | `() => DateTimeFormatsConfig` |
| `getDateTimeFormatter` | `(locale: string, options?: Intl.DateTimeFormatOptions) => Intl.DateTimeFormat` |
| `getNumberFormats` | `() => NumberFormatsConfig` |
| `getNumberFormatter` | `(locale: string, options?: Intl.NumberFormatOptions) => Intl.NumberFormat` |
| `getRelativeTimeFormatter` | `(locale: string, options?: Intl.RelativeTimeFormatOptions) => Intl.RelativeTimeFormat` |
| `new` | `(options?: FormatServiceOptions \| undefined): FormatService` |
| `now?` | `private any` |
| `numberCache` | `private any` |
| `numberFormats` | `private any` |
| `relativeCache` | `private any` |
| `resolveDateTimeFormat` | `(locale: string, key: string) => Intl.DateTimeFormatOptions \| undefined` |
| `resolveNumberFormat` | `(locale: string, key: string) => Intl.NumberFormatOptions \| undefined` |
| `setDateTimeFormats` | `(formats: DateTimeFormatsConfig) => void` |
| `setNumberFormats` | `(formats: NumberFormatsConfig) => void` |
| `timeZone?` | `private any` |

</details>

<details>
<summary><code>I18nClientProps</code> — 6 members</summary>

| Member | Type |
| --- | --- |
| `currentRoute` | `string` |
| `fallbackLocale` | `string` |
| `locale` | `string` |
| `localeIso?` | `Record<string, string> \| undefined` |
| `pluralLocale?` | `string \| undefined` |
| `translations` | `Record<string, Translations>` |

</details>

<details>
<summary><code>I18nIntegrationOptions</code> — 10 members</summary>

| Member | Type |
| --- | --- |
| `autoDetect?` | `boolean \| undefined` |
| `disablePageLocales?` | `boolean \| undefined` |
| `fallbackLocale?` | `string \| undefined` |
| `locale` | `string` |
| `localeCookie?` | `string \| null \| undefined` |
| `locales?` | `Locale[] \| undefined` |
| `middleware?` | `boolean \| undefined` |
| `missingWarn?` | `boolean \| undefined` |
| `redirectToDefault?` | `boolean \| undefined` |
| `translationDir?` | `string \| undefined` |

</details>

<details>
<summary><code>I18nMiddlewareOptions</code> — 9 members</summary>

| Member | Type |
| --- | --- |
| `autoDetect?` | `boolean \| undefined` |
| `base?` | `string \| undefined` |
| `defaultLocale` | `string` |
| `i18n` | `AstroI18n` |
| `localeCookie?` | `string \| null \| undefined` |
| `localeObjects?` | `Locale[] \| undefined` |
| `locales` | `string[]` |
| `redirectToDefault?` | `boolean \| undefined` |
| `routingStrategy?` | `I18nRoutingStrategy \| undefined` |

</details>

<details>
<summary><code>I18nRoutingStrategy</code> — 10 members</summary>

| Member | Type |
| --- | --- |
| `getCurrentPath` | `() => string` |
| `getLocaleFromPath?` | `((path: string, defaultLocale: string, locales: string[]) => string) \| undefined` |
| `getRoute?` | `(() => { fullPath: string; query: Record<string, unknown>; }) \| undefined` |
| `getRouteName?` | `((path: string, locales: string[], routePattern?: string) => string) \| undefined` |
| `localizePath?` | `((path: string, locale: string, locales: string[], defaultLocale?: string) => string) \| undefined` |
| `push?` | `((target: { path: string; }) => void) \| undefined` |
| `removeLocaleFromPath?` | `((path: string, locales: string[]) => string) \| undefined` |
| `replace?` | `((target: { path: string; }) => void) \| undefined` |
| `resolvePath?` | `((to: string \| { path?: string; }, locale: string) => string \| { path?: string; }) \| undefined` |
| `switchLocalePath?` | `((path: string, newLocale: string, locales: string[], defaultLocale?: string) => string) \| undefined` |

</details>

<code>Locale</code> — 11 members, identical to [`Locale`](/api/packages/types).

<details>
<summary><code>LocaleHeadOptions</code> — 4 members</summary>

| Member | Type |
| --- | --- |
| `addDirAttribute?` | `boolean \| undefined` |
| `addSeoAttributes?` | `boolean \| undefined` |
| `baseUrl?` | `string \| undefined` |
| `hreflangBaseLanguage?` | `boolean \| undefined` |

</details>

<code>Translations</code> — 1 members, identical to [`Translations`](/api/packages/types).
## `@i18n-micro/astro/client`

```ts
import { /* … */ } from '@i18n-micro/astro/client'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `hasTranslation` | function | `(state: I18nState, key: string, routeName?: string) => boolean` |
| `I18nState` | interface | 6 members |
| `translate` | function | `(state: I18nState, key: string, params?: Params, defaultValue?: string \| null, routeName?: string) => string \| number \| boolean \| Translations \| null` |

<code>I18nState</code> — 6 members, identical to `I18nClientProps` above.
## `@i18n-micro/astro/client/preact`

```ts
import { /* … */ } from '@i18n-micro/astro/client/preact'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `I18nProvider` | const | `({ children, value }: { children: ComponentChildren; value: I18nClientProps; }) => import("preact").VNode<{ value: I18nContextValue \| null; children?: ComponentChildren; }>` |
| `useAstroI18n` | function | `() => { locale: string; fallbackLocale: string; currentRoute: string; setLocale: (locale: string) => void; setRoute: (currentRoute: string) => void; t: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null, routeName?: string) => import("@i18n-micro/types").CleanTranslation; ts: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string, routeName?: string) => string; tc: (key: import("@i18n-micro/types").TranslationKey, count: number \| import("@i18n-micro/types").Params, defaultValue?: string) => string; tn: (value: number, options?: Intl.NumberFormatOptions) => string; td: (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions) => string; tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; has: (key: import("@i18n-micro/types").TranslationKey, routeName?: string) => boolean; getRoute: () => string; }` |


## `@i18n-micro/astro/client/react`

```ts
import { /* … */ } from '@i18n-micro/astro/client/react'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `I18nProvider` | function | `({ children, value }: { children: React.ReactNode; value: I18nClientProps; }) => React.ReactElement` |
| `useAstroI18n` | function | `() => { locale: string; fallbackLocale: string; currentRoute: string; setLocale: (locale: string) => void; setRoute: (currentRoute: string) => void; t: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null, routeName?: string) => import("@i18n-micro/types").CleanTranslation; ts: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string, routeName?: string) => string; tc: (key: import("@i18n-micro/types").TranslationKey, count: number \| import("@i18n-micro/types").Params, defaultValue?: string) => string; tn: (value: number, options?: Intl.NumberFormatOptions) => string; td: (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions) => string; tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; has: (key: import("@i18n-micro/types").TranslationKey, routeName?: string) => boolean; getRoute: () => string; }` |


## `@i18n-micro/astro/client/svelte`

```ts
import { /* … */ } from '@i18n-micro/astro/client/svelte'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `createI18nStore` | function | `(props: I18nClientProps) => Writable<I18nState>` |
| `useAstroI18n` | function | `(store: Writable<I18nState>) => { locale: string; fallbackLocale: string; currentRoute: string; setLocale: (locale: string) => void; setRoute: (routeName: string) => void; t: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null, routeName?: string) => import("@i18n-micro/types").CleanTranslation; ts: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string, routeName?: string) => string; tc: (key: import("@i18n-micro/types").TranslationKey, count: number \| import("@i18n-micro/types").Params, defaultValue?: string) => string; tn: (value: number, options?: Intl.NumberFormatOptions) => string; td: (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions) => string; tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; has: (key: import("@i18n-micro/types").TranslationKey, routeName?: string) => boolean; getRoute: () => string; store: Writable<I18nState>; }` |


## `@i18n-micro/astro/client/vue`

```ts
import { /* … */ } from '@i18n-micro/astro/client/vue'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `provideI18n` | function | `(props: MaybeRefOrGetter<I18nClientProps>) => Ref<I18nState>` |
| `useAstroI18n` | function | `() => { locale: import("vue").WritableComputedRef<string, string>; fallbackLocale: import("vue").ComputedRef<string>; currentRoute: import("vue").WritableComputedRef<string, string>; setLocale: (locale: string) => void; setRoute: (currentRoute: string) => void; t: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string \| null, routeName?: string) => import("@i18n-micro/types").CleanTranslation; ts: (key: import("@i18n-micro/types").TranslationKey, params?: import("@i18n-micro/types").Params, defaultValue?: string, routeName?: string) => string; tc: (key: import("@i18n-micro/types").TranslationKey, count: number \| import("@i18n-micro/types").Params, defaultValue?: string) => string; tn: (value: number, options?: Intl.NumberFormatOptions) => string; td: (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions) => string; tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; has: (key: import("@i18n-micro/types").TranslationKey, routeName?: string) => boolean; getRoute: () => string; }` |


## `@i18n-micro/astro/middleware`

```ts
import { /* … */ } from '@i18n-micro/astro/middleware'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `onRequest` | const | `import("astro").MiddlewareHandler` |


## `@i18n-micro/astro/node`

```ts
import { /* … */ } from '@i18n-micro/astro/node'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `LoadedTranslations` | interface | 2 members |
| `loadTranslationsFromDir` | function | `(options: LoadTranslationsOptions) => LoadedTranslations` |
| `loadTranslationsIntoI18n` | function | `(i18n: { addTranslations: (locale: string, translations: Translations, merge?: boolean) => void; addRouteTranslations: (locale: string, routeName: string, translations: Translations, merge?: boolean) => void; keepMessages?: (messages: Record<string, Translations>, routeMessages: Record<string, Record<string, Translations>>) => void; }, options: LoadTranslationsOptions) => void` |
| `LoadTranslationsOptions` | interface | 3 members |
| `readTranslationDir` | function | `(options: { translationDir: string; rootDir: URL; disablePageLocales?: boolean; }) => { messages: TranslationFileBuckets<Translations>; files: string[]; }` |

<details>
<summary><code>LoadedTranslations</code> — 2 members</summary>

| Member | Type |
| --- | --- |
| `root` | `Record<string, import("@i18n-micro/types").Translations>` |
| `routes` | `Record<string, Record<string, import("@i18n-micro/types").Translations>>` |

</details>

<details>
<summary><code>LoadTranslationsOptions</code> — 3 members</summary>

| Member | Type |
| --- | --- |
| `disablePageLocales?` | `boolean \| undefined` |
| `rootDir?` | `string \| undefined` |
| `translationDir` | `string` |

</details>

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
