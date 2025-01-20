# nuxt-i18n-micro-core

`nuxt-i18n-micro-core` is the core module for handling translations, routing, and formatting in a Nuxt.js application. It provides utilities for managing translations, interpolating placeholders, formatting numbers, dates, and relative times, and handling locale-specific routing. This module is designed to work seamlessly with `nuxt-i18n-micro` and its associated utilities.

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

This package provides several utilities for managing translations, formatting, and routing:

1. **`useTranslationHelper`**: A helper for managing translations, including loading, caching, and retrieving translations.
2. **`interpolate`**: A utility for interpolating placeholders in translation strings with dynamic values.
3. **`FormatService`**: A service for formatting numbers, dates, and relative times.
4. **`RouteService`**: A service for handling locale-specific routing and route localization.

### Example

Here’s an example of how you might use these utilities in your Nuxt.js project:

```typescript
import { useTranslationHelper, interpolate, FormatService, RouteService } from 'nuxt-i18n-micro-core'

// Initialize the translation helper
const translationHelper = useTranslationHelper()

// Load translations for a specific locale
translationHelper.loadTranslations('en', {
  greeting: 'Hello, {name}!',
  nested: {
    message: 'This is a nested message.',
  },
})

// Load page-specific translations for a specific locale
translationHelper.loadPageTranslations('en', 'home', {
  welcome: 'Welcome to the home page!',
})

// Retrieve a translation for a specific locale
const greeting = translationHelper.getTranslation<string>('en', 'index', 'greeting')
console.log(greeting) // 'Hello, {name}!'

// Interpolate placeholders
const interpolatedGreeting = interpolate(greeting!, { name: 'John' })
console.log(interpolatedGreeting) // 'Hello, John!'

// Format numbers, dates, and relative times
const formatService = new FormatService()
const formattedNumber = formatService.formatNumber(123456.789, 'en-US')
const formattedDate = formatService.formatDate(new Date(), 'en-US')
const formattedRelativeTime = formatService.formatRelativeTime(new Date(), 'en-US')

console.log(formattedNumber) // '123,456.789'
console.log(formattedDate) // '10/5/2023'
console.log(formattedRelativeTime) // 'just now'

// Handle locale-specific routing
const routeService = new RouteService(
  i18nConfig,
  router,
  hashLocaleDefault,
  noPrefixDefault,
  navigateTo,
  setCookie
)

const localizedRoute = routeService.getLocalizedRoute('/about', currentRoute, 'en')
console.log(localizedRoute) // Localized route object
```

## API Reference

### `useTranslationHelper`

#### Methods
- **`hasCache(locale: string, page: string): boolean`**:
  Checks if translations for a specific route and locale are cached.
- **`getCache(locale: string, routeName: string): Map<string, Translations | unknown> | undefined`**:
  Retrieves the cache for a specific route and locale.
- **`setCache(locale: string, routeName: string, cache: Map<string, Translations | unknown>): void`**:
  Sets the cache for a specific route and locale.
- **`mergeTranslation(locale: string, routeName: string, newTranslations: Translations, force = false): void`**:
  Merges new translations into the cache for a specific route and locale.
- **`mergeGlobalTranslation(locale: string, newTranslations: Translations, force = false): void`**:
  Merges new translations into the global cache for a specific locale.
- **`hasGeneralTranslation(locale: string): boolean`**:
  Checks if global translations are loaded for the specified locale.
- **`hasPageTranslation(locale: string, routeName: string): boolean`**:
  Checks if translations for a specific route and locale are loaded.
- **`hasTranslation(locale: string, key: string): boolean`**:
  Checks if a translation exists for the given key and locale.
- **`getTranslation<T = unknown>(locale: string, routeName: string, key: string): T | null`**:
  Retrieves a translation for the given key, route, and locale.
- **`loadPageTranslations(locale: string, routeName: string, translations: Translations): Promise<void>`**:
  Loads translations for a specific route and locale.
- **`loadTranslations(locale: string, translations: Translations): Promise<void>`**:
  Loads global translations for the specified locale.

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

### `FormatService`

#### Methods
- **`formatNumber(value: number, locale: string, options?: Intl.NumberFormatOptions): string`**:
  Formats a number according to the specified locale and options.
- **`formatDate(value: Date | number | string, locale: string, options?: Intl.DateTimeFormatOptions): string`**:
  Formats a date according to the specified locale and options.
- **`formatRelativeTime(value: Date | number | string, locale: string, options?: Intl.RelativeTimeFormatOptions): string`**:
  Formats a relative time (e.g., "2 hours ago") according to the specified locale and options.

### `RouteService`

#### Methods
- **`getCurrentLocale(route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric): string`**:
  Returns the current locale based on the route or configuration.
- **`getCurrentName(route: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric): string | null`**:
  Returns the display name of the current locale.
- **`getRouteName(route: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric, locale: string): string`**:
  Returns the route name without the locale suffix.
- **`getFullPathWithBaseUrl(currentLocale: Locale, route: RouteLocationRaw): string`**:
  Returns the full path with the base URL for the specified locale.
- **`switchLocaleRoute(fromLocale: string, toLocale: string, route: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric, i18nRouteParams: I18nRouteParams): RouteLocationRaw`**:
  Switches the locale for the specified route.
- **`getLocalizedRoute(to: RouteLocationAsString | RouteLocationAsRelative | RouteLocationAsPath, route: RouteLocationNormalizedLoaded, locale?: string): RouteLocationResolved`**:
  Returns a localized route for the specified locale.
- **`updateCookies(toLocale: string): void`**:
  Updates cookies with the new locale.
- **`getCurrentRoute(): RouteLocationNormalizedLoaded`**:
  Returns the current route.
- **`switchLocaleLogic(toLocale: string, i18nRouteParams: I18nRouteParams, route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric | string)`**:
  Handles the logic for switching locales and navigating to the new route.
- **`resolveLocalizedRoute(to: RouteLocationAsString | RouteLocationAsRelative | RouteLocationAsPath | string, locale?: string): RouteLocationResolved`**:
  Resolves a localized route for the specified locale.

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
