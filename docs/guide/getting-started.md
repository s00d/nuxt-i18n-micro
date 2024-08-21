---
outline: deep
---

# 🌐 Getting Started with Nuxt I18n Micro

## 📖 Overview

`Nuxt I18n Micro` is a lightweight internationalization module for Nuxt that delivers superior performance compared to traditional solutions. It's designed to reduce build times, memory usage, and server load, making it ideal for high-traffic and large projects.

## 🤔 Why Choose Nuxt I18n Micro?

Here are some key benefits of using `Nuxt I18n Micro`:

- 🚀 **High Performance**: Significantly reduces build times and memory consumption.
- 📦 **Compact Size**: Has minimal impact on your app's bundle size.
- ⚙️ **Efficiency**: Optimized for large-scale applications with a focus on memory consumption and server load.

## 🛠 Installation

To install the module in your Nuxt application, run the following command:

```bash
npm install nuxt-i18n-micro
```

## ⚙️ Basic Setup

After installation, add the module to your `nuxt.config.ts` file:

```typescript
export default defineNuxtConfig({
  modules: [
    'nuxt-i18n-micro',
  ],
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', dir: 'ltr' },
      { code: 'fr', iso: 'fr-FR', dir: 'ltr' },
      { code: 'ar', iso: 'ar-SA', dir: 'rtl' },
    ],
    defaultLocale: 'en',
    translationDir: 'locales',
    meta: true,
  },
})
```

### 📂 Folder Structure

Translation files are organized into global and page-specific directories:

```
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

- **Global Files**: Contain translations shared across the entire app.
- **Page-Specific Files**: Contain translations unique to specific pages.

# ⚙️ Module Configuration Options

The `Nuxt I18n Micro` module provides a range of customizable options to fine-tune your internationalization setup:

## 🌍 `locales`: `Locale[]`

Defines the locales available in your application. Each locale object includes:

- **`code`**: *(string, required)* A unique identifier for the locale, e.g., `'en'` for English.
- **`iso`**: *(string, optional)* The ISO code, e.g., `'en-US'`, used for the `lang` attribute in HTML.
- **`dir`**: *(string, optional)* Text direction, either `'rtl'` for right-to-left or `'ltr'` for left-to-right languages.
- **`disabled`**: *(boolean, optional)* Indicates if the locale should be disabled.

Example:

```typescript
locales: [
  { code: 'en', iso: 'en-US', dir: 'ltr' },
  { code: 'fr', iso: 'fr-FR', dir: 'ltr' },
  { code: 'ar', iso: 'ar-SA', dir: 'rtl', disabled: false }
]
```

## 🌐 `defaultLocale`: `string`

Sets the default locale if no specific locale is selected by the user.

Example:

```typescript
defaultLocale: 'en'
```

## 🗂 `translationDir`: `string`

Specifies the directory where translation files are stored.

- **Default**: `'locales'`
- **Example**:

```typescript
translationDir: 'i18n' // Custom directory for translation files
```

## 🔍 `meta`: `boolean`

Automatically generates SEO-related meta tags, such as `alternate` links for different locales.

- **Default**: `true`
- **Example**:

```typescript
meta: true // Enable automatic SEO meta tags generation
```

## 🌍 `autoDetectLanguage`: `boolean`

Automatically detects the user's preferred language based on browser settings and redirects to the appropriate locale.

- **Default**: `false`
- **Example**:

```typescript
autoDetectLanguage: true // Enable automatic language detection and redirection
```

## 🔢 `plural`: `function`

Custom function for handling pluralization in translations based on count and locale.

Example:

```typescript
plural: (count, options) => {
  return count === 1 ? options.one : options.other;
}
```

## 🚦 `includeDefaultLocaleRoute`: `boolean`

Automatically redirects routes without a locale prefix to the default locale.

- **Default**: `false`
- **Example**:

```typescript
includeDefaultLocaleRoute: true // Ensure consistency across routes by redirecting to the default locale
```

## 🔗 `routesLocaleLinks`: `Record<string, string>`

Creates links between different pages' locale files to share translations, reducing duplication. This is particularly useful when similar pages (like a main page and a page with a slug) should use the same translation file, avoiding redundancy.

Example:

```typescript
routesLocaleLinks: {
  'products-id': 'products',
  'about-us': 'about'
}
```

In this example, the translations for a dynamic route like `products/[id]` will be linked to the `products` translation file, so both routes will share the same translations.

## 🗃 `cache`: `boolean` <Badge type="danger" text="In development" />

Optimizes performance by caching translations specific to the current page. When enabled, the module caches translations, reducing client-side load and improving navigation performance.

- **Default**: `false`
- **Example**:

```typescript
cache: true // Enable caching for better performance
```
