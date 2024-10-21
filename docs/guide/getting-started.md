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

## ⚙️ Module Configuration Options

The `Nuxt I18n Micro` module provides a range of customizable options to fine-tune your internationalization setup:

### 🌍 `locales`

Defines the locales available in your application.

**Type**: `Locale[]`

Each locale object includes:

- **`code`** *(string, required)*: A unique identifier for the locale, e.g., `'en'` for English.
- **`iso`** *(string, optional)*: The ISO code, e.g., `'en-US'`, used for the `lang` attribute in HTML.
- **`dir`** *(string, optional)*: Text direction, either `'rtl'` for right-to-left or `'ltr'` for left-to-right languages.
- **`disabled`** *(boolean, optional)*: Indicates if the locale should be disabled.

**Example**:

```typescript
locales: [
  { code: 'en', iso: 'en-US', dir: 'ltr' },
  { code: 'fr', iso: 'fr-FR', dir: 'ltr' },
  { code: 'ar', iso: 'ar-SA', dir: 'rtl', disabled: false }
]
```

### 🌐 `defaultLocale`

Sets the default locale if no specific locale is selected by the user.

**Type**: `string`

**Example**:

```typescript
defaultLocale: 'en'
```

### 🗂 `translationDir`

Specifies the directory where translation files are stored.

**Type**: `string`  
**Default**: `'locales'`

**Example**:

```typescript
translationDir: 'i18n' // Custom directory for translation files
```

### 🔍 `meta`

Automatically generates SEO-related meta tags, such as `alternate` links for different locales.

**Type**: `boolean`  
**Default**: `true`

**Example**:

```typescript
meta: true // Enable automatic SEO meta tags generation
```

### 🐛 `debug`

Enables logging and debugging information during the generation process to help with troubleshooting.

**Type**: `boolean`  
**Default**: `false`

**Example**:

```typescript
debug: true // Enable logging and debugging information
```

### 🐛 `types`

Adds types to the project during the postinstall process. If you encounter issues with types, you can disable this option.

**Type**: `boolean`  
**Default**: `true`

**Example**:

```typescript
types: true
```

### 🔗 `metaBaseUrl`

Sets the base URL for generating SEO-related meta tags like canonical and alternate URLs.

**Type**: `string`  
**Default**: `'/'`

**Example**:

```typescript
metaBaseUrl: 'https://example.com' // Custom base URL for meta tags
```

### 🌍 `autoDetectLanguage`

Automatically detects the user's preferred language based on browser settings and redirects to the appropriate locale.

**Type**: `boolean`  
**Default**: `false`

**Example**:

```typescript
autoDetectLanguage: true // Enable automatic language detection and redirection
```

### 🔍 `autoDetectPath`

Specifies the route path(s) on which the locale auto-detection and switching should occur.

**Type**: `string`  
**Default**: `"*"`

**Example**:

```typescript
autoDetectPath: '/' // Locale detection will only happen on the home route
```

### 🔢 `plural`

Custom function for handling pluralization in translations based on count and locale.

**Type**: `(key: string, translation: unknown, count: number, locale: string) => string`

**Example**:

```typescript
export type Getter = (key: string, params?: Record<string, string | number | boolean>, defaultValue?: string) => unknown

{
  plural: (key: string, count: number, _locale: string, t: Getter) => {
    const translation = t(key)
    if (!translation) {
      return key
    }
    const forms = translation.toString().split('|')
    if (count === 0 && forms.length > 2) {
      return forms[0].trim() // Case for "no apples"
    }
    if (count === 1 && forms.length > 1) {
      return forms[1].trim() // Case for "one apple"
    }
    return (forms.length > 2 ? forms[2].trim() : forms[forms.length - 1].trim()).replace('{count}', count.toString())
  }
}
```

### 🚦 `includeDefaultLocaleRoute`

Automatically redirects routes without a locale prefix to the default locale.

**Type**: `boolean`  
**Default**: `false`

**Example**:

```typescript
includeDefaultLocaleRoute: true // Ensure consistency across routes by redirecting to the default locale
```

### 🚦 `customRegexMatcher`

I18n-micro meticulously checks each locale via vue-router route regex.
If you have **a lot** of locales, you can improve pattern matching performances via a custom regex matcher.

**Type**: `string | RegExp`  
**Default**: `false`

**Example**:

```typescript
customRegexMatcher: '[a-z]-[A-Z]'// This matches locales in isoCode (e.g: '/en-US', 'de-DE' etc)
```

