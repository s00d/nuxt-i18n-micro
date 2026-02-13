---
outline: deep
---

# 🔧 Types Generator (`@i18n-micro/types-generator`)

The `@i18n-micro/types-generator` package provides automatic TypeScript type generation for translation keys. It analyzes your JSON translation files and generates strict types, enabling full type-safety and autocomplete support for translation keys.

## 📖 Overview

`@i18n-micro/types-generator` is an optional dev dependency that enhances your development experience by:

- 🔍 **Automatic Type Generation** - Scans JSON translation files and generates TypeScript types
- ✅ **Type Safety** - Prevents typos and invalid translation keys at compile time
- 🎯 **Autocomplete Support** - Full IDE autocomplete for translation keys
- 🔄 **Hot Reload** - Automatically regenerates types when translation files change
- 🚀 **Zero Runtime Overhead** - Types are compile-time only, no impact on bundle size

## 🚀 Installation

Install the package as a dev dependency:

::: code-group

```bash [npm]
npm install -D @i18n-micro/types-generator
```

```bash [yarn]
yarn add -D @i18n-micro/types-generator
```

```bash [pnpm]
pnpm add -D @i18n-micro/types-generator
```

```bash [bun]
bun add -D @i18n-micro/types-generator
```

:::

## 🎯 Quick Start

### For Nuxt Projects

Add the module to your `nuxt.config.ts`:

```typescript
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    'nuxt-i18n-micro',
    '@i18n-micro/types-generator/nuxt', // Add types generator
  ],
  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', iso: 'en-US' },
      { code: 'fr', iso: 'fr-FR' },
    ],
    translationDir: 'locales', // Path to your translation files
  },
})
```

The generator will automatically:
- Scan all JSON files in your `locales` directory
- Generate types in `.nuxt/i18n-micro.d.ts`
- Watch for changes and regenerate types automatically

### For Vue/Vite Projects

Add the plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { I18nTypesPlugin } from '@i18n-micro/types-generator'

export default defineConfig({
  plugins: [
    vue(),
    I18nTypesPlugin({
      srcDir: 'src',
      translationDir: 'locales',
      outputFile: 'src/i18n-types.d.ts', // Optional: custom output path
    }),
  ],
})
```

Make sure to include the generated file in your `tsconfig.json`:

```json
{
  "include": [
    "src/**/*",
    "src/i18n-types.d.ts"
  ]
}
```

## 📁 Translation File Structure

The generator supports both flat and nested translation structures:

```
locales/
  en.json
  fr.json
  pages/
    home/
      en.json
      fr.json
    about/
      en.json
      fr.json
```

**Example `locales/en.json`:**

```json
{
  "greeting": "Hello, {name}!",
  "header": {
    "title": "Welcome",
    "subtitle": "Subtitle"
  },
  "errors": {
    "404": "Not found",
    "500": "Server error"
  },
  "apples": "no apples | one apple | {count} apples"
}
```

The generator will create types for all keys, including nested ones:

```typescript
// Generated types
declare module '@i18n-micro/types' {
  export interface DefineLocaleMessage {
    'greeting': string;
    'header.title': string;
    'header.subtitle': string;
    'errors.404': string;
    'errors.500': string;
    'apples': string;
  }
}
```

## 💡 Usage

Once types are generated, you get full type safety:

```typescript
import { useI18n } from '@i18n-micro/vue'

const { t } = useI18n()

// ✅ Type-safe: autocomplete works
t('greeting', { name: 'World' })
t('header.title')
t('errors.404')

// ❌ Type error: key doesn't exist
t('invalid.key') // Error: Argument of type '"invalid.key"' is not assignable
```

### Nuxt-Specific Note

**In Nuxt projects, type safety works only with the `useI18n` composable.** The generated types are applied to the composable's return value, ensuring type safety when using `t()`, `ts()`, `tc()`, and `has()` methods.

```typescript
// ✅ Correct: Using useI18n composable
<script setup lang="ts">
import { useI18n } from '#imports'

const { t } = useI18n()
t('greeting') // Type-safe with autocomplete
</script>

// ❌ Not type-safe: Direct access to $i18n or other methods
// Type safety is only available through the useI18n composable
```

## 🔄 Dynamic Keys

Sometimes you need to use dynamic keys (e.g., based on user input or API responses). The generator provides a `ScopedKey` helper type for safe dynamic key usage.

### Why Not Runtime Type Guards?

**Runtime type guards are not recommended** for i18n-micro because:

1. **Bundle Size** - Generating a JavaScript array of all keys would bloat your bundle
2. **Performance** - Runtime checks add unnecessary overhead
3. **Philosophy** - i18n-micro is designed to be lightweight and fast

### The TypeScript Way: Type Assertions

For dynamic keys, use TypeScript's type assertion:

```typescript
import type { TranslationKey, ScopedKey } from '@i18n-micro/types'

// ❌ Type error: dynamic key
const status = 'pending'
t(`status.${status}`) // Error: string is not assignable to TranslationKey

