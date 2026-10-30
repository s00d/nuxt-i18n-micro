# @i18n-micro/types-generator

Generates a declaration with every translation key from your JSON files, so `t()`, `$t()` and `<I18nT keypath>` autocomplete them. Works as a Nuxt module and as an unplugin (Vite, Rollup, webpack, esbuild).

```bash
pnpm add -D @i18n-micro/types-generator
```

Nuxt:

```ts
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro', '@i18n-micro/types-generator/nuxt'],
})
```

Vite:

```ts
import { I18nTypesPlugin } from '@i18n-micro/types-generator'

export default defineConfig({
  plugins: [I18nTypesPlugin.vite({ srcDir: process.cwd(), translationDir: 'src/locales' })],
})
```

Docs: [https://s00d.github.io/nuxt-i18n-micro/integrations/types-generator](https://s00d.github.io/nuxt-i18n-micro/integrations/types-generator) · Repository: [github.com/s00d/nuxt-i18n-micro](https://github.com/s00d/nuxt-i18n-micro)

## License

MIT
