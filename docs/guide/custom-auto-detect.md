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

## 🌐 No-Prefix Strategy: Server-Side Locale Detection Without Redirects

When using the `no_prefix` strategy, the locale is not included in the URL. This presents a unique challenge: how do you set the locale programmatically on the server (based on domain, headers, etc.) without causing a redirect?

### The Problem

With `no_prefix` strategy, `nuxt-i18n-micro` attempts to determine the current locale during initialization (SSR phase) by reading a cookie. If you want to programmatically set the locale on the server without a redirect, you need to set this cookie **before** the main i18n plugin initializes and reads it.

The main `nuxt-i18n-micro` plugin has a priority (order) of `-5`. Therefore, your solution must execute earlier.

### The Solution

Create a server plugin with a priority lower than `-5` (e.g., `-10`). In this plugin, you'll implement your locale selection logic and write it to `useCookie`.

### Implementation

**Step 1: Configure `nuxt.config.ts`**

```ts
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'en',
    // Cookie name is important - must match what you use in the plugin
    localeCookie: 'user-locale',
    autoDetectLanguage: false, // Disable built-in detection
    locales: [
      { code: 'en', iso: 'en-US' },
      { code: 'de', iso: 'de-DE' },
      { code: 'fr', iso: 'fr-FR' }
    ]
  }
})
```

**Step 2: Create `plugins/i18n-loader.server.ts`**

```ts
import { defineNuxtPlugin, useCookie, useRequestHeaders, useRuntimeConfig } from '#imports'

export default defineNuxtPlugin({
  name: 'i18n-custom-loader',
  enforce: 'pre',  // Plugin must execute very early
  order: -10,      // Execute BEFORE the i18n plugin (which has order -5)
  
  async setup() {
    const config = useRuntimeConfig()
    // Get cookie name from config or use default
    // @ts-ignore
    const cookieName = config.public.i18nConfig?.localeCookie || 'user-locale'
    
    // Initialize cookie composable
    const localeCookie = useCookie(cookieName)

    // If cookie already exists, do nothing (user has already chosen a language)
    // Remove this condition if you want to always force language based on headers
    if (localeCookie.value) {
      return
    }

    const headers = useRequestHeaders(['x-country', 'host', 'accept-language'])
    let detectedLocale = 'en' // Your default language

    // --- YOUR DETECTION LOGIC ---
    
    // Example 1: By domain
    const host = headers['host']
    if (host?.includes('example.de')) {
      detectedLocale = 'de'
    } 
    // Example 2: By custom header (e.g., from Cloudflare or nginx)
    else if (headers['x-country'] === 'FR') {
      detectedLocale = 'fr'
    }
    // Example 3: By Accept-Language header
    else if (headers['accept-language']?.includes('de')) {
      detectedLocale = 'de'
    }

    // --- APPLY THE LOCALE ---
    
    // Simply set the cookie value.
    // Since this plugin runs BEFORE the main i18n plugin,
    // the main plugin will read this value from the cookie during initialization.
    localeCookie.value = detectedLocale
    
    console.log('[SSR] Forced locale to:', detectedLocale)
  }
})
```

### Why This Works

1. **Server-Side**: Using `useCookie().value = 'xx'` during SSR sets the `Set-Cookie` header for the response and updates the internal request state.

2. **Plugin Order**: By setting `order: -10`, this code executes before `src/runtime/plugins/01.plugin.ts` (which has `order: -5`).

3. **Initialization**: When `01.plugin.ts` runs, it calls `useCookie(cookieName).value`. Since we've already updated this value in the request context, the i18n service picks up our locale (`detectedLocale`).

4. **No Redirect**: The URL doesn't change, there's no redirect. The page renders immediately in the correct language.

5. **Hydration**: The browser receives the HTML and the `Set-Cookie` header. During hydration on the client, the cookie is already set, so the client-side i18n initializes with the correct locale, preventing content "flashing".

### Advanced: Domain-Based Locale Detection

For multi-domain setups, you can detect the locale based on the hostname:

```ts
export default defineNuxtPlugin({
  name: 'i18n-domain-loader',
  enforce: 'pre',
  order: -10,
  
  async setup() {
    const config = useRuntimeConfig()
    // @ts-ignore
    const cookieName = config.public.i18nConfig?.localeCookie || 'user-locale'
    const localeCookie = useCookie(cookieName)

    // Always force locale based on domain (remove the check if needed)
    const headers = useRequestHeaders(['host'])
    const host = headers['host'] || ''
    
    let detectedLocale = 'en'
    
    // Domain-based detection
    if (host.endsWith('.de') || host.includes('german.')) {
      detectedLocale = 'de'
    } else if (host.endsWith('.fr') || host.includes('french.')) {
      detectedLocale = 'fr'
    } else if (host.endsWith('.es') || host.includes('spanish.')) {
      detectedLocale = 'es'
    }

    localeCookie.value = detectedLocale
    console.log(`[SSR] Domain ${host} → Locale: ${detectedLocale}`)
  }
})
```

### Key Points

- ✅ **No URL changes**: Perfect for `no_prefix` strategy where URLs shouldn't contain locale segments
- ✅ **No redirects**: The page loads directly in the correct language
- ✅ **SSR + Client sync**: Cookie ensures both server and client use the same locale
- ✅ **Custom logic**: Full control over locale detection (domain, headers, IP, etc.)
- ✅ **Plugin order**: Use `order: -10` to run before the main i18n plugin (`order: -5`)

---

## ✅ Why Use a Custom Plugin?

- **Full Control**: You decide precisely how to detect, parse, and apply locale logic (headers, cookies, IP-based location, etc.).
- **Simplicity**: You can remove or disable any unused detection features, keeping your codebase clean.
- **Flexible Integration**: You can combine this approach with other middlewares or APIs as needed.
- **Server or Client Focus**: You choose exactly where (server or client) your detection logic runs.

By taking total ownership of the locale detection logic in your own plugin, you don’t have to rely on a “one-size-fits-all” solution. This setup works especially well for advanced use cases (e.g., custom headers, special cookies, IP geolocation, or multi-step detection logic).

## 🏁 Summary

For many projects, turning off the built-in auto-detection and creating a dedicated plugin—whether server-only, client-only, or universal—is the **simplest and most flexible** solution. Since most of the detection logic is custom anyway, there’s no need to maintain a limited built-in approach—everything is under your control.
