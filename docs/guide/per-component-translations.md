## 📖 Per-Component Translations in `Nuxt I18n Micro`

### Overview

`Per-Component Translations` in `Nuxt I18n Micro` allows developers to define translations directly within specific components or pages of a Nuxt application using the `$defineI18nRoute` function. This approach is ideal for managing localized content that is unique to individual components, providing a more modular and maintainable method for handling translations.

### `$defineI18nRoute` Function

The `$defineI18nRoute` function configures route behavior based on the current locale, offering a versatile solution to:

- Control access to specific routes based on available locales.
- Provide translations for specific locales.
- Set custom routes for different locales.

#### Method Signature

```typescript
$defineI18nRoute(routeDefinition: { 
  locales?: string[] | Record<string, Record<string, TranslationObject>>, 
  localeRoutes?: Record<string, string> 
})
```

#### Parameters

- **locales:** Defines which locales are available for the route. This can be:
  - An array of strings, where each string is an available locale (e.g., `['en', 'fr', 'de']`).
  - An object where each key is a locale code, and the value is an object containing translations or an empty object if no translations are needed.

- **localeRoutes:** Allows custom routes for specific locales. Each key represents a locale code, and the value is the custom route path for that locale. This is useful for scenarios where different locales require unique routing.

#### Example Usage

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

### Use Cases

1. **Controlling Access Based on Locales:** Define which locales are allowed for specific routes to ensure users only see content relevant to their language.

   ```typescript
   import { useNuxtApp } from '#imports'

   const { $defineI18nRoute } = useNuxtApp()

   $defineI18nRoute({
     locales: ['en', 'fr', 'de'] // Only these locales are allowed for this route
   })
   ```

2. **Providing Translations for Locales:** Use the `locales` object to provide specific translations for each route, enhancing the user experience by delivering content in the user's preferred language.

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

3. **Custom Routing for Locales:** Define custom paths for specific locales using the `localeRoutes` property. This allows you to create unique navigational flows or URL structures for different languages or regions.

### Best Practices

- **Keep Translations Close to Components:** Define translations directly within the relevant component to keep localized content organized and maintainable.
- **Use Locale Objects for Flexibility:** Utilize the object format for the `locales` property when specific translations or access control based on locales are required.
- **Document Custom Routes:** Clearly document any custom routes set for different locales to maintain clarity and simplify development and maintenance.

Here's an example of a Vue page using `defineI18nRoute` for per-component translations:

### Example: Vue Page with Per-Component Translations

Below is an example of how to use `$defineI18nRoute` within a Vue component to handle translations and custom routing based on locale.

```vue
<template>
  <div>
    <h1>{{ t('greeting') }}</h1>
    <p>{{ t('farewell') }}</p>
  </div>
</template>

<script setup lang="ts">
import { useNuxtApp } from '#imports'

// Access the $defineI18nRoute function from Nuxt's context
const { $defineI18nRoute, $t: t } = useNuxtApp()

// Define i18n route with translations for specific locales
$defineI18nRoute({
  locales: {
    en: { greeting: 'Hello', farewell: 'Goodbye' },
    fr: { greeting: 'Bonjour', farewell: 'Au revoir' },
    de: { greeting: 'Hallo', farewell: 'Auf Wiedersehen' },
    ru: { greeting: 'Привет', farewell: 'До свидания' },
  },
  localeRoutes: {
    ru: '/ru-specific-path', // Custom route path for the Russian locale
    fr: '/fr-specific-path'  // Custom route path for the French locale
  }
})
</script>
```

### Explanation

- **Component-Level Translations:** The translations are defined directly in the component using the `locales` property of `$defineI18nRoute`. This keeps translations closely tied to the component, making them easy to manage and update.
- **Custom Routing:** The `localeRoutes` property is used to set specific paths for different locales. This allows for unique navigational flows based on the user's language preference.

This setup enables the component to display localized greetings and farewells based on the current locale, and it also allows for custom routes tailored to specific locales, enhancing the user experience by delivering content in the preferred language and structure.

### Summary

The `Per-Component Translations` feature, powered by the `$defineI18nRoute` function, offers a powerful and flexible way to manage localization within your Nuxt application. By allowing localized content and routing to be defined at the component level, it helps create a highly customized and user-friendly experience tailored to the language and regional preferences of your audience.
