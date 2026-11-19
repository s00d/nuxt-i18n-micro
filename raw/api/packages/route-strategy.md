# `@i18n-micro/route-strategy`

Locale-aware route generator for Nuxt i18n micro

```ts
import { … } from '@i18n-micro/route-strategy'
```

## Functions

### `generateRoutes`

```ts
function generateRoutes(
  pages: NuxtPage[],
  options: GenerateOptions,
  localizedPaths?: LocalizedPaths,
): NuxtPage[]
```

**See** [`GenerateOptions`](#generateoptions)

### `isLocaleAllowedForUnlocalizedRoute`

Whether `localeCode` may serve this path given `$defineI18nRoute` locales / routeLocales.
Unrestricted paths (and restrictions naming no known locale) allow every locale.

```ts
function isLocaleAllowedForUnlocalizedRoute(
  routeLocales: Record<string, string[]>,
  locales: Locale[],
  routePath: string,
  localeCode: string,
): boolean
```

**See** [`Locale`](/api/packages/test-utils#locale)

### `localeMatcherSource`

The pattern of a `customRegexMatcher`: `/re/` and `re` alike, and a `RegExp` loses its flags, as in the route and in `path-strategy`.

```ts
function localeMatcherSource(matcher: string | RegExp): string
```

### `localesOutsideMatcher`

The codes `matcher` cannot route. The whole code must match, without flags: what the router and `path-strategy` will do.

```ts
function localesOutsideMatcher(
  codes: readonly string[],
  matcher: string | RegExp,
): string[]
```

### `nameOfPath`

The name Nuxt's scanner would give the path: `/a/:id()` -> `a-id`.

```ts
function nameOfPath(fullPath: string): string
```

### `normalizePath`

`a//b/` -> `a/b`; `''` and `.` -> `''`.

```ts
function normalizePath(routePath: string): string
```

### `normalizeRouteKey`

File-path and Nuxt forms of a route path to the vue-router form rules are keyed and written in:
`[...slug]` -> `:slug(.*)*`, `[[page]]` -> `:page?`, `[id]` -> `:id`, `:id()` -> `:id`
(non-empty matchers such as `:id(\d+)` stay).

```ts
function normalizeRouteKey(key: string): string
```

### `pageNames`

Route names of the pages, nested ones included.

```ts
function pageNames(pages: NuxtPage[]): string[]
```

### `routeKey`

Lookup key of a route path or name: normalized, without the leading slash (`/` for the root).

```ts
function routeKey(routePathOrName: string): string
```

## Classes

### `RouteGenerator`

```ts
class RouteGenerator {
  constructor(options: RouteGeneratorOptions)
}
```

<collapsible name="10 members">
<field-group>
<field name="readonly locales" type="Locale[]">



</field>

<field name="readonly disabledLocales" type="Locale[]">

Locales switched off in the config: no routes, but the runtime must know them to answer 404.

</field>

<field name="readonly defaultLocale" type="Locale">



</field>

<field name="readonly strategy" type="Strategies">



</field>

<field name="readonly routeLocales" type="Record<string, string[]>">



</field>

<field name="extendPages" type="(pages: NuxtPage[]) => void">

Replaces `pages` (in place, as Nuxt's `pages:resolved` hook expects) with the localized routes.

</field>

<field name="resolveLocalizedPath" type="(originalPath: string, localeCode: string) => string">

URL of a page path in a locale (custom path and prefix applied), for nitro routeRules and
prerender: `/about` + `de` -> `/de/ueber-uns`. Paths the pages do not have (wildcards, API
routes) only get the prefix.

</field>

<field name="resolveLocalizedRulePaths" type="(originalPath: string, localeCode: string) => string[]">

Every URL pattern a route rule covers in a locale. A wildcard (`/blog/**`) also reaches the
pages under it that moved to a custom path, and only those: `/de/artikel/:slug` for `/artikel/[slug]`.

</field>

<field name="ensureTranslationFilesExist" type="(pagesNames: string[], translationDir: string, rootDir: string, disablePageLocales?: boolean) => void">

Creates the global and per-page translation JSON files that do not exist yet.

</field>

<field name="generateDataRoutes" type="(pages: NuxtPage[], apiBaseUrl: string, disablePageLocales: boolean) => string[]">

data.json routes to prerender: index per locale, plus one per named page unless disablePageLocales.

</field>
</field-group>
</collapsible>

**See** [`RouteGeneratorOptions`](#routegeneratoroptions)

### `Rules`

globalLocaleRoutes / $defineI18nRoute rules and routeLocales restrictions, keyed once by
routeKey so `about/team` and `/about/team` are looked up the same way everywhere. A page is
looked up by its full original path first (`about-team` / `/about-team` for a top-level page,
the form without the slash winning), then by its route name, which only keys written without a
leading slash can be.

```ts
class Rules {
  constructor(
    globalLocaleRoutes: GlobalLocaleRoutes = {},
    routeLocales: Record<string, string[]> = {},
    locales: Locale[] = [],
    routeDisableMeta: Record<string, NoMeta> = {},
  )
}
```

<field-group>
<field name="get" type="(fullPath: string, name: string | undefined) => Rule | undefined">



</field>

<field name="allowedLocales" type="(fullPath: string, name: string | undefined) => string[] | undefined">

Locales a page may be served in, or undefined when it is not restricted.

</field>

<field name="disableMeta" type="(fullPath: string, name: string | undefined) => NoMeta | undefined">

`$defineI18nRoute({ disableMeta })`: SEO tags off for the page (every locale, or the listed ones).

</field>

<field name="customKeysUnder" type="(base: string, locale: string) => string[]">

Keys of the pages at or under `base` (a route key) with a custom path in `locale`: where a wildcard rule's pages live.

</field>

<field name="customPath" type="(fullPath: string, locale: string) => string | undefined">

Custom path of a top-level path for a locale (nitro: prerender and routeRules).

</field>
</field-group>

**See** [`GlobalLocaleRoutes`](/api/packages/types#globallocaleroutes) · [`Locale`](/api/packages/test-utils#locale)

## Types

### `GenerateOptions`

```ts
interface GenerateOptions
```

<collapsible name="11 properties">
<field-group>
<field name="strategy" type="Strategies" :required="true">



</field>

<field name="locales" type="string[]" :required="true">



</field>

<field name="defaultLocale" type="string" :required="true">



</field>

<field name="rules" type="Rules" :required="true">



</field>

<field name="namePrefix" type="string" :required="true">



</field>

<field name="customRegex" type="string | RegExp">



</field>

<field name="excludePatterns" type="(string | RegExp)[]">



</field>

<field name="apiBaseUrl" type="string">



</field>

<field name="noPrefixRedirect" type="boolean" :required="true">



</field>

<field name="redirects" type="boolean">

`false`: no redirect records either, a page's original URL under `prefix` is a 404 like any unprefixed one.

</field>

<field name="hostDefaults" type="string[]">

Under prefix_except_default / prefix_and_default: locales that are the default of a domain in
the same build. They get unprefixed records too, and prefix_except_default keeps every prefix
(the default of one domain is a link target of the others, and the build default of an unknown host).

</field>
</field-group>
</collapsible>

### `RouteGeneratorOptions`

```ts
interface RouteGeneratorOptions
```

<collapsible name="13 properties">
<field-group>
<field name="locales" type="Locale[]" :required="true">



</field>

<field name="defaultLocaleCode" type="string" :required="true">



</field>

<field name="strategy" type="Strategies" :required="true">



</field>

<field name="globalLocaleRoutes" type="GlobalLocaleRoutes" :required="true">

Custom paths by page path or route name, `$defineI18nRoute` ones merged in (config wins).

</field>

<field name="routeLocales" type="Record<string, string[]>">



</field>

<field name="routeDisableMeta" type="Record<string, boolean | string[]>">

`$defineI18nRoute({ disableMeta })` by page path: baked into `meta.i18n.noMeta`.

</field>

<field name="noPrefixRedirect" type="boolean" :required="true">



</field>

<field name="redirects" type="boolean">

`redirects: false` of the module: no redirect records.

</field>

<field name="excludePatterns" type="(string | RegExp)[]">



</field>

<field name="apiBaseUrl" type="string">

The translations route (`_locales` by default): pages under it stay unlocalized.

</field>

<field name="localizedRouteNamePrefix" type="string">



</field>

<field name="customRegexMatcher" type="string | RegExp">



</field>

<field name="parentPaths" type="string[]">

Paths of the pages that nest others (`blog.vue` next to `blog/`): a relative custom value of a child hangs off them.

</field>
</field-group>
</collapsible>

## Re-exports

Declared in another package of this repository and documented on its page.

- From [`@i18n-micro/types`](/api/packages/types): [`RouteI18nMeta`](/api/packages/types#routei18nmeta)

---

Generated from the TypeScript sources and their JSDoc by `pnpm run docs:generate`.
Back to [all packages](/api/packages) · [Integration guides](/integrations/)
