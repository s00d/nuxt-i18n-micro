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

Create a new file in the `plugins` folder (e.g., `~/plugins/i18n-auto-detect.ts`). Here's a complete example:

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
   The plugin reads the headers `x-country` and `accept-language` to figure out the user's preferred locale.
2. **Cookie Storage**  
   The locale is then stored in a cookie, so the user's preference is remembered on subsequent requests.
3. **Route Adjustment**  
   If the current route's locale does not match the determined locale, the plugin automatically redirects to the correct localized route.

## ⚙️ Server-Only or Client-Only Plugins

If you want the detection to happen **only on the server** or **only on the client**, you can use [Nuxt's filename conventions](https://nuxt.com/docs/getting-started/directory-structure#plugins) for plugins:

- **Server-Only**: Name your file `i18n-auto-detect.server.ts`. This plugin will run only during server-side rendering and will not be included in the client bundle.
- **Client-Only**: Name your file `i18n-auto-detect.client.ts`. This plugin will only run on the client side.

For locale detection logic that relies on server headers (like `x-country`), a **server-only** plugin can be more appropriate, as headers are not directly available in the client environment. On the other hand, if you rely on the browser's environment (like accessing `localStorage` or the DOM), a **client-only** plugin is best suited.

---

## 🌐 Programmatic Locale Setting (All Strategies)

You can set the locale programmatically on the server using `useState('i18n-locale')`. This works with **all strategies**:
- `no_prefix`
- `prefix`
- `prefix_except_default`
- `prefix_and_default`
- `hashMode`

::: tip Redirect behavior
For strategies with URL prefix and `redirects: true`, `useState('i18n-locale')` affects the redirect:

| Strategy | Redirect from `/` |
|----------|-------------------|
| `prefix` | → `/<locale>/` (uses `useState`, cookie, or `defaultLocale`) |
| `prefix_except_default` | → `/<locale>/` if locale ≠ default (uses `useState`/cookie) |
| `prefix_and_default` | No redirect (both `/` and `/<locale>/` are valid for default) |

**Important notes:**
- Cookie-based locale detection is disabled by default (`localeCookie: null`)
- Set `localeCookie: 'user-locale'` to enable cookie persistence
- If the locale from cookie/useState is invalid (not in `locales` list), it falls back to `defaultLocale`

This ensures URL consistency for SEO.
:::

### The Solution

Create a server plugin with a priority lower than `-5` (e.g., `-10`). In this plugin, you'll implement your locale selection logic and use both `useState` and `useCookie` to set the locale.

**Important**: Use `useState('i18n-locale')` to immediately pass the locale to the i18n plugin. This is necessary because `useCookie` changes are not immediately visible between plugins during SSR.

### Implementation

**Step 1: Configure `nuxt.config.ts`**

```ts
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro'],
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'en',
    localeCookie: 'user-locale',
    autoDetectLanguage: false,
    locales: [
      { code: 'en', iso: 'en-US' },
      { code: 'de', iso: 'de-DE' },
      { code: 'ja', iso: 'ja-JP' }
    ]
  }
})
```

**Step 2: Create `plugins/i18n-loader.server.ts`**

```ts
import { defineNuxtPlugin, useCookie, useState, useRequestHeaders } from '#imports'
import { getI18nConfig } from '#build/i18n.strategy.mjs'

export default defineNuxtPlugin({
  name: 'i18n-custom-loader',
  enforce: 'pre',
  order: -10, // Execute BEFORE the i18n plugin (which has order -5)

  setup() {
    const { localeCookie: configCookie } = getI18nConfig()
    const cookieName = configCookie ?? 'user-locale'

    const localeCookie = useCookie(cookieName)
    
    // Use useState to immediately pass the locale to the i18n plugin
    // This is the recommended way to set locale programmatically
    const localeState = useState<string | null>('i18n-locale', () => null)

    const headers = useRequestHeaders(['host', 'x-country', 'accept-language'])
    let detectedLocale = 'en'

    // --- YOUR DETECTION LOGIC ---

    // Example 1: By domain
    const host = headers['host']
    if (host?.includes('example.de')) {
      detectedLocale = 'de'
    }
    // Example 2: By custom header
    else if (headers['x-country'] === 'JP') {
      detectedLocale = 'ja'
    }
    // Example 3: By Accept-Language header
    else if (headers['accept-language']?.includes('de')) {
      detectedLocale = 'de'
    }

    // --- APPLY THE LOCALE ---

    // Set cookie for persistence across requests
    if (localeCookie.value !== detectedLocale) {
      localeCookie.value = detectedLocale
    }

    // Set useState for immediate availability to the i18n plugin
    localeState.value = detectedLocale
  }
})
```

### Why This Works

1. **useState for Immediate Sync**: `useState('i18n-locale')` provides immediate synchronization between plugins during SSR. Unlike cookies, state changes are instantly visible to other plugins.

2. **useCookie for Persistence**: The cookie ensures the locale persists across page reloads and subsequent requests.

3. **Plugin Order**: By setting `order: -10`, this plugin executes before `01.plugin.ts` (which has `order: -5`).

4. **No Redirect**: The URL doesn't change, there's no redirect. The page renders immediately in the correct language.

5. **Hydration**: Both server and client use the same locale, preventing hydration mismatches.

### Key Points

| Feature | Description |
|---------|-------------|
| `useState('i18n-locale')` | Immediately available to i18n plugin during SSR |
| `useCookie` | Persists locale across requests |
| `order: -10` | Ensures plugin runs before i18n initialization |
| `enforce: 'pre'` | Runs in the "pre" plugin group |

### Advanced: Domain-Based Locale Detection

For multi-domain setups:

```ts
import { defineNuxtPlugin, useCookie, useState, useRequestHeaders } from '#imports'
import { getI18nConfig } from '#build/i18n.strategy.mjs'

export default defineNuxtPlugin({
  name: 'i18n-domain-loader',
  enforce: 'pre',
  order: -10,

  setup() {
    const { localeCookie: configCookie } = getI18nConfig()
    const cookieName = configCookie ?? 'user-locale'

    const localeCookie = useCookie(cookieName)
    const localeState = useState<string | null>('i18n-locale', () => null)

    const headers = useRequestHeaders(['host'])
    const host = headers['host'] || ''

    let detectedLocale = 'en'

    // Domain-based detection
    if (host.endsWith('.de') || host.includes('german.')) {
      detectedLocale = 'de'
    } else if (host.endsWith('.fr') || host.includes('french.')) {
      detectedLocale = 'fr'
    } else if (host.endsWith('.jp') || host.includes('japanese.')) {
      detectedLocale = 'ja'
    }

    localeCookie.value = detectedLocale
    localeState.value = detectedLocale
  }
})
```

### Advanced: Respecting User Preference

If you want to respect an existing user preference (e.g., they manually switched language):

```ts
import { defineNuxtPlugin, useCookie, useState, useRequestHeaders } from '#imports'
import { getI18nConfig } from '#build/i18n.strategy.mjs'

export default defineNuxtPlugin({
  name: 'i18n-smart-loader',
  enforce: 'pre',
  order: -10,

  setup() {
    const { localeCookie: configCookie } = getI18nConfig()
    const cookieName = configCookie ?? 'user-locale'

    const localeCookie = useCookie(cookieName)
    const localeState = useState<string | null>('i18n-locale', () => null)

    // If user already has a preference, respect it
    if (localeCookie.value) {
      localeState.value = localeCookie.value
      return
    }

    // Otherwise, detect locale
    const headers = useRequestHeaders(['accept-language'])
    let detectedLocale = 'en'

    const acceptLanguage = headers['accept-language'] || ''
    if (acceptLanguage.includes('de')) {
      detectedLocale = 'de'
    } else if (acceptLanguage.includes('ja')) {
      detectedLocale = 'ja'
    }

    localeCookie.value = detectedLocale
    localeState.value = detectedLocale
  }
})
```

---

## ✅ Summary

### Key Takeaways

- ✅ **`useState('i18n-locale')`**: Works with **all strategies** — the recommended way to programmatically set locale before i18n initialization
- ✅ **Plugin order**: Use `order: -10` and `enforce: 'pre'` to run before the main i18n plugin
- ✅ **SSR + Client sync**: Both useState and cookie ensure consistent locale across server and client
- ✅ **Full control**: Implement any detection logic (domain, headers, IP, etc.)
- ✅ **No hydration mismatch**: Server and client use the same locale
- ✅ **`prefix`**: Redirect from `/` to `/<locale>/` using `useState`, cookie (if enabled), or `defaultLocale`
- ✅ **`prefix_except_default`**: Redirect from `/` to `/<locale>/` when non-default locale is set (uses `useState`/cookie)
- ✅ **`prefix_and_default`**: No redirect (both `/` and `/<locale>/` valid for default locale)
