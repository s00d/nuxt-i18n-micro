# @i18n-micro/vitepress

VitePress bindings for Nuxt I18n Micro: runtime dictionaries, `$t` and `<I18nT>` in markdown, locale sync with VitePress path locales, path helpers and SEO tags. Built on `@i18n-micro/vue`.

```bash
pnpm add @i18n-micro/vitepress
```

Peers: `vitepress` `>=1.0.0 || >=2.0.0-alpha.0`, `vue` `^3.5.43`.

| Import                         | Role                                          |
| ------------------------------ | --------------------------------------------- |
| `@i18n-micro/vitepress/config` | `withI18n`, `buildVitePressLocales`, SEO head |
| `@i18n-micro/vitepress/theme`  | `defineI18nTheme(DefaultTheme)`               |
| `@i18n-micro/vitepress`        | client `createI18n`, `useI18n`, components    |
| `@i18n-micro/vitepress/node`   | Node `createI18n` with path methods           |

```ts
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import { defineI18nTheme } from '@i18n-micro/vitepress/theme'

export default defineI18nTheme(DefaultTheme)
```

Docs: [https://s00d.github.io/nuxt-i18n-micro/integrations/vitepress-package](https://s00d.github.io/nuxt-i18n-micro/integrations/vitepress-package) · Repository: [github.com/s00d/nuxt-i18n-micro](https://github.com/s00d/nuxt-i18n-micro)

## License

MIT
