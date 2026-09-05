---
url: 'https://s00d.github.io/nuxt-i18n-micro/integrations/vitepress-package.md'
description: Runtime i18n for VitePress themes and markdown pages.
---

# VitePress Package (`@i18n-micro/vitepress`)

Runtime dictionaries, `$t` / `<I18nT>` inside markdown, and an optional `<I18nSwitcher>` — built on `@i18n-micro/vue`, synced with VitePress path locales.

## Positioning

| Need | Solution |
|------|----------|
| Duplicate `.md`, URL prefixes | VitePress `locales` |
| Runtime `$t` / components / path sync / SEO head | **`@i18n-micro/vitepress`** |
| Default theme chrome labels (`docFooter`, search UI) | Your own `themeConfig` per locale |

::: tip Playground
[`packages/vitepress/playground`](https://github.com/s00d/nuxt-i18n-micro/tree/main/packages/vitepress/playground) — `pnpm -C packages/vitepress/playground dev`
:::

## Install

::: code-group

```bash [pnpm]
pnpm add @i18n-micro/vitepress
```

```bash [npm]
npm install @i18n-micro/vitepress
```

```bash [yarn]
yarn add @i18n-micro/vitepress
```

:::

Peers: `vitepress`, `vue`. Node scripts also use the workspace dependency **`@i18n-micro/node`** (re-exported through `/node`).

## Setup

```
locales/en.json
locales/fr.json
locales/pages/guide/demo/en.json   # optional page-scoped
locales/pages/guide/demo/fr.json
```

Page files map to route names the same way as Nuxt/Astro (`guide/demo` → `guide-demo`).

### 1. Config — `@i18n-micro/vitepress/config`

```ts
// .vitepress/config.mts
import { defineConfig } from 'vitepress'
import { withI18n, buildVitePressLocales } from '@i18n-micro/vitepress/config'

const locales = [
  { code: 'en', iso: 'en-US', displayName: 'English', og: 'en_US' },
  { code: 'fr', iso: 'fr-FR', displayName: 'Français', og: 'fr_FR' },
]
const defaultLocale = 'en'

export default defineConfig(
  withI18n(
    {
      locales: buildVitePressLocales(locales, defaultLocale),
      // themeConfig.i18nRouting is injected automatically
    },
    {
      locale: defaultLocale,
      defaultLocale,
      locales,
      translationDir: 'locales',
      metaBaseUrl: 'https://example.com', // optional SEO head
    },
  ),
)
```

### 2. Theme — `@i18n-micro/vitepress/theme`

```ts
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import { defineI18nTheme } from '@i18n-micro/vitepress/theme'

export default defineI18nTheme(DefaultTheme)
```

Initial locale is taken from the current path before install (no default-locale flash on `/fr/…`).

### Advanced: manual `createI18n`

One factory for the client: Vue plugin + path methods + `enhanceApp` (no separate router helper exports).

```ts
import { createI18n, messagesFromGlob } from '@i18n-micro/vitepress'

const i18n = createI18n({
  locale: 'en',
  defaultLocale: 'en',
  locales: [{ code: 'en' }, { code: 'fr' }],
  messages: messagesFromGlob(import.meta.glob('../../locales/*.json', { eager: true })),
})

i18n.localizePath('/guide', 'fr')
// in theme enhanceApp:
i18n.enhanceApp({ app, router })
```

### Node scripts — `@i18n-micro/vitepress/node`

Uses **`@i18n-micro/node`** `createI18n` / `loadTranslations` (same as Astro & CLI), then attaches VitePress path methods with `BaseI18n.extend`:

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

Plain Node without paths: `import { createI18n } from '@i18n-micro/node'`.

## In-page translations

Each VitePress markdown file is a Vue SFC.

### Global components + `$t` (recommended in MD)

`createI18n` / `defineI18nTheme` install `@i18n-micro/vue`, which registers `I18nT` / `I18nLink` / `I18nGroup` / `I18nSwitcher` and `$t` / `$tc` / `$ts`.

```md
{{ $t('cta.readMore') }}

<I18nT keypath="greeting" :params="{ name: 'VitePress' }" />

<I18nLink to="/guide/demo">Demo</I18nLink>
```

### `useI18n` in `<script setup>`

```md
<script setup>
import { useI18n } from '@i18n-micro/vitepress'
const { t, tc, locale, localePath, switchLocale } = useI18n()
</script>

# {{ t('section.title') }}
```

## Language dropdown

When `locales` has more than one entry, VitePress shows **`VPNavBarTranslations`**. `withI18n` wires `themeConfig.i18nRouting` so the globe matches `<I18nSwitcher>` / path helpers.

Use `<I18nSwitcher>` only in custom layouts — **not** next to the default globe.

## SSR notes

* Locale on prerender comes from the URL path, not cookies.
* Theme code must not touch `window` at import time.
* Import `defineI18nTheme` from `/theme` so Node config evaluation never loads `virtual:i18n-micro/*`.

## API surface

| Export | Role |
|--------|------|
| `createI18n` (`.`) | Client: Vue plugin + path methods + `enhanceApp` |
| `getLocaleFromPath` / `stripSiteBase` / `routeNameFromPath` (`.`) | Manual locale sync when `syncWithVitePress: false` |
| `createI18n` (`/node`) | Node: `@i18n-micro/node` + path methods |
| `defineI18nTheme` (`/theme`) | Zero-boilerplate theme |
| `withI18n` (`/config`) | Config + virtual modules + optional SEO |
| `buildVitePressLocales` (`/config`) | Build VitePress `locales` from `Locale[]` |
| `buildVitePressLocaleHead` (`/config`) | Manual SEO head (also used by `metaBaseUrl`) |
| `messagesFromGlob` | Optional glob → messages map for `createI18n` |
| `useI18n` / `I18nT` / … | Re-exported from `@i18n-micro/vue` |
| `BaseI18n.extend` (`@i18n-micro/core`) | Attach custom methods on any i18n instance |

## OpenAPI-style sites (integration locks)

Regression suite: `packages/vitepress/tests/integration-openapi.test.ts` (deep paths, `base=/openapi_docs/`, sync off + manual locale, Node generators, SEO).

| Pattern | Do this |
|---------|---------|
| Deep `/…/{spec}/{op}` pages, only root UI JSON | Prefer default `syncWithVitePress: true` (keeps `setRoute('index')` when no page dict) **or** `syncWithVitePress: false` + `getLocaleFromPath` |
| Never call `setRoute(deepName)` without page dictionaries | Root UI keys disappear until `setRoute('index')` |
| Generators / `getTranslation` | `createI18n` from `/node` + `await loadTranslations()` + `i18n.t(key)` (set `i18n.locale`) |
| Custom canonical in `transformPageData` | Pass `meta: false` to `withI18n` (avoid double tags) |
| Package SEO with site base | `metaBaseUrl` + VitePress `base` → absolute URLs include base |
| Rename from older package builds | `withI18nMicro` → `withI18n`, `createVitePressI18n` → `createI18n`, `loadMessages` → node `createI18n` |

## Resources

* **Playground**: [`packages/vitepress/playground`](https://github.com/s00d/nuxt-i18n-micro/tree/main/packages/vitepress/playground)
* **Repository**: <https://github.com/s00d/nuxt-i18n-micro>

## License

MIT
