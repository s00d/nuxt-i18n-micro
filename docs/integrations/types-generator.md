---
title: 'Types generator'
description: 'Generate TypeScript autocomplete for translation keys from your JSON files, in Nuxt or any Vite project.'
outline: 'deep'
---

# Types generator

`@i18n-micro/types-generator` reads every JSON file in your translation folder and writes a declaration that lists all keys. Add it when you want your editor to suggest keys in `t()`, `$t()` and `<I18nT keypath>`. It works as a Nuxt module and as a Vite (unplugin) plugin, and regenerates when a file changes.

## Install

::: code-group

```bash [pnpm]
pnpm add -D @i18n-micro/types-generator
```

```bash [npm]
npm install -D @i18n-micro/types-generator
```

```bash [yarn]
yarn add -D @i18n-micro/types-generator
```

:::

Peer dependency: `@nuxt/kit` `^3.18.1 || ^4.5.2`. Only the `/nuxt` entry imports it; in a Vite-only project the peer warning can be ignored.

## Nuxt

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro', '@i18n-micro/types-generator/nuxt'],
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US' },
      { code: 'de', iso: 'de-DE' },
    ],
    defaultLocale: 'en',
    translationDir: 'locales',
  },
})
```

The module writes `.nuxt/types/i18n-micro.d.ts` and Nuxt adds it to the type context; nothing to include by hand. It reads `i18nTypes.translationDir`, else `i18n.translationDir`, else `'locales'`, relative to the project root. Editing a JSON file under that folder regenerates the types in `nuxi dev`. `i18nTypes.outputFile` is ignored in Nuxt (a warning says so).

## Vite

`I18nTypesPlugin` is an unplugin: call `.vite()` (or `.rollup()`, `.webpack()`, `.esbuild()`):

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { I18nTypesPlugin } from '@i18n-micro/types-generator'

export default defineConfig({
  plugins: [
    vue(),
    I18nTypesPlugin.vite({
      srcDir: process.cwd(),
      translationDir: 'src/locales',
      outputFile: 'src/i18n-micro.d.ts',
    }),
  ],
})
```

| Option | Required | Notes |
| --- | --- | --- |
| `srcDir` | yes | Base directory; `translationDir` is resolved against it. |
| `translationDir` | yes | Folder with the JSON files (subfolders such as `pages/` included). |
| `outputFile` | no | Where to write the declaration; default `<srcDir>/i18n-micro.d.ts`. |

The plugin generates once at build start and, unless `NODE_ENV` is `production`, watches the folder and regenerates 300 ms after a change. Make sure your `tsconfig.json` `include` covers the output file.

## Use the keys

The generated file augments `DefineLocaleMessage` in `@i18n-micro/types`, which turns `TranslationKey` into your keys:

```ts
declare module '@i18n-micro/types' {
  export interface DefineLocaleMessage {
    'nav.home': string
    'profile.title': string
  }
}
```

Keys from every locale and every page file are merged into one list. `TranslationKey` is the union of those keys plus any string, so you get autocomplete, not errors: a misspelled or dynamic key still compiles. Params and return values are not typed.

For dynamic keys under a known prefix, `ScopedKey<'prefix'>` narrows to the matching keys:

```ts
import type { ScopedKey } from '@i18n-micro/types'

const statusText = (status: string) => t(`status.${status}` as ScopedKey<'status'>)
```

`TranslationKey` and `ScopedKey` come from `@i18n-micro/types` (React, Preact and Solid re-export `TranslationKey`; Vue does not).

## API

| Export | Entry | Notes |
| --- | --- | --- |
| `I18nTypesPlugin` | `@i18n-micro/types-generator` | unplugin: `.vite()`, `.rollup()`, `.webpack()`, `.esbuild()` |
| `generateTypes(options)` | `@i18n-micro/types-generator` | writes the file, returns its path |
| `getTypesString(options)` | `@i18n-micro/types-generator` | returns the declaration without writing |
| `flattenKeys(obj)`, `formatKeyProperty(key)`, `isPlainTranslationObject(value)` | `@i18n-micro/types-generator` | helpers |
| Nuxt module (`configKey: 'i18nTypes'`) | `@i18n-micro/types-generator/nuxt` | option `translationDir` |

Full signatures: [package reference](/api/packages/types-generator).

## Related

- [Frameworks](./#typed-keys)
- [Translations](/guide/translations) — folder layout the generator scans
