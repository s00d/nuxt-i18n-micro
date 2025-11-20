---
outline: deep
---

# 🛠️ Methods

This page documents all available methods provided by nuxt-i18n-micro. Methods are organized by functionality for easier navigation.


## 🌍 Locale Management

Methods for getting and managing locale information.

### `$getLocale`

- **Type**: `() => string`
- **Description**: Returns the current locale code.

```typescript
const locale = $getLocale()
// Output: 'en' (assuming the current locale is English)
```

### `$getLocaleName`

**Version introduced**: `v1.28.0`

- **Type**: `() => string | null`
- **Description**: Returns the current locale name from displayName config.

```typescript
const locale = $getLocaleName()
// Output: 'English'
```

### `$getLocales`

- **Type**: `() => Array<{ code: string; iso?: string; dir?: string }>`
- **Description**: Returns an array of all available locales configured in the module.

```typescript
const locales = $getLocales()
// Output: [{ code: 'en', iso: 'en-US', dir: 'ltr' }, { code: 'fr', iso: 'fr-FR', dir: 'ltr' }]
```

## 🔍 Translation Methods

Core methods for retrieving and managing translations.

### `$t`

- **Type**: `(key: string, params?: Record<string, any>, defaultValue?: string) => string | number | boolean | Translations | PluralTranslations | unknown | null`
- **Description**: Fetches a translation for the given key. Optionally interpolates parameters.

**Parameters**:
- **key**: `string` — The translation key
- **params**: `Record<string, any> | undefined` — Optional. A record of key-value pairs to interpolate into the translation
- **defaultValue**: `string | undefined` — Optional. The default value to return if the translation is not found
- **route**: `RouteLocationNormalizedLoaded | undefined` — Optional. The route from which to determine the locale and resolve the translation context

```typescript
const welcomeMessage = $t('welcome', { username: 'Alice', unreadCount: 5 })
// Output: "Welcome, Alice! You have 5 unread messages."
```

### `$ts`

- **Type**: `(key: string, params?: Record<string, any>, defaultValue?: string) => string`
- **Description**: A variant of `$t` that always returns a string.

**Parameters**:
- **key**: `string` — The translation key
- **params**: `Record<string, any> | undefined` — Optional. A record of key-value pairs to interpolate into the translation
- **defaultValue**: `string | undefined` — Optional. The default value to return if the translation is not found
- **route**: `RouteLocationNormalizedLoaded | undefined` — Optional. The route from which to determine the locale and resolve the translation context

```typescript
const welcomeMessage = $ts('welcome', { username: 'Alice', unreadCount: 5 })
// Output: "Welcome, Alice! You have 5 unread messages."
```

### `$tc`

- **Type**: `(key: string, count: number, defaultValue?: string) => string`
- **Description**: Fetches a pluralized translation for the given key based on the count.

**Parameters**:
- **key**: `string` — The translation key
- **count**: `number` — The count for pluralization
- **defaultValue**: `string | undefined` — Optional. The default value to return if the translation is not found

```typescript
const appleCountMessage = $tc('apples', 10)
// Output: "10 apples" (assuming the plural rule for 'apples' is defined correctly)
```

### `$mergeTranslations`

- **Type**: `(newTranslations: Record<string, string>) => void`
- **Description**: Merges new translations into the existing translation cache for the current route and locale.

**Parameters**:
- **newTranslations**: `Record<string, string>` — The new translations to merge

```typescript
$mergeTranslations({
  welcome: 'Bienvenue, {username}!'
})
// Output: Updates the translation cache with the new French translation
```

### `$setMissingHandler`

- **Type**: `(handler: MissingHandler | null) => void`
- **Description**: Sets a custom handler function that will be called when a translation key is not found. This is useful for logging missing translations to error tracking services like Sentry.

**Parameters**:
- **handler**: `MissingHandler | null` — A function that receives `(locale: string, key: string, routeName: string)` or `null` to remove the handler

**Type Definition**:
```typescript
type MissingHandler = (
  locale: string,
  key: string,
  routeName: string,
  instance?: unknown,
  type?: string
) => void
```

```typescript
// Set a custom handler
$setMissingHandler((locale, key, routeName) => {
  console.error(`Missing translation: ${key} in ${locale} for route ${routeName}`)
  // Send to Sentry or other error tracking service
  // Sentry.captureMessage(`Missing translation: ${key}`)
})

// Remove the handler
$setMissingHandler(null)
```

**Use Cases**:
- Logging missing translations to error tracking services (Sentry, LogRocket, etc.)
- Collecting analytics on missing translations
- Custom error handling for missing translation keys

## 🔢 Number & Date Formatting

Methods for formatting numbers and dates according to locale conventions.

### `$tn`

