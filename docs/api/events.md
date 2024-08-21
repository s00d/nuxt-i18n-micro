---
outline: deep
---

# Events

## `i18n:register`

This event is triggered when a new translation module is registered within the application. It plays a crucial role in dynamically adding translations to the global i18n context, enabling seamless internationalization in `Nuxt I18n Micro`.

### Details:
- **Purpose**: To allow the dynamic incorporation of additional translations into the existing set for a specific locale.
- **Payload**:
  - **`registerI18nModule`**: A function provided by the event that takes two arguments:
    - **`translations`** (`Translations`): The translation object that contains key-value pairs, organized according to the `Translations` interface.
    - **`locale`** (`string`): The locale code (e.g., `'en'`, `'ru'`) for which the translations are being registered.
- **Behavior**:
  - When the event is triggered, the `registerI18nModule` function is called with the provided `translations` and `locale`. This function merges these translations into the global translation context for the specified locale, updating the available translations in the application.

### Example Usage:
```typescript
nuxt.hook('i18n:register', register => {
  register('en', {
    "greeting": "Hello",
    "farewell": "Goodbye"
  });
});
```

In this example, the En translations for `"greeting"` and `"farewell"` are registered and merged into the existing translations for the `'ru'` locale.
