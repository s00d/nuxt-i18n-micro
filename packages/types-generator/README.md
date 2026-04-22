# @i18n-micro/types-generator

Type generator for i18n-micro translation keys. Automatically generates TypeScript types from JSON translation files.

## Installation

```bash
npm install -D @i18n-micro/types-generator
# or
pnpm add -D @i18n-micro/types-generator
# or
yarn add -D @i18n-micro/types-generator
```

## Usage

### Nuxt

Add to `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ["nuxt-i18n-micro", "@i18n-micro/types-generator/nuxt"],
});
```

### Vite/Vue

Add to `vite.config.ts`:

```typescript
import { I18nTypesPlugin } from "@i18n-micro/types-generator";

export default defineConfig({
  plugins: [
    I18nTypesPlugin({
      srcDir: "src",
      translationDir: "locales",
    }),
  ],
});
```

## Features

- 🔍 Automatic type generation from JSON files
- ✅ Full type safety for translation keys
- 🎯 IDE autocomplete support
- 🔄 Hot reload on file changes
- 🚀 Zero runtime overhead

## Documentation

- **[Types generator integration guide](https://s00d.github.io/nuxt-i18n-micro/integrations/types-generator)**
- **Repository**: [github.com/s00d/nuxt-i18n-micro](https://github.com/s00d/nuxt-i18n-micro)

## License

MIT
