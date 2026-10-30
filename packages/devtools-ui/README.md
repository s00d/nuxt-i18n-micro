# @i18n-micro/devtools-ui

The Nuxt I18n Micro translation editor as a web component, with a Vite plugin that adds a floating button and file endpoints to the dev server. Use it in Vue, React, Preact, Solid or Astro projects.

```bash
pnpm add -D @i18n-micro/devtools-ui
```

```ts
import { defineConfig } from 'vite'
import { i18nDevToolsPlugin } from '@i18n-micro/devtools-ui/vite'

export default defineConfig({
  plugins: [i18nDevToolsPlugin({ translationDir: 'src/locales' })],
})
```

`createBridge` connects the editor to a running instance for live edits.

Docs: [https://s00d.github.io/nuxt-i18n-micro/integrations/devtools-ui-package](https://s00d.github.io/nuxt-i18n-micro/integrations/devtools-ui-package) · Repository: [github.com/s00d/nuxt-i18n-micro](https://github.com/s00d/nuxt-i18n-micro)

## License

MIT
