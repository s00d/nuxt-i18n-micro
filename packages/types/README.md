# @i18n-micro/types

`@i18n-micro/types` provides TypeScript type definitions and interfaces for the `nuxt-i18n-micro` ecosystem. This package is designed to enhance type safety and developer experience when working with translations, locales, and routing in a Nuxt.js application. It includes types for locales, routing strategies, translation parameters, and more.

## Installation

You can install `@i18n-micro/types` using npm or yarn:

```bash
npm install @i18n-micro/types
```

or

```bash
yarn add @i18n-micro/types
```

## Usage

This package provides TypeScript types and interfaces for working with `nuxt-i18n-micro`. It is primarily used to ensure type safety when defining locales, routing strategies, and translation parameters.

### Example

Here’s an example of how you might use the types provided by this package:

```typescript
import { Locale, Strategies, ModuleOptions, I18nRouteParams } from '@i18n-micro/types'

// Define locales
const locales: Locale[] = [
  {
    code: 'en',
    iso: 'en-US',
    dir: 'ltr',
    displayName: 'English',
    baseUrl: 'https://example.com/en',
  },
  {
    code: 'de',
    iso: 'de-DE',
    dir: 'ltr',
    displayName: 'German',
    baseUrl: 'https://example.com/de',
  },
]

// Define routing strategy
const strategy: Strategies = 'prefix_except_default'

// Define module options
const options: ModuleOptions = {
  locales,
  strategy,
  defaultLocale: 'en',
  includeDefaultLocaleRoute: true,
}

// Define route parameters
const routeParams: I18nRouteParams = {
  en: { page: 'home' },
  de: { page: 'startseite' },
}
```

## API Reference

### Types and Interfaces

#### `Locale`
Represents a locale configuration.

#### `LocaleCode`
Represents a locale code (e.g., `'en'`, `'de'`).

#### `Strategies`
Represents the available routing strategies.

```typescript
export type Strategies = 'no_prefix' | 'prefix_except_default' | 'prefix' | 'prefix_and_default'
```

#### `ModuleOptions`
Represents the configuration options for the `nuxt-i18n-micro` module.

#### `ModuleOptionsExtend`
Extends `ModuleOptions` with additional properties.

#### `I18nRouteParams`
Represents route parameters for different locales.

#### `Params`
Represents a key-value pair of parameters for interpolation.

#### `PluralFunc`
Represents a function for handling pluralization in translations.

#### `GlobalLocaleRoutes`
Represents global route configurations for different locales.

#### `Translations`
Represents a key-value pair of translations.

#### `Translation`
Represents a translation value, which can be a string, number, boolean, nested translations, or `null`.

#### `PluralTranslations`
Represents translations for singular and plural forms.

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
