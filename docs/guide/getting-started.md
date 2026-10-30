---
title: 'Getting Started with Nuxt I18n Micro'
description: 'Install and configure Nuxt I18n Micro.'
outline: 'deep'
---

# 🌐 Getting Started with Nuxt I18n Micro

Welcome to Nuxt I18n Micro! This guide will help you get up and running with our high-performance internationalization module for Nuxt.js.

## 📖 Overview

`Nuxt I18n Micro` is a lightweight internationalization module for Nuxt that delivers superior performance compared to traditional solutions. It's designed to reduce build times, memory usage, and server load, making it ideal for high-traffic and large projects.

```mermaid
flowchart LR
    subgraph Core["🌐 Nuxt I18n Micro"]
        direction TB
        T[Translations]
        R[Routing]
        P[Performance]
        S[SEO]
        D[DevTools]
    end

    T --> T1[Global]
    T --> T2[Page-specific]
    T --> T3[Component]
    T --> T4[Fallback]

    R --> R1[prefix]
    R --> R2[no_prefix]
    R --> R3[prefix_except_default]

    P --> P1[Lazy loading]
    P --> P2[Caching]
    P --> P3[SSR optimized]

    S --> S1[hreflang]
    S --> S2[Canonical]
    S --> S3[Open Graph]

    D --> D1[HMR]
    D --> D2[TypeScript]
    D --> D3[CLI]
```

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

::: code-group

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

:::

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

```tree
- name: my-nuxt-app
  description: "Nuxt project with i18n-micro"
  children:
    - name: nuxt.config.ts
      description: "module config"
      highlight: true
      preview: "export default defineNuxtConfig({\n  modules: ['nuxt-i18n-micro'],\n  i18n: {\n    locales: [\n      { code: 'en', iso: 'en-US', dir: 'ltr' },\n      { code: 'fr', iso: 'fr-FR', dir: 'ltr' },\n      { code: 'ar', iso: 'ar-SA', dir: 'rtl' },\n    ],\n    defaultLocale: 'en',\n    translationDir: 'locales',\n    meta: true,\n  },\n})"
    - name: package.json
      preview: "{\n  \"name\": \"my-nuxt-app\",\n  \"private\": true,\n  \"scripts\": {\n    \"dev\": \"nuxt dev\",\n    \"build\": \"nuxt build\",\n    \"generate\": \"nuxt generate\"\n  },\n  \"dependencies\": {\n    \"nuxt\": \"^3.x\",\n    \"nuxt-i18n-micro\": \"^3.x\"\n  }\n}"
    - name: pages
      description: "your Nuxt pages"
      children:
        - name: index.vue
          description: "home page"
          preview: "<template>\n  <div>\n    <h1>{{ $t('welcome') }}</h1>\n    <p>{{ $t('description') }}</p>\n  </div>\n</template>"
        - name: about.vue
          description: "about page"
          preview: "<template>\n  <div>\n    <h1>{{ $t('title') }}</h1>\n    <p>{{ $t('content') }}</p>\n  </div>\n</template>"
        - name: articles
          description: "dynamic route"
          children:
            - name: "[id].vue"
              preview: "<template>\n  <div>\n    <h1>{{ $t('article_title') }}</h1>\n  </div>\n</template>\n\n<script setup>\nconst route = useRoute()\nconst id = route.params.id\n</script>"
    - name: components
      children:
        - name: Header.vue
          preview: "<template>\n  <nav>\n    <i18n-link :to=\"{ name: 'index' }\">\n      {{ $t('menu.home') }}\n    </i18n-link>\n    <i18n-link :to=\"{ name: 'about' }\">\n      {{ $t('menu.about') }}\n    </i18n-link>\n    <i18n-switcher />\n  </nav>\n</template>"
        - name: Footer.vue
          preview: "<template>\n  <footer>\n    <p>{{ $t('footer.copyright') }}</p>\n  </footer>\n</template>"
    - name: locales
      description: "translation files"
      highlight: true
      children:
        - name: en.json
          description: "root-level translations (shared across all pages)"
          preview: "{\n  \"menu\": {\n    \"home\": \"Home\",\n    \"about\": \"About Us\"\n  },\n  \"footer\": {\n    \"copyright\": \"© 2025 My App\"\n  }\n}"
        - name: fr.json
          description: "root-level translations (shared across all pages)"
          preview: "{\n  \"menu\": {\n    \"home\": \"Accueil\",\n    \"about\": \"À propos\"\n  },\n  \"footer\": {\n    \"copyright\": \"© 2025 Mon App\"\n  }\n}"
        - name: ar.json
          description: "root-level translations (shared across all pages)"
          preview: "{\n  \"menu\": {\n    \"home\": \"الرئيسية\",\n    \"about\": \"من نحن\"\n  },\n  \"footer\": {\n    \"copyright\": \"© 2025 تطبيقي\"\n  }\n}"
        - name: pages
          description: "page-specific translations"
          children:
            - name: index
              note: "matches pages/index.vue"
              children:
                - name: en.json
                  preview: "{\n  \"welcome\": \"Welcome to My App\",\n  \"description\": \"A fast Nuxt application with i18n support.\"\n}"
                - name: fr.json
                  preview: "{\n  \"welcome\": \"Bienvenue sur Mon App\",\n  \"description\": \"Une application Nuxt rapide avec support i18n.\"\n}"
                - name: ar.json
                  preview: "{\n  \"welcome\": \"مرحباً بك في تطبيقي\",\n  \"description\": \"تطبيق Nuxt سريع مع دعم الترجمة.\"\n}"
            - name: about
              note: "matches pages/about.vue"
              children:
                - name: en.json
                  preview: "{\n  \"title\": \"About Us\",\n  \"content\": \"Learn more about our mission.\"\n}"
                - name: fr.json
                  preview: "{\n  \"title\": \"À propos\",\n  \"content\": \"En savoir plus sur notre mission.\"\n}"
                - name: ar.json
                  preview: "{\n  \"title\": \"من نحن\",\n  \"content\": \"تعرف على مهمتنا.\"\n}"
            - name: articles-id
              note: "matches pages/articles/[id].vue"
              children:
                - name: en.json
                  preview: "{\n  \"article_title\": \"Article Details\"\n}"
                - name: fr.json
                  preview: "{\n  \"article_title\": \"Détails de l'article\"\n}"
                - name: ar.json
                  preview: "{\n  \"article_title\": \"تفاصيل المقال\"\n}"
    - name: server
      open: false
      children:
        - name: api
          children:
            - name: example.ts
              preview: "export default defineEventHandler((event) => {\n  return { hello: 'world' }\n})"
        - name: tsconfig.json
          preview: "{\n  \"extends\": \"../.nuxt/tsconfig.server.json\"\n}"
```