- **Type**: `(value: number | string, options?: Intl.NumberFormatOptions) => string`
- **Description**: Formats a number according to the current locale using `Intl.NumberFormat`.

**Parameters**:
- **value**: `number | string` — The number to format
- **options**: `Intl.NumberFormatOptions | undefined` — Optional. `Intl.NumberFormatOptions` to customize the formatting

```typescript
const formattedNumber = $tn(1234567.89, { style: 'currency', currency: 'USD' })
// Output: "$1,234,567.89" in the 'en-US' locale
```

**Use Cases**:
- Formatting numbers as currency, percentages, or decimals in the appropriate locale format
- Customizing the number format using `Intl.NumberFormatOptions` such as currency, minimum fraction digits, etc.

### `$td`

- **Type**: `(value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string`
- **Description**: Formats a date according to the current locale using `Intl.DateTimeFormat`.

**Parameters**:
- **value**: `Date | number | string` — The date to format
- **options**: `Intl.DateTimeFormatOptions | undefined` — Optional. `Intl.DateTimeFormatOptions` to customize the formatting

```typescript
const formattedDate = $td(new Date(), { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
// Output: "Friday, September 1, 2023" in the 'en-US' locale
```

**Use Cases**:
- Displaying dates in a format that aligns with the user's locale
- Customizing date output using options like weekday names, time formats, and timezone settings

### `$tdr`

- **Type**: `(value: Date | number | string, options?: Intl.RelativeTimeFormatOptions) => string`
- **Description**: Formats a date as a relative time (e.g., "5 minutes ago") according to the current locale using `Intl.RelativeTimeFormat`.

**Parameters**:
- **value**: `Date | number | string` — The date to compare against the current time
- **options**: `Intl.RelativeTimeFormatOptions | undefined` — Optional. `Intl.RelativeTimeFormatOptions` to customize the relative time formatting

```typescript
const relativeDate = $tdr(new Date(Date.now() - 1000 * 60 * 5))
// Output: "5 minutes ago" in the 'en-US' locale
```

## 🔄 Route & Locale Switching

Methods for switching between locales and routes.

### `$switchLocale`

- **Type**: `(locale: string) => void`
- **Description**: Switches to the given locale and redirects the user to the appropriate localized route.

**Parameters**:
- **locale**: `string` — The locale to switch to

```typescript
$switchLocale('fr')
// Output: Redirects the user to the French version of the route
```

### `$switchLocaleRoute`

- **Type**: `(locale: string) => RouteLocationRaw`
- **Description**: Return current route with the given locale

**Parameters**:
- **locale**: `string` — Target locale

```typescript
// on /en/news
const routeFr = $switchLocaleRoute('fr')
// Output: A route object with the new locale applied, e.g., { name: 'localized-news', params: { locale: 'fr' } }
```

### `$switchLocalePath`

- **Type**: `(locale: string) => string`
- **Description**: Return url of current route with the given locale

**Parameters**:
- **locale**: `string` — Target locale

```typescript
// on /en/news
const routeFr = $switchLocalePath('fr')
window.location.href = routeFr
// Output: url with new locale applied, e.g., '/fr/nouvelles'
```

### `$switchRoute`

