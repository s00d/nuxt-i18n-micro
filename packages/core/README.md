# Nuxt I18n Micro Core

This is a lightweight internationalization (i18n) library for use with Nuxt.js applications, designed to manage translations for multiple languages with caching and dynamic loading support. It allows you to manage translations across your Nuxt pages and components in a clean and efficient way.

## Features

- **Dynamic Translations**: Support for dynamically loaded translations, allowing translations to be fetched on demand.
- **Caching**: Caching of translations for faster access and to reduce redundant requests.
- **Interpolation**: Easy string interpolation for dynamic translation keys.
- **Pluralization**: Built-in support for plural translations.

## Installation

You can install the package via npm or yarn:

```bash
npm install nuxt-i18n-micro-core
```

or

```bash
yarn add nuxt-i18n-micro-core
```

## Usage

### Importing the helper

To use the translation functionality, first, import the necessary helper functions:

```typescript
import { useTranslationHelper, interpolate } from 'nuxt-i18n-micro-core'
```

### Example Usage

To get a translation, you can use `useTranslationHelper`:

```typescript
const { getTranslation, hasTranslation } = useTranslationHelper()

const translation = getTranslation('en', 'home', 'welcome_message')
console.log(translation)
```

For dynamic strings, use the `interpolate` function to inject variables:

```typescript
const template = 'Hello, {name}!'
const result = interpolate(template, { name: 'John' })
console.log(result)  // Output: Hello, John!
```

### Caching

The library automatically caches translations for faster access. You can also manually merge translations into the cache with:

```typescript
mergeTranslation('en', 'home', newTranslations)
```

### Pluralization

Support for plural translations is available by providing both singular and plural variants:

```typescript
const pluralTranslation: PluralTranslations = { singular: 'item', plural: 'items' }
```

## Configuration

The translations are stored in different caches:

- `generalLocaleCache`: Stores global translations for a specific locale.
- `routeLocaleCache`: Stores route-specific translations.
- `dynamicTranslationsCaches`: Stores dynamic translation caches that can be used for specific conditions or pages.

## License

MIT License. See the [LICENSE](LICENSE) file for details.

## Author

- **Name**: s00d
- **Email**: Virus191288@gmail.com
- **Website**: [https://s00d.github.io/](https://s00d.github.io/)
