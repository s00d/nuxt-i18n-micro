---
title: '@i18n-micro/utils'
description: 'Exported API of @i18n-micro/utils, generated from the source.'
navigation:
  title: 'utils'
---

# `@i18n-micro/utils`

Framework-agnostic utilities for Nuxt I18n Micro (granular subpath imports).

Entry points: `@i18n-micro/utils/accept-language`, `@i18n-micro/utils/active-locales`, `@i18n-micro/utils/app-path`, `@i18n-micro/utils/auto-detect-path`, `@i18n-micro/utils/cache-control`, `@i18n-micro/utils/cookie`, `@i18n-micro/utils/deep-merge`, `@i18n-micro/utils/domains`, `@i18n-micro/utils/load-dir`, `@i18n-micro/utils/locale-head`, `@i18n-micro/utils/merge-i18n-head`, `@i18n-micro/utils/merge-source`, `@i18n-micro/utils/normalize`, `@i18n-micro/utils/parse-path`, `@i18n-micro/utils/payload-fetch`, `@i18n-micro/utils/payload-url`, `@i18n-micro/utils/resolve-hreflang`, `@i18n-micro/utils/resolve-locale`, `@i18n-micro/utils/resolve-og-locale`, `@i18n-micro/utils/runtime-config`, `@i18n-micro/utils/source-loader`, `@i18n-micro/utils/split-locale-routes`.

## `@i18n-micro/utils/accept-language`

### Functions

#### `detectLocaleFromAcceptLanguage`

The config locale an `Accept-Language` header prefers, in `q` order; `*` matches nothing.

```ts
function detectLocaleFromAcceptLanguage(
  header: string | undefined,
  validLocales: readonly string[],
): string | null
```

#### `parseAcceptLanguage`

Language tags of an `Accept-Language` header, most preferred first (stable for equal `q`).
`_` becomes `-`; entries with `q=0` or a malformed `q` are dropped.

```ts
function parseAcceptLanguage(header: string | undefined): string[]
```

## `@i18n-micro/utils/active-locales`

### Functions

#### `getEnabledLocaleCodes`

```ts
function getEnabledLocaleCodes(locales?: Locale[] | null): string[]
```

