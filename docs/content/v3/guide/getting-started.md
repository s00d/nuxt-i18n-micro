---
title: Getting Started with Nuxt I18n Micro
description: Install and configure Nuxt I18n Micro.
navigation:
  title: Getting Started
  order: 10
  group: Basics
---

Welcome to Nuxt I18n Micro! This guide will help you get up and running with our high-performance internationalization module for Nuxt.js.

## 📖 Overview

`Nuxt I18n Micro` is a lightweight internationalization module for Nuxt that delivers superior performance compared to traditional solutions. It's designed to reduce build times, memory usage, and server load, making it ideal for high-traffic and large projects.

:docs-diagram{name="guide-getting-started-1" alt="Diagram: 📖 Overview" width="487" height="1643"}

## 🤔 Why Choose Nuxt I18n Micro?

Here are some key benefits of using `Nuxt I18n Micro`:

- 🚀 **High Performance**: Significantly reduces build times and memory consumption
- 📦 **Compact Size**: Has minimal impact on your app's bundle size
- ⚙️ **Efficiency**: Optimized for large-scale applications with a focus on memory consumption and server load
- 🛠️ **Easy Setup**: Simple configuration with sensible defaults
- 🔧 **Flexible**: Extensive customization options for complex use cases
- 📚 **Well Documented**: Comprehensive documentation and examples

## 🚀 Quick Start

### Installation

Install the module in your Nuxt application:

::code-group

```bash [npm]
npm install nuxt-i18n-micro
```

```bash [yarn]
yarn add nuxt-i18n-micro
```

```bash [pnpm]
pnpm add nuxt-i18n-micro
```

```bash [bun]
bun add nuxt-i18n-micro
```

::

### Basic Configuration

Add the module to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', dir: 'ltr' },
      { code: 'fr', iso: 'fr-FR', dir: 'ltr' },
      { code: 'ar', iso: 'ar-SA', dir: 'rtl' },
    ],
    defaultLocale: 'en',
    translationDir: 'locales',
  },
})
```

### Folder Structure

Your translation files will be automatically generated when you run the application. Here is the full project structure:

```text
└── my-nuxt-app/
    ├── nuxt.config.ts
    ├── package.json
    ├── pages/
    │   ├── index.vue
    │   ├── about.vue
    │   └── articles/
    │       └── [id].vue
    ├── components/
    │   ├── Header.vue
    │   └── Footer.vue
    ├── locales/
    │   ├── en.json
    │   ├── fr.json
    │   ├── ar.json
    │   └── pages/
    │       ├── index/  # matches pages/index.vue
    │       │   ├── en.json
    │       │   ├── fr.json
    │       │   └── ar.json
    │       ├── about/  # matches pages/about.vue
    │       │   ├── en.json
    │       │   ├── fr.json
    │       │   └── ar.json
    │       └── articles-id/  # matches pages/articles/[id].vue
    │           ├── en.json
    │           ├── fr.json
    │           └── ar.json
    └── server/
        ├── api/
        │   └── example.ts
        └── tsconfig.json
