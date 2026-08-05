---
url: 'https://s00d.github.io/nuxt-i18n-micro/api/packages/astro.md'
description: 'Exported API of @i18n-micro/astro, generated from the source.'
---

# `@i18n-micro/astro`

56 exports across 6 entry points.
Generated from the API snapshot that [`pnpm run api:surface`](/guide/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/astro`

```ts
import { /* … */ } from '@i18n-micro/astro'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `AstroI18n` | class | 48 members |
| `AstroI18nOptions` | interface | 9 members |
| `CleanTranslation` | type | `string \| number \| boolean \| Translations \| PluralTranslations \| null` |
| `createAstroRouterAdapter` | function | `(locales: Locale[], defaultLocale: string, getCurrentUrl?: () => URL) => I18nRoutingStrategy` |
| `createI18n` | function | `(options: AstroI18nOptions) => AstroI18n` |
| `createI18nMiddleware` | function | `(options: I18nMiddlewareOptions) => MiddlewareHandler` |
| `defaultPlural` | const | `PluralFunc` |
| `detectLocale` | function | `(pathname: string, cookies: { get: (name: string) => { value: string; } \| undefined; }, headers: Headers, defaultLocale: string, locales: string[], localeCookie?: string \| null, routingStrategy?: I18nRoutingStrategy \| null) => string` |
| `FormatService` | class | 19 members |
| `getDefaultLocale` | function | `(astro: AstroGlobal) => string` |
| `getGlobalRoutingStrategy` | function | `() => I18nRoutingStrategy \| null` |
| `getI18n` | function | `(astro: AstroGlobal) => AstroI18n` |
| `getI18nProps` | function | `(astro: AstroGlobal, keys?: string[]) => I18nClientProps` |
| `getLocale` | function | `(astro: AstroGlobal) => string` |
| `getLocales` | function | `(astro: AstroGlobal) => Locale[]` |
| `Getter` | type | `(key: TranslationKey, params?: Record<string, string \| number \| boolean>, defaultValue?: string) => unknown` |
| `I18nClientProps` | interface | 4 members |
| `i18nIntegration` | function | `(options: I18nIntegrationOptions) => AstroIntegration` |
| `I18nIntegrationOptions` | interface | 53 members |
| `I18nMiddlewareOptions` | interface | 7 members |
| `I18nRoutingStrategy` | interface | 10 members |
| `interpolate` | function | `(template: string, params: Params) => string` |
| `LoadedTranslations` | interface | 2 members |
| `loadTranslationsFromDir` | function | `(options: LoadTranslationsOptions) => LoadedTranslations` |
| `loadTranslationsIntoI18n` | function | `(i18n: { addTranslations: (locale: string, translations: Translations, merge?: boolean) => void; addRouteTranslations: (locale: string, routeName: string, translations: Translations, merge?: boolean) => void; }, options: LoadTranslationsOptions) => void` |
| `LoadTranslationsOptions` | interface | 3 members |
| `Locale` | interface | 11 members |
| `LocaleCode` | type | `string` |
| `LocaleHeadOptions` | interface | 4 members |
| `LocaleHeadResult` | interface | 3 members |
| `Params` | type | `Record<string, string \| number \| boolean>` |
| `PluralFunc` | type | `(key: TranslationKey, count: number, params: Params, locale: string, getter: Getter) => string \| null` |
| `runWithRoutingStrategy` | function | `<T>(strategy: I18nRoutingStrategy \| null, fn: () => T) => T` |
| `setGlobalRoutingStrategy` | function | `(strategy: I18nRoutingStrategy \| null) => void` |
| `Translations` | interface | 1 members |
| `useI18n` | function | `(astro: AstroGlobal) => { locale: string; defaultLocale: string; locales: Locale[]; t: (key: TranslationKey, params?: Params, defaultValue?: string \| null, routeName?: string) => CleanTranslation; ts: (key: TranslationKey, params?: Params, defaultValue?: string, routeName?: string) => string; tc: (key: TranslationKey, count: number \| Params, defaultValue?: string) => string; tn: { (value: number, options?: Intl.NumberFormatOptions): string; (value: number, key: string, overrides?: Intl.NumberFormatOptions): string; (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string; }; td: { (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, overrides?: Intl.DateTimeFormatOptions): string; (value: Date \| number \| string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string; }; tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; has: (key: TranslationKey, routeName?: string) => boolean; getRoute: () => string; getRouteName: (path?: string) => string; getLocaleFromPath: (path?: string) => string; switchLocalePath: (newLocale: string) => string; localizePath: (path: string, targetLocale?: string) => string; getI18n: () => AstroI18n; getBasePath: (url?: URL) => string; addTranslations: (locale: string, translations: Record<string, unknown>, merge?: boolean) => void; addRouteTranslations: (locale: string, routeName: string, translations: Record<string, unknown>, merge?: boolean) => void; mergeTranslations: (locale: string, routeName: string, translations: Record<string, unknown>) => void; clearCache: () => void; }` |
| `useLocaleHead` | function | `(astro: AstroGlobal, options?: LocaleHeadOptions) => LocaleHeadResult` |

| Member | Type |
| --- | --- |
| `_currentRoute` | `private string` |
| `_fallbackLocale` | `private string` |
| `_locale` | `private string` |
| `addRouteTranslations` | `(locale: string, routeName: string, translations: Translations, merge?: boolean) => void` |
| `addTranslations` | `(locale: string, translations: Translations, merge?: boolean) => void` |
| `clearCache` | `() => void` |
| `clone` | `(newLocale?: string) => AstroI18n` |
| `cloneStorage` | `private (source: TranslationStorage) => TranslationStorage` |
| `fallbackLocale` | `string` |
| `formatter` | `FormatService` |
| `getCustomMissingHandler?` | `(() => MissingHandler \| null) \| undefined` |
| `getFallbackLocale` | `() => string` |
| `getLocale` | `() => string` |
| `getMissingContext` | `protected (routeContext?: unknown) => { locale: string; routeName: string; }` |
| `getRoute` | `() => string` |
| `getRouteTranslations` | `(locale: string, routeName: string) => Translations \| null` |
| `has` | `(key: TranslationKey, routeContext?: unknown) => boolean` |
| `helper` | `{ hasCache(locale: string, page: string): boolean; getCache(locale: string, routeName: string): Translations \| undefined; setCache(_locale: string, _routeName: string, _cache: Map<string, unknown>): void; hasTranslation(locale: string, key: string): boolean; hasPageTranslation(locale: string, routeName: string): boolean; getTranslation<T = unknown>(locale: string, routeName: string, key: string): T \| null; loadTranslations(locale: string, data: Translations, routeName?: string): void; setTranslations(locale: string, data: Translations, routeName?: string): void; loadPageTranslations(locale: string, routeName: string, data: Translations): void; mergeTranslation(locale: string, routeName: string, newTranslations: Translations, _force?: boolean): void; clearCache(): void; }` |
| `initialMessages` | `private Record<string, Translations>` |
| `loadRouteTranslationsCore` | `(locale: string, routeName: string, translations: Translations, merge: boolean) => void` |
| `loadTranslationsCore` | `(locale: string, translations: Translations, merge: boolean, routeName?: string) => void` |
| `locale` | `string` |
| `mergeTranslations` | `(locale: string, routeName: string, translations: Translations) => void` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn` | `boolean` |
| `new` | `(options: AstroI18nOptions): AstroI18n` |
| `onTranslationsChanged` | `protected () => void` |
| `pluralFunc` | `PluralFunc` |
| `resolveDateTimeFormatArgs` | `private any` |
| `resolveHas` | `protected (key: TranslationKey, routeContext?: unknown) => boolean` |
| `resolveLookup` | `protected (key: TranslationKey, routeContext?: unknown) => unknown \| null` |
| `resolveNumberFormatArgs` | `private any` |
| `resolveRouteName` | `protected (routeContext?: unknown) => string` |
| `resolveTranslations` | `(routeContext?: unknown) => Translations` |
| `resolveTranslationTree` | `protected (lower: Record<string, unknown>, upper: Record<string, unknown>) => Translations` |
| `setRoute` | `(routeName: string) => void` |
| `setTranslation` | `(key: TranslationKey, value: unknown) => void` |
| `storage` | `TranslationStorage` |
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

| Member | Type |
| --- | --- |
| `_storage?` | `TranslationStorage \| undefined` |
| `datetimeFormats?` | `DateTimeFormatsConfig \| undefined` |
| `fallbackLocale?` | `string \| undefined` |
| `locale` | `string` |
| `messages?` | `Record<string, Translations> \| undefined` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn?` | `boolean \| undefined` |
| `numberFormats?` | `NumberFormatsConfig \| undefined` |
| `plural?` | `PluralFunc \| undefined` |

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
| `numberCache` | `private any` |
| `numberFormats` | `private any` |
| `relativeCache` | `private any` |
| `resolveDateTimeFormat` | `(locale: string, key: string) => Intl.DateTimeFormatOptions \| undefined` |
| `resolveNumberFormat` | `(locale: string, key: string) => Intl.NumberFormatOptions \| undefined` |
| `setDateTimeFormats` | `(formats: DateTimeFormatsConfig) => void` |
| `setNumberFormats` | `(formats: NumberFormatsConfig) => void` |

| Member | Type |
| --- | --- |
| `currentRoute` | `string` |
| `fallbackLocale` | `string` |
| `locale` | `string` |
| `translations` | `Record<string, Translations>` |

| Member | Type |
| --- | --- |
| `apiBaseClientHost?` | `string \| undefined` |
| `apiBaseServerHost?` | `string \| undefined` |
| `apiBaseUrl?` | `string \| undefined` |
| `autoDetect?` | `boolean \| undefined` |
| `autoDetectLanguage?` | `boolean \| undefined` |
| `autoDetectPath?` | `string \| undefined` |
| `cacheMaxSize?` | `number \| undefined` |
| `cacheTtl?` | `number \| undefined` |
| `canonicalQueryWhitelist?` | `string[] \| undefined` |
| `components?` | `boolean \| undefined` |
| `customRegexMatcher?` | `string \| RegExp \| undefined` |
| `dateBuild?` | `string \| number \| undefined` |
| `datetimeFormats?` | `Record<string, Record<string, Intl.DateTimeFormatOptions>> \| undefined` |
| `debug?` | `boolean \| undefined` |
| `defaultLocale?` | `string \| undefined` |
| `define?` | `boolean \| undefined` |
| `disablePageLocales?` | `boolean \| undefined` |
| `disableWatcher?` | `boolean \| undefined` |
| `excludePatterns?` | `(string \| RegExp)[] \| undefined` |
| `experimental?` | `Record<string, unknown> \| undefined` |
| `fallbackLocale?` | `string \| undefined` |
| `globalLocaleRoutes?` | `GlobalLocaleRoutes` |
| `hmr?` | `boolean \| undefined` |
| `hooks?` | `boolean \| undefined` |
| `hreflangBaseLanguage?` | `boolean \| undefined` |
| `httpCacheDuration?` | `number \| undefined` |
| `locale` | `string` |
| `localeCookie?` | `string \| null \| undefined` |
| `locales?` | `Locale[] \| undefined` |
| `localizedRouteNamePrefix?` | `string \| undefined` |
| `messages?` | `Record<string, Record<string, unknown>> \| undefined` |
| `meta?` | `boolean \| undefined` |
| `metaBaseUrl?` | `string \| undefined` |
| `metaTrustForwardedHost?` | `boolean \| undefined` |
| `metaTrustForwardedProto?` | `boolean \| undefined` |
| `missingHandler?` | `((locale: string, key: string, routeName: string) => void) \| undefined` |
| `missingWarn?` | `boolean \| undefined` |
| `noPrefixRedirect?` | `boolean \| undefined` |
| `numberFormats?` | `Record<string, Record<string, Intl.NumberFormatOptions>> \| undefined` |
| `plugin?` | `boolean \| undefined` |
| `plural?` | `PluralFunc \| undefined` |
| `redirects?` | `boolean \| undefined` |
| `redirectToDefault?` | `boolean \| undefined` |
| `routeDisableMeta?` | `Record<string, boolean \| string[]> \| undefined` |
| `routeLocales?` | `Record<string, string[]> \| undefined` |
| `routesLocaleLinks?` | `{ [key: string]: string; } \| undefined` |
| `routingStrategy?` | `I18nRoutingStrategy \| undefined` |
| `serverTranslationPreload?` | `boolean \| undefined` |
| `strategy?` | `Strategies \| undefined` |
| `translationDir?` | `string \| undefined` |
| `translationPayloads?` | `TranslationPayloadOptions \| undefined` |
| `types?` | `boolean \| undefined` |
| `vueDevtools?` | `boolean \| undefined` |

| Member | Type |
| --- | --- |
| `autoDetect?` | `boolean \| undefined` |
| `defaultLocale` | `string` |
| `i18n` | `AstroI18n` |
| `localeObjects?` | `Locale[] \| undefined` |
| `locales` | `string[]` |
| `redirectToDefault?` | `boolean \| undefined` |
| `routingStrategy?` | `I18nRoutingStrategy \| undefined` |

| Member | Type |
| --- | --- |
| `getCurrentPath` | `() => string` |
| `getLocaleFromPath?` | `((path: string, defaultLocale: string, locales: string[]) => string) \| undefined` |
| `getRoute?` | `(() => { fullPath: string; query: Record<string, unknown>; }) \| undefined` |
| `getRouteName?` | `((path: string, locales: string[]) => string) \| undefined` |
| `localizePath?` | `((path: string, locale: string, locales: string[], defaultLocale?: string) => string) \| undefined` |
| `push?` | `((target: { path: string; }) => void) \| undefined` |
| `removeLocaleFromPath?` | `((path: string, locales: string[]) => string) \| undefined` |
| `replace?` | `((target: { path: string; }) => void) \| undefined` |
| `resolvePath?` | `((to: string \| { path?: string; }, locale: string) => string \| { path?: string; }) \| undefined` |
| `switchLocalePath?` | `((path: string, newLocale: string, locales: string[], defaultLocale?: string) => string) \| undefined` |

| Member | Type |
| --- | --- |
| `root` | `Record<string, import("packages/types/dist/index").Translations>` |
| `routes` | `Record<string, Record<string, import("packages/types/dist/index").Translations>>` |

| Member | Type |
| --- | --- |
| `disablePageLocales?` | `boolean \| undefined` |
| `rootDir?` | `string \| undefined` |
| `translationDir` | `string` |

| Member | Type |
| --- | --- |
| `addDirAttribute?` | `boolean \| undefined` |
| `addSeoAttributes?` | `boolean \| undefined` |
| `baseUrl?` | `string \| undefined` |
| `hreflangBaseLanguage?` | `boolean \| undefined` |

| Member | Type |
| --- | --- |
| `htmlAttrs` | `{ lang?: string; dir?: "ltr" \| "rtl" \| "auto"; }` |
| `link` | `{ rel: string; href: string; hreflang?: string; }[]` |
| `meta` | `{ property: string; content: string; }[]` |

```ts
import { /* … */ } from '@i18n-micro/astro/client'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `createI18nStore` | function | `(props: I18nClientProps) => Writable<I18nState>` |
| `hasTranslation` | function | `(state: I18nState, key: string, routeName?: string) => boolean` |
| `I18nProvider` | function | `({ children, value }: { children: React.ReactNode; value: I18nClientProps; }) => React.ReactElement` |
| `I18nProviderPreact` | const | `({ children, value }: { children: ComponentChildren; value: I18nClientProps; }) => import("preact/src/index").VNode<{ value: I18nState \| null; children?: ComponentChildren; }>` |
| `I18nState` | interface | 4 members |
| `provideI18n` | function | `(props: I18nClientProps) => Ref<I18nState>` |
| `translate` | function | `(state: I18nState, key: string, params?: Params, defaultValue?: string \| null, routeName?: string) => string \| number \| boolean \| Translations \| null` |
| `useAstroI18nPreact` | function | `() => { t: (key: TranslationKey, params?: Params, defaultValue?: string \| null, routeName?: string) => CleanTranslation; ts: (key: TranslationKey, params?: Params, defaultValue?: string, routeName?: string) => string; tc: (key: TranslationKey, count: number \| Params, defaultValue?: string) => string; tn: (value: number, options?: Intl.NumberFormatOptions) => string; td: (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions) => string; tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; has: (key: TranslationKey, routeName?: string) => boolean; locale: string; fallbackLocale: string; currentRoute: string; getRoute: () => string; }` |
| `useAstroI18nReact` | function | `() => { t: (key: TranslationKey, params?: Params, defaultValue?: string \| null, routeName?: string) => CleanTranslation; ts: (key: TranslationKey, params?: Params, defaultValue?: string, routeName?: string) => string; tc: (key: TranslationKey, count: number \| Params, defaultValue?: string) => string; tn: (value: number, options?: Intl.NumberFormatOptions) => string; td: (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions) => string; tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; has: (key: TranslationKey, routeName?: string) => boolean; locale: string; fallbackLocale: string; currentRoute: string; getRoute: () => string; }` |
| `useAstroI18nSvelte` | function | `(store: Writable<I18nState>) => { store: Writable<I18nState>; t: (key: TranslationKey, params?: Params, defaultValue?: string \| null, routeName?: string) => CleanTranslation; ts: (key: TranslationKey, params?: Params, defaultValue?: string, routeName?: string) => string; tc: (key: TranslationKey, count: number \| Params, defaultValue?: string) => string; tn: (value: number, options?: Intl.NumberFormatOptions) => string; td: (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions) => string; tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; has: (key: TranslationKey, routeName?: string) => boolean; readonly locale: string; readonly fallbackLocale: string; readonly currentRoute: string; setLocale: (locale: string) => void; setRoute: (routeName: string) => void; getRoute: () => string; }` |
| `useAstroI18nVue` | function | `() => { t: (key: TranslationKey, params?: Params, defaultValue?: string \| null, routeName?: string) => CleanTranslation; ts: (key: TranslationKey, params?: Params, defaultValue?: string, routeName?: string) => string; tc: (key: TranslationKey, count: number \| Params, defaultValue?: string) => string; tn: (value: number, options?: Intl.NumberFormatOptions) => string; td: (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions) => string; tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; has: (key: TranslationKey, routeName?: string) => boolean; locale: import("vue/dist/vue").WritableComputedRef<string, string>; fallbackLocale: import("vue/dist/vue").ComputedRef<string>; currentRoute: import("vue/dist/vue").WritableComputedRef<string, string>; setLocale: (locale: string) => void; setRoute: (routeName: string) => void; getRoute: () => string; }` |

I18nState — 4 members, identical to `I18nClientProps` above.

## `@i18n-micro/astro/client/preact`

```ts
import { /* … */ } from '@i18n-micro/astro/client/preact'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `I18nProvider` | const | `({ children, value }: { children: ComponentChildren; value: I18nClientProps; }) => import("preact/src/index").VNode<{ value: I18nState \| null; children?: ComponentChildren; }>` |
| `useAstroI18n` | function | `() => { t: (key: TranslationKey, params?: Params, defaultValue?: string \| null, routeName?: string) => CleanTranslation; ts: (key: TranslationKey, params?: Params, defaultValue?: string, routeName?: string) => string; tc: (key: TranslationKey, count: number \| Params, defaultValue?: string) => string; tn: (value: number, options?: Intl.NumberFormatOptions) => string; td: (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions) => string; tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; has: (key: TranslationKey, routeName?: string) => boolean; locale: string; fallbackLocale: string; currentRoute: string; getRoute: () => string; }` |

## `@i18n-micro/astro/client/react`

```ts
import { /* … */ } from '@i18n-micro/astro/client/react'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `I18nProvider` | function | `({ children, value }: { children: React.ReactNode; value: I18nClientProps; }) => React.ReactElement` |
| `useAstroI18n` | function | `() => { t: (key: TranslationKey, params?: Params, defaultValue?: string \| null, routeName?: string) => CleanTranslation; ts: (key: TranslationKey, params?: Params, defaultValue?: string, routeName?: string) => string; tc: (key: TranslationKey, count: number \| Params, defaultValue?: string) => string; tn: (value: number, options?: Intl.NumberFormatOptions) => string; td: (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions) => string; tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; has: (key: TranslationKey, routeName?: string) => boolean; locale: string; fallbackLocale: string; currentRoute: string; getRoute: () => string; }` |

## `@i18n-micro/astro/client/svelte`

```ts
import { /* … */ } from '@i18n-micro/astro/client/svelte'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `createI18nStore` | function | `(props: I18nClientProps) => Writable<I18nState>` |
| `useAstroI18n` | function | `(store: Writable<I18nState>) => { store: Writable<I18nState>; t: (key: TranslationKey, params?: Params, defaultValue?: string \| null, routeName?: string) => CleanTranslation; ts: (key: TranslationKey, params?: Params, defaultValue?: string, routeName?: string) => string; tc: (key: TranslationKey, count: number \| Params, defaultValue?: string) => string; tn: (value: number, options?: Intl.NumberFormatOptions) => string; td: (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions) => string; tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; has: (key: TranslationKey, routeName?: string) => boolean; readonly locale: string; readonly fallbackLocale: string; readonly currentRoute: string; setLocale: (locale: string) => void; setRoute: (routeName: string) => void; getRoute: () => string; }` |

## `@i18n-micro/astro/client/vue`

```ts
import { /* … */ } from '@i18n-micro/astro/client/vue'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `provideI18n` | function | `(props: I18nClientProps) => Ref<I18nState>` |
| `useAstroI18n` | function | `() => { t: (key: TranslationKey, params?: Params, defaultValue?: string \| null, routeName?: string) => CleanTranslation; ts: (key: TranslationKey, params?: Params, defaultValue?: string, routeName?: string) => string; tc: (key: TranslationKey, count: number \| Params, defaultValue?: string) => string; tn: (value: number, options?: Intl.NumberFormatOptions) => string; td: (value: Date \| number \| string, options?: Intl.DateTimeFormatOptions) => string; tdr: (value: Date \| number \| string, options?: Intl.RelativeTimeFormatOptions) => string; has: (key: TranslationKey, routeName?: string) => boolean; locale: import("vue/dist/vue").WritableComputedRef<string, string>; fallbackLocale: import("vue/dist/vue").ComputedRef<string>; currentRoute: import("vue/dist/vue").WritableComputedRef<string, string>; setLocale: (locale: string) => void; setRoute: (routeName: string) => void; getRoute: () => string; }` |

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