// ✅ Solution 1: Type assertion (if you're sure the key exists)
t(`status.${status}` as TranslationKey)

// ✅ Solution 2: ScopedKey helper (safer, checks prefix exists)
function getStatusText(status: string) {
  return t(`status.${status}` as ScopedKey<'status'>)
  // TypeScript verifies that keys starting with 'status.' exist
}

// ✅ Solution 3: Runtime check with has()
if (has(`status.${status}`)) {
  t(`status.${status}` as TranslationKey)
}
```

### ScopedKey Helper

The `ScopedKey<Scope>` type allows you to narrow dynamic keys by prefix:

```typescript
import type { ScopedKey } from '@i18n-micro/types'

// Assuming you have keys: 'errors.404', 'errors.500', 'btn.save'

function getErrorText(code: string) {
  // ✅ Safer than plain TranslationKey
  // TypeScript verifies that 'errors.*' keys exist
  return t(`errors.${code}` as ScopedKey<'errors'>)
}

// ❌ Type error: 'btn' prefix doesn't match 'errors'
function getErrorTextWrong(code: string) {
  return t(`errors.${code}` as ScopedKey<'btn'>) // Error
}
```

## ⚙️ Configuration

### Nuxt Module Options

```typescript
export default defineNuxtConfig({
  modules: ['@i18n-micro/types-generator/nuxt'],
  i18nTypes: {
    translationDir: 'locales', // Custom translation directory
    outputFile: '.nuxt/custom-types.d.ts', // Custom output path
  },
})
```

### Vite Plugin Options

```typescript
I18nTypesPlugin({
  srcDir: 'src', // Source directory
  translationDir: 'locales', // Translation files directory
  outputFile: 'src/i18n-types.d.ts', // Output file path
})
```

## 🎨 Advanced Usage

### Handling Route-Specific Translations

The generator automatically includes keys from route-specific translation files:

```
locales/
  en.json                    # Root-level translations
  pages/
    home/
      en.json               # Route-specific translations
    about/
      en.json
```

All keys from both root-level and route-specific files are included in the generated types.

### Disabling Page Locales

If you use `disablePageLocales: true` in your i18n config, the generator will treat all files (including those in `pages/`) as root-level translations.

## 🐛 Troubleshooting

### Types Not Updating

1. **Check file paths** - Ensure `translationDir` points to the correct directory
2. **Restart TypeScript server** - In VS Code: `Cmd/Ctrl + Shift + P` → "TypeScript: Restart TS Server"
3. **Check tsconfig.json** - Ensure the generated file is included

### Type Errors After Adding Keys

1. **Regenerate types** - The generator should auto-regenerate, but you can manually trigger it
2. **Check JSON syntax** - Invalid JSON files are skipped with a warning
3. **Restart dev server** - Sometimes needed for changes to take effect

### Autocomplete Not Working

1. **Verify file inclusion** - Check that the generated `.d.ts` file is in your `tsconfig.json` include
2. **Check module augmentation** - Ensure the generated file uses `declare module '@i18n-micro/types'`
3. **TypeScript version** - Requires TypeScript 4.1+ for template literal types

## 📚 API Reference

### `generateTypes(options: GeneratorOptions)`

Manually generate types (useful for scripts or CI):

```typescript
import { generateTypes } from '@i18n-micro/types-generator'

await generateTypes({
  srcDir: './src',
  translationDir: 'locales',
  outputFile: './src/i18n-types.d.ts',
})
```

### `flattenKeys(obj: Record<string, unknown>, prefix?: string)`

Utility function to flatten nested translation objects:

```typescript
import { flattenKeys } from '@i18n-micro/types-generator'

const keys = flattenKeys({
  header: { title: 'Title' },
  footer: { copyright: 'Copyright' },
})
// Returns: ['header.title', 'footer.copyright']
```

## 🔍 How It Works

1. **Scanning** - Uses `globby` to find all `**/*.json` files in the translation directory
2. **Parsing** - Parses each JSON file and extracts all keys using recursive flattening
3. **Deduplication** - Combines keys from all files into a unique set
4. **Generation** - Creates a `.d.ts` file with `declare module` augmentation
5. **Watching** - In dev mode, watches for file changes and regenerates types

The generated file uses TypeScript's module augmentation to extend `DefineLocaleMessage` in `@i18n-micro/types`, which automatically updates the `TranslationKey` type throughout your project.

## 🎯 Best Practices

1. **Keep translations organized** - Use nested objects for related keys
2. **Use consistent naming** - Follow a naming convention (e.g., `errors.*`, `buttons.*`)
3. **Leverage ScopedKey** - Use `ScopedKey` for dynamic keys instead of plain assertions
4. **Check types in CI** - Run type checking in your CI pipeline
5. **Don't edit generated files** - The `.d.ts` file is auto-generated and will be overwritten

## 🔗 Related Documentation

- [Vue Package](./vue-package.md) - Vue integration
- [Astro Package](./astro-package.md) - Astro integration
- [Getting Started](../guide/getting-started.md) - Nuxt setup

