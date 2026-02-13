---
outline: deep
---

# 🌐 Node.js Runtime

Use `@i18n-micro/node` to add i18n translations to any Node.js application, CLI tool, or backend service. This package provides the same translation logic as the Nuxt module, but for pure Node.js environments.

## 📦 Installation

```bash
pnpm add @i18n-micro/node
# or
npm install @i18n-micro/node
# or
yarn add @i18n-micro/node
```

## 🚀 Quick Start

```typescript
import { createI18n } from '@i18n-micro/node'

// 1. Create I18n instance
const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  translationDir: './locales', // Path to your locales directory
})

// 2. Load translations from directory
await i18n.loadTranslations()

// 3. Use translations
console.log(i18n.t('greeting', { name: 'John' })) // "Hello, John!"
console.log(i18n.tc('apples', 5)) // "5 apples"
```

## 📂 Translation File Structure

The package supports the same file structure as the Nuxt module:

```tree
locales/
├── en.json
├── de.json
└── pages/
    ├── home/
    │   ├── en.json
    │   └── de.json
    └── about/
        ├── en.json
        └── de.json
```

## 🔧 API Reference

### `createI18n(options: I18nOptions): I18n`

Creates a new I18n instance.

**Options:**
- `locale: string` - Current locale
- `fallbackLocale?: string` - Fallback locale (default: same as locale)
- `translationDir?: string` - Path to locales directory
- `plural?: PluralFunc` - Custom pluralization function
- `missingWarn?: boolean` - Show warnings for missing translations
- `missingHandler?: (locale: string, key: string, routeName: string) => void` - Custom handler

### `i18n.loadTranslations(dir?: string): Promise<void>`

Load translations from directory (recursive, supports pages structure).

```typescript
await i18n.loadTranslations() // Uses translationDir from constructor
await i18n.loadTranslations('./custom-locales') // Or specify custom path
```

### `i18n.t(key: string, params?: Params, defaultValue?: string | null, routeName?: string): string`

Get translation for a key. Uses `currentRoute` by default if `routeName` is not provided.

```typescript
i18n.t('greeting', { name: 'John' }) // "Hello, John!"
i18n.t('welcome') // "Welcome"
i18n.t('nested.key') // Supports nested keys
i18n.t('title', undefined, undefined, 'home') // Route-specific translation

// With currentRoute
i18n.setRoute('home')
i18n.t('title') // Uses 'home' route automatically
```

### `i18n.setRoute(routeName: string): void`

Set the current route name context. Useful when processing a specific page request.

```typescript
i18n.setRoute('home') // Set current route to 'home'
i18n.t('title') // Will look for translation in 'home' route
```

### `i18n.tc(key: string, count: number | Params, defaultValue?: string): string`

Plural translation.

```typescript
// Translation: "no apples|one apple|{count} apples"
i18n.tc('apples', 0) // "no apples"
i18n.tc('apples', 1) // "one apple"
i18n.tc('apples', 5) // "5 apples"
```

### `i18n.tn(value: number, options?: Intl.NumberFormatOptions): string`

Format number.

```typescript
i18n.tn(1234.56) // "1,234.56"
i18n.tn(1234.56, { style: 'currency', currency: 'USD' }) // "$1,234.56"
```

### `i18n.td(value: Date | number | string, options?: Intl.DateTimeFormatOptions): string`

Format date.

```typescript
i18n.td(new Date()) // "1/15/2023"
i18n.td(new Date(), { year: 'numeric', month: 'long', day: 'numeric' }) // "January 15, 2023"
```

### `i18n.tdr(value: Date | number | string, options?: Intl.RelativeTimeFormatOptions): string`

Format relative time.

```typescript
i18n.tdr(new Date(Date.now() - 3600000)) // "1 hour ago"
```

### `i18n.reload(): Promise<void>`

Clear cache and reload translations from disk. Use this when translation files change.

```typescript
await i18n.reload() // Clears cache and reloads all files
```

## 💡 Usage Examples

### Express.js Middleware

```typescript
import express from 'express'
import { createI18n } from '@i18n-micro/node'

const app = express()

// Create I18n instance and load translations once at startup
const i18n = createI18n({
  locale: 'en',
  translationDir: './locales',
})
await i18n.loadTranslations()

// Middleware to set locale and route per request
app.use(async (req, res, next) => {
  const locale = req.headers['accept-language']?.split(',')[0] || 'en'
  const route = req.path.split('/').filter(Boolean)[0] || 'index'
  
  i18n.locale = locale
  i18n.setRoute(route)
  req.i18n = i18n
  await i18n.loadTranslations()
  next()
})

app.get('/greet', (req, res) => {
  res.json({ message: req.i18n.t('greeting', { name: 'World' }) })
})
```

