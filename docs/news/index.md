---
outline: deep
---

# News

## Nuxt I18n Micro v3.0.0 — Performance Optimization, Route & Path Strategy Packages

**Date**: 2026-02-04

**Version**: `v3.0.0`

![RouteGenerator](/3.0.0.png)

We're announcing **v3.0.0** with a **major architectural overhaul**: complete rewrite of the translation storage system for maximum performance, route generation and runtime path logic are now split into dedicated packages, and the redirect flow has been redesigned for better reliability and Serverless compatibility.

### What's New?

#### Performance Optimization — New Translation Storage Architecture

The translation loading and caching system has been completely rewritten for maximum performance:

- **Centralized TranslationStorage class** — A new `TranslationStorage` class (`src/runtime/utils/storage.ts`) provides a unified storage for both client and server. Uses `globalThis` with `Symbol.for` to guarantee a true singleton across the entire Node.js process, preventing cache duplication across bundled modules.

- **Optimized `$t()` function (tFast)** — The translation function uses a direct lookup against a single active dictionary:
  1. All translations (root + page-specific + fallback) are pre-merged at build time into a single file per page
  2. On same-locale navigation, new page translations are cumulatively merged into the active dictionary (prevents key flickering during transition animations)
  3. Supports nested keys (`key.subkey.subsubkey`) with optimized path resolution
  4. No Map lookups or locale/route calculations on each call — uses pre-computed context

- **Server-side injection via `window.__I18N__`** — Translations loaded during SSR are injected into the HTML as a script tag. The client reads directly from `window.__I18N__` on initial load, avoiding duplicate fetches.

- **Local chunk cache in plugin** — The plugin maintains a local `loadedChunks` Map that stores all loaded translation chunks. Once loaded, translations are never re-fetched during the page lifecycle.

- **Build-time pre-merge** — A `preMergeLocales` step in `module.ts` merges all layers, fallback locale chains, and root-level translations into every page file at build time. The server-loader simply reads a single pre-built file — no runtime merging needed.

**Performance improvements:**
- Reduced memory allocation per request (no object re-creation on each `$t()` call)
- Lower garbage collection pressure
- Faster response times under load
- Stable memory usage pattern (no "jumping" graphs)

#### Route & Path Strategy Packages

- **@i18n-micro/route-strategy** — Build-time route generation: extends Nuxt pages with localized routes, handles aliases, nested routes, and custom paths per strategy. Single entry point: `new RouteGenerator(options)` and `extendPages(pages)`. Strategies (`no_prefix`, `prefix`, `prefix_except_default`, `prefix_and_default`) are implemented as separate classes and selected via a factory.
- **@i18n-micro/path-strategy** — Runtime path and locale handling: provides `PathStrategy` for building localized paths, resolving redirects, and locale switching. Tree-shakeable subpath exports (`/prefix`, `/no-prefix`, etc.) so only the selected strategy is bundled. Uses pure functions for route resolution and pre-computed context flags for minimal allocations.
- **Structured package layout** — Route logic in `@i18n-micro/route-strategy` with `core/`, `strategies/`. Path strategy in `@i18n-micro/path-strategy` with a flat `src/` structure: `types.ts`, `path.ts`, `resolver.ts`, `helpers.ts`, and `strategies/`.
- **Consistent behavior** — Alias handling, parent–child path joining, custom `globalLocaleRoutes` / `filesLocaleRoutes` / `routeLocales`, and immutability guarantees are covered by a dedicated test suite.

#### Redirect Architecture Overhaul

- **Server middleware** — Redirects and 404 handling run in Nitro middleware (`i18n.global.ts`). This executes before Nuxt render, so redirects from `/` to `/<locale>/` happen without an error flash when a locale cookie is present.
- **Client plugin (client-side)** — A client-only plugin (`06.client-redirect.client.ts`) runs after hydration and handles redirects when `useI18nLocale()` or cookie sets a non-default locale. Nitro runs before Nuxt, so the server cannot see cookie/state changes from user plugins; the client plugin covers this case.
- **No fallback component** — The `locale-redirect.vue` fallback component and `fallbackRedirectComponentPath` option have been removed. Redirect logic is fully handled by the server middleware and client plugin.
- **Custom path support** — Paths like `/kontakt` for German (via `globalLocaleRoutes`) are correctly recognized as valid without a locale prefix, avoiding incorrect 404s during prerender.
- **customRegexMatcher fix** — When using `customRegexMatcher`, the pattern now matches the **entire** first path segment (with `^` and `$` anchors). This prevents false 404s for routes like `/locale-test` when the pattern `[a-z]{2}-[a-z]{2}` would previously match substrings.
- **autoDetectPath fix** — The `autoDetectPath` option now correctly compares against the original URL path, preventing unwanted redirects when explicitly navigating to locale-prefixed URLs.

