# Types generator

`@i18n-micro/types-generator` reads every JSON file in your translation folder and writes a declaration that lists all keys. Add it when you want your editor to suggest keys in `t()`, `$t()` and `<I18nT keypath>`. It works as a Nuxt module and as a Vite or Rollup plugin, and regenerates when a file changes.

## Install

<code-group>

```bash [pnpm]
pnpm add -D @i18n-micro/types-generator
```

```bash [npm]
npm install -D @i18n-micro/types-generator
```

```bash [yarn]
yarn add -D @i18n-micro/types-generator
```

</code-group>

Peer dependency: `@nuxt/kit` `^3.18.0 || ^4.0.0`. Only the `/nuxt` entry imports it; in a Vite-only project the peer warning can be ignored.

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

The module writes `.nuxt/types/i18n-micro.d.ts` and Nuxt adds it to the type context; nothing to include by hand. It reads `i18nTypes.translationDir`, else where `nuxt-i18n-micro` reads translations: `translationDir` (from `i18n` or inline module options, default `'locales'`) in every layer, and `additionalTranslationDirs`. Editing a JSON file under that folder regenerates the types in `nuxi dev`. `i18nTypes.outputFile` is ignored in Nuxt (a warning says so).

## Vite

`I18nTypesPlugin` is a Vite plugin, which Rollup also takes. For another bundler, call `generateTypes` in a script.

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { I18nTypesPlugin } from '@i18n-micro/types-generator'

export default defineConfig({
  plugins: [
    vue(),
    I18nTypesPlugin({
      srcDir: process.cwd(),
      translationDir: 'src/locales',
      outputFile: 'src/i18n-micro.d.ts',
    }),
  ],
})
```

<table>
<thead>
  <tr>
    <th>
      Option
    </th>
    
    <th>
      Required
    </th>
    
    <th>
      Notes
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        srcDir
      </code>
    </td>
    
    <td>
      yes
    </td>
    
    <td>
      Base directory; <code>
        translationDir
      </code>
      
       is resolved against it.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        translationDir
      </code>
    </td>
    
    <td>
      yes
    </td>
    
    <td>
      Folder with the JSON files (subfolders such as <code>
        pages/
      </code>
      
       included), or an array of folders.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        outputFile
      </code>
    </td>
    
    <td>
      no
    </td>
    
    <td>
      Where to write the declaration; default <code>
        <srcDir>/i18n-micro.d.ts
      </code>
      
      .
    </td>
  </tr>
</tbody>
</table>

The plugin generates once at build start and, on the dev server, regenerates 300 ms after a change in the folder. Make sure your `tsconfig.json` `include` covers the output file.

## Use the keys

The generated file augments `DefineLocaleMessage` in `@i18n-micro/types`, which turns `TranslationKey` into your keys:

```ts
declare module '@i18n-micro/types' {
  export interface DefineLocaleMessage {
    nav: object
    'nav.home': string
    'profile.title': string
  }
}
```

The keys are the ones `t()` answers, objects too, from every locale and every page file, with the type of their JSON value. `TranslationKey` is the union of those keys plus any string, so you get autocomplete, not errors: a misspelled or dynamic key still compiles. Params and return values are not typed.

For dynamic keys under a known prefix, `ScopedKey<'prefix'>` narrows to the matching keys:

```ts
import type { ScopedKey } from '@i18n-micro/types'

const statusText = (status: string) => t(`status.${status}` as ScopedKey<'status'>)
```

`TranslationKey` and `ScopedKey` come from `@i18n-micro/types` (React, Preact and Solid re-export `TranslationKey`; Vue does not).

## API

<table>
<thead>
  <tr>
    <th>
      Export
    </th>
    
    <th>
      Entry
    </th>
    
    <th>
      Notes
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        I18nTypesPlugin(options)
      </code>
    </td>
    
    <td>
      <code>
        @i18n-micro/types-generator
      </code>
    </td>
    
    <td>
      Vite and Rollup plugin
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        generateTypes(options)
      </code>
    </td>
    
    <td>
      <code>
        @i18n-micro/types-generator
      </code>
    </td>
    
    <td>
      writes the file, returns its path
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        getTypesString(options)
      </code>
    </td>
    
    <td>
      <code>
        @i18n-micro/types-generator
      </code>
    </td>
    
    <td>
      returns the declaration without writing
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        formatKeyProperty(key)
      </code>
    </td>
    
    <td>
      <code>
        @i18n-micro/types-generator
      </code>
    </td>
    
    <td>
      helper
    </td>
  </tr>
  
  <tr>
    <td>
      Nuxt module (<code>
        configKey: 'i18nTypes'
      </code>
      
      )
    </td>
    
    <td>
      <code>
        @i18n-micro/types-generator/nuxt
      </code>
    </td>
    
    <td>
      option <code>
        translationDir
      </code>
    </td>
  </tr>
</tbody>
</table>

Full signatures: [package reference](/api/packages/types-generator).

## Related

<card-group>
<card icon="i-lucide-book-open" title="Frameworks" to="./#typed-keys">



</card>

<card icon="i-lucide-book-open" title="Translations" to="/guide/translations">

Folder layout the generator scans

</card>
</card-group>