```

::tip
**Folder Structure Explanation**

- **Root-Level Files** (`locales/en.json`, etc.) — translations shared across the entire app (menus, footer, common UI). With `translationPayloads.mode: 'premerged'` (default), they are merged into every page at build time.
- **Page-Specific Files** (`locales/pages/<route>/<locale>.json`) — translations unique to specific pages, loaded only when the page is visited
- **Dynamic Routes** — `pages/articles/[id].vue` maps to `locales/pages/articles-id/` (brackets replaced with dashes)
- **Auto-Generation** — all translation files are automatically created when missing during `nuxt dev`

::

::note
**Nuxt 4 (`app/` directory)**

The module supports both layouts:

- **Pages**: `pages/**/*.vue` (Nuxt 3) or `app/pages/**/*.vue` (Nuxt 4)
- **Translations**: keep `locales/` at the **project root** by default (recommended convention), not inside `app/`

```text
my-project/
├── app/
│   └── pages/
│       └── index.vue
├── locales/
│   ├── en.json
│   └── pages/
└── nuxt.config.ts
```

Optional colocation: `i18n: { translationDir: 'app/locales' }` (see [fixture `n3`](https://github.com/s00d/nuxt-i18n-micro/tree/main/test/fixtures/n3)).

For the optional CLI helper `text-to-i18n`, use [`nuxt-i18n-micro-cli` ≥ 2.1.1](/v3/guide/cli#-text-to-i18n-command) so `app/pages` and `app/components` are scanned from the project root.

::

### Basic Usage

Use translations in your components:

```vue
<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
    <p>{{ $t('description', { name: 'World' }) }}</p>

    <div>
      <button v-for="locale in $getLocales()" :key="locale.code" @click="$switchLocale(locale.code)">
        {{ locale.code }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from '#imports'

const { $t, $getLocales, $switchLocale } = useI18n()
</script>
```

## ⚙️ Configuration Options

The module exposes many options under the `i18n` key in `nuxt.config`. A minimal setup looks like this:

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', displayName: 'English' },
      { code: 'fr', iso: 'fr-FR', displayName: 'Français' },
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    translationDir: 'locales',
  },
})
```

For every option, default, and example, see the dedicated [Configuration Reference](/v3/guide/configuration).

| Area              | Key options                                                                                                          |
| ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| Locales & routing | `locales`, `defaultLocale`, `strategy`, `globalLocaleRoutes`                                                         |
| Translations      | `translationDir`, `fallbackLocale`, `disablePageLocales`, `translationPayloads`                                      |
| SEO               | `meta`, `metaBaseUrl`, `canonicalQueryWhitelist`                                                                     |
| Runtime / CDN     | `apiBaseUrl`, `apiBaseClientHost`, `apiBaseServerHost`, `cacheMaxSize`, `cacheTtl`, `httpCacheDuration`, `dateBuild` |
| Plugins           | `plugin`, `define`, `redirects`, `hooks`, `components`                                                               |

:::

## 🔄 Caching Mechanism

Nuxt I18n Micro v3 uses a multi-layer caching architecture built around `TranslationStorage` — a singleton class that uses `Symbol.for` on `globalThis` to ensure a single cache instance across bundles.

### Translation Loading Flow

:docs-diagram{name="guide-getting-started-2" alt="Diagram: Translation Loading Flow" width="896" height="1447"}

### Key Characteristics

- 🚀 **HTML stays small**: dictionaries are not inlined into `nuxtApp.payload` (same default as `@nuxtjs/i18n` preload off). The client loads `/{apiBaseUrl}/.../data.json` in the plugin via `await switchContext`. See [Performance](/v3/guide/performance#server-side-load-no-html-embed).
- 💾 **Process-global server cache**: `loadTranslationsFromServer()` caches merged results via `Symbol.for` — loaded once per locale/page, served from memory for all subsequent requests
- ⚡ **Single request per page**: With `mode: 'premerged'` (default), the API returns a pre-built file (root + page-specific + fallback merged at build time). With `mode: 'source'`, the same route merges compact source files at runtime — see [translationPayloads](/v3/guide/configuration#translationpayloads).
- 🔄 **HMR in development**: When `hmr: true`, translation file changes invalidate the server cache automatically

See the [Cache & Storage Architecture](/v3/api/i18n-cache-api) for in-depth details.

## 🌍 Locale State Management

In v3, all locale management goes through the centralized `useI18nLocale()` composable:

```ts
const { setLocale, getLocale, getPreferredLocale } = useI18nLocale()

// Set locale (updates useState + cookie atomically)
setLocale('fr')

// Get current locale
const locale = getLocale()
```

**Do not** use `useState('i18n-locale')` or `useCookie('user-locale')` directly. The `useI18nLocale()` composable manages both internally, ensuring consistency between server and client.

See the [Custom Language Detection](/v3/guide/custom-auto-detect) guide for advanced usage.

## 📚 Next Steps

Now that you have the basics set up, explore these advanced topics:

- **[Routing Strategies](/v3/guide/strategy)** - How locale prefixes and redirects work
- **[Per-Component Translations](/v3/guide/per-component-translations)** - Learn about `$defineI18nRoute`
- **[Custom Language Detection](/v3/guide/custom-auto-detect)** - Programmatic locale management with `useI18nLocale()`
- **[API Reference](/v3/api/methods)** - Complete method documentation
- **[Cache & Storage](/v3/api/i18n-cache-api)** - Translation cache architecture
- **[Examples](/v3/examples)** - Real-world usage examples
- **[Migration Guide](/v3/guide/migration)** - Migrating from other i18n solutions or v2