### 🔗 `routesLocaleLinks`

Creates links between different pages' locale files to share translations, reducing duplication.

**Type**: `Record<string, string>`

**Example**:

```typescript
routesLocaleLinks: {
  'products-id': 'products',
  'about-us': 'about'
}
```

### 🧩 `define`

Enables or disables the addition of a special `define` plugin that allows you to use Nuxt's runtime configuration for overriding settings in your translation files.

**Type**: `boolean`  
**Default**: `true`

**Example**:

```typescript
define: false // Disable the define plugin
```

### 🔄 `disablePageLocales`

Allows you to disable page-specific translations, limiting the module to only use global translation files.

**Type**: `boolean`  
**Default**: `false`

**Example**:

```typescript
disablePageLocales: true // Disable page-specific translations, using only global translations
```

### 📂 Folder Structure with `disablePageLocales: true`

When `disablePageLocales` is enabled, the module will only use the translations defined in the global files located directly under the `locales` directory. Page-specific translation files (located in `/locales/pages`) will be ignored.

```
  /locales
  ├── en.json
  ├── fr.json
  └── ar.json
```

### 👀 `disableWatcher`

Disables the automatic creation of locale files during development.

**Type**: `boolean`  
**Default**: `false`

**Example**:

```typescript
disableWatcher: true // Disables the automatic creation of locale files
```

### 🔗 `apiBaseUrl`

env: `NUXT_I18N_APP_BASE_URL`

Defines the base URL that the server will use to fetch cached translations. By default, this is set to `_locales`, but you can change it to any custom path, such as `api/_locales`, if you want to load translations from a different endpoint.

**Type**: `string`  
**Default**: `'_locales'`

**Example**:

```typescript
apiBaseUrl: 'api/_locales' // Custom URL for fetching cached translations
```

When set, the module will use the specified URL to request cached translations instead of using the default `_locales`.

### 🍪 `localeCookie`

Specifies the name of the cookie used to store the user's selected locale.

**Type**: `string`  
**Default**: `'user-locale'`

### 🌐 `fallbackLocale`

Specifies a fallback locale to be used when the current locale does not have a specific translation available.

**Type**: `string | undefined`  
**Default**: `undefined`

**Example**:

```typescript
i18n: {
  locales: [
    { code: 'en', iso: 'en-US', dir: 'ltr' },
    { code: 'fr', iso: 'fr-FR', dir: 'ltr' },
    { code: 'es', iso: 'es-ES', dir: 'ltr' }
  ],
  defaultLocale: 'en',
  fallbackLocale: 'en', // Use English as a fallback locale
}
```

### 🌐 `globalLocaleRoutes`

Allows you to define custom localized routes for specific pages. You can specify a custom path for each locale for a given page, or disable localization for certain pages entirely.

**Type**: `Record<string, Record<string, string> | false>`

- **Key** (`string`): The name of the page you want to customize or disable localization for.
- **Value**:
  - **`Record<string, string>`**: A set of locale codes with corresponding custom paths for the page.
  - **`false`**: Disable localization for this page entirely. The page will not be localized, and it will remain accessible only through its default path.

This option gives you the flexibility to localize certain pages differently while leaving others unaffected by localization.

**Example**:

```typescript
globalLocaleRoutes: {
  page2: {
    en: '/custom-page2-en',
    de: '/custom-page2-de',
    ru: '/custom-page2-ru',
  },
  unlocalized: false, // Unlocalized page should not be localized
}
```

### Usage:

In the example above:
- **`page2`**: Custom localized paths are defined for the page `page2` in English (`en`), German (`de`), and Russian (`ru`). Instead of following the standard localization pattern (like `/en/page2`), each locale will have a completely custom URL, such as `/en/custom-page2-en` for English, `/de/custom-page2-de` for German, and `/ru/custom-page2-ru` for Russian.
- **`unlocalized`**: This page will not be localized, so it remains accessible only at `/unlocalized`, without any locale prefixes or custom paths.

---

# 🔄 Caching Mechanism

One of the standout features of `Nuxt I18n Micro` is its **intelligent caching system**. When a translation is requested during server-side rendering (SSR), the result is stored in a cache. This means that subsequent requests for the same translation can

retrieve the data from the cache rather than searching through the translation files again. This caching mechanism drastically reduces the time needed to fetch translations and significantly lowers the server's resource consumption.