::: tip Folder Structure Explanation

- **Root-Level Files** (`locales/en.json`, etc.) — translations shared across the entire app (menus, footer, common UI). With `translationPayloads.mode: 'premerged'` (default), they are merged into every page at build time.
- **Page-Specific Files** (`locales/pages/<route>/<locale>.json`) — translations unique to specific pages, loaded only when the page is visited
- **Dynamic Routes** — `pages/articles/[id].vue` maps to `locales/pages/articles-id/` (brackets replaced with dashes)
- **Auto-Generation** — all translation files are automatically created when missing during `nuxt dev`

:::

::: info Nuxt 4 (`app/` directory)

The module supports both layouts:

- **Pages**: `pages/**/*.vue` (Nuxt 3) or `app/pages/**/*.vue` (Nuxt 4)
- **Translations**: keep `locales/` at the **project root** by default (recommended convention), not inside `app/`

```tree
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

For the optional CLI helper `text-to-i18n`, use [`nuxt-i18n-micro-cli` ≥ 2.1.1](/guide/cli#-text-to-i18n-command) so `app/pages` and `app/components` are scanned from the project root.

:::

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

For every option, default, and example, see the dedicated [Configuration Reference](./configuration.md).

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

```mermaid
flowchart TB
    subgraph Client["🖥️ Client Side"]
        A[Page Request] --> D{TranslationStorage cache?}
        D -->|Hit| E[Return Cached]
        D -->|Miss| F["$fetch /_locales/..."]
        F --> G[Store in TranslationStorage]
        G --> E
        E --> H[NuxtI18n view layer]
    end

    subgraph Server["🖧 Server Side"]
        I[SSR Request] --> J{Server process cache?}
        J -->|Hit| K[Return Cached]
        J -->|Miss| L[loadTranslationsFromServer]
        L --> M["Load payload (premerged file or source + runtime merge)"]
        M --> N[Cache in process-global Map]
        N --> K
        K --> O[Render HTML — dictionaries stay in memory, not in payload]
    end

    A -.->|SSR| I
    H --> P[Render Page]
