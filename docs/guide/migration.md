---
outline: deep
---

# Migration from `nuxt-i18n` to `Nuxt I18n Micro`

## Introduction

Migrating from `nuxt-i18n` to `Nuxt I18n Micro` can significantly improve the performance of your Nuxt application, especially in high-traffic environments or projects with large translation files. This guide provides a step-by-step approach to help you smoothly transition from `nuxt-i18n` to `Nuxt I18n Micro`.

## Why Migrate?

The `Nuxt I18n Micro` module offers several advantages over the traditional `nuxt-i18n`:

- **Improved Performance**: Faster build times, lower memory usage, and smaller bundle sizes.
- **Simplified Configuration**: A more streamlined setup process with fewer moving parts.
- **Better Resource Management**: Optimized handling of large translation files and reduced server load.

## Key Differences

Before you begin the migration process, it’s essential to understand the key differences between `nuxt-i18n` and `Nuxt I18n Micro`:

- **Route Management**: `Nuxt I18n Micro` uses dynamic regex-based routing, generating only two routes regardless of the number of locales, unlike `nuxt-i18n` which creates a separate route for each locale.
- **Translation Files**: Only JSON files are supported in `Nuxt I18n Micro`. The translations are split into global and page-specific files, which are auto-generated in development mode if not present.
- **SEO Integration**: `Nuxt I18n Micro` offers built-in SEO optimization with automatic meta tag generation and support for `hreflang` tags.

## Step-by-Step Migration

### 1. Install `Nuxt I18n Micro`

First, add `Nuxt I18n Micro` to your Nuxt project:

```bash
npm install nuxt-i18n-micro
```

### 2. Update Configuration

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

### 3. Reorganize Translation Files

Move your translation files to the `locales` directory. Ensure they are in JSON format and organized by locale. For example:

```
/locales
  /pages
    /index
      en.json
      fr.json
  en.json
  fr.json
```

### 4. Replace `<nuxt-link>` with `<NuxtLink>`

If you are using `<nuxt-link>` for navigation, replace it with `<NuxtLink>` to ensure compatibility with the new module.

**Before:**

```vue
<nuxt-link :to="{ name: 'index' }">Home</nuxt-link>
```

**After:**

```vue
<NuxtLink :to="$localeRoute({ name: 'index' })">Home</NuxtLink>
```

### 5. Update VueI18n Usage

Replace any

direct usage of `vue-i18n` with the corresponding methods from `Nuxt I18n Micro`. This includes methods like `$t`, `$tc`, `$d`, and `$n`.

**Before:**

```vue
<p>{{ $t('welcome') }}</p>
```

**After:**

```vue
<p>{{ $t('welcome') }}</p>
```

### 6. Handle SEO Configurations

Ensure that your SEO configurations are updated to take advantage of `Nuxt I18n Micro`’s automatic meta tag generation. Remove any redundant SEO configurations that were specific to `nuxt-i18n`.

### 7. Test Your Application

After completing the migration steps, thoroughly test your application to ensure that all translations are loading correctly and that navigation between locales works as expected. Pay special attention to SEO-related tags and ensure that they are generated as intended.

## Common Issues and Troubleshooting

### Translation Files Not Loading

Ensure that your translation files are in the correct directory and follow the JSON format. Also, confirm that the `translationDir` option in your configuration matches the location of your translation files.

### Route Not Found Errors

Check that the routes are correctly set up in your application and that the `locales` array in the configuration includes all necessary locale codes.

### Missing SEO Tags

If SEO tags are not being generated, verify that the `meta` option is enabled in your configuration and that each locale has a valid `iso` code.

## Conclusion

Migrating from `nuxt-i18n` to `Nuxt I18n Micro` can greatly enhance the performance and maintainability of your Nuxt application. By following the steps outlined in this guide, you can ensure a smooth transition while taking full advantage of the benefits that `Nuxt I18n Micro` offers.

For more detailed information and support, visit the [Nuxt I18n Micro GitHub repository](https://github.com/s00d/nuxt-i18n-micro).
