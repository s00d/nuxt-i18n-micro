---
outline: deep
---

# 🔄 Migration from `nuxt-i18n` to `Nuxt I18n Micro`

## 📖 Introduction

Migrating from `nuxt-i18n` to `Nuxt I18n Micro` can significantly improve the performance of your Nuxt application, especially in high-traffic environments or projects with large translation files. This guide provides a step-by-step approach to help you smoothly transition from `nuxt-i18n` to `Nuxt I18n Micro`.

## 🚀 Why Migrate?

The `Nuxt I18n Micro` module offers several advantages over the traditional `nuxt-i18n`:

- **⚡ Improved Performance**: Faster build times, lower memory usage, and smaller bundle sizes.
- **🔧 Simplified Configuration**: A more streamlined setup process with fewer moving parts.
- **📉 Better Resource Management**: Optimized handling of large translation files and reduced server load.

## 🔍 Key Differences

Before you begin the migration process, it’s essential to understand the key differences between `nuxt-i18n` and `Nuxt I18n Micro`:

- **🌐 Route Management**: `Nuxt I18n Micro` uses `@i18n-micro/route-strategy` (build-time) and `@i18n-micro/path-strategy` (runtime) to extend Nuxt pages with localized routes based on the chosen strategy (prefix, no_prefix, prefix_except_default, prefix_and_default). Route names follow a consistent pattern (e.g. `localized-about-en`, `localized-about-de`) and can be matched with a single regex when needed.
- **🗂️ Translation Files**: Only JSON files are supported in `Nuxt I18n Micro`. The translations are split into global and page-specific files, which are auto-generated in development mode if not present.
- **📈 SEO Integration**: `Nuxt I18n Micro` offers built-in SEO optimization with automatic meta tag generation and support for `hreflang` tags.

## 🛠️ Step-by-Step Migration

### 1. 🛠️ Install `Nuxt I18n Micro`

First, add `Nuxt I18n Micro` to your Nuxt project:

```bash
npm install nuxt-i18n-micro
```

### 2. 🔄 Update Configuration

Replace your existing `nuxt-i18n` configuration in `nuxt.config.ts` with the `Nuxt I18n Micro` configuration. Here’s an example:

**Before (nuxt-i18n):**

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-i18n'],
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US' },
      { code: 'fr', iso: 'fr-FR' },
    ],
    defaultLocale: 'en',
    vueI18n: './i18n.config.js',
  },
})
```

**After (Nuxt I18n Micro):**

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', dir: 'ltr' },
      { code: 'fr', iso: 'fr-FR', dir: 'ltr' },
    ],
    defaultLocale: 'en',
    translationDir: 'locales',
    meta: true,
  },
})
```

### 3. 🗂️ Reorganize Translation Files

Move your translation files to the `locales` directory. Ensure they are in JSON format and organized by locale. For example:

```plaintext
  /locales
  ├── /pages
  │   ├── /index
  │   │   ├── en.json
  │   │   ├── fr.json
  │   │   └── ar.json
  │   ├── /about
  │   │   ├── en.json
  │   │   ├── fr.json
  │   │   └── ar.json
  ├── en.json
  ├── fr.json
  └── ar.json
```

### 4. 🔗 Replace `<nuxt-link>` with `<NuxtLink>`

If you are using `<nuxt-link>` for navigation, replace it with `<NuxtLink>` to ensure compatibility with the new module.

**Before:**

```vue
<nuxt-link :to="{ name: 'index' }">Home</nuxt-link>
```

**After:**

```vue
<NuxtLink :to="$localeRoute({ name: 'index' })">Home</NuxtLink>
<!-- or -->
<i18n-link :to="{ name: 'index' }">Home</i18n-link>
```

### 5. 🛠️ Handle SEO Configurations

Ensure that your SEO configurations are updated to take advantage of `Nuxt I18n Micro`’s automatic meta tag generation. Remove any redundant SEO configurations that were specific to `nuxt-i18n`.

### 6. 🧪 Test Your Application

After completing the migration steps, thoroughly test your application to ensure that all translations are loading correctly and that navigation between locales works as expected. Pay special attention to SEO-related tags and ensure that they are generated as intended.

## 📦 Migrating from v2.x to v3.0.0

If you're upgrading from Nuxt I18n Micro v2.x to v3.0.0, consider the following changes:

### Removed: `fallbackRedirectComponentPath`

The `fallbackRedirectComponentPath` option and the `locale-redirect.vue` fallback component have been removed. Redirect logic is now fully handled by server middleware (`i18n.global.ts`) and a client plugin (client-side).

**Action:** Remove `fallbackRedirectComponentPath` from your `nuxt.config.ts` if you had it configured:

```diff
 i18n: {
   strategy: 'prefix_except_default',
-  fallbackRedirectComponentPath: '~/components/MyRedirect.vue',
 }
```

### Custom Plugins: Use `getI18nConfig()` Instead of `useRuntimeConfig`

If you have custom locale-detection plugins that read i18n config from runtime config, switch to `getI18nConfig()`:

**Before (v2.x):**

```ts
const config = useRuntimeConfig()
const cookieName = config.public.i18nConfig?.localeCookie || 'user-locale'
```

**After (v3.0.0):**

```ts
import { getI18nConfig } from '#build/i18n.strategy.mjs'

const { localeCookie: configCookie } = getI18nConfig()
const cookieName = configCookie ?? 'user-locale'
```

See [Custom Language Detection](/guide/custom-auto-detect) for full examples.

### Redirect Architecture

Redirects now use server middleware (`i18n.global.ts`) and a client-only plugin. No code changes are required for standard setups. If you relied on the fallback component for custom redirect logic, implement that logic in a custom plugin with `order: -10` and `useI18nLocale().setLocale()` instead.

---

## 🛡️ Common Issues and Troubleshooting

### ❌ Translation Files Not Loading

Ensure that your translation files are in the correct directory and follow the JSON format. Also, confirm that the `translationDir` option in your configuration matches the location of your translation files.

### ⚠️ Route Not Found Errors

Check that the routes are correctly set up in your application and that the `locales` array in the configuration includes all necessary locale codes.

### 🏷️ Missing SEO Tags

If SEO tags are not being generated, verify that the `meta` option is enabled in your configuration and that each locale has a valid `iso` code.
