---
outline: deep
---

# SEO Guide for Nuxt I18n Micro

## Introduction

Effective SEO (Search Engine Optimization) is essential for ensuring that your multilingual site is accessible and visible to users worldwide through search engines. `Nuxt I18n Micro` simplifies the process of managing SEO for multilingual sites by automatically generating essential meta tags and attributes that inform search engines about the structure and content of your site.

This guide explains how `Nuxt I18n Micro` handles SEO to enhance your site's visibility and user experience without requiring additional configuration.

## Automatic SEO Handling

### Key SEO Features

When the `meta` option is enabled in `Nuxt I18n Micro`, the module automatically manages the following SEO aspects:

1. **Language and Direction Attributes**:
  - The module sets the `lang` and `dir` attributes on the `<html>` tag according to the current locale and text direction (e.g., `ltr` for English or `rtl` for Arabic).

2. **Canonical URLs**:
  - The module generates a canonical link (`<link rel="canonical">`) for each page, ensuring that search engines recognize the primary version of the content.

3. **Alternate Language Links (`hreflang`)**:
  - The module automatically generates `<link rel="alternate" hreflang="">` tags for all available locales. This helps search engines understand which language versions of your content are available, improving the user experience for global audiences.

4. **Open Graph Metadata**:
  - The module generates Open Graph meta tags (`og:locale`, `og:url`, etc.) for each locale, which is particularly useful for social media sharing and search engine indexing.

### Configuration

To enable these SEO features, make sure the `meta` option is set to `true` in your `nuxt.config.ts` file:

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
    meta: true, // Enables automatic SEO management
  },
})
```

### Benefits

By enabling the `meta` option, you benefit from:

- **Improved Search Engine Rankings**: Search engines can better index your site, understanding the relationships between different language versions.
- **Better User Experience**: Users are served the correct language version based on their preferences, leading to a more personalized experience.
- **Reduced Manual Configuration**: The module handles SEO tasks automatically, freeing you from the need to manually add SEO-related meta tags and attributes.

## Conclusion

`Nuxt I18n Micro` takes care of the heavy lifting when it comes to SEO for multilingual sites. By simply enabling the `meta` option, your site is automatically optimized for search engines, ensuring that users worldwide can easily find and access the content in their preferred language. This approach not only enhances your site's visibility but also improves the overall user experience.

For more information and updates, visit the [Nuxt I18n Micro GitHub repository](https://github.com/s00d/nuxt-i18n-micro).