**See** [`Locale`](/api/packages/test-utils#locale)

#### `getEnabledLocales`

```ts
function getEnabledLocales(locales?: Locale[] | null): Locale[]
```

**See** [`Locale`](/api/packages/test-utils#locale)

#### `isEnabledLocale`

```ts
function isEnabledLocale(locales: Locale[] | null | undefined, code: string): boolean
```

**See** [`Locale`](/api/packages/test-utils#locale)

## `@i18n-micro/utils/app-path`

### Functions

#### `forwardSlashes`

```ts
function forwardSlashes(path: string): string
```

#### `isInternalPath`

True for Nuxt/i18n internals, Content `__` routes, and static assets that must
skip locale detection / redirects. Lives in utils so client middleware can import
it without pulling `@nuxt/schema` (via route-strategy) into the browser bundle.
`apiBaseUrl` is the translations route (`_locales` by default).

```ts
function isInternalPath(
  path: string,
  excludePatterns?: (string | RegExp | object)[],
  apiBaseUrl?: string,
): boolean
```

#### `isStaticAssetPathname`

```ts
function isStaticAssetPathname(pathname: string): boolean
```

#### `resolveContainedRelPath`

Normalize a payload-relative path and reject any walk out of the payload root.
Callers must use the returned string (or skip the read when this returns `null`).

```ts
function resolveContainedRelPath(relPath: string): string | null
```

#### `trimLeadingSlashes`

```ts
function trimLeadingSlashes(path: string): string
```

#### `trimSlashes`

`path` without the slashes at either end.

```ts
function trimSlashes(path: string): string
```

#### `trimTrailingSlashes`

`path` without the slashes it ends in. A loop: `/\/+$/` retries at every slash of a run that stops short of the end, quadratic on a request URL.

```ts
function trimTrailingSlashes(path: string): string
```

#### `withoutAppBaseURL`

Strip Nuxt `app.baseURL` prefix from a request pathname.
`getRequestURL(event).pathname` includes baseURL; Vue Router paths do not.

```ts
function withoutAppBaseURL(pathname: string, baseURL?: string | null): string
```

## `@i18n-micro/utils/auto-detect-path`

### Functions

#### `shouldAttemptLocaleRedirect`

Whether cookie / Accept-Language preference may steer locale redirects (#242).

Modes (`ModuleOptions.autoDetectPath`):

- `'/'` (default) — only `/`
- `'no_prefix'` — any path without a locale prefix
- `'*'` — every path (also enables aggressive prefixed-URL rewrites in the plugin)
- any other string — that path, trailing slashes ignored

Does not gate strategy / `localeRoutes` canonicalization: when preference is denied on an
unprefixed path, the plugin still runs `getClientRedirect` with the default locale.

```ts
function shouldAttemptLocaleRedirect(
  path: string,
  options?: { autoDetectPath?: string; hasLocalePrefix?: boolean; },
): boolean
```

## `@i18n-micro/utils/cache-control`

### Classes

#### `CacheControl`

```ts
class CacheControl<T> {
  constructor(options?: CacheControlOptions)
}
```

::field-group
:::field
---
name: "configure"
type: "(options: CacheControlOptions) => void"
---
Update limits at runtime. Last call wins, and the same limits again cost nothing: the server calls this per request.
A smaller size applies at once. A TTL applies to what is stored from then on and to entries that have none;
an entry that already expires keeps its time, and no TTL clears them all.
:::
:::field
---
name: "get"
type: "(key: string) => T | undefined"
---

:::
:::field
---
name: "has"
type: "(key: string) => boolean"
---

:::
:::field
---
name: "set"
type: "(key: string, value: T) => void"
---

:::
:::field
---
name: "delete"
type: "(key: string) => boolean"
---

:::
:::field
---
name: "clear"
type: "() => void"
---

:::
:::field
---
name: "keys"
type: "() => IterableIterator<string>"
---

:::
:::field
---
name: "size"
type: "number"
---

:::
::

**See** [`CacheControlOptions`](#cachecontroloptions)

### Types

#### `CacheControlOptions`

CacheControl — O(1) LRU cache with an optional TTL.

TTL counts from when an entry was stored, not from its last read: a hot entry still expires,
so data behind it (a remote `apiBaseServerHost`) is refreshed at least every `ttl` seconds.

Map is created internally — no external references, no desync risk.

Performance:
  get  — O(1) (lazy TTL check + LRU reorder via Map delete/set)
  set  — O(1) (LRU eviction via Map.keys().next())
  has  — O(1) (lazy TTL eviction)

Eviction: LRU (Least Recently Used) based on native Map insertion order.

```ts
interface CacheControlOptions
```

::field-group
:::field
---
name: "maxSize"
type: "number"
---

:::
:::field
---
name: "ttl"
type: "number"
---
TTL in seconds (0 = no expiration)
:::
::

## `@i18n-micro/utils/cookie`

### Functions

#### `decodeCookieValue`

A cookie value, or null when it is not valid percent-encoding (a malformed cookie is absent).

```ts
function decodeCookieValue(value: string): string | null
```

#### `getHashCookieName`

Returns hash cookie name when hashMode is enabled.
Returns null when hashMode is false.

```ts
function getHashCookieName(config: ModuleOptionsExtend): string | null
```

**See** [`ModuleOptionsExtend`](/api/packages/types#moduleoptionsextend)

#### `getLocaleCookieName`

Returns cookie name from config.
If localeCookie === null, returns null (cookies disabled).

```ts
function getLocaleCookieName(config: ModuleOptionsExtend): string | null
```

**See** [`ModuleOptionsExtend`](/api/packages/types#moduleoptionsextend)

#### `getLocaleCookieOptions`

Returns options for locale/hash cookies: `localeCookieOptions` over the defaults. `decode` keeps a
malformed cookie from throwing in Nuxt's `useCookie`, and hands it back as it came: a value that
changed would be written at the end of the request, and that delete would replace the locale a page just stored.

```ts
function getLocaleCookieOptions(options?: LocaleCookieOptions): { … }
```

::field-group
:::field
---
name: "expires"
type: "Date"
required: true
---

:::
:::field
---
name: "maxAge"
type: "number"
required: true
---

:::
:::field
---
name: "path"
type: "string"
required: true
---

:::
:::field
---
name: "watch"
type: "boolean"
required: true
---

:::
:::field
---
name: "sameSite"
type: "\"lax\" | \"strict\" | \"none\""
required: true
---

:::
:::field
---
name: "domain"
type: "string | undefined"
required: true
---

:::
:::field
---
name: "secure"
type: "boolean | undefined"
required: true
---

:::
:::field
---
name: "decode"
type: "(value: string) => string"
required: true
---

:::
::

**See** [`LocaleCookieOptions`](/api/packages/types#localecookieoptions)

#### `getPreferenceCookieName`

The cookie that holds the visitor's locale preference: the hash cookie under hashMode, else the
locale cookie. Server and client read the same one.

```ts
function getPreferenceCookieName(config: ModuleOptionsExtend): string | null
```

**See** [`ModuleOptionsExtend`](/api/packages/types#moduleoptionsextend)

### Constants

#### `DEFAULT_COOKIE_MAX_AGE`

```ts
const DEFAULT_COOKIE_MAX_AGE: number
```

#### `DEFAULT_COOKIE_NAME`

```ts
const DEFAULT_COOKIE_NAME: "user-locale"
```

#### `DEFAULT_HASH_COOKIE_NAME`

```ts
const DEFAULT_HASH_COOKIE_NAME: "hash-locale"
```

## `@i18n-micro/utils/deep-merge`

### Functions

#### `deepMergeTranslationsRecursive`

Deep merge of two translation trees: nested objects merge at any depth, everything else
(arrays, scalars, null) replaces.

```ts
function deepMergeTranslationsRecursive(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown>
```

## `@i18n-micro/utils/domains`

### Functions

#### `configForHost`

`config` as `host` sees it: its default, its locales, its origin. Any other host gets `config`
itself and nothing of the request is kept or echoed: the table holds configured hosts only, one
per resolved config. A runtime config is never written to, so its table cannot go stale; the build
writes one field of its own config late (`dateBuild`, at modules:done), and no build-time caller of
a host config reads it.

```ts
function configForHost<T extends ModuleOptionsExtend>(config: T, host: string): T
```

**See** [`ModuleOptionsExtend`](/api/packages/types#moduleoptionsextend)

#### `withHostDefaults`

`locales` with `baseDefault` on the default of every host, whether the config named it or not.

```ts
function withHostDefaults(locales: Locale[], defaultLocale: string): Locale[]
```

**See** [`Locale`](/api/packages/test-utils#locale)

## `@i18n-micro/utils/load-dir`

### Functions

#### `additionalTranslationRoots`

The folders of `additionalTranslationDirs`, in merge order: each entry in turn, a relative one in
every root (`rootDirs` order), an absolute one (a module's own folder) once. A folder named twice is read once.

```ts
function additionalTranslationRoots(
  rootDirs: string[],
  dirs?: readonly string[],
): string[]
```

#### `isInsideDir`

Whether `file` lies under `dir`, on any platform: `locales-old` is no part of `locales`.

```ts
function isInsideDir(file: string, dir: string): boolean
```

#### `listTranslationFiles`

Every `*.json` under `dir`, sorted by relative path so a read does not depend on the file system's order.

```ts
function listTranslationFiles(directory: string): TranslationFile[]
```

**See** [`TranslationFile`](#translationfile)

#### `loadTranslationDir`

Reads `dir` into root and route buckets.

```ts
function loadTranslationDir<T extends Dictionary = Dictionary>(
  dir: string,
  disablePageLocales?: boolean,
): TranslationFileBuckets<T>
```

**See** [`TranslationFileBuckets`](#translationfilebuckets)

#### `loadTranslationDirAsync`

`loadTranslationDir` for a running server: file contents are read without blocking it.

```ts
function loadTranslationDirAsync<T extends Dictionary = Dictionary>(
  dir: string,
  disablePageLocales?: boolean,
): Promise<TranslationFileBuckets<T>>
```

**See** [`TranslationFileBuckets`](#translationfilebuckets)

#### `loadTranslationFiles`

Reads listed files into root and route buckets.

```ts
function loadTranslationFiles<T extends Dictionary = Dictionary>(
  files: TranslationFile[],
  disablePageLocales?: boolean,
): TranslationFileBuckets<T>
```

**See** [`TranslationFile`](#translationfile) · [`TranslationFileBuckets`](#translationfilebuckets)

#### `parseJsonFile`

`JSON.parse` of a file's text. A BOM from an editor is fine.

```ts
function parseJsonFile(text: string): unknown
```

#### `parseTranslationFile`

The dictionary in a file's text, `null` (reported) when it is not a JSON object.

```ts
function parseTranslationFile(text: string, path: string): Dictionary | null
```

#### `resolveTranslationFile`

The real path of an existing regular `.json` file `file`, relative to `base`, or null when it is missing or
leaves `base`: by `../`, an absolute path or a symlink (both sides are resolved to real paths).

```ts
function resolveTranslationFile(base: string, file: string): string | null
```

### Types

#### `TranslationFile`

The one reader of a locales directory. Node only: never import it from a browser or edge entry.
Every adapter that reads the disk (node, astro, vitepress, devtools, types) agrees on what a
file is: any `*.json` under the directory, symlinks followed; broken and non-object files are
reported and skipped; a missing directory warns and reads as empty.

```ts
interface TranslationFile
```

::field-group
:::field
---
name: "relativePath"
type: "string"
required: true
---
`/`-separated, relative to the directory: what `parseTranslationRelativePath` takes.
:::
:::field
---
name: "absolutePath"
type: "string"
required: true
---

:::
::

## `@i18n-micro/utils/locale-head`

### Functions

#### `buildLocaleHead`

The SEO head of a page: `lang`/`dir`, canonical, `hreflang`, `x-default` and the `og:` tags.
Pure: every adapter says what its router knows and all of them emit the same tags.

```ts
function buildLocaleHead(input: LocaleHeadInput): LocaleHead
```

**See** [`LocaleHeadInput`](#localeheadinput) · [`LocaleHead`](#localehead)

#### `filterQuery`

Keeps the `whitelist` query params of a path or URL and drops its hash.

```ts
function filterQuery(url: string, whitelist: readonly string[]): string
```

#### `joinBase`

`base` + `path` with one slash between them: `'/'` + `/de` or `//de` is `/de`, never the protocol-relative
`//de`. A browser reads `\` as `/` and drops a tab or a newline, so `/\host` is that form as well.

```ts
function joinBase(base: string, path: string): string
```

#### `queryString`

`?a=1&a=2` of a route's query: arrays repeat the key, `null` is a key with no value, `undefined` is left out.

```ts
function queryString(query?: object | null): string
```

### Types

#### `LocaleHead`

```ts
interface LocaleHead
```

::field-group
:::field
---
name: "htmlAttrs"
type: "LocaleHeadAttrs"
required: true
---

:::
:::field
---
name: "link"
type: "LocaleHeadLink[]"
required: true
---

:::
:::field
---
name: "meta"
type: "LocaleHeadMeta[]"
required: true
---

:::
::

#### `LocaleHeadAlternateLink`

```ts
interface LocaleHeadAlternateLink
```

::field-group
:::field
---
name: "[key: string]"
type: "string | undefined"
---

:::
:::field
---
name: "rel"
type: "'alternate'"
required: true
---

:::
:::field
---
name: "href"
type: "string"
required: true
---

:::
:::field
---
name: "hreflang"
type: "string"
required: true
---

:::
::

#### `LocaleHeadAttrs`

```ts
interface LocaleHeadAttrs
```

::field-group
:::field
---
name: "[key: string]"
type: "string | undefined"
---

:::
:::field
---
name: "lang"
type: "string"
---

:::
:::field
---
name: "dir"
type: "'ltr' | 'rtl' | 'auto'"
---

:::
::

#### `LocaleHeadCanonicalLink`

```ts
interface LocaleHeadCanonicalLink
```

::field-group
:::field
---
name: "[key: string]"
type: "string | undefined"
---

:::
:::field
---
name: "rel"
type: "'canonical'"
required: true
---

:::
:::field
---
name: "href"
type: "string"
required: true
---

:::
::

#### `LocaleHeadInput`

```ts
interface LocaleHeadInput
```

::collapsible{name="11 properties"}
:::field-group
::::field
---
name: "locale"
type: "Locale"
required: true
---
The current locale.
::::
::::field
---
name: "seoLocales"
type: "Locale[]"
required: true
---
Locales listed in `hreflang` and `og:locale:alternate`. Their filtering is the caller's: it alone knows the page.
::::
::::field
---
name: "hrefOf"
type: "(code: string) => string"
required: true
---
URL of the page in `code`, `''` for none.
::::
::::field
---
name: "canonical"
type: "string"
required: true
---
`canonical` and `og:url`.
::::
::::field
---
name: "xDefault"
type: "string"
---
The `x-default` URL, when the page has one.
::::
::::field
---
name: "alternates"
type: "boolean"
---
`false` for one URL per page (`no_prefix`): `og:locale:alternate` stays, `hreflang` and `x-default` go.
::::
::::field
---
name: "addDirAttribute"
type: "boolean"
---

::::
::::field
---
name: "addSeoAttributes"
type: "boolean"
---
`false` keeps `htmlAttrs` only.
::::
::::field
---
name: "identifierAttribute"
type: "string"
---

::::
::::field
---
name: "hreflangBaseLanguage"
type: "boolean"
---

::::
::::field
---
name: "missingWarn"
type: "boolean"
---

::::
:::
::

#### `LocaleHeadLink`

One type per `rel`, as in unhead: its `useHead` takes no link with a plain `rel: string`.

```ts
type LocaleHeadLink = LocaleHeadCanonicalLink | LocaleHeadAlternateLink
```

**See** [`LocaleHeadCanonicalLink`](#localeheadcanonicallink) · [`LocaleHeadAlternateLink`](#localeheadalternatelink)

#### `LocaleHeadMeta`

```ts
interface LocaleHeadMeta
```

::field-group
:::field
---
name: "[key: string]"
type: "string"
---

:::
:::field
---
name: "property"
type: "string"
required: true
---

:::
:::field
---
name: "content"
type: "string"
required: true
---

:::
::

## `@i18n-micro/utils/merge-i18n-head`

### Functions

#### `mergeI18nHead`

```ts
function mergeI18nHead(
  base: I18nHeadObject,
  override: I18nHeadInput | null | undefined,
  options?: MergeI18nHeadOptions,
): I18nHeadObject
```

**See** [`I18nHeadObject`](#i18nheadobject) · [`I18nHeadInput`](/api/packages/types#i18nheadinput) · [`MergeI18nHeadOptions`](#mergei18nheadoptions)

### Types

#### `I18nHeadObject`

```ts
interface I18nHeadObject
```

::field-group
:::field
---
name: "htmlAttrs"
type: "Record<string, string | undefined>"
required: true
---

:::
:::field
---
name: "meta"
type: "I18nHeadMeta[]"
required: true
---

:::
:::field
---
name: "link"
type: "I18nHeadLink[]"
required: true
---

:::
::

#### `MergeI18nHeadOptions`

```ts
interface MergeI18nHeadOptions
```

::field-group
:::field
---
name: "identifierAttribute"
type: "string"
---

:::
:::field
---
name: "locales"
type: "Locale[]"
---

:::
:::field
---
name: "currentLocale"
type: "string"
---

:::
::

## `@i18n-micro/utils/merge-source`

### Functions

#### `buildFallbackLocaleChain`

Locales whose files make up `locale`, weakest first: the global fallback, then each
`fallbackLocale` link followed to its end (fr → de → en is `[en, de, fr]`), then the locale.

```ts
function buildFallbackLocaleChain(
  locale: string,
  locales: SourceLocaleInfo[],
  globalFallbackLocale?: string,
): string[]
```

**See** [`SourceLocaleInfo`](#sourcelocaleinfo)

#### `buildSourcePagePath`

```ts
function buildSourcePagePath(pageName: string, localeCode: string): string
```

#### `buildSourceRootPath`

```ts
function buildSourceRootPath(localeCode: string): string
```

#### `mergeOverRoot`

A page's tree from its root and its delta, as a deep merge makes it: objects merge, anything else replaces. Only the
nodes on the delta's paths are new, the rest is the root's, and the delta is taken as it is: a parsed file has no other
owner, and copying a large one costs what parsing it did. A stored tree is never written to.

```ts
function mergeOverRoot(
  root: Record<string, unknown>,
  delta: Record<string, unknown>,
): Record<string, unknown>
```

#### `mergeSourceTranslations`

```ts
function mergeSourceTranslations(
  input: MergeSourceTranslationsInput,
): Promise<Record<string, unknown>>
```

**See** [`MergeSourceTranslationsInput`](#mergesourcetranslationsinput)

#### `mergeTranslationsFromFallbackChainAsync`

```ts
function mergeTranslationsFromFallbackChainAsync(
  chain: string[],
  readLocaleFile: (relativePath: string) => Record<string, unknown> | Promise<Record<string, unknown>>,
  relativePathForLocale: (localeCode: string) => string,
): Promise<Record<string, unknown>>
```

#### `normalizeConfiguredLocales`

```ts
function normalizeConfiguredLocales(
  locales: Array<string | Locale> | undefined,
): SourceLocaleInfo[]
```

**See** [`Locale`](/api/packages/test-utils#locale) · [`SourceLocaleInfo`](#sourcelocaleinfo)

#### `resolveSourcePageName`

```ts
function resolveSourcePageName(pageName: string, disablePageLocales?: boolean): string
```

#### `toPremergedStorageKey`

```ts
function toPremergedStorageKey(pageName: string, locale: string): string
```

#### `toSourceStorageKey`

Storage key relative to the Nitro unstorage mount (fs-friendly `/` paths).

```ts
function toSourceStorageKey(relativePath: string): string
```

### Constants

#### `PREMERGED_ROOT_MARK`

Own key of a premerged file: the root file's content hash, in the root and in every delta made against it.
A file without it is a whole chunk (dev, `source`, the server route, a host's older files) and stands alone.

```ts
const PREMERGED_ROOT_MARK: "__i18n_root"
```

#### `PREMERGED_ROOT_PAGE`

Premerged payload of the root dictionary alone (with fallbacks): what a page without its own
`pages/<name>/` folder shows, instead of an empty dictionary.

```ts
const PREMERGED_ROOT_PAGE: "__root"
```

### Types

#### `MergeSourceTranslationsInput`

```ts
interface MergeSourceTranslationsInput
```

::field-group
:::field
---
name: "locale"
type: "string"
required: true
---

:::
:::field
---
name: "pageName"
type: "string"
required: true
---

:::
:::field
---
name: "locales"
type: "SourceLocaleInfo[]"
required: true
---

:::
:::field
---
name: "globalFallbackLocale"
type: "string"
---

:::
:::field
---
name: "disablePageLocales"
type: "boolean"
---

:::
:::field
---
name: "readLocaleFile"
type: "(relativePath: string) => Record<string, unknown> | Promise<Record<string, unknown>>"
required: true
---

:::
:::field
---
name: "linkedMessages"
type: "boolean"
---
Resolve `@:key` links in the merged chunk (`linkedMessages`).
:::
:::field
---
name: "warn"
type: "(message: string) => void"
---
A link left as written (missing key, cycle, unknown modifier).
:::
::

#### `SourceLocaleInfo`

```ts
interface SourceLocaleInfo
```

::field-group
:::field
---
name: "code"
type: "string"
required: true
---

:::
:::field
---
name: "fallbackLocale"
type: "string"
---

:::
:::field
---
name: "iso"
type: "string"
---
BCP 47 tag of the locale: the case modifiers of linked messages go by it.
:::
::

## `@i18n-micro/utils/normalize`

### Functions

#### `toTranslationRecord`

Normalize unknown payloads into a mutable record (source loader).

```ts
function toTranslationRecord(data: unknown): Record<string, unknown>
```

#### `toTranslations`

Normalize unknown fetch/storage payloads into a plain translation object.
Unstorage already runs `destr` on JSON files — strings are not expected here.

```ts
function toTranslations(data: unknown): Translations
```

**See** [`Translations`](/api/packages/types#translations)

## `@i18n-micro/utils/parse-path`

### Functions

#### `classifyTranslationRelativePath`

Classify a translation path, optionally treating page files as root-level translations.

```ts
function classifyTranslationRelativePath(
  relativePath: string,
  disablePageLocales?: boolean,
): ParsedTranslationRelativePath
```

**See** [`ParsedTranslationRelativePath`](#parsedtranslationrelativepath)

#### `pagePathSegmentsToRouteName`

Convert nested page path segments to a route name (e.g. `user/profile` → `user-profile`).

```ts
function pagePathSegmentsToRouteName(segments: string[]): string | null
```

#### `parseTranslationRelativePath`

Parse a translation file path relative to the locales root.
Examples: `en.json`, `pages/about/en.json`, `pages/user/profile/en.json`
A `__proto__` page or locale is ignored: as a bucket key it would write the prototype.

```ts
function parseTranslationRelativePath(
  relativePath: string,
): ParsedTranslationRelativePath
```

**See** [`ParsedTranslationRelativePath`](#parsedtranslationrelativepath)

#### `storeLoadedTranslationFile`

Store a loaded translation file in root or route buckets based on its relative path.

```ts
function storeLoadedTranslationFile<T extends Record<string, unknown>>(
  buckets: TranslationFileBuckets<T>,
  relativePath: string,
  translations: T,
  disablePageLocales?: boolean,
): void
```

**See** [`TranslationFileBuckets`](#translationfilebuckets)

### Types

#### `ParsedTranslationRelativePath`

```ts
type ParsedTranslationRelativePath = {
  type: 'page';
  pageName: string;
  locale: string;
} | {
  type: 'root';
  locale: string;
} | {
  type: 'ignore';
}
```

#### `TranslationFileBuckets`

```ts
interface TranslationFileBuckets<T = Record<string, unknown>>
```

::field-group
:::field
---
name: "root"
type: "Record<string, T>"
required: true
---

:::
:::field
---
name: "routes"
type: "Record<string, Record<string, T>>"
required: true
---

:::
::

## `@i18n-micro/utils/payload-fetch`

### Functions

#### `fetchTranslationPayloadFromHost`

```ts
function fetchTranslationPayloadFromHost(
  config: TranslationPayloadHostConfig,
  locale: string,
  page: string,
  fetcher: TranslationPayloadFetcher,
): Promise<Translations | null>
```

**See** [`TranslationPayloadHostConfig`](#translationpayloadhostconfig) · [`TranslationPayloadFetcher`](#translationpayloadfetcher) · [`Translations`](/api/packages/types#translations)

### Types

#### `TranslationPayloadFetcher`

```ts
type TranslationPayloadFetcher = <T>(path: string, options: {
  baseURL: string;
  params?: Record<string, string | number>;
  cache?: RequestCache;
  timeout?: number;
}) => Promise<T>
```

#### `TranslationPayloadHostConfig`

```ts
interface TranslationPayloadHostConfig
```

::field-group
:::field
---
name: "apiBaseUrl"
type: "string"
---

:::
:::field
---
name: "apiBaseServerHost"
type: "string"
---

:::
:::field
---
name: "dateBuild"
type: "string | number"
---

:::
::

## `@i18n-micro/utils/payload-url`

### Functions

#### `buildTranslationPayloadCacheControl`

Builds `Cache-Control` for `/{apiBaseUrl}/:page/:locale/data.json`.

`immutable` is only emitted when a cache-buster is active (`hasCacheBuster`),
i.e. requests carry `?v=<dateBuild>`. Without a cache-buster (`dateBuild` set
to `0`/`''`) the URL is stable across deploys, so we intentionally avoid
long-lived caching by returning a conservative `max-age=0` policy.

Returns `null` when caching should be skipped — non-positive or non-finite
`duration` (guards `NaN`/`Infinity` from producing a malformed header).

```ts
function buildTranslationPayloadCacheControl(
  durationSeconds: number | undefined,
  hasCacheBuster?: boolean,
): string | null
```

#### `buildTranslationPayloadFetchRequest`

```ts
function buildTranslationPayloadFetchRequest(
  input: TranslationPayloadFetchRequestInput,
): { path: string; baseURL: string; params?: Record<string, string | number>; }
```

**See** [`TranslationPayloadFetchRequestInput`](#translationpayloadfetchrequestinput)

#### `buildTranslationPayloadPath`

```ts
function buildTranslationPayloadPath(
  apiBaseUrl: string,
  page: string,
  locale: string,
): string
```

#### `resolveTranslationPayloadBaseURL`

```ts
function resolveTranslationPayloadBaseURL(
  options: {
    isServer: boolean;
    baseURL: string;
    apiBaseClientHost?: string;
    apiBaseServerHost?: string;
  },
): string
```

#### `resolveTranslationPayloadCachePolicy`

The URL with the current `v` is the version-pinned one, like a hashed asset. `private`: a CDN that ignores the query
must not answer the next `v` from this response, and pin an old dictionary in a browser for a year.
An old `v` stays servable, as cached HTML still names it, and revalidates. A file header is path-wide, so it stays short.

```ts
function resolveTranslationPayloadCachePolicy(
  input: TranslationPayloadCacheInput,
): TranslationPayloadCachePolicy
```

**See** [`TranslationPayloadCacheInput`](#translationpayloadcacheinput) · [`TranslationPayloadCachePolicy`](#translationpayloadcachepolicy)

#### `resolveTranslationPayloadPage`

```ts
function resolveTranslationPayloadPage(
  routeName: string | undefined,
  routesLocaleLinks?: Record<string, string>,
): string
```

### Constants

#### `TRANSLATION_PAYLOAD_FILE_CACHE_CONTROL`

What a path-wide header can promise: it cannot see `?v=`, so a host's copy stays short.
No `stale-while-revalidate`: past `max-age`, which a CDN's `Age` reaches on a first visit, Chromium revalidates a fetch() or a
preload of this file with a loader that never reads the body, so that request is never reported finished and `networkidle` never comes.

```ts
const TRANSLATION_PAYLOAD_FILE_CACHE_CONTROL: "public, max-age=60"
```

### Types

#### `TranslationPayloadCacheInput`

```ts
interface TranslationPayloadCacheInput
```

::field-group
:::field
---
name: "httpCacheDuration"
type: "number"
---

:::
:::field
---
name: "httpCacheControl"
type: "string | false"
---
The header of a file a host answers. `false`: the policy from before `?v=` decided it: revalidate every file.
:::
:::field
---
name: "dateBuild"
type: "string | number"
---

:::
:::field
---
name: "live"
type: "boolean"
---
The dictionary can change with no build (`source`, `cacheTtl`, a payload host): `v` does not follow it, so nothing is pinned.
:::
::

#### `TranslationPayloadCachePolicy`

```ts
interface TranslationPayloadCachePolicy
```

::field-group
:::field
---
name: "file"
type: "string | null"
required: true
---
Path-wide: the route rule, and with it `_headers` and a host's config.
:::
:::field
---
name: "current"
type: "string | null"
required: true
---
A response to the current `?v=`, where something sees the query.
:::
:::field
---
name: "stale"
type: "string | null"
required: true
---
A response to an old `?v=`, or none.
:::
::

#### `TranslationPayloadFetchRequestInput`

```ts
interface TranslationPayloadFetchRequestInput
```

::collapsible{name="9 properties"}
:::field-group
::::field
---
name: "apiBaseUrl"
type: "string"
required: true
---

::::
::::field
---
name: "routeName"
type: "string"
---

::::
::::field
---
name: "locale"
type: "string"
required: true
---

::::
::::field
---
name: "isServer"
type: "boolean"
required: true
---

::::
::::field
---
name: "baseURL"
type: "string"
required: true
---

::::
::::field
---
name: "apiBaseClientHost"
type: "string"
---

::::
::::field
---
name: "apiBaseServerHost"
type: "string"
---

::::
::::field
---
name: "dateBuild"
type: "string | number"
---

::::
::::field
---
name: "routesLocaleLinks"
type: "Record<string, string>"
---

::::
:::
::

## `@i18n-micro/utils/resolve-hreflang`

### Functions

#### `resolveHreflangAlternates`

Resolve `hreflang` values for SEO alternate links.
Uses `iso || code` — never emits routing `code` when `iso` is set (#243).

```ts
function resolveHreflangAlternates(
  locales: HreflangLocaleInput[],
  options?: ResolveHreflangAlternatesOptions,
): HreflangAlternate[]
```

**See** [`HreflangLocaleInput`](#hreflanglocaleinput) · [`ResolveHreflangAlternatesOptions`](#resolvehreflangalternatesoptions) · [`HreflangAlternate`](#hreflangalternate)

### Types

#### `HreflangAlternate`

```ts
interface HreflangAlternate
```

::field-group
:::field
---
name: "hreflang"
type: "string"
required: true
---
Value for the `hreflang` attribute (BCP-47 / `iso || code`).
:::
:::field
---
name: "localeCode"
type: "string"
required: true
---
Locale `code` whose localized URL should back this tag.
:::
::

#### `HreflangLocaleInput`

```ts
type HreflangLocaleInput = Pick<Locale, 'code' | 'iso'>
```

**See** [`Locale`](/api/packages/test-utils#locale)

#### `ResolveHreflangAlternatesOptions`

```ts
interface ResolveHreflangAlternatesOptions
```

::field-group
:::field
---
name: "hreflangBaseLanguage"
type: "boolean"
---
**Default** `false` · Also emit a bare-language `hreflang` derived from `iso` (e.g. `es-ES` → `es`),
claimed by the first regional locale in the list for that language.
Never derived from routing `code`.
:::
::

## `@i18n-micro/utils/resolve-locale`

### Functions

#### `explicitLocale`

The first valid explicit source: url → query (query → url with `queryFirst`) → state → cookie;
null when none is valid. An invalid value never hides a valid one after it.

```ts
function explicitLocale(input: Omit<ResolveLocaleInput, 'defaultLocale'>): string | null
```

**See** [`ResolveLocaleInput`](#resolvelocaleinput)

#### `firstQueryValue`

A query value as one locale candidate: `?locale=a&locale=b` is `a`.

```ts
function firstQueryValue(value: unknown): string | null
```

#### `localeFromPath`

Locale code in the first path segment, or null.

```ts
function localeFromPath(path: string, validLocales: readonly string[]): string | null
```

#### `preferenceCounts`

Whether cookie, state and Accept-Language decide this URL's redirect.

```ts
function preferenceCounts(
  input: Pick<RedirectLocaleInput, 'path' | 'urlLocale' | 'autoDetectPath' | 'alwaysPrefixed'>,
): boolean
```

**See** [`RedirectLocaleInput`](#redirectlocaleinput)

#### `redirectLocale`

The locale a locale redirect aims at: `resolveLocale` over state → cookie → Accept-Language
wherever `autoDetectPath` lets preference count (`'*'`: every path), and on every unprefixed URL
under `prefix`. Elsewhere an unprefixed URL keeps the default locale, so it still canonicalizes
(`localeRoutes` aliases). The URL is not a source here: it is what the redirect may move.

```ts
function redirectLocale(input: RedirectLocaleInput): string
```

**See** [`RedirectLocaleInput`](#redirectlocaleinput)

#### `resolveLocale`

The one precedence: `explicitLocale`, then Accept-Language (only with `autoDetectLanguage` and
no explicit source), then the default.

```ts
function resolveLocale(input: ResolveLocaleInput): string
```

**See** [`ResolveLocaleInput`](#resolvelocaleinput)

### Types

#### `RedirectLocaleInput`

```ts
interface RedirectLocaleInput extends Omit<ResolveLocaleInput, 'url' | 'query' | 'queryFirst'>
```

::field-group
:::field
---
name: "path"
type: "string"
required: true
---

:::
:::field
---
name: "urlLocale"
type: "string | null"
required: true
---
Locale prefix of `path`, or null.
:::
:::field
---
name: "autoDetectPath"
type: "string"
---
`ModuleOptions.autoDetectPath` (default `'/'`).
:::
:::field
---
name: "alwaysPrefixed"
type: "boolean"
---
`prefix`: no page has an unprefixed URL, so such a URL always takes the preference.
:::
::

**See** [`ResolveLocaleInput`](#resolvelocaleinput)

#### `ResolveLocaleInput`

Every source a caller may have for the locale of a request or navigation. A caller passes only
the sources it has (and is allowed to use); the order between them lives here only.

```ts
interface ResolveLocaleInput
```

::collapsible{name="9 properties"}
:::field-group
::::field
---
name: "defaultLocale"
type: "string"
required: true
---

::::
::::field
---
name: "validLocales"
type: "readonly string[]"
required: true
---

::::
::::field
---
name: "autoDetectLanguage"
type: "boolean"
---

::::
::::field
---
name: "url"
type: "string | null"
---
Locale prefix of the URL, as the routing strategy reads it.
::::
::::field
---
name: "query"
type: "string | null"
---
`?locale=` — only where the caller honours it (no_prefix pages, server API helpers).
::::
::::field
---
name: "state"
type: "string | null"
---
A locale the app chose (`useState('i18n-locale')`).
::::
::::field
---
name: "cookie"
type: "string | null"
---

::::
::::field
---
name: "acceptLanguage"
type: "string | null"
---

::::
::::field
---
name: "queryFirst"
type: "boolean"
---
`?locale=` before the URL: the documented order of the server API helpers.
::::
:::
::

## `@i18n-micro/utils/resolve-og-locale`

### Functions

#### `resolveOgLocale`

Resolve Open Graph locale (`language_TERRITORY`, underscore) for `og:locale` meta tags.
Returns null when the value cannot be determined safely — no tag should be emitted.

```ts
function resolveOgLocale(locale: OgLocaleInput): string | null
```

#### `warnUnresolvedOgLocale`

Log a dev-only hint when `og:locale` / `og:locale:alternate` cannot be derived.

```ts
function warnUnresolvedOgLocale(
  locale: OgLocaleInput,
  options?: WarnUnresolvedOgLocaleOptions,
): void
```

**See** [`WarnUnresolvedOgLocaleOptions`](#warnunresolvedoglocaleoptions)

### Types

#### `WarnUnresolvedOgLocaleOptions`

```ts
interface WarnUnresolvedOgLocaleOptions
```

::field-group
:::field
---
name: "missingWarn"
type: "boolean"
---
When false, suppresses the warning (same flag as missing translation keys).
:::
:::field
---
name: "tag"
type: "'og:locale' | 'og:locale:alternate'"
---

:::
::

## `@i18n-micro/utils/runtime-config`

### Functions

#### `applyI18nRuntimeOverrides`

The build config with runtime overrides applied. Runtime `disabledLocales` add to the
build-time disabled ones (a locale disabled at build has no payloads to re-enable);
`defaultLocale` and `fallbackLocale` must be enabled. No env reads: see `readI18nEnvOverrides`.
When nothing changes, the build config itself is returned (a disabled build default is still replaced).

```ts
function applyI18nRuntimeOverrides<T extends ModuleOptionsExtend>(
  baseConfig: T,
  requested: RuntimeI18nOverrides,
  warn?: (message: string) => void,
): T
```

**See** [`ModuleOptionsExtend`](/api/packages/types#moduleoptionsextend) · [`RuntimeI18nOverrides`](#runtimei18noverrides)

#### `applyLocaleBaseUrls`

`config` with the runtime `locales[].baseUrl`s, after `applyI18nRuntimeOverrides`. A build without
locale domains has no routing for them (the path strategy is chosen at build): ignored there, like
`strategy`. Apart, so that a browser bundle without domains drops it. `metaBaseUrl` stays: who moves the
default locale's domain sets `NUXT_I18N_META_BASE_URL` too.

```ts
function applyLocaleBaseUrls<T extends ModuleOptionsExtend>(
  config: T,
  overrides: RuntimeI18nOverrides,
  warn?: (message: string) => void,
): T
```

**See** [`ModuleOptionsExtend`](/api/packages/types#moduleoptionsextend) · [`RuntimeI18nOverrides`](#runtimei18noverrides)

#### `createI18nConfigResolver`

`applyI18nRuntimeOverrides` with `runtimeConfig.public.i18nRuntime` first, then env vars, memoized
for one process: env is read once, and the same config object answers while the base config and the overrides are unchanged (so warnings
are logged once). That object is shared by every request: in dev it is deep-frozen, so a
mutation throws instead of leaking into later requests.

```ts
function createI18nConfigResolver(
  warn?: (message: string) => void,
): <T extends ModuleOptionsExtend>(baseConfig: T, runtimePublic?: Record<string, unknown>) => T
```

**See** [`ModuleOptionsExtend`](/api/packages/types#moduleoptionsextend)

#### `i18nOverridesKey`

A stable string of the overrides: equal strings resolve to equal configs.

```ts
function i18nOverridesKey(overrides: RuntimeI18nOverrides): string
```

**See** [`RuntimeI18nOverrides`](#runtimei18noverrides)

#### `mergeI18nOverrides`

`primary`'s values, `secondary`'s where `primary` has none.

```ts
function mergeI18nOverrides(
  primary: RuntimeI18nOverrides,
  secondary: RuntimeI18nOverrides,
): RuntimeI18nOverrides
```

**See** [`RuntimeI18nOverrides`](#runtimei18noverrides)

#### `readI18nEnvOverrides`

Overrides from `NUXT_I18N_*` / `NUXT_PUBLIC_I18N_RUNTIME_*` env vars (server only: the browser has no env).

```ts
function readI18nEnvOverrides(): RuntimeI18nOverrides
```

**See** [`RuntimeI18nOverrides`](#runtimei18noverrides)

#### `readI18nRuntimeOverrides`

Overrides from `runtimeConfig.public.i18nRuntime`.

```ts
function readI18nRuntimeOverrides(
  runtimePublic?: Record<string, unknown>,
): RuntimeI18nOverrides
```

**See** [`RuntimeI18nOverrides`](#runtimei18noverrides)

#### `readLocaleBaseUrls`

`runtimeConfig.public.i18nRuntime.localeBaseUrls`. Apart from `readI18nRuntimeOverrides`: only a build with
locale domains reads it, so a browser bundle without them drops the parser.

```ts
function readLocaleBaseUrls(
  runtimePublic?: Record<string, unknown>,
): Record<string, string> | undefined
```

### Types

#### `RuntimeI18nOverrides`

```ts
interface RuntimeI18nOverrides
```

::field-group
:::field
---
name: "defaultLocale"
type: "string"
---

:::
:::field
---
name: "fallbackLocale"
type: "string"
---

:::
:::field
---
name: "disabledLocales"
type: "string[]"
---

:::
:::field
---
name: "strategy"
type: "string"
---

:::
:::field
---
name: "dateBuild"
type: "string"
---
A new `?v=` with no rebuild: for dictionaries replaced in place. Restart to apply, as for any env.
:::
:::field
---
name: "metaBaseUrl"
type: "string"
---
SEO origin (canonical, hreflang) in place of the build's `metaBaseUrl`.
:::
:::field
---
name: "localeBaseUrls"
type: "Record<string, string>"
---
`locales[].baseUrl` by locale code. Only in a build that has locale domains: routing for them is built in.
:::
::

## `@i18n-micro/utils/source-loader`

### Functions

#### `loadSourceTranslationsFromStorage`

```ts
function loadSourceTranslationsFromStorage(
  storage: TranslationStorageReader,
  input: Omit<MergeSourceTranslationsInput, 'readLocaleFile'>,
): Promise<Translations>
```

**See** [`TranslationStorageReader`](#translationstoragereader) · [`MergeSourceTranslationsInput`](#mergesourcetranslationsinput) · [`Translations`](/api/packages/types#translations)

### Types

#### `TranslationStorageReader`

```ts
interface TranslationStorageReader
```

::field-group
:::field
---
name: "getItem"
type: "(key: string) => Promise<unknown>"
required: true
---

:::
::

## `@i18n-micro/utils/split-locale-routes`

### Functions

#### `splitLocaleRoutes`

Split one programmatic route registry into Nuxt pages + `globalLocaleRoutes` (#244).

Keeps both halves in sync and keys locale paths by route **name** (not file path),
so N routes sharing one wrapper SFC do not overwrite each other.

```ts
function splitLocaleRoutes(
  entries: readonly SplitLocaleRouteEntry[],
): SplitLocaleRoutesResult
```

**See** [`SplitLocaleRouteEntry`](#splitlocalerouteentry) · [`SplitLocaleRoutesResult`](#splitlocaleroutesresult)

### Types

#### `SplitLocaleRouteEntry`

One programmatic route entry for `splitLocaleRoutes` (#244).
Prefer route `name` as the `globalLocaleRoutes` key so shared wrapper SFCs do not collapse.

```ts
interface SplitLocaleRouteEntry
```

::field-group
:::field
---
name: "name"
type: "string"
required: true
---
Route name — also the key in `globalLocaleRoutes`.
:::
:::field
---
name: "path"
type: "string"
required: true
---
Default (unlocalized) path pushed into `pages:extend`.
:::
:::field
---
name: "file"
type: "string"
required: true
---
Page component / wrapper SFC (Nuxt `file`).
:::
:::field
---
name: "paths"
type: "Record<LocaleCode, string> | false"
---
Custom per-locale paths, or `false` to disable localization for this route.
Omitted → route is still pushed to `pages`, but no `globalLocaleRoutes` entry.
:::
::

#### `SplitLocaleRoutePage`

```ts
interface SplitLocaleRoutePage
```

::field-group
:::field
---
name: "name"
type: "string"
required: true
---

:::
:::field
---
name: "path"
type: "string"
required: true
---

:::
:::field
---
name: "file"
type: "string"
required: true
---

:::
::

#### `SplitLocaleRoutesResult`

```ts
interface SplitLocaleRoutesResult
```

::field-group
:::field
---
name: "pages"
type: "SplitLocaleRoutePage[]"
required: true
---
Pass into `pages:extend`: `pages.push(...pages)`.
:::
:::field
---
name: "globalLocaleRoutes"
type: "NonNullable<GlobalLocaleRoutes>"
required: true
---
Merge into `i18n.globalLocaleRoutes` (keyed by route name).
:::
::

---

Generated from the TypeScript sources and their JSDoc by `pnpm run docs:generate`.
Back to [all packages](/api/packages) · [Integration guides](/integrations/)
