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

### 🌍 `locales`: `Locale[]`

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

### 🌐 `defaultLocale`: `string`

Sets the default locale if no specific locale is selected by the user.

Example:

```typescript
defaultLocale: 'en'
```

### 🗂 `translationDir`: `string`

Specifies the directory where translation files are stored.

- **Default**: `'locales'`
- **Example**:

```typescript
translationDir: 'i18n' // Custom directory for translation files
```

### 🔍 `meta`: `boolean`

Automatically generates SEO-related meta tags, such as `alternate` links for different locales.

- **Default**: `true`
- **Example**:

```typescript
meta: true // Enable automatic SEO meta tags generation
```

### 🔗 `metaBaseUrl`: `string`

Sets the base URL for generating SEO-related meta tags like canonical and alternate URLs.

- **Default**: `'/'`
- **Example**:

```typescript
metaBaseUrl: 'https://example.com' // Custom base URL for meta tags
```

### 🌍 `autoDetectLanguage`: `boolean`

Automatically detects the user's preferred language based on browser settings and redirects to the appropriate locale.

- **Default**: `false`
- **Example**:

```typescript
autoDetectLanguage: true // Enable automatic language detection and redirection
```

### 🔍 `autoDetectPath`: `string`

The `autoDetectPath` option specifies the route path(s) on which the locale auto-detection and switching should occur. By default, it is set to `"*"`, which means that locale detection will be performed on any route throughout the application. However, you can specify an exact path to restrict locale detection and switching to a specific route.

- **Default**: `"*"` — The locale detection and switching will occur on all routes.
- **Example**:

```typescript
autoDetectPath: '/' // Locale detection will only happen on the home route
```

### 🔢 `plural`: `function`

Custom function for handling pluralization in translations based on count and locale.

Example:

```typescript
plural: (count, options) => {
  return count === 1 ? options.one : options.other;
}
```

### 🚦 `includeDefaultLocaleRoute`: `boolean`

Automatically redirects routes without a locale prefix to the default locale.

- **Default**: `false`
- **Example**:

```typescript
includeDefaultLocaleRoute: true // Ensure consistency across routes by redirecting to the default locale
```

### 🔗 `routesLocaleLinks`: `Record<string, string>`

Creates links between different pages' locale files to share translations, reducing duplication. This is particularly useful when similar pages (like a main page and a page with a slug) should use the same translation file, avoiding redundancy.

Example:

```typescript
routesLocaleLinks: {
  'products-id': 'products',
  'about-us': 'about'
}
```


### 🧩 `define`: `boolean`

Enables or disables the addition of a special `define` plugin that allows you to use Nuxt's runtime configuration for overriding settings in your translation files.

- **Default**: `true`
- **Example**:

```typescript
define: false // Disable the define plugin
```

## 🔄 `disablePageLocales`: `boolean`

The `disablePageLocales` option allows you to disable page-specific translations, limiting the module to only use global translation files. This can be particularly useful for projects where page-specific translations are not necessary or to simplify the translation management process by consolidating all translations into global files.

- **Default**: `false`

- **Example**:

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

This setup is ideal for applications where the majority of the content is shared across pages or when consistency in translations is critical across the entire application. By disabling page-specific translations, you ensure that all translations are centralized, making it easier to maintain and update.

Here's the section for the `disableWatcher` option:

### 👀 `disableWatcher`: `boolean`

The `disableWatcher` option disables the automatic creation of locale files. By default, `Nuxt I18n Micro` monitors changes in translation files and automatically creates necessary locale files during development. This feature ensures that your translation setup remains up-to-date without manual intervention.

However, if you prefer to manage locale files manually, or in production environments where file creation should be controlled, you can disable this feature by setting `disableWatcher` to `true`.

- **Default**: `false`
- **Example**:

```typescript
disableWatcher: true // Disables the automatic creation of locale files
```

#### 📂 How It Works

When the file watcher is enabled, any changes to translation files will trigger a restart or update of the translation cache, ensuring that the latest translations are always in use. Disabling the watcher is useful when:
- You want to optimize performance in production.
- Translation files are not expected to change frequently.
- You need to reduce overhead associated with file monitoring.

By setting `disableWatcher: true`, the module will skip setting up the watcher, which can help in environments where filesystem access is limited or where stability is prioritized over real-time updates.

### 🍪 `localeCookie`: `string`

The `localeCookie` option specifies the name of the cookie that will be used to store the user's selected locale. This is particularly useful when `autoDetectLanguage` is enabled, as it allows the application to remember the user's language preference across sessions by saving it in a cookie.

- **Default**: `'user-locale'` — The default cookie name is `user-locale`.
- **Type**: `string`

### 🌐 `fallbackLocale`: `string | undefined`

The `fallbackLocale` option allows you to specify a fallback locale that will be used when the current locale does not have a specific translation available. This can be particularly useful in scenarios where you have partial translations for some locales and want to provide a more seamless user experience by falling back to a default language when necessary.

- **Default**: `undefined` — No fallback locale is used by default.
- **Type**: Can be a string specifying a locale code (e.g., `'en'`) or `undefined`.

#### How It Works:

- When `fallbackLocale` is set to a valid locale string, the module will attempt to merge translations from the specified fallback locale into the current locale during the translation fetch process.
- If the current locale lacks certain translations, the missing keys will be filled in with the corresponding translations from the fallback locale, ensuring more comprehensive coverage.

#### Example:

```typescript
i18n: {
  locales: [
    { code: 'en', iso: 'en-US', dir: 'ltr' },
    { code: 'fr', iso: 'fr-FR', dir: 'ltr' },
    { code: 'es', iso: 'es-ES', dir: 'ltr' }
  ],
  defaultLocale: 'en',
  translationDir: 'locales',
  fallbackLocale: 'en', // Use English as a fallback locale
}
```

### Use Case:

If the application is set to French (`fr`) and a specific translation key is missing in the French translation file, the module will automatically look for that key in the fallback locale (`en` in this example).

### Important Notes:

- If `fallbackLocale` is set to `undefined`, the module will not attempt to use any fallback locale, and missing translations will remain untranslated.
- The fallback mechanism is only triggered when there are missing keys in the current locale. It does not override existing translations in the current locale.

---

# 🔄 Caching Mechanism

One of the standout features of `Nuxt I18n Micro` is its **intelligent caching system**. When a translation is requested during server-side rendering (SSR), the result is stored in a cache. This means that subsequent requests for the same translation can retrieve the data from the cache rather than searching through the translation files again. This caching mechanism drastically reduces the time needed to fetch translations and significantly lowers the server's resource consumption.

However, it's important to note that **caching is only effective after the page has been accessed at least once**. Once the translations for a specific page and locale are cached, all subsequent requests will benefit from faster load times and reduced server load.

## 🧠 How It Works:

- **First Request**: On the first visit to a page, translations are fetched from the corresponding translation files and stored in the cache.
- **Subsequent Requests**: On all subsequent visits to the same page (within the same session or until the cache is invalidated), translations are retrieved from the cache, resulting in faster response times and lower CPU and memory usage.

This caching strategy is particularly beneficial for high-traffic applications, where the same pages are frequently accessed by users. By minimizing the need to repeatedly load and process translation files, `Nuxt I18n Micro` ensures that your application remains responsive and efficient, even under heavy load.