#### useI18nLocale Composable

- **Centralized locale management** — New `useI18nLocale()` composable replaces `useLocaleCookies` and provides a single entry point for locale state, cookies, and sync utilities.
- **API** — `locale`, `localeCookie`, `hashCookie`, `getLocale()`, `getPreferredLocale()`, `setLocale()`, `syncLocale()`, `isValidLocale()`, `getEffectiveLocale()`, `resolveInitialLocale()`.
- **Programmatic locale** — Use `useI18nLocale().setLocale(locale)` in server plugins instead of `useState('i18n-locale')` for cleaner, centralized locale handling.

#### Custom Auto-Detection & Configuration

- **`getI18nConfig()`** — Custom plugins (e.g. for locale detection) should use `getI18nConfig()` from `#build/i18n.strategy.mjs` instead of `useRuntimeConfig().public.i18nConfig`. This provides direct access to the resolved i18n config (e.g. `localeCookie`) without relying on runtime config.
- **Cookie name** — Use `getI18nConfig().localeCookie ?? 'user-locale'` when implementing custom detection logic.

#### Simplified Integration Packages

All integration packages (`@i18n-micro/vue`, `@i18n-micro/astro`, `@i18n-micro/node`, `@i18n-micro/react`, `@i18n-micro/preact`, `@i18n-micro/solid`) have been simplified and optimized, sharing the same core translation logic.

#### Configuration Changes

- **`previousPageFallback` removed** — This option is no longer needed. The new cumulative merge strategy automatically keeps previous page translations available during transition animations, then cleans them up via the `page:transition:finish` hook.
- **`hmr`** — Moved from `experimental.hmr` to a top-level option. Controls server-side HMR for translation files (enabled by default in development).

```typescript
// Before (v2.x)
export default defineNuxtConfig({
  i18n: {
    experimental: {
      hmr: true,
    }
  }
})

// After (v3.0.0)
export default defineNuxtConfig({
  i18n: {
    hmr: true,
  }
})
```

### Breaking Changes

- **`fallbackRedirectComponentPath`** — Removed. The module no longer uses a fallback route component for redirects. If you had a custom component path configured, remove it from your config.
- **`useLocaleCookies`** — Removed. Use `useI18nLocale()` instead. The new composable provides `locale`, `localeCookie`, `hashCookie`, `setLocale()`, `syncLocale()`, and more.
- **`experimental.i18nPreviousPageFallback` / `previousPageFallback`** — Removed entirely. The cumulative merge strategy handles transition flickering automatically. Remove this option from your config.
- **`experimental.hmr`** — Moved to `hmr`. Update your config if you were using this option.
- **Custom plugins** — If your custom locale-detection plugin used `useRuntimeConfig().public.i18nConfig`, switch to `getI18nConfig()` from `#build/i18n.strategy.mjs`. Prefer `useI18nLocale().setLocale()` over `useState('i18n-locale')`. See [Custom Language Detection](/guide/custom-auto-detect) for updated examples.
- **Internal file changes** — `load-from-storage.ts` and `translation-loader.ts` have been removed and replaced with `storage.ts` and `server-loader.ts`. If you were importing from these files directly (not recommended), update your imports.

### Why It Matters

- **Performance**: Centralized singleton cache eliminates per-request object creation and reduces GC pressure.
- **Maintainability**: Route and path logic live in dedicated packages with clear boundaries and types.
- **Testing**: Strategy behavior and edge cases are tested in isolation.
- **Reliability**: Split server (Nitro) and client redirect logic avoids timing issues when cookie/useState are set by user plugins.
- **Serverless-ready**: Nitro plugin runs in the same context as Nitro handlers, compatible with Edge/Workers.
- **Documentation**: Routing behavior is documented in the [Strategy guide](/guide/strategy) and in the [path-strategy](https://github.com/s00d/nuxt-i18n-micro/tree/main/packages/path-strategy) and [route-strategy](https://github.com/s00d/nuxt-i18n-micro/tree/main/packages/route-strategy) packages.

For upgrade notes and a full list of changes, see the [changelog](https://github.com/s00d/nuxt-i18n-micro/blob/main/CHANGELOG.md).

---

## Nuxt I18n Micro v2.14.1 — New Integrations for Node.js, Vue, and Astro

**Date**: 2025-12-07

**Version**: `v2.14.1`

![Integrations](/2.14.0.png)

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
- Root-level files (e.g., `<locale>.json`) invalidate all merged keys for that locale
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

