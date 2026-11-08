# `@i18n-micro/path-strategy`

Shared strategy-based path and route name builder for Nuxt I18n Micro frontend routing.

Entry points: `@i18n-micro/path-strategy`, `@i18n-micro/path-strategy/types`.

## `@i18n-micro/path-strategy`

### Functions

#### `createPathStrategy`

```ts
function createPathStrategy(ctx: PathStrategyContext): PathStrategy
```

**See** [`PathStrategyContext`](#pathstrategycontext) · [`PathStrategy`](#pathstrategy)

### Classes

#### `DomainPathStrategy`

The strategy of a build with locale domains (`baseUrl`). On a known host (`ctx.domain`) the
locales of other domains are no URLs here, only link targets; on any other host the build config
routes and every `baseUrl` locale is a link target. A class of its own: an app without domains
does not ship it.

```ts
class DomainPathStrategy extends I18nPathStrategy {
  constructor(ctx: PathStrategyContext)
}
```

<field-group>
<field name="protected otherCodes" type="ReadonlySet<string>">

Locales whose URLs are no page here but name one (another domain's): `DomainPathStrategy`.

</field>

<field name="protected createIndex" type="(records: ReturnType<RouterAdapter['getRoutes']>) => Index">

Records keep every locale's prefix (other hosts link there); the default of this host links to its unprefixed record.

</field>

<field name="protected external" type="(locale: string, route: Target) => string | null">

A route in `locale` as an absolute URL on another domain: `DomainPathStrategy`.

</field>

<field name="protected notFoundReason" type="(path: string) => string | null">



</field>

<field name="switchLocaleRoute" type="(toLocale: string, route: ResolvedRouteLike, options?: SwitchLocaleOptions) => RouteLike | string">

A link `localeRoute` made absolute reads as the page it shows, so it switches like any route.

</field>

<field name="localeRoute" type="(locale: string, routeOrPath: RouteLike | string) => RouteLike">

An absolute link of a locale's own domain says where it goes (`<i18n-link :to="$localeRoute(x, 'de')">`).
Any other absolute object stays a path: it can come from a request.

</field>

<field name="protected servedLocale" type="(route: ResolvedRouteLike, preferred: string) => string">

A page restricted to some locales renders in one this host serves.

</field>

<field name="getClientRedirect" type="(currentPath: string, preferredLocale: string, options?: ClientRedirectOptions) => string | null">

Where an unprefixed URL goes for the preferred locale (server plugin and client middleware),
or null to stay. URLs with a locale prefix are never rewritten here.

</field>
</field-group>

**See** [`I18nPathStrategy`](#i18npathstrategy) · [`PathStrategyContext`](#pathstrategycontext)

#### `I18nPathStrategy`

```ts
class I18nPathStrategy {
  constructor(ctx: PathStrategyContext)
}
```

<collapsible name="28 members">
<field-group>
<field name="protected readonly ctx" type="PathStrategyContext">



</field>

<field name="protected readonly codes" type="Set<string>">



</field>

<field name="setRouter" type="(router: RouterAdapter) => void">



</field>

<field name="getDefaultLocale" type="() => string">



</field>

<field name="getLocales" type="() => Locale[]">



</field>

<field name="getStrategy" type="() => Strategies">



</field>

<field name="getLocalizedRouteNamePrefix" type="() => string">



</field>

<field name="protected createIndex" type="(records: ReturnType<RouterAdapter['getRoutes']>) => Index">



</field>

<field name="protected index" type="Index">



</field>

<field name="protected hasPrefix" type="(locale: string) => boolean">

Whether URLs in `locale` carry the locale segment.

</field>

<field name="probe" type="(to: RouteLike | string) => ResolvedRouteLike | null">

Resolves a URL that may match nothing, without vue-router's dev "No match found" warning.

</field>

<field name="protected otherCodes" type="ReadonlySet<string>">

Locales whose URLs are no page here but name one (another domain's): `DomainPathStrategy`.

</field>

<field name="pageLocales" type="(route: RouteLike) => string[] | null">

Locales the page of `route` is served in (every record of it), or null when it is not localized.

</field>

<field name="isMetaDisabled" type="(route: RouteLike, locale: string) => boolean">

Whether `$defineI18nRoute({ disableMeta })` turns the SEO tags of this page off in `locale`.

</field>

<field name="protected external" type="(_locale: string, _route: Target) => string | null">

A route in `locale` as an absolute URL on another domain: `DomainPathStrategy`.

</field>

<field name="switchLocaleRoute" type="(toLocale: string, route: ResolvedRouteLike, options: SwitchLocaleOptions = {}) => RouteLike | string">



</field>

<field name="localeRoute" type="(locale: string, routeOrPath: RouteLike | string) => RouteLike">



</field>

<field name="getRouteBaseName" type="(route: RouteLike) => string | null">



</field>

<field name="getPluginRouteName" type="(route: ResolvedRouteLike, locale: string) => string">

Translation key of the route: its base name (`index` when page translations are off).

</field>

<field name="getCurrentLocale" type="(route: ResolvedRouteLike, defaultLocaleOverride?: string | null) => string">



</field>

<field name="protected servedLocale" type="(route: ResolvedRouteLike, preferred: string) => string">

Under no_prefix the URL names no locale, but a record can: a custom path belongs to its locales,
and a page restricted to some locales never renders in another one. The preference wins among them.

</field>

<field name="getCurrentLocaleName" type="(route: ResolvedRouteLike, defaultLocaleOverride?: string | null) => string | null">



</field>

<field name="getLocaleFromPath" type="(path: string) => string | null">

Locale code in the first path segment, or null.

</field>

<field name="resolveLocaleFromPath" type="(path: string) => string | null">

Locale a URL is in: its prefix, or the default where an unprefixed URL is its page; null under no_prefix.

</field>

<field name="shouldReturn404" type="(currentPath: string) => string | null">

Why a URL must be a 404 (a prefix that is wrong for it, an unknown locale-like segment), or null.

</field>

<field name="protected isOwnPage" type="(path: string) => boolean">

Whether a page of its own answers the URL, in any form: no catch-all.

</field>

<field name="protected notFoundReason" type="(path: string) => string | null">



</field>

<field name="getClientRedirect" type="(currentPath: string, preferredLocale: string, options: ClientRedirectOptions = {}) => string | null">

Where an unprefixed URL goes for the preferred locale (server plugin and client middleware),
or null to stay. URLs with a locale prefix are never rewritten here.

</field>
</field-group>
</collapsible>

**See** [`PathStrategyContext`](#pathstrategycontext)

### Types

#### `ClientRedirectOptions`

```ts
interface ClientRedirectOptions
```

<field-group>
<field name="switchPrefixed" type="boolean">

`autoDetectPath: '*'`: a URL already in another locale moves to the preferred one too
(the same page in that locale), not only unprefixed URLs.

</field>
</field-group>

#### `PathStrategy`

The public surface, structural: the Nuxt template imports the built `.mjs` by path, and a
class type with private members would not match the one TypeScript infers from that file.

```ts
type PathStrategy = {
  [K in keyof I18nPathStrategy]: I18nPathStrategy[K];
}
```

**See** [`I18nPathStrategy`](#i18npathstrategy)

#### `PathStrategyContext`

```ts
interface PathStrategyContext
```

<collapsible name="11 properties">
<field-group>
<field name="strategy" type="Strategies" :required="true">



</field>

<field name="defaultLocale" type="string" :required="true">



</field>

<field name="locales" type="Locale[]" :required="true">



</field>

<field name="localizedRouteNamePrefix" type="string">



</field>

<field name="router" type="RouterAdapter" :required="true">



</field>

<field name="hashMode" type="boolean">

Hash mode: the locale is not read from the URL.

</field>

<field name="disablePageLocales" type="boolean">

All pages use the global translations only.

</field>

<field name="customRegexMatcher" type="string">

Pattern of locale-like first segments (`customRegexMatcher`): one that is no known locale is a 404.

</field>

<field name="prefixCaseRedirect" type="boolean">

A locale prefix in another case or encoding redirects to its own spelling (default); `false`: a 404.

</field>

<field name="domain" type="string">

Host this strategy answers for (`DomainPathStrategy`); unset on a host no locale lives on.

</field>

<field name="linkLocales" type="Locale[]">

With `domain`: every locale. Those missing from `locales` live on another domain.

</field>
</field-group>
</collapsible>

#### `ResolvedRouteLike`

Resolved route (path and fullPath required).

```ts
interface ResolvedRouteLike extends RouteLike
```

<field-group>
<field name="name" type="string | symbol | null | undefined" :required="true">

vue-router names may be symbols (`RouteRecordNameGeneric`).

</field>

<field name="path" type="string" :required="true">



</field>

<field name="fullPath" type="string" :required="true">



</field>

<field name="matched" type="RouteRecordLike[]">

Matched records (vue-router routes have them): an unnamed route that matched is not a 404.

</field>
</field-group>

**See** [`RouteLike`](#routelike)

#### `RouteLike`

Route-like shape (compatible with vue-router).

```ts
interface RouteLike
```

<field-group>
<field name="name" type="string | symbol | null">

vue-router names may be symbols (`RouteRecordNameGeneric`).

</field>

<field name="path" type="string">



</field>

<field name="params" type="Record<string, unknown>">



</field>

<field name="query" type="Record<string, unknown>">



</field>

<field name="hash" type="string">



</field>

<field name="fullPath" type="string">



</field>

<field name="meta" type="Record<string, unknown>">

Route meta (vue-router merges the matched records'): `i18nNoMeta` marks an unlocalized page's disableMeta.

</field>
</field-group>

#### `RouterAdapter`

```ts
interface RouterAdapter
```

<field-group>
<field name="hasRoute" type="(name: string | symbol) => boolean" :required="true">



</field>

<field name="resolve" type="(to: RouteLike | string) => ResolvedRouteLike" :required="true">



</field>

<field name="getRoutes" type="() => RouteRecordLike[]" :required="true">



</field>
</field-group>

#### `RouteRecordLike`

What path-strategy reads from a vue-router record (`router.getRoutes()`).

```ts
interface RouteRecordLike
```

<field-group>
<field name="name" type="string | symbol | null">



</field>

<field name="path" type="string" :required="true">



</field>

<field name="meta" type="Record<string, unknown>">



</field>

<field name="redirect" type="unknown">



</field>

<field name="aliasOf" type="{ path: string; }">



</field>
</field-group>

#### `SwitchLocaleOptions`

```ts
interface SwitchLocaleOptions
```

<field-group>
<field name="i18nRouteParams" type="I18nRouteParams">



</field>

<field name="named" type="boolean">

Keep `name` and `params` on a route with an escape: for a caller that drops `path`, so the router encodes them.

</field>
</field-group>

### Re-exports

Declared in another package of this repository and documented on its page.

- From [`@i18n-micro/types`](/api/packages/types): [`RouteI18nMeta`](/api/packages/types#routei18nmeta)

## `@i18n-micro/path-strategy/types`

Also exports, as `@i18n-micro/path-strategy` does: [`ClientRedirectOptions`](#clientredirectoptions) · [`PathStrategyContext`](#pathstrategycontext) · [`ResolvedRouteLike`](#resolvedroutelike) · [`RouteI18nMeta`](/api/packages/types#routei18nmeta) · [`RouteLike`](#routelike) · [`RouterAdapter`](#routeradapter) · [`RouteRecordLike`](#routerecordlike) · [`SwitchLocaleOptions`](#switchlocaleoptions).

---

Generated from the TypeScript sources and their JSDoc by `pnpm run docs:generate`.
Back to [all packages](/api/packages) · [Integration guides](/integrations/)
