---
title: '@i18n-micro/types'
description: 'Exported API of @i18n-micro/types, generated from the source.'
outline: 'deep'
---

# `@i18n-micro/types`

26 exports across 1 entry point.
Generated from the API snapshot that [`pnpm run api:surface`](/guide/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/types`

```ts
import { /* … */ } from '@i18n-micro/types'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `CleanTranslation` | type | `string \| number \| boolean \| Translations \| PluralTranslations \| null` |
| `DefineI18nRouteConfig` | interface | 3 members |
| `DefineLocaleMessage` | interface | 1 members |
| `Getter` | type | `(key: TranslationKey, params?: Record<string, string \| number \| boolean>, defaultValue?: string) => unknown` |
| `GlobalLocaleRoutes` | type | `Record<string, Record<LocaleCode, string> \| false \| boolean> \| null \| undefined` |
| `I18nHeadDisableGroup` | type | `'hreflang' \| 'x-default' \| 'canonical' \| 'og' \| 'og-alternates' \| 'html'` |
| `I18nHeadInput` | interface | 5 members |
| `I18nHeadLink` | interface | 4 members |
| `I18nHeadMeta` | interface | 1 members |
| `I18nRouteParams` | type | `Record<LocaleCode, Record<string, string>> \| null` |
| `init` | const | `() => void` |
| `Locale` | interface | 11 members |
| `LocaleCode` | type | `string` |
| `MissingHandler` | type | `(locale: string, key: TranslationKey, routeName: string, instance?: unknown, type?: string) => void` |
| `ModuleOptions` | interface | 47 members |
| `ModuleOptionsExtend` | interface | 50 members |
| `ModulePrivateOptionsExtend` | interface | 50 members |
| `Params` | type | `Record<string, string \| number \| boolean>` |
| `PluralFunc` | type | `(key: TranslationKey, count: number, params: Params, locale: string, getter: Getter) => string \| null` |
| `PluralTranslations` | interface | 2 members |
| `ScopedKey` | type | ``<Scope extends string> = Extract<TranslationKey, `${Scope}.${string}`>`` |
| `Strategies` | type | `'no_prefix' \| 'prefix_except_default' \| 'prefix' \| 'prefix_and_default'` |
| `Translation` | type | `CleanTranslation \| unknown` |
| `TranslationKey` | type | `keyof DefineLocaleMessage extends never ? string : keyof DefineLocaleMessage \| string` |
| `TranslationPayloadOptions` | interface | 8 members |
| `Translations` | interface | 1 members |

<details>
<summary><code>DefineI18nRouteConfig</code> — 3 members</summary>

| Member | Type |
| --- | --- |
| `disableMeta?` | `boolean \| string[] \| undefined` |
| `localeRoutes?` | `Record<string, string> \| undefined` |
| `locales?` | `string[] \| Record<string, Translations> \| undefined` |

</details>
<details>
<summary><code>DefineLocaleMessage</code> — 1 members</summary>

| Member | Type |
| --- | --- |
| `__augmentation?` | `undefined` |

</details>
<details>
<summary><code>I18nHeadInput</code> — 5 members</summary>

| Member | Type |
| --- | --- |
| `disable?` | `I18nHeadDisableGroup[] \| undefined` |
| `htmlAttrs?` | `Record<string, string> \| undefined` |
| `link?` | `I18nHeadLink[] \| undefined` |
| `meta?` | `I18nHeadMeta[] \| undefined` |
| `replace?` | `{ canonical?: string \| false; hreflang?: I18nHeadLink[] \| false; xDefault?: I18nHeadLink \| false; ogLocale?: string \| false; ogUrl?: string \| false; ogAlternates?: string[] \| false; } \| undefined` |

</details>
<details>
<summary><code>I18nHeadLink</code> — 4 members</summary>

| Member | Type |
| --- | --- |
| `[string]` | `string \| undefined` |
| `href` | `string` |
| `hreflang?` | `string \| undefined` |
| `rel` | `string` |

</details>
<details>
<summary><code>I18nHeadMeta</code> — 1 members</summary>

| Member | Type |
| --- | --- |
| `[string]` | `string \| undefined` |

</details>
<details>
<summary><code>Locale</code> — 11 members</summary>

| Member | Type |
| --- | --- |
| `[string]` | `unknown` |
| `baseDefault?` | `boolean \| undefined` |
| `baseUrl?` | `string \| undefined` |
| `code` | `string` |
| `dir?` | `"ltr" \| "rtl" \| "auto" \| undefined` |
| `disabled?` | `boolean \| undefined` |
| `displayName?` | `string \| undefined` |
| `fallbackLocale?` | `string \| undefined` |
| `iso?` | `string \| undefined` |
| `og?` | `string \| undefined` |
| `seo?` | `boolean \| undefined` |

</details>
<details>
<summary><code>ModuleOptions</code> — 47 members</summary>

| Member | Type |
| --- | --- |
| `apiBaseClientHost?` | `string \| undefined` |
| `apiBaseServerHost?` | `string \| undefined` |
| `apiBaseUrl?` | `string \| undefined` |
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
| `localeCookie?` | `string \| null \| undefined` |
| `locales?` | `Locale[] \| undefined` |
| `localizedRouteNamePrefix?` | `string \| undefined` |
| `meta?` | `boolean \| undefined` |
| `metaBaseUrl?` | `string \| undefined` |
| `metaTrustForwardedHost?` | `boolean \| undefined` |
| `metaTrustForwardedProto?` | `boolean \| undefined` |
| `missingWarn?` | `boolean \| undefined` |
| `noPrefixRedirect?` | `boolean \| undefined` |
| `numberFormats?` | `Record<string, Record<string, Intl.NumberFormatOptions>> \| undefined` |
| `plugin?` | `boolean \| undefined` |
| `plural?` | `PluralFunc \| undefined` |
| `redirects?` | `boolean \| undefined` |
| `routeDisableMeta?` | `Record<string, boolean \| string[]> \| undefined` |
| `routeLocales?` | `Record<string, string[]> \| undefined` |
| `routesLocaleLinks?` | `{ [key: string]: string; } \| undefined` |
| `serverTranslationPreload?` | `boolean \| undefined` |
| `strategy?` | `Strategies \| undefined` |
| `translationDir?` | `string \| undefined` |
| `translationPayloads?` | `TranslationPayloadOptions \| undefined` |
| `types?` | `boolean \| undefined` |
| `vueDevtools?` | `boolean \| undefined` |

</details>
<details>
<summary><code>ModuleOptionsExtend</code> — 50 members</summary>

| Member | Type |
| --- | --- |
| `apiBaseClientHost?` | `string \| undefined` |
| `apiBaseServerHost?` | `string \| undefined` |
| `apiBaseUrl` | `string` |
| `autoDetectLanguage?` | `boolean \| undefined` |
| `autoDetectPath?` | `string \| undefined` |
| `cacheMaxSize?` | `number \| undefined` |
| `cacheTtl?` | `number \| undefined` |
| `canonicalQueryWhitelist?` | `string[] \| undefined` |
| `components?` | `boolean \| undefined` |
| `customRegexMatcher?` | `string \| RegExp \| undefined` |
| `dateBuild` | `string \| number` |
| `datetimeFormats?` | `Record<string, Record<string, Intl.DateTimeFormatOptions>> \| undefined` |
| `debug?` | `boolean \| undefined` |
| `defaultLocale?` | `string \| undefined` |
| `define?` | `boolean \| undefined` |
| `disablePageLocales` | `boolean` |
| `disableWatcher?` | `boolean \| undefined` |
| `excludePatterns?` | `(string \| RegExp)[] \| undefined` |
| `experimental?` | `Record<string, unknown> \| undefined` |
| `fallbackLocale?` | `string \| undefined` |
| `globalLocaleRoutes?` | `GlobalLocaleRoutes` |
| `hashMode` | `boolean` |
| `hmr?` | `boolean \| undefined` |
| `hooks?` | `boolean \| undefined` |
| `hreflangBaseLanguage?` | `boolean \| undefined` |
| `httpCacheDuration?` | `number \| undefined` |
| `isSSG` | `boolean` |
| `localeCookie?` | `string \| null \| undefined` |
| `locales?` | `Locale[] \| undefined` |
| `localizedRouteNamePrefix?` | `string \| undefined` |
| `meta?` | `boolean \| undefined` |
| `metaBaseUrl?` | `string \| undefined` |
| `metaTrustForwardedHost?` | `boolean \| undefined` |
| `metaTrustForwardedProto?` | `boolean \| undefined` |
| `missingWarn?` | `boolean \| undefined` |
| `noPrefixRedirect?` | `boolean \| undefined` |
| `numberFormats?` | `Record<string, Record<string, Intl.NumberFormatOptions>> \| undefined` |
| `plugin?` | `boolean \| undefined` |
| `plural?` | `PluralFunc \| undefined` |
| `redirects?` | `boolean \| undefined` |
| `routeDisableMeta?` | `Record<string, boolean \| string[]> \| undefined` |
| `routeLocales?` | `Record<string, string[]> \| undefined` |
| `routesLocaleLinks?` | `{ [key: string]: string; } \| undefined` |
| `serverTranslationPreload?` | `boolean \| undefined` |
| `strategy?` | `Strategies \| undefined` |
| `translationDir?` | `string \| undefined` |
| `translationPayloadMode?` | `"premerged" \| "source" \| undefined` |
| `translationPayloads?` | `TranslationPayloadOptions \| undefined` |
| `types?` | `boolean \| undefined` |
| `vueDevtools?` | `boolean \| undefined` |

</details>
<details>
<summary><code>ModulePrivateOptionsExtend</code> — 50 members</summary>

| Member | Type |
| --- | --- |
| `apiBaseClientHost?` | `string \| undefined` |
| `apiBaseServerHost?` | `string \| undefined` |
| `apiBaseUrl` | `string` |
| `autoDetectLanguage?` | `boolean \| undefined` |
| `autoDetectPath?` | `string \| undefined` |
| `cacheMaxSize?` | `number \| undefined` |
| `cacheTtl?` | `number \| undefined` |
| `canonicalQueryWhitelist?` | `string[] \| undefined` |
| `components?` | `boolean \| undefined` |
| `customRegexMatcher?` | `string \| RegExp \| undefined` |
| `dateBuild?` | `string \| number \| undefined` |
| `datetimeFormats?` | `Record<string, Record<string, Intl.DateTimeFormatOptions>> \| undefined` |
| `debug` | `boolean` |
| `defaultLocale?` | `string \| undefined` |
| `define?` | `boolean \| undefined` |
| `disablePageLocales?` | `boolean \| undefined` |
| `disableWatcher?` | `boolean \| undefined` |
| `excludePatterns?` | `(string \| RegExp)[] \| undefined` |
| `experimental?` | `Record<string, unknown> \| undefined` |
| `fallbackLocale` | `string` |
| `globalLocaleRoutes?` | `GlobalLocaleRoutes` |
| `hmr?` | `boolean \| undefined` |
| `hooks?` | `boolean \| undefined` |
| `hreflangBaseLanguage?` | `boolean \| undefined` |
| `httpCacheDuration?` | `number \| undefined` |
| `localeCookie?` | `string \| null \| undefined` |
| `locales?` | `Locale[] \| undefined` |
| `localizedRouteNamePrefix?` | `string \| undefined` |
| `meta?` | `boolean \| undefined` |
| `metaBaseUrl?` | `string \| undefined` |
| `metaTrustForwardedHost?` | `boolean \| undefined` |
| `metaTrustForwardedProto?` | `boolean \| undefined` |
| `missingWarn?` | `boolean \| undefined` |
| `noPrefixRedirect?` | `boolean \| undefined` |
| `numberFormats?` | `Record<string, Record<string, Intl.NumberFormatOptions>> \| undefined` |
| `payloadFsDir` | `string` |
| `payloadPublicRel` | `string` |
| `plugin?` | `boolean \| undefined` |
| `plural?` | `PluralFunc \| undefined` |
| `redirects?` | `boolean \| undefined` |
| `rootDir` | `string` |
| `routeDisableMeta?` | `Record<string, boolean \| string[]> \| undefined` |
| `routeLocales?` | `Record<string, string[]> \| undefined` |
| `routesLocaleLinks?` | `{ [key: string]: string; } \| undefined` |
| `serverTranslationPreload?` | `boolean \| undefined` |
| `strategy?` | `Strategies \| undefined` |
| `translationDir` | `string` |
| `translationPayloads?` | `TranslationPayloadOptions \| undefined` |
| `types?` | `boolean \| undefined` |
| `vueDevtools?` | `boolean \| undefined` |

</details>
<details>
<summary><code>PluralTranslations</code> — 2 members</summary>

| Member | Type |
| --- | --- |
| `plural` | `string` |
| `singular` | `string` |

</details>
<details>
<summary><code>TranslationPayloadOptions</code> — 8 members</summary>

| Member | Type |
| --- | --- |
| `mode?` | `"premerged" \| "source" \| undefined` |
| `prerenderRoutes?` | `boolean \| undefined` |
| `publicAssets?` | `boolean \| undefined` |
| `publicDir?` | `string \| undefined` |
| `serverAssets?` | `boolean \| undefined` |
| `serverHandler?` | `boolean \| undefined` |
| `warnFileCount?` | `number \| undefined` |
| `warnSizeBytes?` | `number \| undefined` |

</details>
<details>
<summary><code>Translations</code> — 1 members</summary>

| Member | Type |
| --- | --- |
| `[string]` | `unknown` |

</details>

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
