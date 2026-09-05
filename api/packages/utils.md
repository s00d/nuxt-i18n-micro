---
url: 'https://s00d.github.io/nuxt-i18n-micro/api/packages/utils.md'
description: 'Exported API of @i18n-micro/utils, generated from the source.'
---

# `@i18n-micro/utils`

102 exports across 24 entry points.
Generated from the API snapshot that [`pnpm run api:surface`](/guide/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/utils/accept-language`

```ts
import { /* … */ } from '@i18n-micro/utils/accept-language'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `applyAutoDetectLanguage` | function | `(locale: string, hasExplicitPreference: boolean, autoDetectLanguage: boolean \| undefined, acceptLanguageHeader: string \| undefined, validLocales: string[]) => string` |
| `detectLocaleFromAcceptLanguage` | function | `(header: string \| undefined, validLocales: string[]) => string \| null` |
| `parseAcceptLanguage` | function | `(header: string \| undefined) => string[]` |

## `@i18n-micro/utils/active-locales`

```ts
import { /* … */ } from '@i18n-micro/utils/active-locales'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `getEnabledLocaleCodes` | function | `(locales?: Locale[] \| null) => string[]` |
| `getEnabledLocales` | function | `(locales?: Locale[] \| null) => Locale[]` |
| `isEnabledLocale` | function | `(locales: Locale[] \| null \| undefined, code: string) => boolean` |

## `@i18n-micro/utils/app-path`

```ts
import { /* … */ } from '@i18n-micro/utils/app-path'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `withoutAppBaseURL` | function | `(pathname: string, baseURL?: string \| null) => string` |

## `@i18n-micro/utils/auto-detect-path`

```ts
import { /* … */ } from '@i18n-micro/utils/auto-detect-path'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `shouldAttemptLocaleRedirect` | function | `(path: string, options?: { autoDetectPath?: string; hasLocalePrefix?: boolean; }) => boolean` |

## `@i18n-micro/utils/build`

```ts
import { /* … */ } from '@i18n-micro/utils/build'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `buildTranslationSourceLayers` | function | `(rootDirs: string[], translationDirName: string, outputDir: string) => Promise<void>` |
| `PreMergeLocaleInfo` | interface | 2 members |
| `preMergeLocales` | function | `(rootDirs: string[], translationDirName: string, outputDir: string, locales: PreMergeLocaleInfo[], globalFallbackLocale?: string, disablePageLocales?: boolean) => Promise<void>` |

| Member | Type |
| --- | --- |
| `code` | `string` |
| `fallbackLocale?` | `string \| undefined` |

```ts
import { /* … */ } from '@i18n-micro/utils/cache-control'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `CacheControl` | class | `<T>` |
| `CacheControlOptions` | interface | 2 members |

| Member | Type |
| --- | --- |
| `cache` | `private Map<string, T>` |
| `clear` | `() => void` |
| `configure` | `(options: CacheControlOptions) => void` |
| `delete` | `(key: string) => boolean` |
| `expiry` | `private Map<string, number>` |
| `get` | `(key: string) => T \| undefined` |
| `has` | `(key: string) => boolean` |
| `keys` | `() => IterableIterator<string>` |
| `maxSize` | `private number` |
| `new` | `<T>(options?: CacheControlOptions \| undefined): CacheControl<T>` |
| `set` | `(key: string, value: T) => void` |
| `size` | `number` |
| `ttlMs` | `private number` |

| Member | Type |
| --- | --- |
| `maxSize?` | `number \| undefined` |
| `ttl?` | `number \| undefined` |

```ts
import { /* … */ } from '@i18n-micro/utils/cookie'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `DEFAULT_COOKIE_MAX_AGE` | const | `number` |
| `DEFAULT_COOKIE_NAME` | const | `"user-locale"` |
| `DEFAULT_HASH_COOKIE_NAME` | const | `"hash-locale"` |
| `getHashCookieName` | function | `(config: ModuleOptionsExtend) => string \| null` |
| `getLocaleCookieName` | function | `(config: ModuleOptionsExtend) => string \| null` |
| `getLocaleCookieOptions` | function | `() => { expires: Date; maxAge: number; path: string; watch: boolean; sameSite: "lax"; }` |

## `@i18n-micro/utils/deep-merge`

```ts
import { /* … */ } from '@i18n-micro/utils/deep-merge'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `deepMergeTranslations` | function | `(target: Record<string, unknown>, source: Record<string, unknown>) => Record<string, unknown>` |
| `deepMergeTranslationsRecursive` | function | `(target: Record<string, unknown>, source: Record<string, unknown>) => Record<string, unknown>` |

## `@i18n-micro/utils/merge-i18n-head`

```ts
import { /* … */ } from '@i18n-micro/utils/merge-i18n-head'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `I18nHeadObject` | interface | 3 members |
| `mergeI18nHead` | function | `(base: I18nHeadObject, override: I18nHeadInput \| null \| undefined, options?: MergeI18nHeadOptions) => I18nHeadObject` |
| `MergeI18nHeadOptions` | interface | 3 members |

| Member | Type |
| --- | --- |
| `htmlAttrs` | `Record<string, string \| undefined>` |
| `link` | `I18nHeadLink[]` |
| `meta` | `I18nHeadMeta[]` |

| Member | Type |
| --- | --- |
| `currentLocale?` | `string \| undefined` |
| `identifierAttribute?` | `string \| undefined` |
| `locales?` | `Locale[] \| undefined` |

```ts
import { /* … */ } from '@i18n-micro/utils/merge-source'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `buildFallbackLocaleChain` | function | `(locale: string, locales: SourceLocaleInfo[], globalFallbackLocale?: string) => string[]` |
| `buildSourcePagePath` | function | `(pageName: string, localeCode: string) => string` |
| `buildSourceRootPath` | function | `(localeCode: string) => string` |
| `mergeSourceTranslations` | function | `(input: MergeSourceTranslationsInput) => Promise<Record<string, unknown>>` |
| `MergeSourceTranslationsInput` | interface | 6 members |
| `mergeTranslationsFromFallbackChain` | function | `(chain: string[], readLocaleFile: (relativePath: string) => Record<string, unknown>, relativePathForLocale: (localeCode: string) => string) => Record<string, unknown>` |
| `mergeTranslationsFromFallbackChainAsync` | function | `(chain: string[], readLocaleFile: (relativePath: string) => Record<string, unknown> \| Promise<Record<string, unknown>>, relativePathForLocale: (localeCode: string) => string) => Promise<Record<string, unknown>>` |
| `normalizeConfiguredLocales` | function | `(locales: Array<string \| Locale> \| undefined) => SourceLocaleInfo[]` |
| `resolveSourcePageName` | function | `(pageName: string, disablePageLocales?: boolean) => string` |
| `SourceLocaleInfo` | interface | 2 members |
| `toPremergedStorageKey` | function | `(pageName: string, locale: string) => string` |
| `toSourceStorageKey` | function | `(relativePath: string) => string` |

| Member | Type |
| --- | --- |
| `disablePageLocales?` | `boolean \| undefined` |
| `globalFallbackLocale?` | `string \| undefined` |
| `locale` | `string` |
| `locales` | `SourceLocaleInfo[]` |
| `pageName` | `string` |
| `readLocaleFile` | `(relativePath: string) => Record<string, unknown> \| Promise<Record<string, unknown>>` |

```ts
import { /* … */ } from '@i18n-micro/utils/normalize'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `toTranslationRecord` | function | `(data: unknown) => Record<string, unknown>` |
| `toTranslations` | function | `(data: unknown) => Translations` |

## `@i18n-micro/utils/parse-path`

```ts
import { /* … */ } from '@i18n-micro/utils/parse-path'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `classifyTranslationRelativePath` | function | `(relativePath: string, disablePageLocales?: boolean) => ParsedTranslationRelativePath` |
| `mergeRouteTranslationsWithRoot` | function | `<T extends Record<string, unknown>>(rootTranslations: T \| undefined, routeTranslations: T) => T` |
| `pagePathSegmentsToRouteName` | function | `(segments: string[]) => string \| null` |
| `ParsedTranslationRelativePath` | type | `{ type: 'page'; pageName: string; locale: string } \| { type: 'root'; locale: string } \| { type: 'ignore' }` |
| `parseTranslationRelativePath` | function | `(relativePath: string) => ParsedTranslationRelativePath` |
| `storeLoadedTranslationFile` | function | `<T extends Record<string, unknown>>(buckets: TranslationFileBuckets<T>, relativePath: string, translations: T, disablePageLocales?: boolean) => void` |
| `TranslationFileBuckets` | interface | `<T = Record<string, unknown>>` |

| Member | Type |
| --- | --- |
| `root` | `Record<string, T>` |
| `routes` | `Record<string, Record<string, T>>` |

```ts
import { /* … */ } from '@i18n-micro/utils/payload-config'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `DEFAULT_TRANSLATION_PAYLOAD_WARN_FILE_COUNT` | const | `500` |
| `DEFAULT_TRANSLATION_PAYLOAD_WARN_SIZE_BYTES` | const | `number` |
| `formatBytes` | function | `(bytes: number) => string` |
| `getTranslationPayloadMisconfigurationWarnings` | function | `(input: TranslationPayloadMisconfigurationInput) => string[]` |
| `getTranslationPayloadSizeWarning` | function | `(stats: TranslationPayloadStats, thresholds?: TranslationPayloadSizeThresholds) => string \| null` |
| `hasLocalTranslationPayloadOutput` | function | `(translationPayloads: ResolvedTranslationPayloadOptions) => boolean` |
| `ResolvedTranslationPayloadOptions` | interface | 8 members |
| `resolveTranslationPayloadMode` | function | `(options: ModuleOptions) => TranslationPayloadMode` |
| `resolveTranslationPayloadOptions` | function | `(options: ModuleOptions) => ResolvedTranslationPayloadOptions` |
| `resolveTranslationPayloadPublicDir` | function | `(outputPublicDir: string \| undefined, options: ModuleOptions, apiBaseUrl?: string) => string` |
| `resolveTranslationPayloadPublicRel` | function | `(options: ModuleOptions, apiBaseUrl?: string) => string` |
| `resolveTranslationPayloadWarningThresholds` | function | `(options?: TranslationPayloadOptions) => Required<TranslationPayloadSizeThresholds>` |
| `shouldCopyTranslationPayloadsToPublic` | function | `(translationPayloads: ResolvedTranslationPayloadOptions, isNode: boolean) => boolean` |
| `shouldRegisterNitroServerAssets` | function | `(translationPayloads: ResolvedTranslationPayloadOptions, isNode: boolean) => boolean` |
| `TranslationPayloadMisconfigurationInput` | interface | 3 members |
| `TranslationPayloadMode` | type | `'premerged' \| 'source'` |
| `TranslationPayloadSizeThresholds` | interface | 2 members |
| `TranslationPayloadStats` | interface | 2 members |

| Member | Type |
| --- | --- |
| `mode` | `TranslationPayloadMode` |
| `prerenderRoutes` | `boolean` |
| `publicAssets` | `boolean` |
| `publicDir?` | `string \| undefined` |
| `serverAssets` | `boolean` |
| `serverHandler` | `boolean` |
| `warnFileCount?` | `number \| undefined` |
| `warnSizeBytes?` | `number \| undefined` |

| Member | Type |
| --- | --- |
| `apiBaseClientHost?` | `string \| undefined` |
| `apiBaseServerHost?` | `string \| undefined` |
| `translationPayloads` | `ResolvedTranslationPayloadOptions` |

| Member | Type |
| --- | --- |
| `warnFileCount?` | `number \| undefined` |
| `warnSizeBytes?` | `number \| undefined` |

| Member | Type |
| --- | --- |
| `fileCount` | `number` |
| `totalBytes` | `number` |

```ts
import { /* … */ } from '@i18n-micro/utils/payload-fetch'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `fetchTranslationPayloadFromHost` | function | `(config: TranslationPayloadHostConfig, locale: string, page: string, fetcher: TranslationPayloadFetcher) => Promise<Translations>` |
| `TranslationPayloadFetcher` | type | `<T>(path: string, options: { baseURL: string; params?: Record<string, string \| number> }) => Promise<T>` |
| `TranslationPayloadHostConfig` | interface | 3 members |

| Member | Type |
| --- | --- |
| `apiBaseServerHost?` | `string \| undefined` |
| `apiBaseUrl?` | `string \| undefined` |
| `dateBuild?` | `string \| number \| undefined` |

```ts
import { /* … */ } from '@i18n-micro/utils/payload-stats'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `compressTranslationPayloads` | function | `(dir: string, compression: PublicAssetCompression) => number` |
| `hashTranslationSources` | function | `(rootDirs: string[], translationDirName: string) => string \| null` |
| `PublicAssetCompression` | type | `boolean \| { gzip?: boolean; brotli?: boolean } \| undefined` |
| `scanTranslationPayloadDirectory` | function | `(dir: string) => TranslationPayloadStats` |

## `@i18n-micro/utils/payload-url`

```ts
import { /* … */ } from '@i18n-micro/utils/payload-url'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `buildTranslationPayloadCacheControl` | function | `(durationSeconds: number \| undefined, hasCacheBuster?: boolean) => string \| null` |
| `buildTranslationPayloadFetchRequest` | function | `(input: TranslationPayloadFetchRequestInput) => { path: string; baseURL: string; params?: Record<string, string \| number>; }` |
| `buildTranslationPayloadPath` | function | `(apiBaseUrl: string, page: string, locale: string) => string` |
| `resolveTranslationPayloadBaseURL` | function | `(options: { isServer: boolean; baseURL: string; apiBaseClientHost?: string; apiBaseServerHost?: string; }) => string` |
| `resolveTranslationPayloadPage` | function | `(routeName: string \| undefined, routesLocaleLinks?: Record<string, string>) => string` |
| `TranslationPayloadFetchRequestInput` | interface | 9 members |

| Member | Type |
| --- | --- |
| `apiBaseClientHost?` | `string \| undefined` |
| `apiBaseServerHost?` | `string \| undefined` |
| `apiBaseUrl` | `string` |
| `baseURL` | `string` |
| `dateBuild?` | `string \| number \| undefined` |
| `isServer` | `boolean` |
| `locale` | `string` |
| `routeName?` | `string \| undefined` |
| `routesLocaleLinks?` | `Record<string, string> \| undefined` |

```ts
import { /* … */ } from '@i18n-micro/utils/resolve-hreflang'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `HreflangAlternate` | interface | 2 members |
| `HreflangLocaleInput` | type | `Pick<Locale, 'code' \| 'iso'>` |
| `resolveHreflangAlternates` | function | `(locales: HreflangLocaleInput[], options?: ResolveHreflangAlternatesOptions) => HreflangAlternate[]` |
| `ResolveHreflangAlternatesOptions` | interface | 1 members |

| Member | Type |
| --- | --- |
| `hreflang` | `string` |
| `localeCode` | `string` |

| Member | Type |
| --- | --- |
| `hreflangBaseLanguage?` | `boolean \| undefined` |

```ts
import { /* … */ } from '@i18n-micro/utils/resolve-locale'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `resolvePreferredLocale` | function | `(input: ResolvePreferredLocaleInput) => string` |
| `ResolvePreferredLocaleInput` | interface | 7 members |
| `resolveServerLocale` | function | `(input: ResolveServerLocaleInput) => string` |
| `ResolveServerLocaleInput` | interface | 8 members |

| Member | Type |
| --- | --- |
| `acceptLanguageHeader?` | `string \| null \| undefined` |
| `autoDetectLanguage?` | `boolean \| undefined` |
| `cookieLocale?` | `string \| null \| undefined` |
| `defaultLocale` | `string` |
| `ignoreStateLocale?` | `boolean \| undefined` |
| `stateLocale?` | `string \| null \| undefined` |
| `validLocales` | `string[]` |

| Member | Type |
| --- | --- |
| `acceptLanguageHeader?` | `string \| null \| undefined` |
| `autoDetectLanguage?` | `boolean \| undefined` |
| `cookieLocale?` | `string \| null \| undefined` |
| `defaultLocale` | `string` |
| `hasLocaleInUrl` | `boolean` |
| `queryLocale?` | `string \| null \| undefined` |
| `urlLocale?` | `string \| null \| undefined` |
| `validLocales` | `string[]` |

```ts
import { /* … */ } from '@i18n-micro/utils/resolve-og-locale'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `resolveOgLocale` | function | `(locale: OgLocaleInput) => string \| null` |
| `warnUnresolvedOgLocale` | function | `(locale: OgLocaleInput, options?: WarnUnresolvedOgLocaleOptions) => void` |
| `WarnUnresolvedOgLocaleOptions` | interface | 2 members |

| Member | Type |
| --- | --- |
| `missingWarn?` | `boolean \| undefined` |
| `tag?` | `"og:locale" \| "og:locale:alternate" \| undefined` |

```ts
import { /* … */ } from '@i18n-micro/utils/route'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `findAllowedLocalesForRoute` | function | `(route: I18nRouteContext, routeLocales: Record<string, string[]> \| undefined, localizedRouteNamePrefix?: string, localeCodes?: string[]) => string[] \| null` |
| `I18nRouteContext` | interface | 3 members |
| `isMetaDisabledForRoute` | function | `(route: I18nRouteContext, routeDisableMeta: Record<string, boolean \| string[]> \| undefined, currentLocale?: string, localizedRouteNamePrefix?: string) => boolean` |

| Member | Type |
| --- | --- |
| `matched?` | `{ path: string; }[] \| undefined` |
| `name?` | `string \| symbol \| null \| undefined` |
| `path` | `string` |

```ts
import { /* … */ } from '@i18n-micro/utils/route-pattern'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `extractBaseRoutePattern` | function | `(matchedPath: string) => string` |
| `routeNameToPath` | function | `(normalizedRouteName: string \| undefined) => string \| undefined` |
| `stripLeadingSlash` | function | `(path: string) => string` |
| `stripLocalizedRouteNamePrefix` | function | `(routeName: string \| undefined \| null, localizedRouteNamePrefix?: string) => string \| undefined` |

## `@i18n-micro/utils/runtime-config`

```ts
import { /* … */ } from '@i18n-micro/utils/runtime-config'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `resolveI18nConfigWithRuntimeOverrides` | function | `(baseConfig: ModuleOptionsExtend, runtimePublic?: Record<string, unknown>, warn?: (message: string) => void) => ModuleOptionsExtend` |
| `RuntimeI18nOverrides` | interface | 4 members |

| Member | Type |
| --- | --- |
| `defaultLocale?` | `string \| undefined` |
| `disabledLocales?` | `string[] \| undefined` |
| `fallbackLocale?` | `string \| undefined` |
| `strategy?` | `string \| undefined` |

```ts
import { /* … */ } from '@i18n-micro/utils/source-loader'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `loadSourceTranslationsFromStorage` | function | `(storage: TranslationStorageReader, input: Omit<MergeSourceTranslationsInput, "readLocaleFile">) => Promise<Translations>` |
| `TranslationStorageReader` | interface | 1 members |

| Member | Type |
| --- | --- |
| `getItem` | `(key: string) => Promise<unknown>` |

```ts
import { /* … */ } from '@i18n-micro/utils/split-locale-routes'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `SplitLocaleRouteEntry` | interface | 4 members |
| `SplitLocaleRoutePage` | interface | 3 members |
| `splitLocaleRoutes` | function | `(entries: readonly SplitLocaleRouteEntry[]) => SplitLocaleRoutesResult` |
| `SplitLocaleRoutesResult` | interface | 2 members |

| Member | Type |
| --- | --- |
| `file` | `string` |
| `name` | `string` |
| `path` | `string` |
| `paths?` | `false \| Record<string, string> \| undefined` |

| Member | Type |
| --- | --- |
| `file` | `string` |
| `name` | `string` |
| `path` | `string` |

| Member | Type |
| --- | --- |
| `globalLocaleRoutes` | `Record<string, boolean \| Record<string, string>>` |
| `pages` | `SplitLocaleRoutePage[]` |

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
