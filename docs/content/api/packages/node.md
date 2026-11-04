---
title: '@i18n-micro/node'
description: 'Exported API of @i18n-micro/node, generated from the source.'
navigation:
  title: 'node'
---

# `@i18n-micro/node`

Node.js utilities for loading translations and locale data in Nuxt I18n Micro.

```ts
import { … } from '@i18n-micro/node'
```

## Functions

### `createI18n`

```ts
function createI18n(options: I18nOptions): I18n
```

**See** [`I18nOptions`](#i18noptions) · [`I18n`](#i18n)

### `loadRootTranslations`

Load only root-level translations from a directory

```ts
function loadRootTranslations(
  dir: string,
  disablePageLocales?: boolean,
): Promise<Record<string, Translations>>
```

::field-group
:::field
---
name: "dir"
type: "string"
required: true
---
Directory path containing translation files
:::
:::field
---
name: "disablePageLocales"
type: "boolean"
---
If true, ignores pages/ folder and treats all files as root translations
:::
::

**See** [`Translations`](/api/packages/types#translations)

### `loadTranslations`

Load translations from a directory
Supports both flat structure (locales/{lang}.json) and nested structure (locales/pages/{page}/{lang}.json)

```ts
function loadTranslations(
  dir: string,
  disablePageLocales?: boolean,
): Promise<LoadedTranslations>
```

::field-group
:::field
---
name: "dir"
type: "string"
required: true
---
Directory path containing translation files
:::
:::field
---
name: "disablePageLocales"
type: "boolean"
---
If true, ignores pages/ folder and treats all files as global translations
:::
::

**Returns** — Object with global and route-specific translations

**See** [`LoadedTranslations`](#loadedtranslations)

## Classes

### `I18n`

```ts
class I18n extends RuntimeI18n {
  constructor(options: I18nOptions)
}
```

::field-group
:::field
---
name: "translationDir"
type: "string"
---

:::
:::field
---
name: "protected store"
type: "ReactiveI18nStore"
---
Inside `run`, the shared instance answers with the request's locale and route. A fork always answers with its own.
:::
:::field
---
name: "run"
type: "<T>(locale: string, fn: (i18n: this) => T) => T"
---
Runs `fn` with a fork for `locale` as the current request: until `fn` and everything it awaits
finish, this instance reads and sets that fork's locale and route. `fn` also gets the fork.
:::
:::field
---
name: "loadTranslations"
type: "(dir?: string) => Promise<void>"
---

:::
:::field
---
name: "reload"
type: "() => Promise<void>"
---
Re-reads the directory. The old dictionaries answer until the new ones are in, so no request sees an empty instance.
:::
::

**See** [`I18nOptions`](#i18noptions)

## Types

### `I18nOptions`

```ts
interface I18nOptions extends RuntimeI18nOptions
```

::field-group
:::field
---
name: "translationDir"
type: "string"
---

:::
:::field
---
name: "disablePageLocales"
type: "boolean"
---

:::
::

### `LoadedTranslations`

```ts
interface LoadedTranslations extends TranslationFileBuckets<Translations>
```

**See** [`TranslationFileBuckets`](/api/packages/utils#translationfilebuckets) · [`Translations`](/api/packages/types#translations)

## Re-exports

Declared in another package of this repository and documented on its page.

- From [`@i18n-micro/core`](/api/packages/core): [`interpolate`](/api/packages/core#interpolate) · [`localeIsoMap`](/api/packages/core#localeisomap) · [`FormatService`](/api/packages/core#formatservice)
- From [`@i18n-micro/types`](/api/packages/types): [`CleanTranslation`](/api/packages/types#cleantranslation) · [`Getter`](/api/packages/types#getter) · [`Locale`](/api/packages/types#locale) · [`LocaleCode`](/api/packages/types#localecode) · [`Params`](/api/packages/types#params) · [`PluralFunc`](/api/packages/types#pluralfunc) · [`Translations`](/api/packages/types#translations)

---

Generated from the TypeScript sources and their JSDoc by `pnpm run docs:generate`.
Back to [all packages](/api/packages) · [Integration guides](/integrations/)
