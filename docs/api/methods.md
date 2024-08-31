---
outline: deep
---

# 🛠️ Methods

## 🌍 `$getLocale()`

Returns the current locale code.

```typescript
const locale = $getLocale()
```

## 🌍 `$getLocales()`

Returns an array of all available locales configured in the module.

```typescript
const locales = $getLocales()
```

## 🔍 `$t(key: string, params?: Record<string, any>, defaultValue?: string)`

Fetches a translation for the given key. Optionally interpolates parameters.

```typescript
const welcomeMessage = $t('welcome', { username: 'Alice', unreadCount: 5 })
```

## 🔢 `$tc(key: string, count: number, defaultValue?: string)`

Fetches a pluralized translation for the given key based on the count.

```typescript
const appleCountMessage = $tc('apples', 10)
```

## 🔄 `$switchLocale(locale: string)`

Switches to the given locale and redirects the user to the appropriate localized route.

```typescript
$switchLocale('fr')
```

## 🌐 `$localeRoute(to: RouteLocationRaw, locale?: string): RouteLocationRaw`

Generates a localized route object based on the target route.

```typescript
const localizedRoute = $localeRoute({ name: 'index' })
```

## 🗂️ `$mergeTranslations(newTranslations: Translations)`

Merges new translations into the existing translation cache for the current route and locale.

```typescript
$mergeTranslations({
  welcome: 'Bienvenue, {username}!'
})
```

Here's the updated documentation for the `$defineI18nRoute` function with the added description for the `localeRoutes` property:

---

## 🚦 `$defineI18nRoute(routeDefinition: { locales?: string[] | Record<string, Record<string, TranslationObject>>, localeRoutes?: Record<string, string> })`

Defines route behavior based on the current locale. This method can be used to control access to specific routes based on available locales, provide translations for specific locales, or set custom routes for different locales.

- **`locales`**: This property determines which locales are available for the route. It can be either:
  - An **array of strings**, where each string represents an available locale (e.g., `['en', 'fr', 'de']`).
  - An **object** where each key is a locale code, and the value is either an object containing translations or an empty object if you do not wish to provide translations for that locale.

- **`localeRoutes`**: This property allows you to define custom routes for specific locales. Each key represents a locale code, and the corresponding value is the custom route path for that locale. This is useful for handling scenarios where certain locales require different route structures or paths.

  Example:

  ```typescript
  $defineI18nRoute({
    locales: {
      en: { greeting: 'Hello', farewell: 'Goodbye' },
      ru: { greeting: 'Привет', farewell: 'До свидания' },
      de: { greeting: 'Hallo', farewell: 'Auf Wiedersehen' },
    },
    localeRoutes: {
      ru: '/localesubpage', // Custom route path for the Russian locale
    },
  })
  ```

### Use Cases:

- **Controlling Access**: By specifying available locales, you can control which routes are accessible based on the current locale, ensuring that users only see content relevant to their language.

- **Providing Translations**: The `locales` object allows for providing specific translations for each route, enhancing the user experience by delivering content in the user's preferred language.

- **Custom Routing**: The `localeRoutes` property offers flexibility in defining different paths for specific locales, which can be particularly useful in cases where certain languages or regions require unique navigational flows or URLs.

This function offers a flexible way to manage routing and localization in your Nuxt application, making it easy to tailor the user experience based on the language and region settings of your audience.

### Example 1: Controlling Access Based on Locales

```typescript
import { useNuxtApp } from '#imports'

const { $defineI18nRoute } = useNuxtApp()

$defineI18nRoute({
  locales: ['en', 'fr', 'de'] // Only these locales are allowed for this route
})
```

### Example 2: Providing Translations for Locales

```typescript
import { useNuxtApp } from '#imports'

const { $defineI18nRoute } = useNuxtApp()

$defineI18nRoute({
  locales: {
    en: { greeting: 'Hello', farewell: 'Goodbye' },
    fr: { greeting: 'Bonjour', farewell: 'Au revoir' },
    de: { greeting: 'Hallo', farewell: { aaa: { bbb: "Auf Wiedersehen" } } },
    ru: {} // Russian locale is allowed but no translations are provided
  }
})
```

### 📝 Explanation:

- **Locales Array**: If you only want to specify which locales are allowed for a route, pass an array of locale codes. The user will only be able to access this route if the current locale is in this list.
- **Locales Object**: If you want to provide specific translations for each locale, pass an object where each key is a locale code. The value should be an object with key-value pairs for translations. If you do not wish to provide translations for a locale but still want to allow access, pass an empty object (`{}`) for that locale.

## 💻 Example Usage in a Component

Here's an example of how to use these methods in a Nuxt component:

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
        @click="$switchLocale(locale.code)"
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

## 🛠️ `useNuxtApp`

**Example:**

```typescript
import { useNuxtApp } from '#imports'

const { $getLocale, $switchLocale, $getLocales, $localeRoute, $t } = useNuxtApp()
```

## 🧩 `useI18n` Composable

**Example:**

```typescript
import { useI18n } from '#imports'

const { $getLocale, $switchLocale, $getLocales, $localeRoute, $t } = useI18n()
// or
const i18n = useI18n()
```
