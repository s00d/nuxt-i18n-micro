---
outline: deep
---

# 📢 Events

## 🔄 `i18n:register`

The `i18n:register` event is a key feature in `Nuxt I18n Micro`, enabling the dynamic addition of new translations to your application's global i18n context. This event ensures that internationalization is seamless and flexible, allowing you to integrate additional translations as needed.

### 📝 Event Details

- **Purpose**: 
  - This event allows for the dynamic incorporation of additional translations into the existing set for a specific locale.

- **Payload**:
  - **`registerI18nModule`**: 
    - A function provided by the event that takes two arguments:
      - **`translations`** (`Translations`): 
        - An object containing key-value pairs that represent the translations, organized according to the `Translations` interface.
      - **`locale`** (`string`): 
        - The locale code (e.g., `'en'`, `'ru'`) for which the translations are being registered.

- **Behavior**:
  - When the event is triggered, the `registerI18nModule` function is called with the provided `translations` and `locale`. 
  - This function merges the new translations into the global translation context for the specified locale, updating the available translations across the application.

### 💡 Example Usage

Here’s how you might use the `i18n:register` event to add new translations dynamically:

```typescript
nuxt.hook('i18n:register', (registerI18nModule) => {
  registerI18nModule({
    "greeting": "Hello",
    "farewell": "Goodbye"
  }, 'en');
});
```

### 🛠️ Explanation:

- **Triggering the Event**:
  - The event is hooked into the `i18n:register` lifecycle event provided by `Nuxt I18n Micro`.
- **Adding Translations**:
  - In the example, the English translations for `"greeting"` and `"farewell"` are registered.
  - The `registerI18nModule` function merges these new translations into the existing set for the `'en'` locale.

### 🔗 Key Benefits

- **Dynamic Updates**:
  - Easily update or add translations without redeploying your entire application.
- **Localization Flexibility**:
  - Allows for real-time localization adjustments based on user or application needs.

By leveraging the `i18n:register` event, you can ensure that your application's localization strategy remains flexible and adaptive to changing requirements, enhancing the overall user experience.