### Fastify Plugin

```typescript
import Fastify from 'fastify'
import { createI18n } from '@i18n-micro/node'

const fastify = Fastify()

// Create I18n instance
const i18n = createI18n({
  locale: 'en',
  translationDir: './locales',
})
await i18n.loadTranslations()

// Plugin to add i18n to request
fastify.addHook('onRequest', async (request, reply) => {
  const locale = request.headers['accept-language']?.split(',')[0] || 'en'
  i18n.locale = locale
  request.i18n = i18n
  await i18n.loadTranslations()
})

fastify.get('/greet', async (request, reply) => {
  return { message: request.i18n.t('greeting', { name: 'World' }) }
})
```

### Hot Module Replacement (HMR) with File Watcher

```typescript
import { createI18n } from '@i18n-micro/node'
import { watch } from 'node:fs'

// Create I18n instance
const i18n = createI18n({
  locale: 'en',
  translationDir: './locales',
})

// Initial load
await i18n.loadTranslations()

// Simple file watcher (Node.js built-in, no dependencies needed)
let reloadTimeout: NodeJS.Timeout
watch('./locales', { recursive: true }, (eventType, filename) => {
  if (filename && filename.endsWith('.json')) {
    // Debounce to avoid multiple reloads when saving one file
    clearTimeout(reloadTimeout)
    reloadTimeout = setTimeout(async () => {
      console.log(`File changed: ${filename}, reloading...`)
      await i18n.reload() // Clears cache and reloads all files
    }, 100)
  }
})

// Now i18n.t() will always return fresh data after file changes
```

### CLI Tool

```typescript
import { createI18n } from '@i18n-micro/node'

async function main() {
  const i18n = createI18n({
    locale: process.env.LOCALE || 'en',
    translationDir: './locales',
  })

  await i18n.loadTranslations()

  console.log(i18n.t('welcome'))
  console.log(i18n.tc('items', 5))
}

main()
```

## 🔄 Using currentRoute

The `currentRoute` feature allows you to set a route context that will be used by default in all `t()` calls:

```typescript
import { createI18n } from '@i18n-micro/node'

const i18n = createI18n({
  locale: 'en',
  translationDir: './locales',
})

// Set route context
i18n.setRoute('home')

await i18n.loadTranslations()

// Now t() will automatically use 'home' route
console.log(i18n.t('title')) // Looks in 'home' route translations
console.log(i18n.t('welcome')) // Base translation (from index, merged into route)

// Can still override with explicit routeName
console.log(i18n.t('title', undefined, undefined, 'about')) // Uses 'about' route
```

## 🎯 Key Features

- 🚀 **Lightweight** - No Vue dependencies, pure Node.js
- 📦 **Same JSON structure** - Use the same translation files as your Nuxt app
- 🔄 **Route-specific translations** - Support for page-level translations
- 🌍 **Pluralization** - Built-in plural form support
- 📅 **Formatting** - Number, date, and relative time formatting
- ⚡ **Fast** - Efficient in-memory caching
- 🔧 **Type-safe** - Full TypeScript support
- 🔄 **Hot Reload** - Built-in support for file watching and cache reloading

## 🌍 Using in Nuxt Server Routes

You can use `@i18n-micro/node` in Nuxt server API routes to provide server-side translations:

```javascript
import { defineEventHandler, getQuery } from 'h3'
import { createI18n } from '@i18n-micro/node'
import { join } from 'node:path'

// Create a singleton I18n instance (in production, you'd want to cache this)
let i18nInstance = null

async function getI18n() {
  if (!i18nInstance) {
    // Get locales directory path (relative to playground root)
    const localesPath = join(process.cwd(), 'playground', 'locales')

    i18nInstance = createI18n({
      locale: 'en',
      fallbackLocale: 'en',
      translationDir: localesPath,
    })
  }

  return i18nInstance
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const locale = query.locale || 'en'
  const route = query.route || 'index'

  const i18n = await getI18n()

  // Set locale and route for this request
  i18n.locale = locale
  i18n.setRoute(route)

  // Load translations (required after setting route)
  await i18n.loadTranslations()

  // Demonstrate various translation methods
  return {
    locale: i18n.locale,
    route: i18n.getRoute(),
    translations: {
      // Simple translation
      welcome: i18n.t('welcome'),
      // Translation with interpolation
      greeting: i18n.t('greeting', { name: 'Node.js User' }),
      // Nested key
      nested: i18n.t('nested.message'),
      // Pluralization
      apples: {
        zero: i18n.tc('apples', 0),
        one: i18n.tc('apples', 1),
        many: i18n.tc('apples', 5),
      },
      // Number formatting
      number: i18n.tn(1234.56),
      // Date formatting
      date: i18n.td(new Date()),
      // Relative time
      relativeTime: i18n.tdr(new Date(Date.now() - 3600000)),
      // Route-specific translation (if available)
      routeSpecific: i18n.t('title', undefined, undefined, route),
    },
    // Show available methods
    methods: {
      hasTranslation: i18n.hasTranslation('welcome'),
      currentRoute: i18n.getRoute(),
      currentLocale: i18n.locale,
    },
  }
})
```

