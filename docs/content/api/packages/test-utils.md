---
title: '@i18n-micro/test-utils'
description: 'Exported API of @i18n-micro/test-utils, generated from the source.'
navigation:
  title: 'test-utils'
---

# `@i18n-micro/test-utils`

Testing helpers for Nuxt I18n Micro (translations, locales, formatting mocks).

```ts
import { … } from '@i18n-micro/test-utils'
```

## Functions

### `_t`

```ts
function _t(
  route: unknown,
): (key: TranslationKey, params?: Params, defaultValue?: string | null) => Translation
```

**See** [`TranslationKey`](/api/packages/types#translationkey) · [`Params`](/api/packages/types#params) · [`Translation`](/api/packages/types#translation)

### `_ts`

```ts
function _ts(
  route: unknown,
): (key: TranslationKey, params?: Params, defaultValue?: string | null) => string
```

**See** [`TranslationKey`](/api/packages/types#translationkey) · [`Params`](/api/packages/types#params)

### `createFakeI18n`

Build a `useI18n()`-shaped mock for `mockNuxtImport('useI18n', …)`.
Includes `$…` methods, bare aliases (`t` / `$t`), `helper`, and test setters.

Pass `isolated: true` (or use `createIsolatedFakeI18n` / `setupNuxtI18nMock`)
for a private translation cache.

```ts
function createFakeI18n(options?: CreateFakeI18nOptions): { … }
```

::collapsible{name="35 properties"}
:::field-group
::::field
---
name: "$i18nStrategy"
type: "{ getStrategy: () => TestStrategy; getDefaultLocale: () => string; getLocales: () => Locale[]; getLocalizedRouteNamePrefix: () => string; getRouteBaseName: () => null; pageLocales: () => null; isMetaDisabled: () => boolean; setRouter: () => void; shouldReturn404: () => null; getClientRedirect: () => null; resolveLocaleFromPath(path: string): string | null; getLocaleFromPath(path: string): string | null; getCurrentLocale: () => string; getPluginRouteName: () => string; getCurrentLocaleName: () => string | null; localeRoute(targetLocale: string, routeOrPath: unknown): { path: string; fullPath: string; }; switchLocaleRoute(toLocale: string, route?: unknown): { path: string; fullPath: string; }; }"
required: true
---

::::
::::field
---
name: "$getI18nConfig"
type: "() => { locales: Locale[]; defaultLocale: string | undefined; strategy: TestStrategy; }"
required: true
---

::::
::::field
---
name: "$getLocale"
type: "() => string"
required: true
---

::::
::::field
---
name: "$setLocale"
type: "(val: string) => void"
required: true
---

::::
::::field
---
name: "$getLocaleName"
type: "() => string | null"
required: true
---

::::
::::field
---
name: "$setLocaleName"
type: "(val: string | null) => void"
required: true
---

::::
::::field
---
name: "$getLocales"
type: "() => Locale[]"
required: true
---

::::
::::field
---
name: "$setLocales"
type: "(val: Locale[]) => void"
required: true
---

::::
::::field
---
name: "$defaultLocale"
type: "() => string | undefined"
required: true
---

::::
::::field
---
name: "$setDefaultLocale"
type: "(val: string | undefined) => void"
required: true
---

::::
::::field
---
name: "$getRouteName"
type: "(_route?: unknown, _locale?: string) => string"
required: true
---

::::
::::field
---
name: "$setRouteName"
type: "(val: string) => void"
required: true
---

::::
::::field
---
name: "$t"
type: "(key: TranslationKey, params?: Params | ListParams, defaultValue?: string | null, routeContext?: unknown) => CleanTranslation"
required: true
---

::::
::::field
---
name: "$_t"
type: "(route: unknown) => (key: TranslationKey, params?: Params, defaultValue?: string | null) => Translation"
required: true
---

::::
::::field
---
name: "$ts"
type: "(key: TranslationKey, params?: Params | ListParams, defaultValue?: string, routeContext?: unknown) => string"
required: true
---

::::
::::field
---
name: "$_ts"
type: "(route: unknown) => (key: TranslationKey, params?: Params, defaultValue?: string | null) => string"
required: true
---

::::
::::field
---
name: "$tc"
type: "(key: TranslationKey, count: number | Params, defaultValue?: string) => string"
required: true
---

::::
::::field
---
name: "$tn"
type: "{ (value: number, options?: Intl.NumberFormatOptions): string; (value: number, key: string, overrides?: Intl.NumberFormatOptions): string; (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string; }"
required: true
---

::::
::::field
---
name: "$td"
type: "{ (value: Date | number | string, options?: Intl.DateTimeFormatOptions): string; (value: Date | number | string, key: string, overrides?: Intl.DateTimeFormatOptions): string; (value: Date | number | string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string; }"
required: true
---

::::
::::field
---
name: "$tdr"
type: "(value: Date | number | string, options?: Intl.RelativeTimeFormatOptions) => string"
required: true
---

::::
::::field
---
name: "$has"
type: "(key: TranslationKey, routeContext?: unknown) => boolean"
required: true
---

::::
::::field
---
name: "$resolveTranslations"
type: "(routeContext?: unknown) => Translations"
required: true
---

::::
::::field
---
name: "$setTranslation"
type: "(key: TranslationKey, value: unknown) => void"
required: true
---

::::
::::field
---
name: "$mergeTranslations"
type: "(newTranslations: Translations) => void"
required: true
---

::::
::::field
---
name: "$switchLocaleRoute"
type: "(loc: string) => { path: string; name: string; }"
required: true
---

::::
::::field
---
name: "$switchLocalePath"
type: "(loc: string) => string"
required: true
---

::::
::::field
---
name: "$switchLocale"
type: "(val: string) => void"
required: true
---

::::
::::field
---
name: "$switchRoute"
type: "(route: unknown, toLocale?: string) => void"
required: true
---

::::
::::field
---
name: "$localeRoute"
type: "(to: unknown, loc?: string) => { name?: string | symbol | undefined; path: string; }"
required: true
---

::::
::::field
---
name: "$localePath"
type: "(to: unknown, loc?: string) => string"
required: true
---

::::
::::field
---
name: "$setI18nRouteParams"
type: "(value: unknown) => unknown"
required: true
---

::::
::::field
---
name: "$loadPageTranslations"
type: "(locale: string, page: string, translations: Translations) => Promise<void>"
required: true
---

::::
::::field
---
name: "$setMissingHandler"
type: "(handler: MissingHandler | null) => void"
required: true
---

::::
::::field
---
name: "$setTranslationsFromJson"
type: "(locale: string, translations: Record<string, unknown>) => Promise<void>"
required: true
---

::::
::::field
---
name: "helper"
type: "TranslationHelper"
required: true
---

::::
:::
::

**See** [`CreateFakeI18nOptions`](#createfakei18noptions)

### `createIsolatedFakeI18n`

Isolated fake + bound helpers (does not touch the shared module cache).

```ts
function createIsolatedFakeI18n(options?: CreateFakeI18nOptions): IsolatedFakeI18n
```

**See** [`CreateFakeI18nOptions`](#createfakei18noptions) · [`IsolatedFakeI18n`](#isolatedfakei18n)

### `defaultLocale`

```ts
function defaultLocale(): string | undefined
```

### `getI18nConfig`

```ts
function getI18nConfig(): { … }
```

::field-group
:::field
---
name: "locales"
type: "Locale[]"
required: true
---

:::
:::field
---
name: "defaultLocale"
type: "string | undefined"
required: true
---

:::
:::field
---
name: "strategy"
type: "TestStrategy"
required: true
---

:::
::

### `getLocale`

```ts
function getLocale(): string
```

### `getLocaleName`

```ts
function getLocaleName(): string | null
```

### `getLocales`

```ts
function getLocales(): Locale[]
```

**See** [`Locale`](#locale)

### `getRouteName`

```ts
function getRouteName(_route?: unknown, _locale?: string): string
```

### `has`

```ts
function has(key: string, routeContext?: unknown): boolean
```

### `loadPageTranslations`

```ts
function loadPageTranslations(
  locale: string,
  page: string,
  translations: Translations,
): Promise<void>
```

**See** [`Translations`](/api/packages/types#translations)

### `localePath`

```ts
function localePath(to: unknown, loc?: string): string
```

### `localeRoute`

```ts
function localeRoute(to: unknown, loc?: string): { … }
```

::field-group
:::field
---
name: "name"
type: "string | symbol | undefined"
---

:::
:::field
---
name: "path"
type: "string"
required: true
---

:::
::

### `mergeTranslations`

```ts
function mergeTranslations(newTranslations: Translations): void
```

**See** [`Translations`](/api/packages/types#translations)

### `resetI18n`

Reset the shared mock state and clear the translation cache.
Call from `beforeEach` so tests do not leak dictionaries/locales.
For isolated harnesses, use the `reset` returned by `setupNuxtI18nMock` / `createIsolatedFakeI18n`.

```ts
function resetI18n(options?: ResetI18nOptions): void
```

**See** [`ResetI18nOptions`](#reseti18noptions)

### `resolveTranslations`

```ts
function resolveTranslations(routeContext?: unknown): Translations
```

**See** [`Translations`](/api/packages/types#translations)

### `setDefaultLocale`

```ts
function setDefaultLocale(val: string | undefined): void
```

### `setI18nRouteParams`

```ts
function setI18nRouteParams(value: unknown): unknown
```

### `setLocale`

```ts
function setLocale(val: string): void
```

### `setLocaleName`

```ts
function setLocaleName(val: string | null): void
```

### `setLocales`

```ts
function setLocales(val: Locale[]): void
```

**See** [`Locale`](#locale)

### `setMissingHandler`

```ts
function setMissingHandler(handler: MissingHandler | null): void
```

**See** [`MissingHandler`](/api/packages/types#missinghandler)

### `setRouteName`

```ts
function setRouteName(val: string): void
```

### `setTranslation`

```ts
function setTranslation(key: string, value: unknown): void
```

### `setTranslationsFromJson`

```ts
function setTranslationsFromJson(
  locale: string,
  translations: Record<string, unknown>,
): Promise<void>
```

### `setupNuxtI18nMock`

One-call harness for Nuxt unit tests: isolated fake, optional `beforeEach` reset,
and a `useI18n` factory for `mockNuxtImport`.

```ts
function setupNuxtI18nMock(options?: SetupNuxtI18nMockOptions): NuxtI18nMockHarness
```

```ts
import { setupNuxtI18nMock } from '@i18n-micro/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, vi } from 'vitest'

const { i18n, useI18n, setTranslationsFromJson } = setupNuxtI18nMock({
  spy: vi.fn,
  beforeEach,
  translations: { welcome: 'Welcome' },
})

mockNuxtImport('useI18n', () => useI18n)
export { i18n, setTranslationsFromJson }
```

**See** [`SetupNuxtI18nMockOptions`](#setupnuxti18nmockoptions) · [`NuxtI18nMockHarness`](#nuxti18nmockharness)

### `switchLocale`

```ts
function switchLocale(val: string): void
```

### `switchLocalePath`

```ts
function switchLocalePath(loc: string): string
```

### `switchLocaleRoute`

```ts
function switchLocaleRoute(loc: string): { … }
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
name: "name"
type: "string"
required: true
---

:::
::

### `switchRoute`

```ts
function switchRoute(route: unknown, toLocale?: string): void
```

### `t`

```ts
function t(
  key: string,
  params?: Params | ListParams,
  defaultValue?: string | null,
  routeContext?: unknown,
): CleanTranslation
```

**See** [`Params`](/api/packages/types#params) · [`ListParams`](/api/packages/types#listparams) · [`CleanTranslation`](/api/packages/types#cleantranslation)

### `tc`

```ts
function tc(key: string, count: number | Params, defaultValue?: string): string
```

**See** [`Params`](/api/packages/types#params)

### `td`

```ts
function td(value: string | number | Date, options?: Intl.DateTimeFormatOptions): string
function td(
  value: string | number | Date,
  key: string,
  overrides?: Intl.DateTimeFormatOptions,
): string
function td(
  value: string | number | Date,
  key: string,
  locale: string,
  overrides?: Intl.DateTimeFormatOptions,
): string
```

### `tdr`

```ts
function tdr(
  value: string | number | Date,
  options?: Intl.RelativeTimeFormatOptions,
): string
```

### `tn`

```ts
function tn(value: number, options?: Intl.NumberFormatOptions): string
function tn(value: number, key: string, overrides?: Intl.NumberFormatOptions): string
function tn(
  value: number,
  key: string,
  locale: string,
  overrides?: Intl.NumberFormatOptions,
): string
```

### `ts`

```ts
function ts(
  key: string,
  params?: Params | ListParams,
  defaultValue?: string,
  routeContext?: unknown,
): string
```

**See** [`Params`](/api/packages/types#params) · [`ListParams`](/api/packages/types#listparams)

## Classes

### `I18nTestContext`

Stateful i18n mock. Translation, plural and format calls are `BaseI18n`'s own: a test answers
what the app answers. What is added here is the test state: setters, seeds and path stubs.
The package's default singleton backs the module-level helpers (`t`, `resetI18n`, …).

```ts
class I18nTestContext extends BaseI18n {
  constructor(options: CreateI18nTestContextOptions = {})
}
```

::collapsible{name="31 members"}
:::field-group
::::field
---
name: "strategy"
type: "TestStrategy"
---

::::
::::field
---
name: "pagePath"
type: "string"
---

::::
::::field
---
name: "getLocale"
type: "() => string"
---

::::
::::field
---
name: "getFallbackLocale"
type: "() => string"
---

::::
::::field
---
name: "getRoute"
type: "() => string"
---

::::
::::field
---
name: "reset"
type: "(options: ResetI18nOptions & { reseed?: boolean; } = {}) => void"
---
Clear cache and restore locale/route defaults.
Pass `reseed: true` (or explicit `translations` / `messages`) to reload factory seeds.
::::
::::field
---
name: "_t"
type: "(route: unknown) => (key: TranslationKey, params?: Params, defaultValue?: string | null) => Translation"
---

::::
::::field
---
name: "_ts"
type: "(route: unknown) => (key: TranslationKey, params?: Params, defaultValue?: string | null) => string"
---

::::
::::field
---
name: "setTranslationsFromJson"
type: "(locale: string, translations: Record<string, unknown>) => Promise<void>"
---

::::
::::field
---
name: "loadPageTranslations"
type: "(locale: string, page: string, translations: Translations) => Promise<void>"
---

::::
::::field
---
name: "setLocale"
type: "(val: string) => void"
---

::::
::::field
---
name: "getLocaleName"
type: "() => string | null"
---

::::
::::field
---
name: "setLocaleName"
type: "(val: string | null) => void"
---

::::
::::field
---
name: "getLocales"
type: "() => Locale[]"
---

::::
::::field
---
name: "setLocales"
type: "(val: Locale[]) => void"
---

::::
::::field
---
name: "defaultLocale"
type: "() => string | undefined"
---

::::
::::field
---
name: "setDefaultLocale"
type: "(val: string | undefined) => void"
---

::::
::::field
---
name: "getRouteName"
type: "(_route?: unknown, _locale?: string) => string"
---

::::
::::field
---
name: "setRouteName"
type: "(val: string) => void"
---

::::
::::field
---
name: "mergeTranslations"
type: "(newTranslations: Translations) => void"
---

::::
::::field
---
name: "setMissingHandler"
type: "(handler: MissingHandler | null) => void"
---

::::
::::field
---
name: "getI18nConfig"
type: "() => { locales: Locale[]; defaultLocale: string | undefined; strategy: TestStrategy; }"
---

::::
::::field
---
name: "i18nStrategy"
type: "{ getStrategy: () => TestStrategy; getDefaultLocale: () => string; getLocales: () => Locale[]; getLocalizedRouteNamePrefix: () => string; getRouteBaseName: () => null; pageLocales: () => null; isMetaDisabled: () => boolean; setRouter: () => void; shouldReturn404: () => null; getClientRedirect: () => null; resolveLocaleFromPath(path: string): string | null; getLocaleFromPath(path: string): string | null; getCurrentLocale: () => string; getPluginRouteName: () => string; getCurrentLocaleName: () => string | null; localeRoute(targetLocale: string, routeOrPath: unknown): { path: string; fullPath: string; }; switchLocaleRoute(toLocale: string, route?: unknown): { path: string; fullPath: string; }; }"
---

::::
::::field
---
name: "localePath"
type: "(to: unknown, loc?: string) => string"
---

::::
::::field
---
name: "switchLocalePath"
type: "(loc: string) => string"
---
Returns a locale-prefixed path for the last `localePath` target.
Does **not** change the active locale (matches Nuxt runtime).
::::
::::field
---
name: "localeRoute"
type: "(to: unknown, loc?: string) => { name?: string | symbol | undefined; path: string; }"
---

::::
::::field
---
name: "switchLocaleRoute"
type: "(loc: string) => { path: string; name: string; }"
---

::::
::::field
---
name: "switchLocale"
type: "(val: string) => void"
---

::::
::::field
---
name: "switchRoute"
type: "(route: unknown, toLocale?: string) => void"
---

::::
::::field
---
name: "setI18nRouteParams"
type: "(value: unknown) => unknown"
---

::::
::::field
---
name: "createFake"
type: "(spy: SpyFn = (fn) => fn) => { $i18nStrategy: { getStrategy: () => TestStrategy; getDefaultLocale: () => string; getLocales: () => Locale[]; getLocalizedRouteNamePrefix: () => string; getRouteBaseName: () => null; pageLocales: () => null; isMetaDisabled: () => boolean; setRouter: () => void; shouldReturn404: () => null; getClientRedirect: () => null; resolveLocaleFromPath(path: string): string | null; getLocaleFromPath(path: string): string | null; getCurrentLocale: () => string; getPluginRouteName: () => string; getCurrentLocaleName: () => string | null; localeRoute(targetLocale: string, routeOrPath: unknown): { path: string; fullPath: string; }; switchLocaleRoute(toLocale: string, route?: unknown): { path: string; fullPath: string; }; }; $getI18nConfig: () => { locales: Locale[]; defaultLocale: string | undefined; strategy: TestStrategy; }; $getLocale: () => string; $setLocale: (val: string) => void; $getLocaleName: () => string | null; $setLocaleName: (val: string | null) => void; $getLocales: () => Locale[]; $setLocales: (val: Locale[]) => void; $defaultLocale: () => string | undefined; $setDefaultLocale: (val: string | undefined) => void; $getRouteName: (_route?: unknown, _locale?: string) => string; $setRouteName: (val: string) => void; $t: (key: TranslationKey, params?: Params | ListParams, defaultValue?: string | null, routeContext?: unknown) => CleanTranslation; $_t: (route: unknown) => (key: TranslationKey, params?: Params, defaultValue?: string | null) => Translation; $ts: (key: TranslationKey, params?: Params | ListParams, defaultValue?: string, routeContext?: unknown) => string; $_ts: (route: unknown) => (key: TranslationKey, params?: Params, defaultValue?: string | null) => string; $tc: (key: TranslationKey, count: number | Params, defaultValue?: string) => string; $tn: { (value: number, options?: Intl.NumberFormatOptions): string; (value: number, key: string, overrides?: Intl.NumberFormatOptions): string; (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string; }; $td: { (value: Date | number | string, options?: Intl.DateTimeFormatOptions): string; (value: Date | number | string, key: string, overrides?: Intl.DateTimeFormatOptions): string; (value: Date | number | string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string; }; $tdr: (value: Date | number | string, options?: Intl.RelativeTimeFormatOptions) => string; $has: (key: TranslationKey, routeContext?: unknown) => boolean; $resolveTranslations: (routeContext?: unknown) => Translations; $setTranslation: (key: TranslationKey, value: unknown) => void; $mergeTranslations: (newTranslations: Translations) => void; $switchLocaleRoute: (loc: string) => { path: string; name: string; }; $switchLocalePath: (loc: string) => string; $switchLocale: (val: string) => void; $switchRoute: (route: unknown, toLocale?: string) => void; $localeRoute: (to: unknown, loc?: string) => { name?: string | symbol | undefined; path: string; }; $localePath: (to: unknown, loc?: string) => string; $setI18nRouteParams: (value: unknown) => unknown; $loadPageTranslations: (locale: string, page: string, translations: Translations) => Promise<void>; $setMissingHandler: (handler: MissingHandler | null) => void; $setTranslationsFromJson: (locale: string, translations: Record<string, unknown>) => Promise<void>; helper: TranslationHelper; }"
---

::::
:::
::

**See** [`BaseI18n`](/api/packages/core#basei18n) · [`CreateI18nTestContextOptions`](#createi18ntestcontextoptions)

## Constants

### `createI18nTestContext`

```ts
const createI18nTestContext: (options?: CreateI18nTestContextOptions) => I18nTestContext
```

**See** [`CreateI18nTestContextOptions`](#createi18ntestcontextoptions) · [`I18nTestContext`](#i18ntestcontext)

### `i18nStrategy`

Minimal strategy stub so `useI18n().$i18nStrategy` does not throw.

```ts
const i18nStrategy: {
  getStrategy: () => TestStrategy;
  getDefaultLocale: () => string;
  getLocales: () => Locale[];
  getLocalizedRouteNamePrefix: () => string;
  getRouteBaseName: () => null;
  pageLocales: () => null;
  isMetaDisabled: () => boolean;
  setRouter: () => void;
  shouldReturn404: () => null;
  getClientRedirect: () => null;
  resolveLocaleFromPath(path: string): string | null;
  getLocaleFromPath(path: string): string | null;
  getCurrentLocale: () => string;
  getPluginRouteName: () => string;
  getCurrentLocaleName: () => string | null;
  localeRoute(targetLocale: string, routeOrPath: unknown): {
    path: string;
    fullPath: string;
  };
  switchLocaleRoute(toLocale: string, route?: unknown): {
    path: string;
    fullPath: string;
  };
}
```

**See** [`TestStrategy`](#teststrategy) · [`Locale`](#locale)

### `i18nUtils`

```ts
const i18nUtils: {
  t: (key: TranslationKey, params?: Params | ListParams, defaultValue?: string | null, routeContext?: unknown) => CleanTranslation;
  tc: (key: TranslationKey, count: number | Params, defaultValue?: string) => string;
  ts: (key: TranslationKey, params?: Params | ListParams, defaultValue?: string, routeContext?: unknown) => string;
  tn: {
    (value: number, options?: Intl.NumberFormatOptions): string;
    (value: number, key: string, overrides?: Intl.NumberFormatOptions): string;
    (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string;
  };
  td: {
    (value: Date | number | string, options?: Intl.DateTimeFormatOptions): string;
    (value: Date | number | string, key: string, overrides?: Intl.DateTimeFormatOptions): string;
    (value: Date | number | string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string;
  };
  tdr: (value: Date | number | string, options?: Intl.RelativeTimeFormatOptions) => string;
  has: (key: TranslationKey, routeContext?: unknown) => boolean;
  resetI18n: (options?: ResetI18nOptions) => void;
  createFakeI18n: (options?: CreateFakeI18nOptions) => {
    $i18nStrategy: {
      getStrategy: () => TestStrategy;
      getDefaultLocale: () => string;
      getLocales: () => Locale[];
      getLocalizedRouteNamePrefix: () => string;
      getRouteBaseName: () => null;
      pageLocales: () => null;
      isMetaDisabled: () => boolean;
      setRouter: () => void;
      shouldReturn404: () => null;
      getClientRedirect: () => null;
      resolveLocaleFromPath(path: string): string | null;
      getLocaleFromPath(path: string): string | null;
      getCurrentLocale: () => string;
      getPluginRouteName: () => string;
      getCurrentLocaleName: () => string | null;
      localeRoute(targetLocale: string, routeOrPath: unknown): {
        path: string;
        fullPath: string;
      };
      switchLocaleRoute(toLocale: string, route?: unknown): {
        path: string;
        fullPath: string;
      };
    };
    $getI18nConfig: () => {
      locales: Locale[];
      defaultLocale: string | undefined;
      strategy: TestStrategy;
    };
    $getLocale: () => string;
    $setLocale: (val: string) => void;
    $getLocaleName: () => string | null;
    $setLocaleName: (val: string | null) => void;
    $getLocales: () => Locale[];
    $setLocales: (val: Locale[]) => void;
    $defaultLocale: () => string | undefined;
    $setDefaultLocale: (val: string | undefined) => void;
    $getRouteName: (_route?: unknown, _locale?: string) => string;
    $setRouteName: (val: string) => void;
    $t: (key: TranslationKey, params?: Params | ListParams, defaultValue?: string | null, routeContext?: unknown) => CleanTranslation;
    $_t: (route: unknown) => (key: TranslationKey, params?: Params, defaultValue?: string | null) => Translation;
    $ts: (key: TranslationKey, params?: Params | ListParams, defaultValue?: string, routeContext?: unknown) => string;
    $_ts: (route: unknown) => (key: TranslationKey, params?: Params, defaultValue?: string | null) => string;
    $tc: (key: TranslationKey, count: number | Params, defaultValue?: string) => string;
    $tn: {
      (value: number, options?: Intl.NumberFormatOptions): string;
      (value: number, key: string, overrides?: Intl.NumberFormatOptions): string;
      (value: number, key: string, locale: string, overrides?: Intl.NumberFormatOptions): string;
    };
    $td: {
      (value: Date | number | string, options?: Intl.DateTimeFormatOptions): string;
      (value: Date | number | string, key: string, overrides?: Intl.DateTimeFormatOptions): string;
      (value: Date | number | string, key: string, locale: string, overrides?: Intl.DateTimeFormatOptions): string;
    };
    $tdr: (value: Date | number | string, options?: Intl.RelativeTimeFormatOptions) => string;
    $has: (key: TranslationKey, routeContext?: unknown) => boolean;
    $resolveTranslations: (routeContext?: unknown) => Translations;
    $setTranslation: (key: TranslationKey, value: unknown) => void;
    $mergeTranslations: (newTranslations: Translations) => void;
    $switchLocaleRoute: (loc: string) => {
      path: string;
      name: string;
    };
    $switchLocalePath: (loc: string) => string;
    $switchLocale: (val: string) => void;
    $switchRoute: (route: unknown, toLocale?: string) => void;
    $localeRoute: (to: unknown, loc?: string) => {
      name?: string | symbol | undefined;
      path: string;
    };
    $localePath: (to: unknown, loc?: string) => string;
    $setI18nRouteParams: (value: unknown) => unknown;
    $loadPageTranslations: (locale: string, page: string, translations: Translations) => Promise<void>;
    $setMissingHandler: (handler: MissingHandler | null) => void;
    $setTranslationsFromJson: (locale: string, translations: Record<string, unknown>) => Promise<void>;
    helper: TranslationHelper;
  };
  createIsolatedFakeI18n: (options?: CreateFakeI18nOptions) => IsolatedFakeI18n;
  setupNuxtI18nMock: (options?: SetupNuxtI18nMockOptions) => NuxtI18nMockHarness;
  createI18nTestContext: (options?: CreateI18nTestContextOptions) => I18nTestContext;
  setTranslationsFromJson: (locale: string, translations: Record<string, unknown>) => Promise<void>;
  loadPageTranslations: (locale: string, page: string, translations: Translations) => Promise<void>;
  setMissingHandler: (handler: MissingHandler | null) => void;
  getI18nConfig: () => {
    locales: Locale[];
    defaultLocale: string | undefined;
    strategy: TestStrategy;
  };
  i18nStrategy: {
    getStrategy: () => TestStrategy;
    getDefaultLocale: () => string;
    getLocales: () => Locale[];
    getLocalizedRouteNamePrefix: () => string;
    getRouteBaseName: () => null;
    pageLocales: () => null;
    isMetaDisabled: () => boolean;
    setRouter: () => void;
    shouldReturn404: () => null;
    getClientRedirect: () => null;
    resolveLocaleFromPath(path: string): string | null;
    getLocaleFromPath(path: string): string | null;
    getCurrentLocale: () => string;
    getPluginRouteName: () => string;
    getCurrentLocaleName: () => string | null;
    localeRoute(targetLocale: string, routeOrPath: unknown): {
      path: string;
      fullPath: string;
    };
    switchLocaleRoute(toLocale: string, route?: unknown): {
      path: string;
      fullPath: string;
    };
  };
  getLocale: () => string;
  setLocale: (val: string) => void;
  getLocaleName: () => string | null;
  setLocaleName: (val: string | null) => void;
  getLocales: () => Locale[];
  setLocales: (val: Locale[]) => void;
  defaultLocale: () => string | undefined;
  setDefaultLocale: (val: string | undefined) => void;
  getRouteName: (_route?: unknown, _locale?: string) => string;
  setRouteName: (val: string) => void;
  _t: (route: unknown) => (key: TranslationKey, params?: Params, defaultValue?: string | null) => Translation;
  _ts: (route: unknown) => (key: TranslationKey, params?: Params, defaultValue?: string | null) => string;
  mergeTranslations: (newTranslations: Translations) => void;
  resolveTranslations: (routeContext?: unknown) => Translations;
  setTranslation: (key: TranslationKey, value: unknown) => void;
  switchLocaleRoute: (loc: string) => {
    path: string;
    name: string;
  };
  switchLocalePath: (loc: string) => string;
  switchLocale: (val: string) => void;
  switchRoute: (route: unknown, toLocale?: string) => void;
  localeRoute: (to: unknown, loc?: string) => {
    name?: string | symbol | undefined;
    path: string;
  };
  localePath: (to: unknown, loc?: string) => string;
  setI18nRouteParams: (value: unknown) => unknown;
}
```

**See** [`TranslationKey`](/api/packages/types#translationkey) · [`Params`](/api/packages/types#params) · [`ListParams`](/api/packages/types#listparams) · [`CleanTranslation`](/api/packages/types#cleantranslation) · [`ResetI18nOptions`](#reseti18noptions) · [`CreateFakeI18nOptions`](#createfakei18noptions) · [`TestStrategy`](#teststrategy) · [`Locale`](#locale) · [`Translation`](/api/packages/types#translation) · [`Translations`](/api/packages/types#translations) · [`MissingHandler`](/api/packages/types#missinghandler) · [`TranslationHelper`](/api/packages/core#translationhelper) · [`IsolatedFakeI18n`](#isolatedfakei18n) · [`SetupNuxtI18nMockOptions`](#setupnuxti18nmockoptions) · [`NuxtI18nMockHarness`](#nuxti18nmockharness) · [`CreateI18nTestContextOptions`](#createi18ntestcontextoptions) · [`I18nTestContext`](#i18ntestcontext)

## Types

### `CreateFakeI18nOptions`

```ts
interface CreateFakeI18nOptions extends CreateI18nTestContextOptions
```

::field-group
:::field
---
name: "isolated"
type: "boolean"
---
A context of its own instead of the module's shared one.
:::
:::field
---
name: "spy"
type: "SpyFn"
---
Wrap each method (e.g. `vi.fn`). Defaults to identity — no Vitest dependency.
:::
::

**See** [`CreateI18nTestContextOptions`](#createi18ntestcontextoptions)

### `CreateI18nTestContextOptions`

```ts
type CreateI18nTestContextOptions = ResetI18nOptions
```

**See** [`ResetI18nOptions`](#reseti18noptions)

### `Getter`

```ts
type Getter = (key: TranslationKey, params?: Record<string, string | number | boolean>, defaultValue?: string) => unknown
```

**See** [`TranslationKey`](/api/packages/types#translationkey)

### `IsolatedFakeI18n`

```ts
interface IsolatedFakeI18n
```

::field-group
:::field
---
name: "i18n"
type: "ReturnType<I18nTestContext['createFake']>"
required: true
---

:::
:::field
---
name: "context"
type: "I18nTestContext"
required: true
---

:::
:::field
---
name: "reset"
type: "I18nTestContext['reset']"
required: true
---

:::
:::field
---
name: "setTranslationsFromJson"
type: "I18nTestContext['setTranslationsFromJson']"
required: true
---

:::
::

### `Locale`

```ts
interface Locale
```

::field-group
:::field
---
name: "code"
type: "LocaleCode"
required: true
---

:::
:::field
---
name: "disabled"
type: "boolean"
---

:::
:::field
---
name: "iso"
type: "string"
---

:::
:::field
---
name: "dir"
type: "'ltr' | 'rtl' | 'auto'"
---

:::
:::field
---
name: "displayName"
type: "string"
---

:::
:::field
---
name: "baseUrl"
type: "string"
---

:::
:::field
---
name: "baseDefault"
type: "boolean"
---

:::
::

### `LocaleCode`

```ts
type LocaleCode = string
```

### `NuxtI18nMockHarness`

```ts
interface NuxtI18nMockHarness extends IsolatedFakeI18n
```

::field-group
:::field
---
name: "useI18n"
type: "() => ReturnType<I18nTestContext['createFake']>"
required: true
---
Replacement for Nuxt `useI18n`. Pass to:
`mockNuxtImport('useI18n', () => useI18n)`
(keep `mockNuxtImport` in your setup file so `@nuxt/test-utils` can transform it).
:::
::

**See** [`IsolatedFakeI18n`](#isolatedfakei18n)

### `ResetI18nOptions`

```ts
interface ResetI18nOptions
```

::field-group
:::field
---
name: "locale"
type: "string"
---

:::
:::field
---
name: "defaultLocale"
type: "string | undefined"
---

:::
:::field
---
name: "localeName"
type: "string | null"
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
name: "routeName"
type: "string"
---

:::
:::field
---
name: "strategy"
type: "TestStrategy"
---

:::
:::field
---
name: "translations"
type: "Record<string, unknown>"
---
Seed the active route chunk for `locale` after reset.
:::
:::field
---
name: "messages"
type: "Record<string, Record<string, unknown>>"
---
Seed route chunks per locale code after reset.
:::
::

### `SetupNuxtI18nMockOptions`

```ts
interface SetupNuxtI18nMockOptions extends CreateFakeI18nOptions
```

::field-group
:::field
---
name: "beforeEach"
type: "(fn: () => void) => void"
---
Vitest `beforeEach`. When provided, registers an auto-reset that reseeds
factory `translations` / `messages`.
:::
:::field
---
name: "autoReset"
type: "boolean"
---
**Default** ``true when `beforeEach` is passed``
:::
::

**See** [`CreateFakeI18nOptions`](#createfakei18noptions)

### `SpyFn`

```ts
type SpyFn = <T>(fn: T) => T
```

### `TestStrategy`

```ts
type TestStrategy =
  | 'prefix'
  | 'prefix_except_default'
  | 'prefix_and_default'
  | 'no_prefix'
```

---

Generated from the TypeScript sources and their JSDoc by `pnpm run docs:generate`.
Back to [all packages](/api/packages) · [Integration guides](/integrations/)
