---
outline: deep
---

# 📢 Events

## 🔄 `i18n:register`

The `i18n:register` event in `Nuxt I18n Micro` enables dynamic addition of translations to your application's global i18n context, making the internationalization process seamless and flexible. This event allows you to integrate new translations as needed, enhancing your application's localization capabilities.

### 📝 Event Details

- **Purpose**:
  - Allows dynamic incorporation of additional translations into the existing set for a specific locale.

- **Payload**:
  - **`register`**:
    - A function provided by the event that takes two arguments:
      - **`translations`** (`Translations`):
        - An object containing key-value pairs representing translations, organized according to the `Translations` interface.
      - **`locale`** (`string`, optional):
        - The locale code (e.g., `'en'`, `'ru'`) for which the translations are registered. Defaults to the locale provided by the event if not specified.

- **Behavior**:
  - When triggered, the `register` function merges the new translations into the global context for the specified locale, updating the available translations across the application.

### 💡 Example Usage

The following example demonstrates how to use the `i18n:register` event to dynamically add translations:

```typescript
nuxt.hook('i18n:register', async (register: (translations: unknown, locale?: string) => void, locale: string) => {
  register({
    "greeting": "Hello",
    "farewell": "Goodbye"
  }, locale);
});
```

### 🛠️ Explanation

- **Triggering the Event**:
  - The event is hooked into the `i18n:register` lifecycle event provided by `Nuxt I18n Micro`.

- **Adding Translations**:
  - The example registers English translations for `"greeting"` and `"farewell"`.
  - The `register` function merges these translations into the existing set for the provided locale.

### 🔗 Key Benefits

- **Dynamic Updates**:
  - Easily update or add translations without needing to redeploy your entire application.

- **Localization Flexibility**:
  - Supports real-time localization adjustments based on user or application needs.

Using the `i18n:register` event, you can ensure that your application's localization strategy remains flexible and adaptable, enhancing the overall user experience.

---

## 🛠️ Modifying Translations with Plugins

To modify translations dynamically in your Nuxt application, using plugins is recommended. Plugins provide a structured way to handle localization updates, especially when working with modules or external translation files.

### **Registering the Plugin**

If you're using a module, register the plugin where translation modifications will occur by adding it to your module’s configuration:

```javascript
addPlugin({
  src: resolve('./plugins/extend_locales'),
})
```

This registers the plugin located at `./plugins/extend_locales`, which will handle dynamic loading and registration of translations.

### **Implementing the Plugin**

In the plugin, you can manage locale modifications. Here's an example implementation in a Nuxt plugin:

```typescript
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(async (nuxtApp) => {
  // Function to load translations from JSON files and register them
  const loadTranslations = async (lang: string) => {
    try {
      const translations = await import(`../locales/${lang}.json`)
      return translations.default
    } catch (error) {
      console.error(`Error loading translations for language: ${lang}`, error)
      return null
    }
  }

  // Hook into the 'i18n:register' event to dynamically add translations
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  nuxtApp.hook('i18n:register', async (register: (translations: unknown, locale?: string) => void, locale: string) => {
    const translations = await loadTranslations(locale)
    if (translations) {
      register(translations, locale)
    }
  })
})
```

### 📝 Detailed Explanation

1. **Loading Translations**:
  - The `loadTranslations` function dynamically imports translation files based on the locale. The files are expected to be in the `locales` directory and named according to locale codes (e.g., `en.json`, `de.json`).
  - On successful loading, translations are returned; otherwise, an error is logged.

2. **Registering Translations**:
  - The plugin hooks into the `i18n:register` event using `nuxtApp.hook`.
  - When the event is triggered, the `register` function is called with the loaded translations and the corresponding locale.
  - This merges the new translations into the global i18n context for the specified locale, updating the available translations throughout the application.

### 🔗 Benefits of Using Plugins for Translation Modifications

- **Separation of Concerns**:
  - Encapsulate localization logic separately from the main application code, making management and maintenance easier.

- **Dynamic and Scalable**:
  - By dynamically loading and registering translations, you can update content without requiring a full application redeployment, which is especially useful for applications with frequently updated or multilingual content.

- **Enhanced Localization Flexibility**:
  - Plugins allow you to modify or extend translations as needed, providing a more adaptable and responsive localization strategy that meets user preferences or business requirements.

By adopting this approach, you can efficiently expand and modify your application's localization through a structured and maintainable process using plugins, keeping internationalization adaptive to changing needs and improving the overall user experience.
