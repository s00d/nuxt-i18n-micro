# nuxt-i18n-micro-core

`nuxt-i18n-micro-core` is the core module for handling translations and interpolation in a Nuxt.js application. It provides utilities for managing translations, interpolating placeholders, and caching translations for efficient retrieval. This module is designed to work seamlessly with `nuxt-i18n-micro` and its associated utilities.

## Installation

You can install `nuxt-i18n-micro-core` using npm or yarn:

```bash
npm install nuxt-i18n-micro-core
```

or

```bash
yarn add nuxt-i18n-micro-core
```

## Usage

This package provides two main utilities:

1. **`useTranslationHelper`**: A helper for managing translations, including loading, caching, and retrieving translations.
2. **`interpolate`**: A utility for interpolating placeholders in translation strings with dynamic values.

### Example

Here’s an example of how you might use `useTranslationHelper` and `interpolate` in your Nuxt.js project:

```typescript
import { useTranslationHelper, interpolate } from 'nuxt-i18n-micro-core'

// Initialize the translation helper
const translationHelper = useTranslationHelper()

// Set the locale
translationHelper.setLocale('en')

// Load translations
translationHelper.loadTranslations({
  greeting: 'Hello, {name}!',
  nested: {
    message: 'This is a nested message.',
  },
})

// Load page-specific translations
translationHelper.loadPageTranslations('home', {
  welcome: 'Welcome to the home page!',
})

// Retrieve a translation
const greeting = translationHelper.getTranslation<string>('index', 'greeting')
console.log(greeting) // 'Hello, {name}!'

// Interpolate placeholders
const interpolatedGreeting = interpolate(greeting!, { name: 'John' })
console.log(interpolatedGreeting) // 'Hello, John!'
```

## API Reference

### `useTranslationHelper`

#### Methods
- **`getLocale(): string`**:
  Returns the current locale.
- **`setLocale(locale: string): void`**:
  Sets the current locale.
- **`hasCache(routeName: string): boolean`**:
  Checks if translations for a specific route are cached.
- **`getCache(routeName: string): Map<string, Translations | unknown> | undefined`**:
  Retrieves the cache for a specific route.
- **`setCache(routeName: string, cache: Map<string, Translations | unknown>): void`**:
  Sets the cache for a specific route.
- **`mergeTranslation(routeName: string, newTranslations: Translations, force = false): void`**:
  Merges new translations into the cache for a specific route.
- **`mergeGlobalTranslation(newTranslations: Translations, force = false): void`**:
  Merges new translations into the global cache.
- **`hasGeneralTranslation(): boolean`**:
  Checks if global translations are loaded for the current locale.
- **`hasPageTranslation(routeName: string): boolean`**:
  Checks if translations for a specific route are loaded.
- **`hasTranslation(key: string): boolean`**:
  Checks if a translation exists for the given key.
- **`getTranslation<T = unknown>(routeName: string, key: string): T | null`**:
  Retrieves a translation for the given key.
- **`loadPageTranslations(routeName: string, translations: Translations): Promise<void>`**:
  Loads translations for a specific route.
- **`loadTranslations(translations: Translations): Promise<void>`**:
  Loads global translations for the current locale.

### `interpolate`

#### Function
```typescript
interpolate(template: string, params: Params): string
```
- **`template`**: The translation string with placeholders (e.g., `'Hello, {name}!'`).
- **`params`**: An object containing key-value pairs for interpolation (e.g., `{ name: 'John' }`).

#### Example
```typescript
const result = interpolate('Hello, {name}!', { name: 'John' })
console.log(result) // 'Hello, John!'
```

## Types

### `Translations`
Represents a key-value pair of translations. Keys can be nested using dots (e.g., `'nested.message'`).

```typescript
export interface Translations {
  [key: string]: Translation
}
```

### `Translation`
Represents a translation value, which can be a string, number, boolean, nested translations, or `null`.

```typescript
export type Translation = string | number | boolean | Translations | PluralTranslations | unknown | null
```

### `PluralTranslations`
Represents translations for singular and plural forms.

```typescript
export interface PluralTranslations {
  singular: string
  plural: string
}
```

### `Params`
Represents a key-value pair of parameters for interpolation.

```typescript
export type Params = Record<string, string | number | boolean>
```

## Contributing

If you find any issues or have suggestions for improvements, feel free to open an issue or submit a pull request on the [GitHub repository](https://github.com/s00d/nuxt-i18n-micro).

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/s00d/nuxt-i18n-micro/blob/main/LICENSE) file for more details.

---

For more information, visit the [GitHub repository](https://github.com/s00d/nuxt-i18n-micro).

## Author

- **Name**: s00d
- **Email**: Virus191288@gmail.com
- **Website**: [https://s00d.github.io/](https://s00d.github.io/)
