---
outline: deep
---

# 🔧 Custom Language Detection in Nuxt I18n Micro

## 📖 Overview

Nuxt I18n Micro offers built-in mechanisms for automatically detecting the user's locale. However, you may find that creating your own dedicated **custom plugin** provides more flexibility and control for determining and switching locales. By turning off the built-in auto-detection (`autoDetectLanguage: false`), you can seamlessly integrate any logic you need right into a plugin.

Below is an example plugin that demonstrates a straightforward way to detect the locale from user headers, store it in a cookie, and navigate to the appropriate route.

## 🛠️ Disabling Built-In Auto-Detection

In your Nuxt configuration (e.g., `nuxt.config.ts`), simply set:

```ts
export default defineNuxtConfig({
  // ...
  i18n: {
    // ...
    autoDetectLanguage: false
  }
})
```

With this setting, Nuxt I18n Micro will not attempt to detect the user's language. You can then handle all your custom detection logic in a separate plugin.

## ✨ Example: Custom Detection Plugin

Create a new file in the `plugins` folder (e.g., `~/plugins/i18n-auto-detect.ts`). Here’s a complete example:

```ts
import { defineNuxtPlugin, useCookie, useRequestHeaders, useRouter, useRoute, navigateTo, useNuxtApp } from '#imports'

export default defineNuxtPlugin(async (_nuxtApp) => {
  // Access runtime headers
  const headers = useRequestHeaders()
  const route = useRoute()
  const router = useRouter()

  // If you have a method or variable in NuxtApp providing the default locale:
  const { $defaultLocale } = useNuxtApp()
  // Otherwise, fall back to 'en'
  const defaultLocale = $defaultLocale?.() || 'en'

  // Retrieve country from the 'x-country' header and language from 'accept-language'
  const country = headers['x-country']?.toLowerCase() || ''
  const acceptLanguage = headers['accept-language']?.toLowerCase() || ''

  // Locale determination logic:
  // (a) If country = 'de' or 'ru', use that
  // (b) Otherwise, check acceptLanguage
  // (c) Otherwise, fallback to defaultLocale
  let finalLocale: string

  if (country === 'de') {
    finalLocale = 'de'
  } else if (country === 'ru') {
    finalLocale = 'ru'
  } else if (acceptLanguage.startsWith('de')) {
    finalLocale = 'de'
  } else if (acceptLanguage.startsWith('ru')) {
    finalLocale = 'ru'
  } else {
    finalLocale = defaultLocale
  }

  // Check if the user-locale cookie is already set
  const userLocaleCookie = useCookie('user-locale-change')

  // If the cookie does not exist, store the new locale
  if (!userLocaleCookie.value) {
    userLocaleCookie.value = finalLocale
  }

  // Compare the current route's locale to the final locale
  const currentLocale = route.params.locale ?? defaultLocale
  if (currentLocale !== finalLocale) {
    const currentRouteName = route.name as string
    if (currentRouteName) {
      // Remove 'localized-' if it exists
      const routeName = currentRouteName.replace(/^localized-/, '')
      const newParams = { ...route.params }
      delete newParams.locale

      // If finalLocale differs from default, prepend 'localized-'
      let newRouteName = routeName
      if (finalLocale !== defaultLocale) {
        newRouteName = `localized-${routeName}`
        newParams.locale = finalLocale
      }

      // Resolve and redirect
      const newRoute = router.resolve({ name: newRouteName, params: newParams })
      await navigateTo(newRoute.href, { redirectCode: 302, external: true })
    }
  }
})
```

### How It Works

1. **Headers and Country Detection**  
   The plugin reads the headers `x-country` and `accept-language` to figure out the user’s preferred locale.
2. **Cookie Storage**  
   The locale is then stored in a cookie, so the user’s preference is remembered on subsequent requests.
3. **Route Adjustment**  
   If the current route’s locale does not match the determined locale, the plugin automatically redirects to the correct localized route.

## ⚙️ Server-Only or Client-Only Plugins

If you want the detection to happen **only on the server** or **only on the client**, you can use [Nuxt’s filename conventions](https://nuxt.com/docs/getting-started/directory-structure#plugins) for plugins:

- **Server-Only**: Name your file `i18n-auto-detect.server.ts`. This plugin will run only during server-side rendering and will not be included in the client bundle.
- **Client-Only**: Name your file `i18n-auto-detect.client.ts`. This plugin will only run on the client side.

For locale detection logic that relies on server headers (like `x-country`), a **server-only** plugin can be more appropriate, as headers are not directly available in the client environment. On the other hand, if you rely on the browser’s environment (like accessing `localStorage` or the DOM), a **client-only** plugin is best suited.

---

## ✅ Why Use a Custom Plugin?

- **Full Control**: You decide precisely how to detect, parse, and apply locale logic (headers, cookies, IP-based location, etc.).
- **Simplicity**: You can remove or disable any unused detection features, keeping your codebase clean.
- **Flexible Integration**: You can combine this approach with other middlewares or APIs as needed.
- **Server or Client Focus**: You choose exactly where (server or client) your detection logic runs.

By taking total ownership of the locale detection logic in your own plugin, you don’t have to rely on a “one-size-fits-all” solution. This setup works especially well for advanced use cases (e.g., custom headers, special cookies, IP geolocation, or multi-step detection logic).

## 🏁 Summary

For many projects, turning off the built-in auto-detection and creating a dedicated plugin—whether server-only, client-only, or universal—is the **simplest and most flexible** solution. Since most of the detection logic is custom anyway, there’s no need to maintain a limited built-in approach—everything is under your control.
