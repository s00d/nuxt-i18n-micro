---
outline: deep
---

# News

## Nuxt I18n Micro v2.14.1 — New Integrations for Node.js, Vue, and Astro

**Date**: 2025-12-07

**Version**: `v2.14.0`

![Integrations](/2.14.1.png)

We're excited to announce **v2.14.1** with brand new integrations for Node.js, Vue 3, and Astro! These packages bring the same powerful i18n capabilities to your favorite frameworks, sharing the same core logic for consistency and performance.

### What's New?

- **@i18n-micro/node** - Use i18n translations in any Node.js application, CLI tool, or backend service
- **@i18n-micro/vue** - Vue 3 plugin for internationalization with reactive translations and route-specific support
- **@i18n-micro/astro** - Astro integration for internationalization with full TypeScript support
- **@i18n-micro/types-generator** - Automatic TypeScript type generation for translation keys with full type safety and IDE autocomplete

### Key Features

All integrations share the same core benefits:
- Lightweight and performant
- Route-specific translations support
- Built-in pluralization
- Number, date, and relative time formatting
- Full TypeScript support
- Same JSON translation file structure

**Types Generator** provides additional developer experience enhancements:
- Automatic type generation from JSON translation files
- Type-safe translation keys with compile-time validation
- Full IDE autocomplete support
- Hot reload on translation file changes
- Zero runtime overhead

