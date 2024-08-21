---
outline: deep
---

# Module Options

The `Nuxt I18n Micro` module offers a range of options to customize the internationalization (i18n) setup in your Nuxt application. Below is a detailed description of each option, including examples of how to configure them in your `nuxt.config.ts` file.

## `locales`: `Locale[]`

Defines the available locales for your application. Each locale object includes properties that specify the locale code, ISO code, text direction, and an optional flag to disable the locale.

- **Type**: `Array`
- **Properties**:
  - **`code`**: *(string, required)* A unique identifier for the locale, such as `'en'` for English or `'fr'` for French.
  - **`iso`**: *(string, optional)* The ISO code for the locale, typically used for setting the `lang` attribute in HTML or for other internationalization purposes (e.g., `'en-US'`, `'fr-FR'`).
  - **`dir`**: *(string, optional)* The text direction for the locale. It can be either `'rtl'` for right-to-left languages (like Arabic or Hebrew) or `'ltr'` for left-to-right languages (like English or French).
  - **`disabled`**: *(boolean, optional)* A flag indicating whether this locale should be disabled or excluded from the application.

- **Example**:

```typescript
locales: [
  { code: 'en', iso: 'en-US', dir: 'ltr' },
  { code: 'fr', iso: 'fr-FR', dir: 'ltr' },
  { code: 'ar', iso: 'ar-SA', dir: 'rtl', disabled: false }
]
```

## `defaultLocale`: `string`

Specifies the default locale that the application should use if no specific locale is set by the user or detected automatically.

- **Type**: `String`
- **Example**:

```typescript
defaultLocale: 'en'
```

## `translationDir`: `string`

Sets the directory where your translation files are stored. This is where `Nuxt I18n Micro` will look for the JSON files containing your translations.

- **Type**: `String`
- **Default**: `'locales'`
- **Example**:

```typescript
translationDir: 'i18n' // Custom directory for translation files
```

## `meta`: `boolean`

Determines whether to automatically generate SEO-related meta tags, such as `alternate` links for different locales. This is useful for improving the SEO of your multi-language site by letting search engines know about the different language versions of your pages.

- **Type**: `Boolean`
- **Default**: `true`
- **Example**:

```typescript
meta: true // Enable automatic SEO meta tags generation
```

## `autoDetectLanguage`: `boolean`

If set to `true`, the module will automatically detect the user's preferred language based on the browser settings or user preferences and redirect to the appropriate locale.

- **Type**: `Boolean`
- **Default**: `false`
- **Example**:

```typescript
autoDetectLanguage: true // Automatically detect and redirect to the user's preferred language
```

## `plural`: `function`

Allows you to define a custom function for handling pluralization logic in your translations. This function will determine how plural forms are handled based on the count and locale.

- **Type**: `Function`
- **Example**:

```typescript
plural: (count, options) => {
  return count === 1 ? options.one : options.other;
}
```

## `includeDefaultLocaleRoute`: `boolean`

When set to `true`, all routes that do not have a specific locale prefix will automatically redirect to the default locale route. This ensures consistency across all pages, even if a locale is not explicitly provided in the URL.

- **Type**: `Boolean`
- **Default**: `false`
- **Example**:

```typescript
includeDefaultLocaleRoute: true // Redirect routes without a locale prefix to the default locale
```

## `routesLocaleLinks`: `Record<string, string>`

This option allows you to create links between different pages' locale files to share translations. It is especially useful when you have similar pages (e.g., a main page and a page with a slug) and want them to use the same translation file, reducing duplication and maintenance effort.

- **Type**: `Record<string, string>`
- **Example**:

```typescript
routesLocaleLinks: {
  'products-id': 'products',
  'about-us': 'about'
}
```

In this example, the translations for a dynamic route like `products/[id]` will be linked to the `products` translation file, meaning both routes will share the same translations.

## `cache`: `boolean`

This option is designed to optimize performance when dealing with large JSON translation files. When enabled, the module caches translations specific to the current page, reducing search times and minimizing client-side load during navigation.

- **Type**: `Boolean`
- **Default**: `false` (In development)
- **Example**:

```typescript
cache: true // Enable caching of translation files to improve performance
```
