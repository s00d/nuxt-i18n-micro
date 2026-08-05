---
url: 'https://s00d.github.io/nuxt-i18n-micro/integrations/vitepress-package.md'
description: Runtime i18n for VitePress themes and markdown pages.
---

# VitePress Package (`@i18n-micro/vitepress`)

Runtime dictionaries, `$t` / `<I18nT>` inside markdown, and an optional `<I18nSwitcher>` — built on `@i18n-micro/vue`, synced with VitePress path locales.

## Positioning

VitePress i18n is three separate problems. This package only solves **runtime UI strings**.

| Layer | Need | Solution |
|-------|------|----------|
| A. Site structure | Duplicate `.md`, URL prefixes, `locales` | **VitePress built-in** |
| B. Default theme chrome | `docFooter`, search UI, outline labels | **`vitepress-i18n`**, hand-written `themeConfig`, or tools like **ai-i18n-tools** |
| C. Runtime UI in MD / custom theme | `t` / plural / components / custom dropdown | **`@i18n-micro/vitepress`** |

```
@i18n-micro/vitepress ≠ theme chrome translator
@i18n-micro/vitepress ≠ markdown copier
```

::: tip Playground
Tiny VitePress site with `withI18nMicro`, theme `$t`, and FR locale pages:

[`packages/vitepress/playground`](https://github.com/s00d/nuxt-i18n-micro/tree/main/packages/vitepress/playground) — `pnpm -C packages/vitepress/playground dev`
:::

### Compose with other helpers

`withI18n` is already used by [`vitepress-i18n`](https://www.npmjs.com/package/vitepress-i18n). Our helper is intentionally named **`withI18nMicro`**:

```ts
import { defineConfig } from 'vitepress'
import { withI18n } from 'vitepress-i18n' // optional: chrome labels
import { withI18nMicro } from '@i18n-micro/vitepress/config'

export default defineConfig(
  withI18n(
    withI18nMicro(vitePressConfig, i18nMicroOptions),
    vitePressI18nOptions,
  ),
)
```

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

Peers: `vitepress`, `vue`.

## Setup

Put dictionaries under the site root, e.g.:

```
locales/en.json
locales/fr.json
locales/pages/guide/demo/en.json   # optional page-scoped
locales/pages/guide/demo/fr.json
```

Page files map to route names the same way as Nuxt/Astro (`guide/demo` → `guide-demo`). On `/guide/demo` / `/fr/guide/demo`, `setRoute('guide-demo')` loads them.

### 1. Config — `@i18n-micro/vitepress/config`

```ts
// .vitepress/config.mts
import { defineConfig } from 'vitepress'
import {
  withI18nMicro,
  createI18nRoutingFromAdapter,
} from '@i18n-micro/vitepress/config'

const locales = [
  { code: 'en', iso: 'en-US', displayName: 'English' },
  { code: 'fr', iso: 'fr-FR', displayName: 'Français' },
]

export default defineConfig(
  withI18nMicro(
    {
      locales: {
        root: { label: 'English', lang: 'en-US' },
        fr: { label: 'Français', lang: 'fr-FR', link: '/fr/' },
      },
      themeConfig: {
        // Self-contained function (safe for VitePress site-data serialization)
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
      translationDir: 'locales',
    },
  ),
)
```

`withI18nMicro` injects Vite virtual modules:

* `virtual:i18n-micro/config` — locales / defaults / `localeKeyToCode`
* `virtual:i18n-micro/messages` — per-file JSON imports from `translationDir` (+ `routeMessages`)

Import the helper from **`/config`** (Node + `fs`). Do not import it from the client theme.

### 2. Theme — `defineI18nTheme` (recommended)

```ts
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import { defineI18nTheme } from '@i18n-micro/vitepress'

export default defineI18nTheme(DefaultTheme)
```

Initial locale is taken from the current path before install (no default-locale flash on `/fr/…`).

#### Advanced: own messages / `createVitePressI18n`

```ts
import { createVitePressI18n, messagesFromGlob } from '@i18n-micro/vitepress'

const messages = messagesFromGlob(
  import.meta.glob('../../locales/*.json', { eager: true }),
)
const { enhanceApp } = createVitePressI18n({ /* … */, messages })
```

Node FS helpers (scripts / config tooling):

```ts
import { loadMessages, loadTranslationBuckets } from '@i18n-micro/vitepress/node'
// or from '@i18n-micro/vitepress/config'
```

## In-page translations

Each VitePress markdown file is a Vue SFC. Three patterns:

### Global components + `$t` (recommended in MD)

`createVitePressI18n` installs `@i18n-micro/vue`, which registers `I18nT` / `I18nLink` / `I18nGroup` / `I18nSwitcher` and `$t` / `$tc` / `$ts`.

```md
{{ $t('cta.readMore') }}

<I18nT keypath="greeting" :params="{ name: 'VitePress' }" />

<I18nLink to="/guide/demo">Demo</I18nLink>
```

Component names must be PascalCase or contain a hyphen (VitePress hydration rule).

### `useI18n` in `<script setup>`

```md
<script setup>
import { useI18n } from '@i18n-micro/vitepress'
const { t, tc, locale } = useI18n()
</script>

# {{ t('section.title') }}
```

### Prose vs JSON keys

| Content | How to localize |
|---------|-----------------|
| Long guides / articles | Duplicate `.md` per locale (VitePress) |
| Shared UI phrases, CTA, plurals | JSON + `$t` / `<I18nT>` |
| Page-only UI keys | `locales/pages/<path>/<locale>.json` |
| Tip/warning container titles | VitePress `locales.*.markdown.container` |

## Language dropdown

### Built-in (default theme)

When `locales` has more than one entry, VitePress shows **`VPNavBarTranslations`** (globe flyout). Wire `themeConfig.i18nRouting` (boolean or function) so corresponding pages resolve correctly. Use `createI18nRoutingFromAdapter` so the built-in menu matches `<I18nSwitcher>` paths.

### `<I18nSwitcher>` (custom themes only)

Use in custom layouts / page content — **not** in the default navbar next to the globe.

```ts
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { defineI18nTheme, I18nSwitcher } from '@i18n-micro/vitepress'

export default defineI18nTheme({
  ...DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      // custom theme example — avoid with default VPNavBarTranslations
      'doc-footer-before': () => h(I18nSwitcher),
    }),
})
```

Navigation always changes the URL via the VitePress router (`router.go`). Client-only locale without a path change is not supported (against VitePress’ model).

::: warning Do not mount both in the navbar
With the default theme, the globe menu (`VPNavBarTranslations`) is enough.
Putting `<I18nSwitcher>` in `nav-bar-content-*` duplicates the control. Prefer page/footer slots or a fully custom theme.
:::

| Scenario | Use |
|----------|-----|
| Default theme docs | Built-in language menu |
| Custom theme / hero / footer | `<I18nSwitcher>` |
| Both in navbar | Avoid — pick one |

## SSR notes

* Locale on prerender comes from the URL path (adapter), not cookies.
* Theme code must not touch `window` at import time.
* `$t` / components used in MD become dynamic Vue nodes (static prose stays static).

## API surface

| Export | Role |
|--------|------|
| `@i18n-micro/vitepress/config` → `withI18nMicro` | Config helper + virtual modules (Node) |
| `defineI18nTheme` | Zero-boilerplate theme (`enhanceApp`) |
| `createVitePressI18n` | Manual `enhanceApp` installer + path sync |
| `createVitePressRouterAdapter` | Path ↔ locale (prefix except default) |
| `createI18nRoutingFromAdapter` | Serializable `themeConfig.i18nRouting` |
| `messagesFromGlob` | Optional glob → messages map |
| `I18nT` / `I18nLink` / `I18nGroup` / `I18nSwitcher` / `useI18n` | Re-exported from `@i18n-micro/vue` |
| `/node` → `loadMessages` / `loadTranslationBuckets` | Node FS loaders (scripts; prefer `/config` for site config) |

## Resources

* **Playground**: [`packages/vitepress/playground`](https://github.com/s00d/nuxt-i18n-micro/tree/main/packages/vitepress/playground)
* **Repository**: <https://github.com/s00d/nuxt-i18n-micro>

## License

MIT
