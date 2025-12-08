# Nuxt I18n Micro Test Utils

This is a utility library designed to facilitate testing for Nuxt.js applications that use the `@i18n-micro/core` package. It provides helper functions to handle translations, formatting, and locale switching, simplifying the process of testing internationalization (i18n) functionality.

## Features

- **Translation Helper Functions**: Easily retrieve and interpolate translations with the `t` and `tc` functions.
- **Pluralization**: Handle plural forms of translations with the `tc` function.
- **Locale Management**: Set and get the current locale and locale-specific data (e.g., route name, locale list).
- **Number and Date Formatting**: Format numbers and dates according to the current locale.
- **Translation Merging**: Merge new translations into the existing cache with the `mergeTranslations` function.
- **Locale Switching**: Switch between locales dynamically and update route and path accordingly.

## Installation

You can install the package via npm or yarn:

```bash
npm install @i18n-micro/test-utils
```

or

```bash
yarn add @i18n-micro/test-utils
```

## Usage

### Importing the helper functions

To use the utility functions, import them as follows:

```typescript
import { i18nUtils } from '@i18n-micro/test-utils'
```

### Example Usage

#### Getting a translation

To retrieve a translation, you can use the `t` function:

```typescript
const translatedValue = i18nUtils.t('welcome_message', { name: 'John' })
console.log(translatedValue)  // Output: translated string with the injected name
```

#### Formatting numbers

Use the `tn` function to format numbers based on the current locale:

```typescript
const formattedNumber = i18nUtils.tn(12345.6789)
console.log(formattedNumber)  // Output: formatted number
```

#### Formatting dates

Use the `td` function to format dates:

```typescript
const formattedDate = i18nUtils.td(new Date())
console.log(formattedDate)  // Output: formatted date
```

#### Pluralization

Handle plural translations with `tc`:

```typescript
const pluralValue = i18nUtils.tc('item_count', 3)
console.log(pluralValue)  // Output: appropriate plural form
```

#### Merging Translations

To add new translations, use the `mergeTranslations` function:

```typescript
i18nUtils.mergeTranslations({ welcome_message: 'Hello, {name}!' })
```

### Locale Management

You can manage the current locale with the following functions:

```typescript
i18nUtils.setLocale('en')  // Set current locale to English
const currentLocale = i18nUtils.getLocale()  // Get the current locale
```

### Setting Translations from JSON

Load translations dynamically using the `setTranslationsFromJson` function:

```typescript
const newTranslations = { welcome_message: 'Welcome!' }
i18nUtils.setTranslationsFromJson('en', newTranslations)
```

## License

MIT License. See the [LICENSE](LICENSE) file for details.

## Author

- **Name**: s00d
- **Email**: Virus191288@gmail.com
- **Website**: [https://s00d.github.io/](https://s00d.github.io/)
