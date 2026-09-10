---
url: 'https://s00d.github.io/nuxt-i18n-micro/api/packages/route-strategy.md'
description: 'Exported API of @i18n-micro/route-strategy, generated from the source.'
---

# `@i18n-micro/route-strategy`

18 exports across 1 entry point.
Generated from the API snapshot that [`pnpm run api:surface`](/guide/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/route-strategy`

```ts
import { /* … */ } from '@i18n-micro/route-strategy'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `buildEncodedPathAliases` | function | `(routePath: string) => string[]` |
| `buildFullPath` | function | `(locale: string \| string[], basePath: string, customRegex?: string \| RegExp) => string` |
| `buildFullPathNoPrefix` | function | `(basePath: string) => string` |
| `buildRouteName` | const | `(baseName: string, localeCode: string, isCustom: boolean, prefix?: string) => string` |
| `cloneArray` | const | `<T extends object>(array: T[]) => T[]` |
| `extractLocalizedPaths` | function | `(pages: NuxtPage[], globalLocaleRoutes: LocaleRoutesConfig, filesLocaleRoutes: LocaleRoutesConfig, parentPath?: string) => LocalizedPathsMap` |
| `isInternalPath` | function | `(path: string, excludePatterns?: (string \| RegExp \| object)[]) => boolean` |
| `isLocaleAllowedForUnlocalizedRoute` | function | `(routeLocales: Record<string, string[]>, locales: Locale[], unlocalizedPath: string, localeCode: string) => boolean` |
| `isLocaleDefault` | const | `(locale: string \| Locale, defaultLocale: Locale) => boolean` |
| `isLocalizationDisabledForPage` | function | `(globalLocaleRoutes: LocaleRoutesConfig, originalPath: string, pageName: string) => boolean` |
| `isPageRedirectOnly` | const | `(page: NuxtPage) => boolean` |
| `LocalizedPathsMap` | type | `Record<string, Record<string, string>>` |
| `normalizePath` | const | `(routePath: string) => string` |
| `normalizeRouteKey` | function | `(key: string) => string` |
| `removeLeadingSlash` | const | `(routePath: string) => string` |
| `RouteGenerator` | class | 23 members |
| `RouteGeneratorOptions` | interface | 11 members |
| `shouldAddLocalePrefix` | const | `(locale: string, defaultLocale: Locale, addLocalePrefix: boolean) => boolean` |

| Member | Type |
| --- | --- |
| `activeLocaleCodes` | `string[]` |
| `collectPageNames` | `private (pages: NuxtPage[]) => string[]` |
| `computeActiveLocaleCodes` | `private () => string[]` |
| `customRegex` | `string \| RegExp \| undefined` |
| `defaultLocale` | `Locale` |
| `ensureFileExists` | `private (filePath: string) => void` |
| `ensureTranslationFilesExist` | `(pagesNames: string[], translationDir: string, rootDir: string, disablePageLocales?: boolean) => void` |
| `excludePatterns` | `(string \| RegExp)[] \| undefined` |
| `extendPages` | `(pages: NuxtPage[]) => void` |
| `extractLocalizedPaths` | `(pages: NuxtPage[], parentPath?: string) => { [key: string]: { [locale: string]: string; }; }` |
| `fallbackRedirectComponentPath` | `string \| undefined` |
| `filesLocaleRoutes` | `LocaleRoutesConfig` |
| `generateDataRoutes` | `(pages: NuxtPage[], apiBaseUrl: string, disablePageLocales: boolean) => string[]` |
| `globalLocaleRoutes` | `LocaleRoutesConfig` |
| `locales` | `Locale[]` |
| `localizedPaths` | `LocalizedPathsMap` |
| `localizedRouteNamePrefix` | `string` |
| `new` | `(options: RouteGeneratorOptions): RouteGenerator` |
| `noPrefixRedirect` | `boolean` |
| `rawGlobalLocaleRoutes` | `GlobalLocaleRoutes` |
| `resolveLocalizedPath` | `(originalPath: string, localeCode: string) => string` |
| `routeLocales` | `Record<string, string[]>` |
| `strategy` | `Strategies` |

| Member | Type |
| --- | --- |
| `customRegexMatcher?` | `string \| RegExp \| undefined` |
| `defaultLocaleCode` | `string` |
| `excludePatterns?` | `(string \| RegExp)[] \| undefined` |
| `fallbackRedirectComponentPath?` | `string \| undefined` |
| `filesLocaleRoutes?` | `GlobalLocaleRoutes` |
| `globalLocaleRoutes` | `GlobalLocaleRoutes` |
| `locales` | `Locale[]` |
| `localizedRouteNamePrefix?` | `string \| undefined` |
| `noPrefixRedirect` | `boolean` |
| `routeLocales?` | `Record<string, string[]> \| undefined` |
| `strategy` | `Strategies` |

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
