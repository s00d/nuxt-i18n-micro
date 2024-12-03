---
outline: deep
---

# FAQ: Common Issues & Solutions

## ❓ What if a route doesn't load?

When using `Nuxt I18n Micro`, certain routes might not load as expected, especially if the router doesn't automatically assign a name to a route in subfolders.

**Solution:**
To address this, manually define the route name for the page by adding the following to the corresponding Vue file:

```javascript
definePageMeta({ name: 'pageName' })
```

This ensures the route is properly registered, enabling seamless navigation within the application.

---

## ❓ Why is the `assets/_locales/` folder added to the server folder?

During deployment, especially on platforms like Netlify, the build process might differ from local development. This can lead to issues where certain files or folders are missing during server-side rendering (SSR).

**Explanation:**
- **Build Process:** Translation files are cached in the production folder during the build. However, on Netlify, server code moves to functions, sometimes isolating localization files.
- **Prerendering:** Prerendering does not work with `$fetch` in SSR, causing middleware to miss localization files.
- **Server Assets:** To resolve this, localization files are saved in the Nitro server assets during prerendering. They are then accessible in production directly from server assets.

---

## ❓ Is `Nuxt I18n Micro` inspired by `vue-i18n`? What about modifiers?

While `Nuxt I18n Micro` serves as a performance alternative to `nuxt-i18n`, it’s built independently of `vue-i18n`. While some method names and parameters may be similar, the underlying functionality differs significantly.

**Modifiers**: The maintainer initially considered modifiers, but concluded that components like `<i18n-t>` and `<i18n-link>` effectively address those needs.

For example:

```vue
<template>
  <i18n-t keypath="feedback.text">
    <template #link>
      <nuxt-link :to="{ name: 'index' }">
        <i18n-t keypath="feedback.link" />
      </nuxt-link>
    </template>
  </i18n-t>
</template>
```

This approach is flexible, so releasing modifiers is currently unnecessary. However, modifiers may be added in future releases if there is demand.

---

## ❓ Can I use `NuxtLink` or `i18nLink` directly in translation strings?

Yes, `Nuxt I18n Micro` allows the use of `NuxtLink` or `i18nLink` within translations through the `<i18n-t>` component, which is especially helpful for handling grammar and RTL language requirements without splitting translation strings.

**Example**:

Translation file:
```json
{
  "example": "Share your {link} with friends",
  "link_text": "translation link"
}
```

Vue template:
```vue
<template>
  <i18n-t keypath="example">
    <template #link>
      <nuxt-link :to="{ name: 'referral' }">
        <i18n-t keypath="link_text" />
      </nuxt-link>
    </template>
  </i18n-t>
</template>
```

This allows dynamic links within translations while preserving proper localization structure.

---

### Updated FAQ Addition:

## ❓ How can I duplicate the default locale when `includeDefaultLocaleRoute` is set to `false`?

When `includeDefaultLocaleRoute: false` is enabled, you can configure two routes with the same locale, using different `code` values. This allows you to duplicate the default locale with different identifiers for routing purposes.

**Solution:**
For example, you can set the locale configuration like this:

```javascript
i18n: {
  locales: [
    { code: 'en_df', iso: 'en_EN', displayName: 'English' },
    { code: 'en', iso: 'en_EN', displayName: 'English' },
  ],
  defaultLocale: 'en_df',
  includeDefaultLocaleRoute: false,
}
```

### Explanation:
- **`defaultLocale: 'en_df'`**: Defines the default locale for the application.
- **Two locales with different `code` values**: By setting the `code` for the default locale (`en_df`) and a second one (`en`), you can create routes for both, without Vue Router treating them as duplicates. This way, you can manually manage URLs like `/en` and `/en_df` for different purposes while still using the same translations.

This approach is particularly useful when you need to differentiate routes with different `code` values for the same language, without causing conflicts with the default locale route.

---

## ❓ Why does `$t` or other i18n composables not work in Nuxt plugins?

Nuxt I18n composables (`$t`, `$getLocale`, `$localePath`, etc.) may not work as expected within Nuxt plugins or utility functions, resulting in runtime errors.

**Cause and Solution:**
Nuxt composables require specific contexts (e.g., Nuxt hooks or Vue setup functions) to access the Nuxt instance. If used outside of these contexts (e.g., in utility functions or plugins), the following error might appear in the console:

```
[nuxt] A composable that requires access to the Nuxt instance was called outside of a plugin, Nuxt hook, Nuxt middleware, or Vue setup function. This is probably not a Nuxt bug. Find out more at https://nuxt.com/docs/guide/concepts/auto-imports#vue-and-nuxt-composables
```

### Solution 1: Use `runWithContext`
To call i18n composables after an asynchronous operation, use [`runWithContext`](https://nuxt.com/docs/api/composables/use-nuxt-app#runwithcontext) to preserve the necessary context.

**Example:**
```javascript
await nuxtApp.runWithContext(() => $t('test_key'))
```

### Solution 2: Retrieve Value First
Alternatively, retrieve the translation value first, then pass it to a utility function.

**Example:**
```javascript
const val = nuxtApp.$t('common.errors.unknown.title')
showError({
    title: val
})
```

### Solution 3: Pass Translation Keys in Services
In services or utility functions, pass the translation keys instead of using `$t` directly. Then, fetch the translation in the component.

**Example:**
```javascript
showError({
  title: 'common.errors.unknown.title',
  message: 'common.errors.unknown.message',
  i18n: true
})
```

These solutions help maintain context and reduce errors, allowing for flexibility in handling translations across the application.
