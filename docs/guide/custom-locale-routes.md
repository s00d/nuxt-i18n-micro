---
outline: deep
---

# 🔗 Custom Localized Routes with `localeRoutes` in `Nuxt I18n Micro`

## 📖 Introduction to `localeRoutes`

The `localeRoutes` feature in `Nuxt I18n Micro` allows you to define custom routes for specific locales, offering flexibility and control over the routing structure of your application. This feature is particularly useful when certain locales require different URL structures, tailored paths, or need to follow specific regional or linguistic conventions.

## 🚀 Primary Use Case of `localeRoutes`

The primary use case for `localeRoutes` is to provide distinct routes for different locales, enhancing the user experience by ensuring URLs are intuitive and relevant to the target audience. For example, you might have different paths for English and Russian versions of a page, where the Russian locale follows a localized URL format.

### 📄 Example: Defining `localeRoutes` in `$defineI18nRoute`

Here’s an example of how you might define custom routes for specific locales using `localeRoutes` in your `$defineI18nRoute` function:

```typescript
$defineI18nRoute({
    localeRoutes: {
        ru: '/localesubpage', // Custom route path for the Russian locale
        de: '/lokaleseite' // Custom route path for the German locale
    }
})
```

### 🔄 How `localeRoutes` Work

-   **Default Behavior**: Without `localeRoutes`, all locales use a common route structure defined by the primary path.
-   **Custom Behavior**: With `localeRoutes`, specific locales can have their own routes, overriding the default path with locale-specific routes defined in the configuration.

## 🌱 Use Cases for `localeRoutes`

### 📄 Example: Using `localeRoutes` in a Page

Here’s a simple Vue component demonstrating the use of `$defineI18nRoute` with `localeRoutes`:

```vue
<template>
    <div>
        <!-- Display greeting message based on the current locale -->
        <p>{{ $t('greeting') }}</p>

        <!-- Navigation links -->
        <div>
            <NuxtLink :to="$localeRoute({ name: 'index' })">
                Go to Index
            </NuxtLink>
            |
            <NuxtLink :to="$localeRoute({ name: 'about' })">
                Go to About Page
            </NuxtLink>
        </div>
    </div>
</template>

<script setup>
import { useNuxtApp } from '#imports'

const { $switchLocale, $localeRoute, $t, $defineI18nRoute } = useNuxtApp()

// Define translations and custom routes for specific locales
$defineI18nRoute({
    localeRoutes: {
        ru: '/localesubpage' // Custom route path for Russian locale
    }
})
</script>
```

### 🛠️ Using `localeRoutes` in Different Contexts

-   **Landing Pages**: Use custom routes to localize URLs for landing pages, ensuring they align with marketing campaigns.
-   **Documentation Sites**: Provide distinct routes for each locale to better match the localized content structure.
-   **E-commerce Sites**: Tailor product or category URLs per locale for improved SEO and user experience.

## 📝 Best Practices for Using `localeRoutes`

-   **🚀 Use for Relevant Locales**: Apply `localeRoutes` primarily where the URL structure significantly impacts the user experience or SEO. Avoid overuse for minor differences.
-   **🔧 Maintain Consistency**: Keep a consistent routing pattern across locales unless there's a strong reason to deviate. This approach helps in maintaining clarity and reducing complexity.
-   **📚 Document Custom Routes**: Clearly document any custom routes you define with `localeRoutes`, especially in modular applications, to ensure team members understand the routing logic.