For detailed documentation and examples, visit the [repository](https://github.com/s00d/nuxt-i18n-micro) or check out the [documentation](https://s00d.github.io/nuxt-i18n-micro/).

---

## Nuxt I18n Micro v2.0.0 — Dev HMR for Translations

**Date**: 2025-10-30

**Version**: `v2.0.0`

![HMR Update](/2.0.0.png)

We’re introducing server‑side HMR for translation files in development. When a JSON translation changes, the server cache invalidates only the affected keys, and subsequent requests immediately receive fresh data—no restarts required.

### What’s New?

- Server‑side HMR for translation files
- Instant cache invalidation per page/locale
- Seamless DX while editing content

### How it works

- Watcher in `src/runtime/server/plugins/watcher.dev.ts` observes `<rootDir>/<translationDir>/**/*.json`
- Page files (e.g., `pages/<page>/<locale>.json`) invalidate `_locales:merged:<page>:<locale>`
- Global files (e.g., `<locale>.json`) invalidate all merged keys for that locale
- Auto‑registered from `src/module.ts` in dev when `experimental.hmr !== false`

### Configuration

```ts
export default defineNuxtConfig({
  i18n: {
    experimental: { hmr: true }, // default in dev
  }
})
```

## Redesigned DevTools in Nuxt I18n Micro v1.73.0 🎉

**Date**: 2025-01-27

**Version**: `v1.73.0`

![DevTools Update](/1.73.0-devtools.gif)

We’re excited to unveil the **fully revamped DevTools** in **v1.73.0**, bringing a modern, intuitive experience to your i18n workflow! The update introduces powerful new features, improved usability, and a host of enhancements to streamline localization and translation management.

### What’s New?

1. New Editor
2. File Tree Viewer
3. Online Translator
4. Enhanced Settings
5. Advanced Statistics


## Nuxt I18n Micro v1.65.0

**Date**: 2025-01-20 

**Version**: `v1.65.0`

![1.65.0](/1.65.0.jpg)

We’re thrilled to announce **v1.65.0**, featuring a **complete rewrite of core logic** for better performance and maintainability! This release includes enhanced TypeScript support, client-side locale redirection, and streamlined translation handling. Upgrade now for a smoother, faster experience! 🚀

[Learn more](https://github.com/s00d/nuxt-i18n-micro/blob/main/CHANGELOG.md#v1650)

## Optimized Translation Loading Algorithm Released

**Date**: 2025-01-10

**Version Introduced**: `v1.58.0`

![Optimized Loading Demo](/optimized-loading.png)

We are thrilled to announce the release of a **new algorithm for loading translations** in Nuxt I18n Micro. This update introduces significant performance improvements, a cleaner architecture, and more efficient memory usage.

### What’s New?

The new translation-loading algorithm focuses on:
1. **Optimized File Merging**: Enhanced the deep merge functionality to handle translations more efficiently.
2. **Caching Enhancements**: Leveraged server storage for pre-rendered translations, reducing redundant computations.
3. **Streamlined Code**: Simplified file paths and structure for better maintainability.

---

### Key Benefits

#### **1. Faster Build Times**
The new algorithm reduces build times by efficiently handling translation files and minimizing memory overhead.

- **Old Build Time**: 7.20 seconds
- **New Build Time**: 6.91 seconds
- **Improvement**: **4.03% faster**

#### **2. Reduced CPU Usage**
Lower maximum and average CPU usage during builds and stress tests:

- **Build Max CPU**: From **257.60%** → **198.20%** (23.06% lower)
- **Stress Test Avg CPU**: From **93.85%** → **89.14%** (5.01% lower)

#### **3. Lower Memory Usage**
Memory consumption has been significantly optimized across builds and runtime stress tests:

- **Build Max Memory**: From **1286.00 MB** → **885.19 MB** (31.15% lower)
- **Stress Test Max Memory**: From **624.22 MB** → **429.52 MB** (31.20% lower)

#### **4. Enhanced Response Times**
Stress test response times saw drastic improvement:

- **Average Response Time**: From **411.50 ms** → **9.30 ms** (97.74% faster)
- **Max Response Time**: From **2723.00 ms** → **187.00 ms** (93.13% faster)

#### **5. Increased Request Throughput**
The new algorithm boosts the number of handled requests per second:

- **Requests per Second**: From **288.00** → **305.00** (5.90% increase)

---

### Why It’s Important

Localization is essential for global applications, and improving translation-loading performance can have a direct impact on:
- **User Experience**: Faster response times lead to a smoother user experience.
- **Scalability**: Lower resource usage allows better handling of high traffic.
- **Developer Productivity**: Reduced build times and a simplified codebase streamline workflows.

---

### How It Works

1. **Efficient Deep Merging**
  - The algorithm has been rewritten to handle translation merging more intelligently, ensuring minimal memory overhead and faster operations.

2. **Smart Caching**
  - Server-side storage is now used to cache translations during pre-rendering, which are then reused during runtime. This avoids repetitive reads and merges.

3. **Streamlined File Loading**
  - Translation files are loaded in a more predictable and maintainable way by unifying fallback handling and caching.


## [New CLI Feature: `text-to-i18n`](/guide/cli#🔄-text-to-i18n-command)

**Date**: 2024-12-24

**Cli Version Introduced**: `v1.1.0`

![text-to-i18n Command Demo](/text-to-i18n.gif)

We’re excited to announce the new `text-to-i18n` command in the Nuxt I18n Micro CLI! This powerful feature automates the process of extracting hardcoded text strings from your codebase and converting them into i18n translation keys. It’s designed to save time, reduce errors, and streamline your localization workflow.

### Key Benefits

- **Automated Text Extraction**: Scans Vue templates, JavaScript, and TypeScript files.
- **Seamless Key Generation**: Creates structured translation keys based on file paths and content.
- **Efficient Translation Management**: Updates your translation files while preserving existing entries.

### How It Works

1. **File Scanning**: Processes files in key directories like `pages`, `components`, and `plugins`.
2. **Text Processing**: Identifies and extracts translatable strings, generating unique keys.
3. **Translation Updates**: Automatically inserts new keys into your translation files and maintains their nested structure.

### Usage

```bash
i18n-micro text-to-i18n [options]
```

Example:

```bash
i18n-micro text-to-i18n --translationFile locales/en.json --context auth
```

### Example Transformations

#### Before
```vue
<template>
  <div>
    <h1>Welcome to our site</h1>
    <p>Please sign in to continue</p>
  </div>
</template>
```

#### After
```vue
<template>
  <div>
    <h1>{{ $t('pages.home.welcome_to_our_site') }}</h1>
    <p>{{ $t('pages.home.please_sign_in') }}</p>
  </div>
</template>
```

For more details, check out the [documentation](/guide/cli#🔄-text-to-i18n-command).

---

