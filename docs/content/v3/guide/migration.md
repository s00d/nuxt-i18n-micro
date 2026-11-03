---
title: Migration from nuxt-i18n
description: Migrate from @nuxtjs/i18n to Nuxt I18n Micro.
navigation:
  title: Migration from nuxt-i18n
  order: 260
  group: Migration & Help
---

## Which guide do you need?

| You are migrating from…                | Guide                                            |
| -------------------------------------- | ------------------------------------------------ |
| `@nuxtjs/i18n` (vue-i18n based module) | **This page**                                    |
| `nuxt-i18n-micro` v2.x                 | [Upgrading from v2.x to v3.x](/v3/guide/v3-upgrade) |

## Why Migrate?

- **Improved performance**: ~51% faster builds and ~54% less build memory vs `@nuxtjs/i18n` **v10.6** in our [benchmark fixtures](/v3/guide/performance-results)
- **Simplified configuration**: Streamlined setup with sensible defaults
- **Better resource management**: Optimized handling of large translation files

## Key Differences

| Feature                 | `nuxt-i18n`                      | `Nuxt I18n Micro`                         |
| ----------------------- | -------------------------------- | ----------------------------------------- |
| Translation files       | JS/TS/JSON, loaded via `vueI18n` | JSON only, auto-generated in dev          |
| Route generation        | Runtime                          | Build-time (`@i18n-micro/route-strategy`) |
| Translation loading     | Bundled into JS                  | Lazy-loaded JSON per page                 |
| Locale state            | `useI18n()` from `vue-i18n`      | `useI18nLocale()` composable              |
| `detectBrowserLanguage` | Supported                        | Use `autoDetectLanguage` instead          |

## Step-by-Step

### 1. Install

```bash
npm install nuxt-i18n-micro
```

### 2. Update Configuration

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
    detectBrowserLanguage: { useCookie: true },
  },
})
```

**After (Nuxt I18n Micro v3):**

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
    localeCookie: 'user-locale',
    autoDetectLanguage: true,
  },
})
```

### 3. Reorganize Translation Files

Move translations to the `locales` directory in JSON format. Here is a full project comparison:

::code-group
```text [Before (nuxt-i18n)]
└── my-app/
    ├── i18n/  # langDir
    │   └── locales/
    │       ├── en.json  (- deleted)  # all translations in one file
    │       ├── ru.json  (- deleted)
    │       └── de.json  (- deleted)
    ├── pages/
    │   ├── index.vue
    │   └── page.vue
    ├── server/
    │   └── tsconfig.json
    ├── nuxt.config.ts  (~ modified)  # config will change
    └── package.json
```

```text [After (Nuxt I18n Micro)]
└── my-app/
    ├── locales/  (+ added)  # translationDir
    │   ├── en.json  (+ added)  # root-level translations
    │   ├── ru.json  (+ added)
    │   ├── de.json  (+ added)
    │   └── pages/  (+ added)  # page-specific
    │       ├── index/  (+ added)
    │       │   ├── en.json  (+ added)
    │       │   ├── ru.json  (+ added)
    │       │   └── de.json  (+ added)
    │       └── page/  (+ added)
    │           ├── en.json  (+ added)
    │           ├── ru.json  (+ added)
    │           └── de.json  (+ added)
    ├── pages/
    │   ├── index.vue  (~ modified)  # API changes
    │   └── page.vue  (~ modified)
    ├── server/
    │   └── tsconfig.json
    ├── nuxt.config.ts  (~ modified)  # new config
    └── package.json
```
::

::tip
Missing page-specific translation files are **auto-generated** in development mode — just run `nuxt dev` and the module will create empty JSON files for each page and locale.
::

### 4. Update Navigation

```diff
- <nuxt-link :to="{ name: 'index' }">Home</nuxt-link>
+ <NuxtLink :to="$localeRoute({ name: 'index' })">Home</NuxtLink>
+ <!-- or use the built-in component -->
+ <i18n-link :to="{ name: 'index' }">Home</i18n-link>
```

### 5. Update SEO

Remove any manual SEO configurations from `nuxt-i18n`. Nuxt I18n Micro generates `hreflang`, canonical URLs, and Open Graph tags automatically when `meta: true` is set.

### 6. Test

Thoroughly test translations, locale switching, redirects, and SEO meta tags.

---

## 🛡️ Common Issues and Troubleshooting

### ❌ Translation Files Not Loading

Ensure translation files are in the correct directory and follow JSON format. Verify that `translationDir` matches your file location.

### ⚠️ Route Not Found Errors

Check that all locale codes in `locales` array are correct and that routes are properly set up.

### 🏷️ Missing SEO Tags

Verify that `meta: true` is set and each locale has a valid `iso` code.

### 🔄 Hydration Mismatches

If using `no_prefix` strategy, set the locale in a server plugin with `order: -10` using `useI18nLocale().setLocale()` to ensure server and client agree on the locale. See [Custom Language Detection](/v3/guide/custom-auto-detect).

### 🍪 Redirects Not Working

For prefix strategies, ensure `localeCookie: 'user-locale'` is set. Without a cookie, the server redirect plugin has no way to remember the user's preferred locale across page reloads.
