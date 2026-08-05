# `@i18n-micro/vitepress`

VitePress bindings for [i18n-micro](https://github.com/s00d/nuxt-i18n-micro): runtime JSON dictionaries, `$t` / `<I18nT>` inside markdown, and an optional `<I18nSwitcher>` — on top of VitePress built-in `locales`.

## What this is / is not

| Need | Use |
|------|-----|
| Duplicate markdown per language, URL prefixes | **VitePress `locales`** |
| Default theme chrome labels (docFooter, search UI) | **`vitepress-i18n`** or hand-written `themeConfig` |
| Runtime `t` / plural / components in MD & custom theme | **`@i18n-micro/vitepress`** (this package) |

## Quick start

```bash
pnpm add @i18n-micro/vitepress
```

### Config (`/config` — Node)

```ts
import { defineConfig } from 'vitepress'
import { withI18nMicro, createI18nRoutingFromAdapter } from '@i18n-micro/vitepress/config'

const locales = [
  { code: 'en', iso: 'en-US', displayName: 'English' },
  { code: 'fr', iso: 'fr-FR', displayName: 'Français' },
]

export default defineConfig(
  withI18nMicro(
    {
      locales: {
        root: { label: 'English', lang: 'en' },
        fr: { label: 'Français', lang: 'fr', link: '/fr/' },
      },
      themeConfig: {
        i18nRouting: createI18nRoutingFromAdapter({
          defaultLocale: 'en',
          localeCodes: locales.map((l) => l.code),
        }),
      },
    },
    {
      locale: 'en',
      defaultLocale: 'en',
      locales,
      translationDir: 'locales', // root + optional pages/**
    },
  ),
)
```

### Theme

```ts
import DefaultTheme from 'vitepress/theme'
import { defineI18nTheme } from '@i18n-micro/vitepress'

export default defineI18nTheme(DefaultTheme)
```

### In markdown

```md
{{ $t('cta.readMore') }}

<I18nT keypath="greeting" :params="{ name: 'VitePress' }" />
<I18nLink to="/guide/demo">Demo</I18nLink>
```

## License

MIT