## 📋 Locale Detection

You can implement custom locale detection logic based on your needs:

```typescript
import { createI18n } from '@i18n-micro/node'
import { IncomingMessage } from 'http'

function detectLocale(req: IncomingMessage): string {
  // 1. Check URL parameters: ?locale=ru
  const url = new URL(req.url || '', `http://${req.headers.host}`)
  const localeFromQuery = url.searchParams.get('locale')
  if (localeFromQuery) return localeFromQuery

  // 2. Check cookies: user-locale cookie
  const cookies = req.headers.cookie || ''
  const localeFromCookie = cookies
    .split(';')
    .find(c => c.trim().startsWith('user-locale='))
    ?.split('=')[1]
  if (localeFromCookie) return localeFromCookie

  // 3. Check HTTP Headers: Accept-Language
  const acceptLanguage = req.headers['accept-language']
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage.split(',')[0].split('-')[0]
    return preferredLocale
  }

  // 4. Fallback to default
  return 'en'
}
```

## 📋 Advanced Usage Examples

### Conditional Response Based on Locale

```typescript
import { createI18n } from '@i18n-micro/node'

const i18n = createI18n({
  locale: 'en',
  translationDir: './locales',
})

await i18n.loadTranslations()

function handleRequest(locale: string) {
  i18n.locale = locale

  // Return different content based on locale
  if (locale === 'ru') {
    return {
      message: i18n.t('greeting', { name: 'Мир' }),
      locale: locale,
    }
  }

  if (locale === 'de') {
    return {
      message: i18n.t('greeting', { name: 'Welt' }),
      locale: locale,
    }
  }

  // Default English response
  return {
    message: i18n.t('greeting', { name: 'World' }),
    locale: locale,
  }
}
```

### Locale-Aware API with Validation

```typescript
import { createI18n } from '@i18n-micro/node'
import { defineEventHandler, getQuery, createError } from 'h3'

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  translationDir: './locales',
})

await i18n.loadTranslations()

const availableLocales = ['en', 'ru', 'de']

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const locale = (query.locale as string) || 'en'

  // Validate if the detected locale is supported
  if (!availableLocales.includes(locale)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Unsupported locale: ${locale}. Available locales: ${availableLocales.join(', ')}`,
    })
  }

  i18n.locale = locale

  // Return locale-specific configuration
  return {
    locale: locale,
    message: i18n.t('welcome'),
    availableLocales: availableLocales,
  }
})
```

### Integration with Route-Specific Translations

```typescript
import { createI18n } from '@i18n-micro/node'
import { defineEventHandler, getQuery } from 'h3'

const i18n = createI18n({
  locale: 'en',
  translationDir: './locales',
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const locale = (query.locale as string) || 'en'
  const route = (query.route as string) || 'index'

  // Set locale and route for this request
  i18n.locale = locale
  i18n.setRoute(route)

  // Load translations (required after setting route)
  await i18n.loadTranslations()

  return {
    locale: i18n.locale,
    route: i18n.getRoute(),
    // Route-specific translation
    title: i18n.t('title'),
    // Base translation (from index, merged into route)
    welcome: i18n.t('welcome'),
  }
})
```

## 📝 Best Practices

1. **Always validate locales**: Check if the detected locale is in your available locales list
2. **Use fallback logic**: Provide sensible defaults when locale detection fails
3. **Cache I18n instance**: Create a singleton instance and reuse it across requests for better performance
4. **Handle edge cases**: Account for unsupported locales and provide appropriate error responses
5. **Use route context**: Set `currentRoute` to automatically use route-specific translations
6. **Reload on file changes**: Use `reload()` method with file watchers in development for hot-reloading

## 🚀 Performance Considerations

- **Singleton pattern**: Create one I18n instance and reuse it across requests
- **Lazy loading**: Load translations once at startup, not on every request
- **Efficient caching**: Translations are cached in memory for fast access
- **Route context**: Use `setRoute()` to avoid passing route name to every `t()` call
- **No external calls**: All translations are loaded from local files, no network requests

## 📚 Related Documentation

- **[Folder Structure](../guide/folder-structure.md)** - Learn about translation file organization
- **[Server Side Translations](../guide/server-side-translations.md)** - Nuxt server-side usage
- **[API Reference](../api/methods.md)** - Complete method documentation

