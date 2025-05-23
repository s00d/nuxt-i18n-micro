---
outline: deep
---

# 🌍 Server-Side Translations in Nuxt I18n Micro

## 📖 Overview

Nuxt I18n Micro supports server-side translations, allowing you to translate content on the server and return it as part of the response. This is particularly useful for APIs or server-rendered applications where localization is needed before reaching the client.

The translations use locale messages defined in the Nuxt I18n  configuration and are dynamically resolved based on the detected locale. 

To clarify, the translations used by Nuxt I18n Micro in server-side handling are only sourced from the root-level translation files. Any nested translation files or subdirectories are not utilized in this context. The system will only retrieve translations from the root folder, ensuring a consistent and manageable approach to server-side translation retrieval.

---

## 🛠️ Setting Up Server-Side Translations

To enable server-side translations, use the provided middleware to handle locale detection and return translations dynamically. The `useTranslationServerMiddleware` function is designed for this purpose.

---

## ✨ Using Translations in Server Handlers

You can seamlessly translate content in any `eventHandler` by using the middleware.

### Example: Basic Usage
```typescript
import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const t = await useTranslationServerMiddleware(event)
  return {
    message: t('greeting'), // Returns the translated value for the key "greeting"
  }
})
```

In this example:
- The user's locale is detected automatically from query parameters, cookies, or headers.
- The `t` function retrieves the appropriate translation for the detected locale.

---

## 🌐 Providing a Custom Locale

If you need to specify a locale manually (e.g., for testing or certain requests), you can pass it to the middleware:

### Example: Custom Locale
```typescript
import { defineEventHandler } from 'h3'

function detectLocale(event): string | null {
  const urlSearchParams = new URLSearchParams(event.node.req.url?.split('?')[1]);
  const localeFromQuery = urlSearchParams.get('locale');
  if (localeFromQuery) return localeFromQuery;

  return 'en';
}

export default defineEventHandler(async (event) => {
  const t = await useTranslationServerMiddleware(event, 'en', detectLocale(event)) // Force French local, en - default locale
  return {
    message: t('welcome'), // Returns the French translation for "welcome"
  }
})
```

---

## 📋 Detecting Locale

The middleware automatically determines the user's locale using a fallback chain:
1. **Query Parameter**: `?locale=fr`
2. **Cookie**: `user-locale`
3. **HTTP Header**: `Accept-Language`
4. **Default Locale**: As defined in useTranslationServerMiddleware param.
