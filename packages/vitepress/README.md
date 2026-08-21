# `@i18n-micro/vitepress`

VitePress bindings for [i18n-micro](https://github.com/s00d/nuxt-i18n-micro). One runtime API: **`createI18n`** — translations, path helpers, and (in the theme) Vue plugin + route sync.

## Entries

| Import                         | Role                                                  |
| ------------------------------ | ----------------------------------------------------- |
| `@i18n-micro/vitepress`        | Client `createI18n` + `useI18n` / `getLocaleFromPath` |
| `@i18n-micro/vitepress/theme`  | `defineI18nTheme` (uses virtual modules from config)  |
| `@i18n-micro/vitepress/config` | `withI18n`, `buildVitePressLocales`, SEO head         |
| `@i18n-micro/vitepress/node`   | Node `createI18n` (`@i18n-micro/node` + path methods) |

OpenAPI-style locks: `tests/integration-openapi.test.ts`.  
Playground SSG smoke (en/fr/de, page-scoped, SEO / disableMeta): `tests/playground-ssg.test.ts`.

There is **no** separate `createVitePressRouterAdapter` / path-helpers package surface — path methods hang on the `createI18n` instance via `BaseI18n.extend`.

## `createI18n`

### Theme / client

```ts
import { createI18n } from '@i18n-micro/vitepress'

const i18n = createI18n({
  locale: 'en',
  defaultLocale: 'en',
  locales: [{ code: 'en' }, { code: 'fr' }],
  messages: { en: { hi: 'Hi' }, fr: { hi: 'Salut' } },
})

i18n.localizePath('/guide', 'fr') // '/fr/guide'
i18n.t // via i18n.global / after enhanceApp
// app.use(i18n) happens inside i18n.enhanceApp({ app, router })
```

Prefer `defineI18nTheme` for zero-boilerplate sites.

### Node / generators

Built on **`@i18n-micro/node`** (same `createI18n` / `loadTranslations` as Astro & CLI), plus VitePress path methods on the same object:

```ts
import { createI18n } from '@i18n-micro/vitepress/node'

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  translationDir: './locales',
  locales: ['en', 'fr'],
  defaultLocale: 'en',
})
await i18n.loadTranslations()
i18n.t('cta.readMore')
i18n.localizePath('/guide', 'fr')
```

You can also import `createI18n` from `@i18n-micro/node` directly when you do not need path helpers.

Custom methods anywhere BaseI18n is used:

```ts
i18n.extend({ shout: (key) => String(i18n.t(key)).toUpperCase() })
```

## Config

```ts
import { defineConfig } from 'vitepress'
import { withI18n, buildVitePressLocales } from '@i18n-micro/vitepress/config'

const locales = [
  { code: 'en', iso: 'en-US', displayName: 'English', og: 'en_US' },
  { code: 'fr', iso: 'fr-FR', displayName: 'Français', og: 'fr_FR' },
]
const defaultLocale = 'en'

export default defineConfig(
  withI18n(
    { locales: buildVitePressLocales(locales, defaultLocale) },
    {
      locale: defaultLocale,
      defaultLocale,
      locales,
      translationDir: 'locales',
      metaBaseUrl: 'https://example.com',
    },
  ),
)
```

`withI18n` injects `themeConfig.i18nRouting` automatically.

### Theme

```ts
import DefaultTheme from 'vitepress/theme'
import { defineI18nTheme } from '@i18n-micro/vitepress/theme'

export default defineI18nTheme(DefaultTheme)
```

In pages: `useI18n().localePath` / `switchLocale`, or `$t` / `<I18nT>`.

## License

MIT
