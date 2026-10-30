---
title: '@i18n-micro/path-strategy'
description: 'Exported API of @i18n-micro/path-strategy, generated from the source.'
outline: 'deep'
---

# `@i18n-micro/path-strategy`

21 exports across 2 entry points.
Generated from the API snapshot that [`pnpm run api:surface`](/contributing/maintenance-commands#api-surface)
checks against the TypeScript sources.

## `@i18n-micro/path-strategy`

```ts
import { /* … */ } from '@i18n-micro/path-strategy'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `ClientRedirectOptions` | interface | 1 members |
| `createPathStrategy` | function | `(ctx: PathStrategyContext) => PathStrategy` |
| `DomainPathStrategy` | class | 45 members |
| `I18nPathStrategy` | class | 44 members |
| `PathStrategy` | type | `{ [K in keyof I18nPathStrategy]: I18nPathStrategy[K] }` |
| `PathStrategyContext` | interface | 10 members |
| `ResolvedRouteLike` | interface | 8 members |
| `RouteI18nMeta` | interface | 3 members |
| `RouteLike` | interface | 7 members |
| `RouterAdapter` | interface | 3 members |
| `RouteRecordLike` | interface | 5 members |
| `Strategy` | class | 44 members |
| `SwitchLocaleOptions` | interface | 1 members |

<details>
<summary><code>ClientRedirectOptions</code> — 1 members</summary>

| Member | Type |
| --- | --- |
| `switchPrefixed?` | `boolean \| undefined` |

</details>

<details>
<summary><code>DomainPathStrategy</code> — 45 members</summary>

| Member | Type |
| --- | --- |
| `baseOf` | `private (name: string) => string \| null` |
| `codes` | `protected Set<string>` |
| `createIndex` | `protected (records: ReturnType<RouterAdapter["getRoutes"]>) => Index` |
| `ctx` | `protected PathStrategyContext` |
| `disabledCodes` | `private Set<string>` |
| `external` | `protected (locale: string, route: Target) => string \| null` |
| `findPage` | `private (path: string) => Page \| typeof UNLOCALIZED \| null` |
| `foreign` | `private Set<string>` |
| `getClientRedirect` | `(currentPath: string, preferredLocale: string, options?: ClientRedirectOptions) => string \| null` |
| `getCurrentLocale` | `(route: ResolvedRouteLike, defaultLocaleOverride?: string \| null) => string` |
| `getCurrentLocaleName` | `(route: ResolvedRouteLike, defaultLocaleOverride?: string \| null) => string \| null` |
| `getDefaultLocale` | `() => string` |
| `getLocaleFromPath` | `(path: string) => string \| null` |
| `getLocales` | `() => Locale[]` |
| `getLocalizedRouteNamePrefix` | `() => string` |
| `getPluginRouteName` | `(route: ResolvedRouteLike, locale: string) => string` |
| `getRouteBaseName` | `(route: RouteLike, _locale?: string) => string \| null` |
| `getStrategy` | `() => Strategies` |
| `hasPrefix` | `protected (locale: string) => boolean` |
| `home` | `private (locale: string) => Target` |
| `index` | `protected Index` |
| `isDisabledPrefix` | `private (path: string, segment: string) => boolean` |
| `isMetaDisabled` | `(route: RouteLike, locale: string) => boolean` |
| `isOwnPage` | `protected (path: string) => boolean` |
| `isUnknownLocale` | `private (path: string, segment: string) => boolean` |
| `localeRoute` | `(locale: string, routeOrPath: RouteLike \| string, _currentRoute?: ResolvedRouteLike) => RouteLike` |
| `matchPage` | `private (path: string) => Page \| typeof UNLOCALIZED \| null` |
| `moved` | `private (path: string, locale: string) => string \| null` |
| `new` | `(ctx: PathStrategyContext): DomainPathStrategy` |
| `notFoundReason` | `protected (path: string) => string \| null` |
| `pageBase` | `private (route: RouteLike) => string \| null` |
| `pageLocales` | `(route: RouteLike) => string[] \| null` |
| `prefix` | `private string` |
| `prefixed` | `private (locale: string, path: string) => string` |
| `probe` | `protected (to: RouteLike \| string) => ResolvedRouteLike \| null` |
| `resolve` | `private (to: RouteLike \| string) => ResolvedRouteLike \| null` |
| `resolveLocaleFromPath` | `(path: string) => string \| null` |
| `routeTo` | `private (locale: string, base: string, params: Record<string, unknown>, query?: Record<string, unknown>, hash?: string) => Target \| null` |
| `servedLocale` | `protected (route: ResolvedRouteLike, preferred: string) => string` |
| `setRouter` | `(router: RouterAdapter) => void` |
| `shared` | `private Shared` |
| `shared_` | `private Shared \| undefined` |
| `shouldReturn404` | `(currentPath: string) => string \| null` |
| `switchLocaleRoute` | `(fromLocale: string, toLocale: string, route: ResolvedRouteLike, options?: SwitchLocaleOptions) => RouteLike \| string` |
| `unknownLocale` | `private RegExp \| null` |

</details>

<details>
<summary><code>I18nPathStrategy</code> — 44 members</summary>

| Member | Type |
| --- | --- |
| `baseOf` | `private (name: string) => string \| null` |
| `codes` | `protected Set<string>` |
| `createIndex` | `protected (records: ReturnType<RouterAdapter["getRoutes"]>) => Index` |
| `ctx` | `protected PathStrategyContext` |
| `disabledCodes` | `private Set<string>` |
| `external` | `protected (_locale: string, _route: Target) => string \| null` |
| `findPage` | `private (path: string) => Page \| typeof UNLOCALIZED \| null` |
| `getClientRedirect` | `(currentPath: string, preferredLocale: string, options?: ClientRedirectOptions) => string \| null` |
| `getCurrentLocale` | `(route: ResolvedRouteLike, defaultLocaleOverride?: string \| null) => string` |
| `getCurrentLocaleName` | `(route: ResolvedRouteLike, defaultLocaleOverride?: string \| null) => string \| null` |
| `getDefaultLocale` | `() => string` |
| `getLocaleFromPath` | `(path: string) => string \| null` |
| `getLocales` | `() => Locale[]` |
| `getLocalizedRouteNamePrefix` | `() => string` |
| `getPluginRouteName` | `(route: ResolvedRouteLike, locale: string) => string` |
| `getRouteBaseName` | `(route: RouteLike, _locale?: string) => string \| null` |
| `getStrategy` | `() => Strategies` |
| `hasPrefix` | `protected (locale: string) => boolean` |
| `home` | `private (locale: string) => Target` |
| `index` | `protected Index` |
| `isDisabledPrefix` | `private (path: string, segment: string) => boolean` |
| `isMetaDisabled` | `(route: RouteLike, locale: string) => boolean` |
| `isOwnPage` | `protected (path: string) => boolean` |
| `isUnknownLocale` | `private (path: string, segment: string) => boolean` |
| `localeRoute` | `(locale: string, routeOrPath: RouteLike \| string, _currentRoute?: ResolvedRouteLike) => RouteLike` |
| `matchPage` | `private (path: string) => Page \| typeof UNLOCALIZED \| null` |
| `moved` | `private (path: string, locale: string) => string \| null` |
| `new` | `(ctx: PathStrategyContext): I18nPathStrategy` |
| `notFoundReason` | `protected (path: string) => string \| null` |
| `pageBase` | `private (route: RouteLike) => string \| null` |
| `pageLocales` | `(route: RouteLike) => string[] \| null` |
| `prefix` | `private string` |
| `prefixed` | `private (locale: string, path: string) => string` |
| `probe` | `protected (to: RouteLike \| string) => ResolvedRouteLike \| null` |
| `resolve` | `private (to: RouteLike \| string) => ResolvedRouteLike \| null` |
| `resolveLocaleFromPath` | `(path: string) => string \| null` |
| `routeTo` | `private (locale: string, base: string, params: Record<string, unknown>, query?: Record<string, unknown>, hash?: string) => Target \| null` |
| `servedLocale` | `protected (route: ResolvedRouteLike, preferred: string) => string` |
| `setRouter` | `(router: RouterAdapter) => void` |
| `shared` | `private Shared` |
| `shared_` | `private Shared \| undefined` |
| `shouldReturn404` | `(currentPath: string) => string \| null` |
| `switchLocaleRoute` | `(_fromLocale: string, toLocale: string, route: ResolvedRouteLike, options?: SwitchLocaleOptions) => RouteLike \| string` |
| `unknownLocale` | `private RegExp \| null` |

</details>

<details>
<summary><code>PathStrategyContext</code> — 10 members</summary>

| Member | Type |
| --- | --- |
| `customRegexMatcher?` | `string \| undefined` |
| `defaultLocale` | `string` |
| `disablePageLocales?` | `boolean \| undefined` |
| `domain?` | `string \| undefined` |
| `hashMode?` | `boolean \| undefined` |
| `linkLocales?` | `Locale[] \| undefined` |
| `locales` | `Locale[]` |
| `localizedRouteNamePrefix?` | `string \| undefined` |
| `router` | `RouterAdapter` |
| `strategy` | `Strategies` |

</details>

<details>
<summary><code>ResolvedRouteLike</code> — 8 members</summary>

| Member | Type |
| --- | --- |
| `fullPath` | `string` |
| `hash?` | `string \| undefined` |
| `matched?` | `unknown[] \| undefined` |
| `meta?` | `Record<string, unknown> \| undefined` |
| `name` | `string \| symbol \| null \| undefined` |
| `params?` | `Record<string, unknown> \| undefined` |
| `path` | `string` |
| `query?` | `Record<string, unknown> \| undefined` |

</details>

<details>
<summary><code>RouteI18nMeta</code> — 3 members</summary>

| Member | Type |
| --- | --- |
| `locales` | `string[]` |
| `name` | `string` |
| `noMeta?` | `boolean \| string[] \| undefined` |

</details>

<details>
<summary><code>RouteLike</code> — 7 members</summary>

| Member | Type |
| --- | --- |
| `fullPath?` | `string \| undefined` |
| `hash?` | `string \| undefined` |
| `meta?` | `Record<string, unknown> \| undefined` |
| `name?` | `string \| symbol \| null \| undefined` |
| `params?` | `Record<string, unknown> \| undefined` |
| `path?` | `string \| undefined` |
| `query?` | `Record<string, unknown> \| undefined` |

</details>

<details>
<summary><code>RouterAdapter</code> — 3 members</summary>

| Member | Type |
| --- | --- |
| `getRoutes` | `() => RouteRecordLike[]` |
| `hasRoute` | `(name: string \| symbol) => boolean` |
| `resolve` | `(to: RouteLike \| string) => ResolvedRouteLike` |

</details>

<details>
<summary><code>RouteRecordLike</code> — 5 members</summary>

| Member | Type |
| --- | --- |
| `aliasOf?` | `unknown` |
| `meta?` | `Record<string, unknown> \| undefined` |
| `name?` | `string \| symbol \| null \| undefined` |
| `path` | `string` |
| `redirect?` | `unknown` |

</details>

<code>Strategy</code> — 44 members, identical to `I18nPathStrategy` above.

<details>
<summary><code>SwitchLocaleOptions</code> — 1 members</summary>

| Member | Type |
| --- | --- |
| `i18nRouteParams?` | `I18nRouteParams \| undefined` |

</details>
## `@i18n-micro/path-strategy/types`

```ts
import { /* … */ } from '@i18n-micro/path-strategy/types'
```

| Export | Kind | Signature |
| --- | --- | --- |
| `ClientRedirectOptions` | interface | 1 members |
| `PathStrategyContext` | interface | 10 members |
| `ResolvedRouteLike` | interface | 8 members |
| `RouteI18nMeta` | interface | 3 members |
| `RouteLike` | interface | 7 members |
| `RouterAdapter` | interface | 3 members |
| `RouteRecordLike` | interface | 5 members |
| `SwitchLocaleOptions` | interface | 1 members |

<code>ClientRedirectOptions</code> — 1 members, identical to `ClientRedirectOptions` above.

<code>PathStrategyContext</code> — 10 members, identical to `PathStrategyContext` above.

<code>ResolvedRouteLike</code> — 8 members, identical to `ResolvedRouteLike` above.

<code>RouteI18nMeta</code> — 3 members, identical to `RouteI18nMeta` above.

<code>RouteLike</code> — 7 members, identical to `RouteLike` above.

<code>RouterAdapter</code> — 3 members, identical to `RouterAdapter` above.

<code>RouteRecordLike</code> — 5 members, identical to `RouteRecordLike` above.

<code>SwitchLocaleOptions</code> — 1 members, identical to `SwitchLocaleOptions` above.

Back to [all packages](/api/packages) · [Integration guides](/integrations/)
