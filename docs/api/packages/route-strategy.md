---
title: '@i18n-micro/route-strategy'
description: 'Exported API of @i18n-micro/route-strategy, generated from the source.'
outline: 'deep'
---

# `@i18n-micro/route-strategy`

10 exports across 1 entry point.
Generated from the API snapshot that [`pnpm run api:surface`](/guide/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/route-strategy`

```ts
import { /* … */ } from '@i18n-micro/route-strategy'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `GenerateOptions` | interface | 8 members |
| `generateRoutes` | function | `(pages: NuxtPage[], options: GenerateOptions, localizedPaths?: LocalizedPaths) => NuxtPage[]` |
| `isInternalPath` | function | `(path: string, excludePatterns?: (string \| RegExp \| object)[]) => boolean` |
| `isLocaleAllowedForUnlocalizedRoute` | function | `(routeLocales: Record<string, string[]>, locales: Locale[], routePath: string, localeCode: string) => boolean` |
| `normalizePath` | function | `(routePath: string) => string` |
| `normalizeRouteKey` | function | `(key: string) => string` |
| `RouteGenerator` | class | 12 members |
| `RouteGeneratorOptions` | interface | 10 members |
| `RouteI18nMeta` | interface | 3 members |
| `Rules` | class | 11 members |

<details>
<summary><code>GenerateOptions</code> — 8 members</summary>

| Member | Type |
| --- | --- |
| `customRegex?` | `string \| RegExp \| undefined` |
| `defaultLocale` | `string` |
| `excludePatterns?` | `(string \| RegExp)[] \| undefined` |
| `locales` | `string[]` |
| `namePrefix` | `string` |
| `noPrefixRedirect` | `boolean` |
| `rules` | `Rules` |
| `strategy` | `Strategies` |

</details>

<details>
<summary><code>RouteGenerator</code> — 12 members</summary>

| Member | Type |
| --- | --- |
| `defaultLocale` | `Locale` |
| `ensureTranslationFilesExist` | `(pagesNames: string[], translationDir: string, rootDir: string, disablePageLocales?: boolean) => void` |
| `extendPages` | `(pages: NuxtPage[]) => void` |
| `generateDataRoutes` | `(pages: NuxtPage[], apiBaseUrl: string, disablePageLocales: boolean) => string[]` |
| `locales` | `Locale[]` |
| `localizedPaths` | `private LocalizedPaths` |
| `new` | `(options: RouteGeneratorOptions): RouteGenerator` |
| `options` | `private RouteGeneratorOptions` |
| `resolveLocalizedPath` | `(originalPath: string, localeCode: string) => string` |
| `routeLocales` | `Record<string, string[]>` |
| `rules` | `private Rules` |
| `strategy` | `Strategies` |

</details>

<details>
<summary><code>RouteGeneratorOptions</code> — 10 members</summary>

| Member | Type |
| --- | --- |
| `customRegexMatcher?` | `string \| RegExp \| undefined` |
| `defaultLocaleCode` | `string` |
| `excludePatterns?` | `(string \| RegExp)[] \| undefined` |
| `globalLocaleRoutes` | `GlobalLocaleRoutes` |
| `locales` | `Locale[]` |
| `localizedRouteNamePrefix?` | `string \| undefined` |
| `noPrefixRedirect` | `boolean` |
| `routeDisableMeta?` | `Record<string, boolean \| string[]> \| undefined` |
| `routeLocales?` | `Record<string, string[]> \| undefined` |
| `strategy` | `Strategies` |

</details>

<code>RouteI18nMeta</code> — 3 members, identical to [`RouteI18nMeta`](/api/packages/path-strategy).

<details>
<summary><code>Rules</code> — 11 members</summary>

| Member | Type |
| --- | --- |
| `allowedLocales` | `(fullPath: string, name: string \| undefined) => string[] \| undefined` |
| `byName` | `private Map<string, Rule>` |
| `customPath` | `(fullPath: string, locale: string) => string \| undefined` |
| `disableMeta` | `(fullPath: string, name: string \| undefined) => NoMeta \| undefined` |
| `get` | `(fullPath: string, name: string \| undefined) => Rule \| undefined` |
| `new` | `(globalLocaleRoutes?: GlobalLocaleRoutes, routeLocales?: Record<string, string[]>, locales?: Locale[], routeDisableMeta?: Record<string, NoMeta>): Rules` |
| `noMeta` | `private Map<string, NoMeta>` |
| `noMetaByName` | `private Map<string, NoMeta>` |
| `restrictions` | `private Map<string, string[]>` |
| `restrictionsByName` | `private Map<string, string[]>` |
| `rules` | `private Map<string, Rule>` |

</details>

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
