---
outline: deep
---

# 🔄 Migrating from `nuxt-i18n` to `Nuxt I18n Micro`

::: tip Looking for the v2 → v3 upgrade guide?
See [Upgrading from v2.x to v3.0.0](/guide/v3-upgrade).
:::

## Why Migrate?

- **⚡ Improved Performance**: Up to 90% faster build times and 88% less memory
- **🔧 Simplified Configuration**: Streamlined setup with sensible defaults
- **📉 Better Resource Management**: Optimized handling of large translation files

## Key Differences

| Feature | `nuxt-i18n` | `Nuxt I18n Micro` |
|---------|------------|-------------------|
| Translation files | JS/TS/JSON, loaded via `vueI18n` | JSON only, auto-generated in dev |
| Route generation | Runtime | Build-time (`@i18n-micro/route-strategy`) |
| Translation loading | Bundled into JS | Lazy-loaded JSON per page |
| Locale state | `useI18n()` from `vue-i18n` | `useI18nLocale()` composable |
| `detectBrowserLanguage` | Supported | Use `autoDetectLanguage` instead |

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

```tree
- tab: "Before (nuxt-i18n)"
  children:
    - name: my-app
      children:
        - name: i18n
          note: "langDir"
          children:
            - name: locales
              children:
                - name: en.json
                  status: deleted
                  note: "all translations in one file"
                - name: ru.json
                  status: deleted
                - name: de.json
                  status: deleted
        - name: pages
          children:
            - index.vue
            - page.vue
        - name: server
          children:
            - tsconfig.json
        - name: nuxt.config.ts
          status: modified
          note: "config will change"
        - package.json
- tab: "After (Nuxt I18n Micro)"
  children:
    - name: my-app
      children:
        - name: locales
          status: added
          note: "translationDir"
          children:
            - name: en.json
              status: added
              note: "global translations"
            - name: ru.json
              status: added
            - name: de.json
              status: added
            - name: pages
              status: added
              note: "page-specific"
              children:
                - name: index
                  status: added
                  children:
                    - name: en.json
                      status: added
                    - name: ru.json
                      status: added
                    - name: de.json
                      status: added
                - name: page
                  status: added
                  children:
                    - name: en.json
                      status: added
                    - name: ru.json
                      status: added
                    - name: de.json
                      status: added
        - name: pages
          children:
            - name: index.vue
              status: modified
              note: "API changes"
            - name: page.vue
              status: modified
        - name: server
          children:
            - tsconfig.json
        - name: nuxt.config.ts
          status: modified
          note: "new config"
        - package.json
```

::: tip
Missing page-specific translation files are **auto-generated** in development mode — just run `nuxt dev` and the module will create empty JSON files for each page and locale.
:::

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

If using `no_prefix` strategy, set the locale in a server plugin with `order: -10` using `useI18nLocale().setLocale()` to ensure server and client agree on the locale. See [Custom Language Detection](/guide/custom-auto-detect).

### 🍪 Redirects Not Working

For prefix strategies, ensure `localeCookie: 'user-locale'` is set. Without a cookie, the redirect plugin has no way to remember the user's preferred locale across page reloads.