**Version introduced**: `v1.27.0**

- **Type**: `(route: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric | string, toLocale?: string) => void`
- **Description**: Switches the route to a new specified destination and changes the locale if needed, redirecting the user to the appropriate localized route.

**Parameters**:
- **route**: `RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric | string` — The route to which you want to switch
- **toLocale** (optional): `string` — The locale to switch to for the target route

**Examples**:

::: code-group

```typescript [String Path]
// Switches to the given path with the current locale
switchRoute('/about')
```

```typescript [String Path with Locale]
// Switches to the given path with French locale
switchRoute('/about', 'fr')
```

```typescript [Named Route]
// Switches to a named route with the current locale
switchRoute({ name: 'page' })
```

```typescript [Named Route with Locale]
// Switches to a named route and changes the locale to Spanish
switchRoute({ name: 'page' }, 'es')
```

:::

## 🌐 Route Generation

Methods for generating localized routes and paths.

### `$localeRoute`

- **Type**: `(to: RouteLocationRaw, locale?: string) => RouteLocationResolved`
- **Description**: Generates a localized route object based on the target route.

**Parameters**:
- **to**: `RouteLocationRaw` — The target route object
- **locale**: `string | undefined` — Optional. The locale for the generated route

```typescript
const localizedRoute = $localeRoute({ name: 'index' })
// Output: A route object with the current locale applied, e.g., { name: 'index', params: { locale: 'fr' } }
```

### `$localePath`

- **Type**: `(to: RouteLocationRaw, locale?: string) => string`
- **Description**: Return url based on the target route

**Parameters**:
- **to**: `RouteLocationRaw` — The target route object
- **locale**: `string | undefined` — Optional. The locale for the generated route

```typescript
const localizedRoute = $localeRoute({ name: 'news' })
// Output: url with new locale applied, e.g., '/en/nouvelles'
```

## 🔍 Route Information

Methods for getting route information and names.

### `$getRouteName`

**Version introduced**: `v1.28.0`

- **Type**: `(route?: RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric, locale?: string) => string`
- **Description**: Retrieves the base route name without any locale-specific prefixes or suffixes.

**Parameters**:
- **route**: `RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric | undefined` — Optional. The route object from which to extract the name
- **locale**: `string | undefined` — Optional. The locale code to consider when extracting the route name

```typescript
const routeName = $getRouteName(routeObject, 'fr')
// Output: 'index' (assuming the base route name is 'index')
```

## 🚦 Route Configuration

Methods for configuring route behavior and access control.

### `$defineI18nRoute`

- **Type**: `(routeDefinition: DefineI18nRouteConfig) => void`
- **Description**: Defines route behavior based on the current locale. Controls access to routes, provides translations, and sets custom routes for different locales.

**Parameters**:
- **locales**: `string[] | Record<string, Record<string, string>>` — Available locales for the route
- **localeRoutes**: `Record<string, string>` — Optional. Custom routes for specific locales
- **disableMeta**: `boolean | string[]` — Optional. Disables i18n meta tags for all or specific locales

**Basic Example**:
```typescript
$defineI18nRoute({
  locales: ['en', 'fr', 'de'],
  localeRoutes: {
    en: '/welcome',
    fr: '/bienvenue',
    de: '/willkommen'
  },
  disableMeta: false
})
```

> 📖 **For detailed usage examples, configuration formats, and best practices, see the [Per-Component Translations Guide](/guide/per-component-translations.md).**

### `$setI18nRouteParams`

- **Type**: `(value: Record<LocaleCode, Record<string, string>> | null) => Record<LocaleCode, Record<string, string>> | null`
- **Description**: Set localized versions of params for all switchLocale* methods and returns passed value. MUST be called inside useAsyncData

**Parameters**:
- **value**: `Record<LocaleCode, Record<string, string>> | null` — params of current route for other locale

```typescript
// in pages/news/[id].vue
// for en/news/1-first-article
const { $switchLocaleRoute, $setI18nRouteParams, $defineI18nRoute } = useI18n();
// OR
const { $switchLocaleRoute, $setI18nRouteParams, $defineI18nRoute } = useNuxtApp();
$defineI18nRoute({
  localeRoutes: {
    en: '/news/:id()',
    fr: '/nouvelles/:id()',
    de: '/Nachricht/:id()',
  },
})
const { data: news } = await useAsyncData(`news-${params.id}`, async () => {
  let response = await $fetch("/api/getNews", {
    query: {
      id: params.id,
    },
  });
  if (response?.localeSlugs) {
    response.localeSlugs = {
      en: {
        id: '1-first-article'
      }
      fr: {
        id: '1-premier-article'
      }
      de: {
        id: '1-erster-Artikel'
      }
    }
    $setI18nRouteParams(response?.localeSlugs);
  }
  return response;
});
$switchLocalePath('fr') // === 'fr/nouvelles/1-premier-article'
$switchLocalePath('de') // === 'de/Nachricht/1-erster-Artikel'
```

## 💻 Usage Examples

### Basic Component Usage

```vue
<template>
  <div>
    <p>{{ $t('key2.key2.key2.key2.key2') }}</p>
    <p>Current Locale: {{ $getLocale() }}</p>

    <div>
      {{ $t('welcome', { username: 'Alice', unreadCount: 5 }) }}
    </div>
    <div>
      {{ $tc('apples', 10) }}
    </div>

    <div>
      <button
        v-for="locale in $getLocales()"
        :key="locale"
        :disabled="locale === $getLocale()"
        @click="() => $switchLocale(locale.code)"
      >
        Switch to {{ locale.code }}
      </button>
    </div>

    <div>
      <NuxtLink :to="$localeRoute({ name: 'index' })">
        Go to Index
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from '#imports'

const { $getLocale, $switchLocale, $getLocales, $localeRoute, $t, $tc } = useI18n()
</script>
```

### Using with useNuxtApp

```typescript
import { useNuxtApp } from '#imports'

const { $getLocale, $switchLocale, $getLocales, $localeRoute, $t } = useNuxtApp()
```

### Using with useI18n Composable

```typescript
import { useI18n } from '#imports'

const { $getLocale, $switchLocale, $getLocales, $localeRoute, $t } = useI18n()
// or
const i18n = useI18n()
```
