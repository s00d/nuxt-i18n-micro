---
outline: deep
---

# FAQ: Common Issues & Solutions

## ❓ What if a route doesn't load?

One common issue when using `Nuxt I18n Micro` is that some routes might not open as expected. This can happen when the router doesn’t automatically assign a name to a route, particularly in subfolders.

**Solution:**
To fix this, manually define the page’s route name by adding the following to the corresponding Vue file:

```javascript
definePageMeta({ name: 'pageName' })
```

This ensures that the route is properly registered, and the application can navigate to it without issues.

---

## ❓ Why is the `assets/_locales/` folder added to the server folder?

When deploying to platforms like Netlify, the build process might behave differently compared to local development. This can lead to issues where certain files or folders are not found during server-side rendering (SSR).

To ensure that localization files are available during SSR, the `assets/_locales/` folder is added to the server folder. This is a workaround to make sure that the localization files are accessible in the production environment, especially when the build process and runtime environment differ.

**Explanation:**
- **Build Process:** During the build, all translations are cached in the production folder. However, when deploying to platforms like Netlify, the server code is moved to functions, and there might be a separate container where locale files are not accessible.
- **Prerendering:** Prerendering does not work when using `$fetch` in SSR, leading to middleware not finding the localization files.
- **Server Assets:** To address this, the localization files are saved in the Nitro server assets during prerendering. In production, they are read from the server assets.

---

## ❓ Is `Nuxt I18n Micro` inspired by `vue-i18n`? What about features like modifiers?

While `Nuxt I18n Micro` serves as a performance alternative to `nuxt-i18n`, it is not directly inspired by `vue-i18n`. The library was built from scratch to address issues in `nuxt-i18n`, and while some method names and parameters are similar, the underlying logic is entirely different.

**Modifiers**: The maintainer experimented with adding modifiers but found that components like `<i18n-t>` and `<i18n-link>` effectively cover the same needs. For example:

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

Since this approach is flexible and powerful, releasing modifiers was deemed unnecessary for now. However, modifiers may be added in the future if demand arises.

---

## ❓ Can I use `NuxtLink` or `i18nLink` directly in translation strings?

Yes, `Nuxt I18n Micro` allows you to use `NuxtLink` or `i18nLink` in translations through the `<i18n-t>` component, eliminating the need to split translation strings, which can be especially helpful when dealing with languages that have different grammatical rules or RTL languages.

Example:

```json
{
  "example": "Share your {link} with friends",
  "link_text": "translation link"
}
```

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

This method supports dynamic link creation inside translations while maintaining proper localization structure.
