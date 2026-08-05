---
url: 'https://s00d.github.io/nuxt-i18n-micro/api/packages/path-strategy.md'
description: 'Exported API of @i18n-micro/path-strategy, generated from the source.'
---

# `@i18n-micro/path-strategy`

38 exports across 6 entry points.
Generated from the API snapshot that [`pnpm run api:surface`](/guide/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/path-strategy`

```ts
import { /* … */ } from '@i18n-micro/path-strategy'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `analyzeRoute` | function | `(ctx: PathStrategyContext, route: ResolvedRouteLike) => RouteAnalysis` |
| `BasePathStrategy` | class | 36 members |
| `buildLocalizedName` | function | `(baseName: string, locale: string, prefix?: string) => string` |
| `createPathStrategy` | function | `(ctx: PathStrategyContext) => PathStrategy` |
| `getRouteBaseName` | function | `(route: { name?: string \| null; } & Record<string, any>, options: GetRouteBaseNameOptions) => string \| null` |
| `GetRouteBaseNameOptions` | interface | 2 members |
| `GlobalLocaleRoutes` | type | `Record<string, Record<string, string> \| false \| boolean>` |
| `isIndexRouteName` | function | `(name: string \| null \| undefined, options?: IsIndexRouteNameOptions) => boolean` |
| `IsIndexRouteNameOptions` | interface | 2 members |
| `NoPrefixPathStrategy` | class | 36 members |
| `NormalizedRouteInput` | type | `\| { kind: 'path'; path: string } \| { kind: 'route'; inputName: string \| null; sourceRoute: RouteLike; resolved: ResolvedRouteLike }` |
| `PathStrategy` | interface | 22 members |
| `PathStrategyContext` | interface | 15 members |
| `PrefixAndDefaultPathStrategy` | class | 37 members |
| `PrefixExceptDefaultPathStrategy` | class | 44 members |
| `PrefixPathStrategy` | class | 36 members |
| `ResolvedRouteLike` | interface | 6 members |
| `resolvePathWithParams` | function | `(path: string, params?: Record<string, unknown>) => string` |
| `RouteAnalysis` | interface | 2 members |
| `RouteLike` | interface | 6 members |
| `RouterAdapter` | interface | 3 members |
| `SwitchLocaleOptions` | interface | 1 members |

| Member | Type |
| --- | --- |
| `_ensureRouteLike` | `(value: RouteLike \| string, source?: RouteLike \| null) => RouteLike` |
| `_normalizeRouteInput` | `(routeOrPath: RouteLike \| string, _currentRoute?: ResolvedRouteLike) => NormalizedRouteInput` |
| `applyBaseUrl` | `(localeCode: string, route: RouteLike \| string) => RouteLike \| string` |
| `buildLocalizedName` | `(baseName: string, locale: string) => string` |
| `buildLocalizedPath` | `(path: string, locale: string, _isCustom: boolean) => string` |
| `buildLocalizedRouteName` | `(baseName: string, locale: string) => string` |
| `ctx` | `PathStrategyContext` |
| `detectLocaleFromName` | `(name: string \| null) => string \| null` |
| `formatPathForResolve` | `(path: string, fromLocale: string, _toLocale: string) => string` |
| `getBaseRouteName` | `(route: RouteLike, locale: string) => string \| null` |
| `getCanonicalPath` | `(route: ResolvedRouteLike, targetLocale: string) => string \| null` |
| `getClientRedirect` | `(currentPath: string, preferredLocale: string) => string \| null` |
| `getCurrentLocale` | `(route: ResolvedRouteLike, defaultLocaleOverride?: string \| null) => string` |
| `getCurrentLocaleName` | `(route: ResolvedRouteLike, defaultLocaleOverride?: string \| null) => string \| null` |
| `getDefaultLocale` | `() => string` |
| `getGlobalLocaleRoutes` | `() => PathStrategyContext["globalLocaleRoutes"]` |
| `getLocaleFromPath` | `(path: string) => string \| null` |
| `getLocales` | `() => Locale[]` |
| `getLocalizedRouteNamePrefix` | `() => string` |
| `getNoPrefixRedirect` | `() => boolean \| undefined` |
| `getPathWithoutLocale` | `(path: string) => { pathWithoutLocale: string; localeFromPath: string \| null; }` |
| `getPluginRouteName` | `(route: ResolvedRouteLike, locale: string) => string` |
| `getRedirect` | `(currentPath: string, targetLocale: string) => string \| null` |
| `getRouteBaseName` | `(route: RouteLike, locale?: string) => string \| null` |
| `getRouteLocales` | `() => PathStrategyContext["routeLocales"]` |
| `getRoutesLocaleLinks` | `() => PathStrategyContext["routesLocaleLinks"]` |
| `getStrategy` | `() => PathStrategyContext["strategy"]` |
| `getSwitchLocaleFallbackWhenNoRoute` | `(route: ResolvedRouteLike, targetName: string) => RouteLike \| string` |
| `localeRoute` | `(targetLocale: string, routeOrPath: RouteLike \| string, currentRoute?: ResolvedRouteLike) => RouteLike` |
| `new` | `abstract (ctx: PathStrategyContext): BasePathStrategy` |
| `resolveLocaleFromPath` | `(path: string) => string \| null` |
| `resolveLocaleRoute` | `(targetLocale: string, normalized: NormalizedRouteInput, _currentRoute?: ResolvedRouteLike) => RouteLike \| string` |
| `resolvePathForLocale` | `(path: string, targetLocale: string) => string` |
| `setRouter` | `(router: RouterAdapter) => void` |
| `shouldReturn404` | `(currentPath: string) => string \| null` |
| `switchLocaleRoute` | `(fromLocale: string, toLocale: string, route: ResolvedRouteLike, options: SwitchLocaleOptions) => RouteLike \| string` |

| Member | Type |
| --- | --- |
| `locales` | `{ code: string; }[]` |
| `localizedRouteNamePrefix?` | `string \| undefined` |

| Member | Type |
| --- | --- |
| `localeCodes?` | `readonly string[] \| undefined` |
| `localizedRouteNamePrefix?` | `string \| undefined` |

| Member | Type |
| --- | --- |
| `_ensureRouteLike` | `(value: RouteLike \| string, source?: RouteLike \| null) => RouteLike` |
| `_normalizeRouteInput` | `(routeOrPath: RouteLike \| string, _currentRoute?: ResolvedRouteLike) => NormalizedRouteInput` |
| `applyBaseUrl` | `(localeCode: string, route: RouteLike \| string) => RouteLike \| string` |
| `buildLocalizedName` | `(baseName: string, locale: string) => string` |
| `buildLocalizedPath` | `(path: string, _locale: string, _isCustom: boolean) => string` |
| `buildLocalizedRouteName` | `(baseName: string, locale: string) => string` |
| `ctx` | `PathStrategyContext` |
| `detectLocaleFromName` | `(name: string \| null) => string \| null` |
| `formatPathForResolve` | `(path: string, _fromLocale: string, _toLocale: string) => string` |
| `getBaseRouteName` | `(route: RouteLike, locale: string) => string \| null` |
| `getCanonicalPath` | `(route: ResolvedRouteLike, targetLocale: string) => string \| null` |
| `getClientRedirect` | `(_currentPath: string, _preferredLocale: string) => string \| null` |
| `getCurrentLocale` | `(route: ResolvedRouteLike, defaultLocaleOverride?: string \| null) => string` |
| `getCurrentLocaleName` | `(route: ResolvedRouteLike, defaultLocaleOverride?: string \| null) => string \| null` |
| `getDefaultLocale` | `() => string` |
| `getGlobalLocaleRoutes` | `() => PathStrategyContext["globalLocaleRoutes"]` |
| `getLocaleFromPath` | `(path: string) => string \| null` |
| `getLocales` | `() => Locale[]` |
| `getLocalizedRouteNamePrefix` | `() => string` |
| `getNoPrefixRedirect` | `() => boolean \| undefined` |
| `getPathWithoutLocale` | `(path: string) => { pathWithoutLocale: string; localeFromPath: string \| null; }` |
| `getPluginRouteName` | `(route: ResolvedRouteLike, locale: string) => string` |
| `getRedirect` | `(currentPath: string, _targetLocale: string) => string \| null` |
| `getRouteBaseName` | `(route: RouteLike, locale?: string) => string \| null` |
| `getRouteLocales` | `() => PathStrategyContext["routeLocales"]` |
| `getRoutesLocaleLinks` | `() => PathStrategyContext["routesLocaleLinks"]` |
| `getStrategy` | `() => PathStrategyContext["strategy"]` |
| `getSwitchLocaleFallbackWhenNoRoute` | `(route: ResolvedRouteLike, _targetName: string) => RouteLike \| string` |
| `localeRoute` | `(targetLocale: string, routeOrPath: RouteLike \| string, currentRoute?: ResolvedRouteLike) => RouteLike` |
| `new` | `(ctx: PathStrategyContext): NoPrefixPathStrategy` |
| `resolveLocaleFromPath` | `(_path: string) => string \| null` |
| `resolveLocaleRoute` | `(targetLocale: string, normalized: NormalizedRouteInput, currentRoute?: ResolvedRouteLike) => RouteLike \| string` |
| `resolvePathForLocale` | `(path: string, targetLocale: string) => string` |
| `setRouter` | `(router: RouterAdapter) => void` |
| `shouldReturn404` | `(_currentPath: string) => string \| null` |
| `switchLocaleRoute` | `(fromLocale: string, toLocale: string, route: ResolvedRouteLike, options: SwitchLocaleOptions) => RouteLike \| string` |

| Member | Type |
| --- | --- |
| `formatPathForResolve` | `(path: string, fromLocale: string, toLocale: string) => string` |
| `getCanonicalPath` | `(route: ResolvedRouteLike, targetLocale: string) => string \| null` |
| `getClientRedirect` | `(currentPath: string, preferredLocale: string) => string \| null` |
| `getCurrentLocale` | `(route: ResolvedRouteLike, defaultLocaleOverride?: string \| null) => string` |
| `getCurrentLocaleName` | `(route: ResolvedRouteLike, defaultLocaleOverride?: string \| null) => string \| null` |
| `getDefaultLocale` | `() => string` |
| `getGlobalLocaleRoutes` | `() => GlobalLocaleRoutes \| undefined` |
| `getLocaleFromPath` | `(path: string) => string \| null` |
| `getLocales` | `() => Locale[]` |
| `getLocalizedRouteNamePrefix` | `() => string` |
| `getNoPrefixRedirect` | `() => boolean \| undefined` |
| `getPluginRouteName` | `(route: ResolvedRouteLike, locale: string) => string` |
| `getRedirect` | `(currentPath: string, targetLocale: string) => string \| null` |
| `getRouteBaseName` | `(route: RouteLike, locale?: string) => string \| null` |
| `getRouteLocales` | `() => Record<string, string[]> \| undefined` |
| `getRoutesLocaleLinks` | `() => Record<string, string> \| undefined` |
| `getStrategy` | `() => Strategies` |
| `localeRoute` | `(targetLocale: string, routeOrPath: RouteLike \| string, currentRoute?: ResolvedRouteLike) => RouteLike` |
| `resolveLocaleFromPath` | `(path: string) => string \| null` |
| `setRouter` | `(router: RouterAdapter) => void` |
| `shouldReturn404` | `(currentPath: string) => string \| null` |
| `switchLocaleRoute` | `(fromLocale: string, toLocale: string, route: ResolvedRouteLike, options: SwitchLocaleOptions) => RouteLike \| string` |

| Member | Type |
| --- | --- |
| `_hasGR?` | `boolean \| undefined` |
| `_hasRL?` | `boolean \| undefined` |
| `debug?` | `boolean \| undefined` |
| `defaultLocale` | `string` |
| `disablePageLocales?` | `boolean \| undefined` |
| `globalLocaleRoutes?` | `GlobalLocaleRoutes \| undefined` |
| `hashMode?` | `boolean \| undefined` |
| `localeCodes?` | `readonly string[] \| undefined` |
| `locales` | `Locale[]` |
| `localizedRouteNamePrefix` | `string` |
| `noPrefixRedirect?` | `boolean \| undefined` |
| `routeLocales?` | `Record<string, string[]> \| undefined` |
| `router` | `RouterAdapter` |
| `routesLocaleLinks?` | `Record<string, string> \| undefined` |
| `strategy` | `Strategies` |

| Member | Type |
| --- | --- |
| `_ensureRouteLike` | `(value: RouteLike \| string, source?: RouteLike \| null) => RouteLike` |
| `_normalizeRouteInput` | `(routeOrPath: RouteLike \| string, _currentRoute?: ResolvedRouteLike) => NormalizedRouteInput` |
| `applyBaseUrl` | `(localeCode: string, route: RouteLike \| string) => RouteLike \| string` |
| `buildLocalizedName` | `(baseName: string, locale: string) => string` |
| `buildLocalizedPath` | `(path: string, locale: string, _isCustom: boolean) => string` |
| `buildLocalizedRouteName` | `(baseName: string, locale: string) => string` |
| `ctx` | `PathStrategyContext` |
| `detectLocaleFromName` | `(name: string \| null) => string \| null` |
| `formatPathForResolve` | `(path: string, fromLocale: string, _toLocale: string) => string` |
| `getBaseRouteName` | `(route: RouteLike, locale: string) => string \| null` |
| `getCanonicalPath` | `(route: ResolvedRouteLike, targetLocale: string) => string \| null` |
| `getClientRedirect` | `(currentPath: string, _preferredLocale: string) => string \| null` |
| `getCurrentLocale` | `(route: ResolvedRouteLike, defaultLocaleOverride?: string \| null) => string` |
| `getCurrentLocaleName` | `(route: ResolvedRouteLike, defaultLocaleOverride?: string \| null) => string \| null` |
| `getDefaultLocale` | `() => string` |
| `getGlobalLocaleRoutes` | `() => PathStrategyContext["globalLocaleRoutes"]` |
| `getLocaleFromPath` | `(path: string) => string \| null` |
| `getLocales` | `() => Locale[]` |
| `getLocalizedRouteNamePrefix` | `() => string` |
| `getNoPrefixRedirect` | `() => boolean \| undefined` |
| `getPathWithoutLocale` | `(path: string) => { pathWithoutLocale: string; localeFromPath: string \| null; }` |
| `getPluginRouteName` | `(route: ResolvedRouteLike, locale: string) => string` |
| `getRedirect` | `(currentPath: string, detectedLocale: string) => string \| null` |
| `getRouteBaseName` | `(route: RouteLike, locale?: string) => string \| null` |
| `getRouteLocales` | `() => PathStrategyContext["routeLocales"]` |
| `getRoutesLocaleLinks` | `() => PathStrategyContext["routesLocaleLinks"]` |
| `getStrategy` | `() => PathStrategyContext["strategy"]` |
| `getSwitchLocaleFallbackWhenNoRoute` | `(route: ResolvedRouteLike, targetName: string) => RouteLike \| string` |
| `localeRoute` | `(targetLocale: string, routeOrPath: RouteLike \| string, currentRoute?: ResolvedRouteLike) => RouteLike` |
| `new` | `(ctx: PathStrategyContext): PrefixAndDefaultPathStrategy` |
| `resolveLocaleFromPath` | `(path: string) => string \| null` |
| `resolveLocaleRoute` | `(targetLocale: string, normalized: NormalizedRouteInput, currentRoute?: ResolvedRouteLike) => RouteLike \| string` |
| `resolvePathForLocale` | `(path: string, targetLocale: string) => string` |
| `rewriteWithLocalePrefix` | `private (route: RouteLike, targetLocale: string) => RouteLike` |
| `setRouter` | `(router: RouterAdapter) => void` |
| `shouldReturn404` | `(currentPath: string) => string \| null` |
| `switchLocaleRoute` | `(fromLocale: string, toLocale: string, route: ResolvedRouteLike, options: SwitchLocaleOptions) => RouteLike \| string` |

| Member | Type |
| --- | --- |
| `_ensureRouteLike` | `(value: RouteLike \| string, source?: RouteLike \| null) => RouteLike` |
| `_normalizeRouteInput` | `(routeOrPath: RouteLike \| string, _currentRoute?: ResolvedRouteLike) => NormalizedRouteInput` |
| `applyBaseUrl` | `(localeCode: string, route: RouteLike \| string) => RouteLike \| string` |
| `buildLocalizedName` | `(baseName: string, locale: string) => string` |
| `buildLocalizedPath` | `(path: string, locale: string, _isCustom: boolean) => string` |
| `buildLocalizedRouteName` | `(baseName: string, locale: string) => string` |
| `buildNestedCustomResult` | `private (customPath: string, routeName: string, targetLocale: string, needsPrefix: boolean, sourceRoute: RouteLike, currentRoute?: ResolvedRouteLike) => RouteLike \| string` |
| `ctx` | `PathStrategyContext` |
| `detectLocaleFromName` | `(name: string \| null) => string \| null` |
| `formatPathForResolve` | `(path: string, fromLocale: string, toLocale: string) => string` |
| `getBaseRouteName` | `(route: RouteLike, locale: string) => string \| null` |
| `getCanonicalPath` | `(route: ResolvedRouteLike, targetLocale: string) => string \| null` |
| `getClientRedirect` | `(currentPath: string, preferredLocale: string) => string \| null` |
| `getCurrentLocale` | `(route: ResolvedRouteLike, defaultLocaleOverride?: string \| null) => string` |
| `getCurrentLocaleName` | `(route: ResolvedRouteLike, defaultLocaleOverride?: string \| null) => string \| null` |
| `getDefaultLocale` | `() => string` |
| `getGlobalLocaleRoutes` | `() => PathStrategyContext["globalLocaleRoutes"]` |
| `getLocaleFromPath` | `(path: string) => string \| null` |
| `getLocales` | `() => Locale[]` |
| `getLocalizedRouteNamePrefix` | `() => string` |
| `getNestedRouteInfo` | `private (baseRouteName: string) => { parentKey: string; keyWithSlash: string; } \| null` |
| `getNoPrefixRedirect` | `() => boolean \| undefined` |
| `getParentPathForTarget` | `private (parentKey: string, keyWithSlash: string, targetLocale: string, currentRoute?: ResolvedRouteLike) => string` |
| `getPathWithoutLocale` | `(path: string) => { pathWithoutLocale: string; localeFromPath: string \| null; }` |
| `getPluginRouteName` | `(route: ResolvedRouteLike, locale: string) => string` |
| `getRedirect` | `(currentPath: string, detectedLocale: string) => string \| null` |
| `getRouteBaseName` | `(route: RouteLike, locale?: string) => string \| null` |
| `getRouteLocales` | `() => PathStrategyContext["routeLocales"]` |
| `getRoutesLocaleLinks` | `() => PathStrategyContext["routesLocaleLinks"]` |
| `getStrategy` | `() => PathStrategyContext["strategy"]` |
| `getSwitchLocaleFallbackWhenNoRoute` | `(route: ResolvedRouteLike, targetName: string) => RouteLike \| string` |
| `isLocaleRules` | `private (key: string) => boolean` |
| `localeRoute` | `(targetLocale: string, routeOrPath: RouteLike \| string, currentRoute?: ResolvedRouteLike) => RouteLike` |
| `new` | `(ctx: PathStrategyContext): PrefixExceptDefaultPathStrategy` |
| `resolveLocaleFromPath` | `(path: string) => string \| null` |
| `resolveLocaleRoute` | `(targetLocale: string, normalized: NormalizedRouteInput, currentRoute?: ResolvedRouteLike) => RouteLike \| string` |
| `resolveLocaleRouteFallback` | `private (targetLocale: string, resolved: ResolvedRouteLike, sourceRoute: RouteLike, needsPrefix: boolean, currentRoute?: ResolvedRouteLike) => RouteLike \| string` |
| `resolveLocaleRouteFull` | `private (targetLocale: string, inputName: string \| null, sourceRoute: RouteLike, resolved: ResolvedRouteLike, needsPrefix: boolean, hasParams: boolean, currentRoute?: ResolvedRouteLike) => RouteLike \| string` |
| `resolveLocaleRouteSimple` | `private (targetLocale: string, inputName: string \| null, sourceRoute: RouteLike, resolved: ResolvedRouteLike, needsPrefix: boolean, hasParams: boolean, currentRoute?: ResolvedRouteLike) => RouteLike \| string` |
| `resolvePathForLocale` | `(path: string, targetLocale: string) => string` |
| `setRouter` | `(router: RouterAdapter) => void` |
| `shouldHavePrefix` | `protected (locale: string) => boolean` |
| `shouldReturn404` | `(currentPath: string) => string \| null` |
| `switchLocaleRoute` | `(fromLocale: string, toLocale: string, route: ResolvedRouteLike, options: SwitchLocaleOptions) => RouteLike \| string` |

| Member | Type |
| --- | --- |
| `_ensureRouteLike` | `(value: RouteLike \| string, source?: RouteLike \| null) => RouteLike` |
| `_normalizeRouteInput` | `(routeOrPath: RouteLike \| string, _currentRoute?: ResolvedRouteLike) => NormalizedRouteInput` |
| `applyBaseUrl` | `(localeCode: string, route: RouteLike \| string) => RouteLike \| string` |
| `buildLocalizedName` | `(baseName: string, locale: string) => string` |
| `buildLocalizedPath` | `(path: string, locale: string, _isCustom: boolean) => string` |
| `buildLocalizedRouteName` | `(baseName: string, locale: string) => string` |
| `ctx` | `PathStrategyContext` |
| `detectLocaleFromName` | `(name: string \| null) => string \| null` |
| `formatPathForResolve` | `(path: string, fromLocale: string, _toLocale: string) => string` |
| `getBaseRouteName` | `(route: RouteLike, locale: string) => string \| null` |
| `getCanonicalPath` | `(route: ResolvedRouteLike, targetLocale: string) => string \| null` |
| `getClientRedirect` | `(currentPath: string, preferredLocale: string) => string \| null` |
| `getCurrentLocale` | `(route: ResolvedRouteLike, defaultLocaleOverride?: string \| null) => string` |
| `getCurrentLocaleName` | `(route: ResolvedRouteLike, defaultLocaleOverride?: string \| null) => string \| null` |
| `getDefaultLocale` | `() => string` |
| `getGlobalLocaleRoutes` | `() => PathStrategyContext["globalLocaleRoutes"]` |
| `getLocaleFromPath` | `(path: string) => string \| null` |
| `getLocales` | `() => Locale[]` |
| `getLocalizedRouteNamePrefix` | `() => string` |
| `getNoPrefixRedirect` | `() => boolean \| undefined` |
| `getPathWithoutLocale` | `(path: string) => { pathWithoutLocale: string; localeFromPath: string \| null; }` |
| `getPluginRouteName` | `(route: ResolvedRouteLike, locale: string) => string` |
| `getRedirect` | `(currentPath: string, detectedLocale: string) => string \| null` |
| `getRouteBaseName` | `(route: RouteLike, locale?: string) => string \| null` |
| `getRouteLocales` | `() => PathStrategyContext["routeLocales"]` |
| `getRoutesLocaleLinks` | `() => PathStrategyContext["routesLocaleLinks"]` |
| `getStrategy` | `() => PathStrategyContext["strategy"]` |
| `getSwitchLocaleFallbackWhenNoRoute` | `(route: ResolvedRouteLike, targetName: string) => RouteLike \| string` |
| `localeRoute` | `(targetLocale: string, routeOrPath: RouteLike \| string, currentRoute?: ResolvedRouteLike) => RouteLike` |
| `new` | `(ctx: PathStrategyContext): PrefixPathStrategy` |
| `resolveLocaleFromPath` | `(path: string) => string \| null` |
| `resolveLocaleRoute` | `(targetLocale: string, normalized: NormalizedRouteInput, currentRoute?: ResolvedRouteLike) => RouteLike \| string` |
| `resolvePathForLocale` | `(path: string, targetLocale: string) => string` |
| `setRouter` | `(router: RouterAdapter) => void` |
| `shouldReturn404` | `(currentPath: string) => string \| null` |
| `switchLocaleRoute` | `(fromLocale: string, toLocale: string, route: ResolvedRouteLike, options: SwitchLocaleOptions) => RouteLike \| string` |

| Member | Type |
| --- | --- |
| `fullPath` | `string` |
| `hash?` | `string \| undefined` |
| `name` | `string \| null` |
| `params?` | `Record<string, unknown> \| undefined` |
| `path` | `string` |
| `query?` | `Record<string, unknown> \| undefined` |

| Member | Type |
| --- | --- |
| `baseRouteName` | `string \| null` |
| `pathWithoutLocale` | `string` |

| Member | Type |
| --- | --- |
| `fullPath?` | `string \| undefined` |
| `hash?` | `string \| undefined` |
| `name?` | `string \| null \| undefined` |
| `params?` | `Record<string, unknown> \| undefined` |
| `path?` | `string \| undefined` |
| `query?` | `Record<string, unknown> \| undefined` |

| Member | Type |
| --- | --- |
| `getRoutes?` | `(() => unknown[]) \| undefined` |
| `hasRoute` | `(name: string) => boolean` |
| `resolve` | `(to: RouteLike \| string) => ResolvedRouteLike` |

| Member | Type |
| --- | --- |
| `i18nRouteParams?` | `I18nRouteParams \| undefined` |

```ts
import { /* … */ } from '@i18n-micro/path-strategy/no-prefix'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `NoPrefixPathStrategy` | class | 36 members |
| `Strategy` | class | 36 members |

NoPrefixPathStrategy — 36 members, identical to `NoPrefixPathStrategy` above.
Strategy — 36 members, identical to `NoPrefixPathStrategy` above.

## `@i18n-micro/path-strategy/prefix`

```ts
import { /* … */ } from '@i18n-micro/path-strategy/prefix'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `PrefixPathStrategy` | class | 36 members |
| `Strategy` | class | 36 members |

PrefixPathStrategy — 36 members, identical to `PrefixPathStrategy` above.
Strategy — 36 members, identical to `PrefixPathStrategy` above.

## `@i18n-micro/path-strategy/prefix-and-default`

```ts
import { /* … */ } from '@i18n-micro/path-strategy/prefix-and-default'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `PrefixAndDefaultPathStrategy` | class | 37 members |
| `Strategy` | class | 37 members |

PrefixAndDefaultPathStrategy — 37 members, identical to `PrefixAndDefaultPathStrategy` above.
Strategy — 37 members, identical to `PrefixAndDefaultPathStrategy` above.

## `@i18n-micro/path-strategy/prefix-except-default`

```ts
import { /* … */ } from '@i18n-micro/path-strategy/prefix-except-default'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `PrefixExceptDefaultPathStrategy` | class | 44 members |
| `Strategy` | class | 44 members |

PrefixExceptDefaultPathStrategy — 44 members, identical to `PrefixExceptDefaultPathStrategy` above.
Strategy — 44 members, identical to `PrefixExceptDefaultPathStrategy` above.

## `@i18n-micro/path-strategy/types`

```ts
import { /* … */ } from '@i18n-micro/path-strategy/types'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `GlobalLocaleRoutes` | type | `Record<string, Record<string, string> \| false \| boolean>` |
| `NormalizedRouteInput` | type | `\| { kind: 'path'; path: string } \| { kind: 'route'; inputName: string \| null; sourceRoute: RouteLike; resolved: ResolvedRouteLike }` |
| `PathStrategy` | interface | 22 members |
| `PathStrategyContext` | interface | 15 members |
| `ResolvedRouteLike` | interface | 6 members |
| `RouteLike` | interface | 6 members |
| `RouterAdapter` | interface | 3 members |
| `SwitchLocaleOptions` | interface | 1 members |

PathStrategy — 22 members, identical to `PathStrategy` above.
PathStrategyContext — 15 members, identical to `PathStrategyContext` above.
ResolvedRouteLike — 6 members, identical to `ResolvedRouteLike` above.
RouteLike — 6 members, identical to `RouteLike` above.
RouterAdapter — 3 members, identical to `RouterAdapter` above.
SwitchLocaleOptions — 1 members, identical to `SwitchLocaleOptions` above.

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