```

### Key Characteristics

- 🚀 **HTML stays small**: dictionaries are not inlined into `nuxtApp.payload` (same default as `@nuxtjs/i18n` preload off). The client loads `/{apiBaseUrl}/.../data.json` in the plugin via `await switchContext`. See [Performance](./performance.md#server-side-load-no-html-embed).
- 💾 **Process-global server cache**: `loadTranslationsFromServer()` caches merged results via `Symbol.for` — loaded once per locale/page, served from memory for all subsequent requests
- ⚡ **Single request per page**: With `mode: 'premerged'` (default), the API returns a pre-built file (root + page-specific + fallback merged at build time). With `mode: 'source'`, the same route merges compact source files at runtime — see [translationPayloads](./configuration.md#translationpayloads).
- 🔄 **HMR in development**: When `hmr: true`, translation file changes invalidate the server cache automatically

See the [Cache & Storage Architecture](../api/i18n-cache-api.md) for in-depth details.

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

See the [Custom Language Detection](./custom-auto-detect.md) guide for advanced usage.

## 📚 Next Steps

Now that you have the basics set up, explore these advanced topics:

- **[Routing Strategies](./strategy.md)** - How locale prefixes and redirects work
- **[Per-Component Translations](./per-component-translations.md)** - Learn about `$defineI18nRoute`
- **[Custom Language Detection](./custom-auto-detect.md)** - Programmatic locale management with `useI18nLocale()`
- **[API Reference](../api/methods.md)** - Complete method documentation
- **[Cache & Storage](../api/i18n-cache-api.md)** - Translation cache architecture
- **[Examples](../examples.md)** - Real-world usage examples
- **[Migration Guide](./migration.md)** - Migrating from other i18n solutions or v2

## Using translations in components

Once the module is installed and configured, you can display translations by calling `$t('your_key')` within your Vue templates and scripts.

### 1. Root-Level & Page-Specific Translation Files

1. **Root-level** translations reside directly under the `/locales` folder (e.g. `/locales/en.json`, `/locales/fr.json`). At build time, they are automatically merged into every page-specific file, making them available on all pages.
2. **Page-specific** translations live under `/locales/pages/...`, matching your Nuxt pages folder structure:

```tree
locales/
├── en.json
├── fr.json
└── pages/
    └── dir1/
        ├── en.json
        └── fr.json
```

### 2. Template Usage with `$t`

In your `.vue` files, you can directly use `$t` in the template:

```vue
<template>
  <div>
    <!-- Root-level translation (available on all pages) -->
    <p>{{ $t('test_key') }}</p>
    <!-- Displays: Hello World! -->

    <!-- Page-specific translation (if this page is /dir1) -->
    <p>{{ $t('local_key') }}</p>
    <!-- Displays: This is a page-specific translation for /dir1. -->

    <!-- Nested key -->
    <p>{{ $t('nested.key.deeper') }}</p>
    <!-- Displays: Nested translation here -->

    <!-- Placeholder usage -->
    <p>{{ $t('greeting', { name: 'Alice' }) }}</p>
    <!-- Displays: Hello, Alice! -->
  </div>
</template>

<script setup lang="ts">
// No need to import anything from 'nuxt-i18n-micro'.
// The plugin automatically provides `useI18n` and `$t`.
const { $t } = useI18n()

// You can now use $t in your script, for example:
console.log($t('test_key')) // "Hello World!"
</script>
```

::: tip `$t` vs `$ts` — choosing the right method
`$t` can return **objects** if the key points to a nested JSON node (e.g. `$t('header')` → `{ title: "Hi" }`). In templates this renders as `[object Object]`. Use `$ts` when you need a guaranteed string, or provide a more specific key like `$t('header.title')`. See [API Reference — $t vs $ts](/api/methods#t) for details.
:::

### 3. Switching the Current Locale

To change languages in your app, you can retrieve `$locale` from `useI18n()` and assign it a new code:

```vue
<template>
  <div>
    <button @click="$switchLocale('en')">English</button>
    <button @click="$switchLocale('fr')">Français</button>
  </div>
</template>

<script setup lang="ts">
// The plugin auto-injects these references
const { $t, $switchLocale } = useI18n()
</script>
```

### 4. Nested Keys and Placeholders

- **Nested keys** use dot notation, e.g. `nested.key.deeper`.
- **Placeholders** allow you to insert dynamic values:
  ```json
  { "greeting": "Hello, {name}!" }
  ```
  ```vue
  <p>{{ $t('greeting', { name: 'Alice' }) }}</p>
  <!-- Displays: Hello, Alice! -->
  ```

### 5. Tips & Best Practices

- **Conflicting Keys**: If a page-specific file contains the same key as a root-level file, the page-specific version takes priority (root translations are merged as a base at build time).
- **Disabling Page Files**: If you'd rather not use page-specific translations, you can set `disablePageLocales: true` in your Nuxt config. This way, only the `/locales/*.json` files are used.
- **No Direct Imports**: You don't need to do `import { useI18n } from 'nuxt-i18n-micro'`; the module's auto-injection feature handles it for you.

That's it! With these steps, you can quickly **start retrieving translations** from root-level or page-specific JSON files and **display them** in your Nuxt application using `$t`.

### Additional Resources

To explore more advanced features, be sure to check out:

1. **`<i18n-t>` Component**  
   The `<i18n-t>` component is a powerful alternative to `$t`, especially useful for situations involving nested elements, advanced placeholder usage, and more complex translation structures.

- **Documentation**: [i18n-t](/components/i18n-t)

2. **`useI18n` Composable**  
   The `useI18n` composable offers a complete set of functions and reactive properties for managing translations, handling locale switching, formatting, and more.

- **Documentation**: [useI18n](/composables/useI18n)
