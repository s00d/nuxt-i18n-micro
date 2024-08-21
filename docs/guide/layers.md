---
outline: deep
---

# 🗂️ Layers in `Nuxt I18n Micro`

## 📖 Introduction to Layers

Layers in `Nuxt I18n Micro` allow you to manage and customize localization settings flexibly across different parts of your application. By defining different layers, you can adjust the configuration for various contexts, such as overriding settings for specific sections of your site or creating reusable base configurations that can be extended by other parts of your application.

## 🛠️ Primary Configuration Layer

The **Primary Configuration Layer** is where you set up the default localization settings for your entire application. This layer is essential as it defines the global configuration, including the supported locales, default language, and other critical i18n settings.

### 📄 Example: Defining the Primary Configuration Layer

Here’s an example of how you might define the primary configuration layer in your `nuxt.config.ts` file:

```typescript
export default defineNuxtConfig({
  i18n: {
    locales: [
      { code: 'en', iso: 'en-EN', dir: 'ltr' },
      { code: 'fr', iso: 'fr-FR', dir: 'ltr' },
      { code: 'ar', iso: 'ar-SA', dir: 'rtl' },
    ],
    defaultLocale: 'en', // The default locale for the entire app
    translationDir: 'locales', // Directory where translations are stored
    meta: true, // Automatically generate SEO-related meta tags like `alternate`
    autoDetectLanguage: true, // Automatically detect and use the user's preferred language
  },
})
```

## 🌱 Child Layers

Child layers are used to extend or override the primary configuration for specific parts of your application. For instance, you might want to add additional locales or modify the default locale for a particular section of your site. Child layers are especially useful in modular applications where different parts of the application might have different localization requirements.

### 📄 Example: Extending the Primary Layer in a Child Layer

Suppose you have a section of your site that needs to support additional locales, or you want to disable a particular locale in a certain context. Here’s how you can achieve that by extending the primary configuration layer:

```typescript
// basic/nuxt.config.ts (Primary Layer)
export default defineNuxtConfig({
  i18n: {
    locales: [
      { code: 'en', iso: 'en-EN', dir: 'ltr' },
      { code: 'fr', iso: 'fr-FR', dir: 'ltr' },
    ],
    defaultLocale: 'en',
    meta: true,
    translationDir: 'locales',
  },
})
```

```typescript
// extended/nuxt.config.ts (Child Layer)
export default defineNuxtConfig({
  extends: '../basic', // Inherit the base configuration from the 'basic' layer
  i18n: {
    locales: [
      { code: 'en', iso: 'en-EN', dir: 'ltr' }, // Inherited from the base layer
      { code: 'fr', iso: 'fr-FR', dir: 'ltr' }, // Inherited from the base layer
      { code: 'de', iso: 'de-DE', dir: 'ltr' }, // Added in the child layer
    ],
    defaultLocale: 'fr', // Override the default locale to French for this section
    autoDetectLanguage: false, // Disable automatic language detection in this section
  },
})
```

### 🌐 Using Layers in a Modular Application

In a larger, modular Nuxt application, you might have multiple sections, each requiring its own i18n settings. By leveraging layers, you can maintain a clean and scalable configuration structure.

### 📄 Example: Layered Configuration in a Modular Application

Imagine you have an e-commerce site with distinct sections like the main website, admin panel, and customer support portal. Each section might need a different set of locales or other i18n settings.

#### **Primary Layer (Global Configuration):**

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  i18n: {
    locales: [
      { code: 'en', iso: 'en-EN', dir: 'ltr' },
      { code: 'fr', iso: 'fr-FR', dir: 'ltr' },
    ],
    defaultLocale: 'en',
    meta: true,
    translationDir: 'locales',
    autoDetectLanguage: true,
  },
})
```

#### **Child Layer for Admin Panel:**

```typescript
// admin/nuxt.config.ts
export default defineNuxtConfig({
  extends: '../nuxt.config', // Inherit the global settings
  i18n: {
    locales: [
      { code: 'en', iso: 'en-EN', dir: 'ltr' }, // Inherited
      { code: 'fr', iso: 'fr-FR', dir: 'ltr' }, // Inherited
      { code: 'es', iso: 'es-ES', dir: 'ltr' }, // Specific to the admin panel
    ],
    defaultLocale: 'en',
    meta: false, // Disable automatic meta generation in the admin panel
  },
})
```

#### **Child Layer for Customer Support Portal:**

```typescript
// support/nuxt.config.ts
export default defineNuxtConfig({
  extends: '../nuxt.config', // Inherit the global settings
  i18n: {
    locales: [
      { code: 'en', iso: 'en-EN', dir: 'ltr' }, // Inherited
      { code: 'fr', iso: 'fr-FR', dir: 'ltr' }, // Inherited
      { code: 'de', iso: 'de-DE', dir: 'ltr' }, // Specific to the support portal
    ],
    defaultLocale: 'de', // Default to German in the support portal
    autoDetectLanguage: false, // Disable automatic language detection
  },
})
```

In this modular example:
- Each section (admin, support) has its own i18n settings, but they all inherit the base configuration.
- The admin panel adds Spanish (`es`) as a locale and disables meta tag generation.
- The support portal adds German (`de`) as a locale and defaults to German for the user interface.

## 📝 Best Practices for Using Layers

- **🔧 Keep the Primary Layer Simple:** The primary layer should contain the most commonly used settings that apply globally across your application. Keep it straightforward to ensure consistency.
- **⚙️ Use Child Layers for Specific Customizations:** Only override or extend settings in child layers when necessary. This approach avoids unnecessary complexity in your configuration.
- **📚 Document Your Layers:** Clearly document the purpose and specifics of each layer in your project. This will help maintain clarity and make it easier for others (or future you) to understand the configuration.
