# `@i18n-micro/types-generator`

Type generator for i18n-micro translation keys

Entry points: `@i18n-micro/types-generator`, `@i18n-micro/types-generator/nuxt`.

## `@i18n-micro/types-generator`

### Components

#### `I18nTypesPlugin`

A Vite (and Rollup) plugin: generates at build start, and again in dev after a locale file changes.

```ts
function I18nTypesPlugin(options: GeneratorOptions): Plugin
```

**See** [`GeneratorOptions`](#generatoroptions)

### Functions

#### `formatKeyProperty`

Emit a TS property name from a translation key.
JSON.stringify covers quotes/newlines/null bytes; U+2028/U+2029 need an extra escape
so the .d.ts stays safe when embedded in older JS tooling.

```ts
function formatKeyProperty(key: string): string
```

#### `generateTypes`

Generates TypeScript types for translation keys from JSON files.
Writes the result to a file.

```ts
function generateTypes(options: GeneratorOptions): string
```

<field-group>
<field name="options" type="GeneratorOptions" :required="true">

Generator options

</field>
</field-group>

**Returns** — Path to the generated file

**See** [`GeneratorOptions`](#generatoroptions)

#### `getTypesString`

Generates a string with TypeScript types for translation keys.
Does not write a file, only returns content.

```ts
function getTypesString(options: GeneratorOptions): string
```

<field-group>
<field name="options" type="GeneratorOptions" :required="true">

Generator options

</field>
</field-group>

**Returns** — String with .d.ts file content

**See** [`GeneratorOptions`](#generatoroptions)

### Types

#### `GeneratorOptions`

```ts
interface GeneratorOptions
```

<field-group>
<field name="srcDir" type="string" :required="true">



</field>

<field name="translationDir" type="string | string[]" :required="true">

One folder or several (layers, additional dirs); each is resolved against `srcDir`.

</field>

<field name="additionalDirs" type="string[]">

Folders of which only the top-level `{locale}.json` count, as `additionalTranslationDirs` of the module.

</field>

<field name="outputFile" type="string">



</field>
</field-group>

## `@i18n-micro/types-generator/nuxt`

### Functions

#### `default`

```ts
function default(
  resolvedOptions: I18nTypesGeneratorOptions,
  nuxt: Nuxt,
): ModuleSetupReturn
```

**See** [`I18nTypesGeneratorOptions`](#i18ntypesgeneratoroptions)

### Types

#### `I18nTypesGeneratorOptions`

```ts
interface I18nTypesGeneratorOptions
```

<field-group>
<field name="translationDir" type="string">

Translation directory relative to the project root. Defaults to where `nuxt-i18n-micro` reads translations.

</field>
</field-group>

---

Generated from the TypeScript sources and their JSDoc by `pnpm run docs:generate`.
Back to [all packages](/api/packages) · [Integration guides](/integrations/)
