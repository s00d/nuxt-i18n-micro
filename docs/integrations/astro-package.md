---
outline: deep
---

# 🌐 Astro Package (`@i18n-micro/astro`)

The `@i18n-micro/astro` package provides a lightweight, high-performance internationalization solution for Astro applications. It shares the same core logic as Nuxt I18n Micro, offering SSR support, automatic locale detection, Astro components, and full TypeScript support.

## 📖 Overview

`@i18n-micro/astro` is designed for Astro applications that need internationalization with server-side rendering support. It provides:

- 🚀 **Lightweight** - Uses shared core logic from `@i18n-micro/core`
- ⚡ **SSR Support** - Full server-side rendering compatibility
- 🔄 **Automatic Locale Detection** - Detects locale from URL path, cookies, or headers
- 🌍 **Pluralization** - Built-in plural form support
- 📅 **Formatting** - Number, date, and relative time formatting
- 🔧 **Type-safe** - Full TypeScript support
- 🛠️ **DevTools Integration** - Built-in development tools for managing translations
- 📊 **SEO Optimized** - Automatic meta tags and hreflang generation

## 🚀 Installation

Install the package using your preferred package manager:

::: code-group

```bash [npm]
npm install @i18n-micro/astro
```

```bash [yarn]
yarn add @i18n-micro/astro
```

```bash [pnpm]
pnpm add @i18n-micro/astro
```

```bash [bun]
bun add @i18n-micro/astro
```

:::

### Peer Dependencies

The package requires Astro 5:

```json
{
  "peerDependencies": {
    "astro": "^5.0.0"
  }
}
```

## 🎯 Quick Start

### Basic Setup

Add the integration to your `astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config'
import { i18nIntegration } from '@i18n-micro/astro'

export default defineConfig({
  integrations: [
    i18nIntegration({
      locale: 'en',
      fallbackLocale: 'en',
      locales: [
        { code: 'en', displayName: 'English', iso: 'en-US' },
        { code: 'fr', displayName: 'Français', iso: 'fr-FR' },
      ],
      translationDir: 'src/locales', // Optional: auto-load from directory
    }),
  ],
})
```

### Setup Middleware

Create `src/middleware.ts`:

```typescript
import { createI18nMiddleware } from '@i18n-micro/astro'
import { createI18n } from '@i18n-micro/astro'
import type { AstroI18nOptions } from '@i18n-micro/astro'

// Create global i18n instance
const globalI18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      welcome: 'Welcome',
      greeting: 'Hello, {name}!',
    },
    fr: {
      welcome: 'Bienvenue',
      greeting: 'Bonjour, {name}!',
    },
  },
})

export const onRequest = createI18nMiddleware({
  i18n: globalI18n,
  defaultLocale: 'en',
  locales: ['en', 'fr'],
  localeObjects: [
    { code: 'en', displayName: 'English', iso: 'en-US' },
    { code: 'fr', displayName: 'Français', iso: 'fr-FR' },
  ],
})
```

### Usage in Astro Components

```astro
---
import { useI18n } from '@i18n-micro/astro'

const { t, locale } = useI18n(Astro)
---

<html lang={locale}>
  <body>
    <h1>{t('welcome')}</h1>
    <p>{t('greeting', { name: 'World' })}</p>
  </body>
</html>
```

### Using Components

```astro
---
import I18nT from '@i18n-micro/astro/components/i18n-t.astro'
import I18nLink from '@i18n-micro/astro/components/i18n-link.astro'
import I18nSwitcher from '@i18n-micro/astro/components/i18n-switcher.astro'
---

<I18nT keypath="welcome" />
<I18nLink href="/about">About</I18nLink>
<I18nSwitcher />
```

## ⚙️ Integration API

### `i18nIntegration(options: I18nIntegrationOptions)`

Creates and configures the Astro integration for i18n-micro.

**Parameters:**

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `locale` | `string` | ✅ | - | Default locale code (e.g., `'en'`) |
| `fallbackLocale` | `string` | ❌ | Same as `locale` | Fallback locale when translation is missing |
| `locales` | `Locale[]` | ❌ | `[]` | Array of locale objects |
| `messages` | `Record<string, Translations>` | ❌ | `{}` | Initial translation messages |
| `plural` | `PluralFunc` | ❌ | `defaultPlural` | Custom pluralization function |
| `missingWarn` | `boolean` | ❌ | `false` | Show console warnings for missing translations |
| `missingHandler` | `(locale: string, key: string, routeName: string) => void` | ❌ | - | Custom handler for missing translations |
| `localeCookie` | `string` | ❌ | `'i18n-locale'` | Cookie name for storing locale |
| `autoDetect` | `boolean` | ❌ | `true` | Enable automatic locale detection |
| `redirectToDefault` | `boolean` | ❌ | `false` | Redirect to default locale if not found |
| `translationDir` | `string` | ❌ | `'src/locales'` | Directory path for translation files |
| `disablePageLocales` | `boolean` | ❌ | `false` | If `true`, ignores `pages/` folder and treats all files as global translations |

**Returns:** `AstroIntegration`

**Example:**

```typescript
import { defineConfig } from 'astro/config'
import { i18nIntegration } from '@i18n-micro/astro'

export default defineConfig({
  integrations: [
    i18nIntegration({
      locale: 'en',
      fallbackLocale: 'en',
      locales: [
        { code: 'en', displayName: 'English', iso: 'en-US' },
        { code: 'fr', displayName: 'Français', iso: 'fr-FR' },
        { code: 'de', displayName: 'Deutsch', iso: 'de-DE' },
      ],
      translationDir: 'src/locales',
      missingWarn: true,
      missingHandler: (locale, key, routeName) => {
        console.warn(`Missing translation: ${key} in ${locale} for route ${routeName}`)
      },
    }),
  ],
})
```

### Auto-loading Translations from Directory

When `translationDir` is specified, the integration will automatically load translation files from the directory structure:

```
src/locales/
  en.json
  fr.json
  de.json
  pages/
    home/
      en.json
      fr.json
    about/
      en.json
      fr.json
```

The integration reads all `.json` files recursively and makes them available to the i18n instance.

By default, files in the `pages/` folder are treated as route-specific translations. If you want to disable this behavior and treat all files (including those in `pages/`) as global translations, set `disablePageLocales: true`:

```typescript
i18nIntegration({
  locale: 'en',
  translationDir: 'src/locales',
  disablePageLocales: true, // All files treated as global translations
})
```

## 🎯 Core API: AstroI18n

### `AstroI18n` Class

The core i18n instance class that handles all translation logic.

#### Constructor

```typescript
new AstroI18n(options: AstroI18nOptions)
```

**Options:**

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `locale` | `string` | ✅ | - | Current locale code |
| `fallbackLocale` | `string` | ❌ | Same as `locale` | Fallback locale |
| `messages` | `Record<string, Translations>` | ❌ | `{}` | Initial translation messages |
| `plural` | `PluralFunc` | ❌ | `defaultPlural` | Custom pluralization function |
| `missingWarn` | `boolean` | ❌ | `false` | Show console warnings |
| `missingHandler` | `(locale: string, key: string, routeName: string) => void` | ❌ | - | Custom missing handler |

#### Properties

- `locale: string` - Current locale (getter/setter)
- `fallbackLocale: string` - Fallback locale (getter/setter)
- `currentRoute: string` - Current route name (getter)
- `cache: TranslationCache` - Translation cache (read-only)

#### Methods

##### `t(key: string, params?: Params, defaultValue?: string | null, routeName?: string): CleanTranslation`

Translates a key with optional parameters and fallback value.

```typescript
const i18n = new AstroI18n({ /* ... */ })

// Basic translation
i18n.t('welcome') // "Welcome"

// With parameters
i18n.t('greeting', { name: 'John' }) // "Hello, John!"

// With default value
i18n.t('missing', {}, 'Default text') // "Default text"

// Route-specific translation
i18n.t('title', {}, null, 'home') // Uses 'home' route translations
```

##### `ts(key: string, params?: Params, defaultValue?: string, routeName?: string): string`

Same as `t()` but always returns a string.

##### `tc(key: string, count: number | Params, defaultValue?: string): string`

Pluralization-aware translation.

```typescript
// With count number
i18n.tc('apples', 0) // "no apples"
i18n.tc('apples', 1) // "one apple"
i18n.tc('apples', 5) // "5 apples"

// With params object
i18n.tc('items', { count: 3, type: 'books' })
```

##### `tn(value: number, options?: Intl.NumberFormatOptions): string`

Formats a number according to the current locale.

```typescript
i18n.tn(1234.56) // "1,234.56" (en) or "1 234,56" (fr)
i18n.tn(1234.56, { style: 'currency', currency: 'USD' }) // "$1,234.56"
```

##### `td(value: Date | number | string, options?: Intl.DateTimeFormatOptions): string`

Formats a date according to the current locale.

```typescript
i18n.td(new Date()) // "12/31/2023" (en) or "31/12/2023" (fr)
i18n.td(new Date(), { dateStyle: 'full' }) // "Sunday, December 31, 2023"
```

##### `tdr(value: Date | number | string, options?: Intl.RelativeTimeFormatOptions): string`

Formats a relative time (e.g., "2 hours ago").

```typescript
const yesterday = new Date()
yesterday.setDate(yesterday.getDate() - 1)
i18n.tdr(yesterday) // "yesterday"
i18n.tdr(Date.now() - 3600000) // "1 hour ago"
```

##### `has(key: string, routeName?: string): boolean`

Checks if a translation key exists.

```typescript
i18n.has('welcome') // true
i18n.has('missing') // false
```

##### `addTranslations(locale: string, translations: Translations, merge?: boolean): void`

Adds or merges translations for a locale.

```typescript
// Add new translations
i18n.addTranslations('en', {
  newKey: 'New translation',
})

// Replace existing (merge = false)
i18n.addTranslations('en', {
  welcome: 'New Welcome',
}, false)
```

##### `addRouteTranslations(locale: string, routeName: string, translations: Translations, merge?: boolean): void`

Adds route-specific translations.

```typescript
i18n.addRouteTranslations('en', 'home', {
  title: 'Home Page',
  description: 'Welcome to our home page',
})
```

##### `mergeTranslations(locale: string, routeName: string, translations: Translations): void`

Merges translations into existing route translations.

##### `mergeGlobalTranslations(locale: string, translations: Translations): void`

Merges translations into global translations.

##### `clearCache(): void`

Clears the translation cache while preserving initial messages.

##### `setRoute(routeName: string): void`

Sets the current route name for route-specific translations.

##### `getRoute(): string`

Gets the current route name.

##### `clone(newLocale?: string): AstroI18n`

Creates a lightweight copy of the instance with a new locale, sharing the same cache. Useful for per-request instances in middleware.

```typescript
const requestI18n = globalI18n.clone('fr')
```

## 🛠️ Middleware

### `createI18nMiddleware(options: I18nMiddlewareOptions)`

Creates Astro middleware for automatic locale detection and i18n instance setup.

**Options:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `i18n` | `AstroI18n` | ✅ | Global i18n instance (shared cache) |
| `defaultLocale` | `string` | ✅ | Default locale code |
| `locales` | `string[]` | ✅ | Array of available locale codes |
| `localeObjects` | `Locale[]` | ❌ | Array of locale objects with metadata |
| `autoDetect` | `boolean` | ❌ | Enable automatic locale detection (default: `true`) |
| `redirectToDefault` | `boolean` | ❌ | Redirect to default locale if not found (default: `false`) |

**Returns:** `MiddlewareHandler`

**Example:**

```typescript
import { createI18nMiddleware, createI18n } from '@i18n-micro/astro'

const globalI18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: { welcome: 'Welcome' },
    fr: { welcome: 'Bienvenue' },
  },
})

export const onRequest = createI18nMiddleware({
  i18n: globalI18n,
  defaultLocale: 'en',
  locales: ['en', 'fr'],
  localeObjects: [
    { code: 'en', displayName: 'English', iso: 'en-US' },
    { code: 'fr', displayName: 'Français', iso: 'fr-FR' },
  ],
  autoDetect: true,
  redirectToDefault: false,
})
```

### Locale Detection

The middleware automatically detects the locale from:

1. **URL Path** - Checks if the first path segment is a locale code (e.g., `/fr/about`)
2. **Cookies** - Checks the `i18n-locale` cookie (or custom cookie name)
3. **Accept-Language Header** - Parses the browser's language preference
4. **Default Locale** - Falls back to the configured default locale

### `detectLocale(pathname, cookies, headers, defaultLocale, locales, localeCookie?): string`

Utility function for custom locale detection logic.

```typescript
import { detectLocale } from '@i18n-micro/astro'

const locale = detectLocale(
  '/fr/about',
  cookies,
  headers,
  'en',
  ['en', 'fr', 'de'],
  'i18n-locale'
)
```

## 🛠️ Utils: `useI18n`

### `useI18n(astro: AstroGlobal)`

Provides helper functions for translations and routing in Astro components and pages.

**Returns:**

```typescript
{
  // Current locale info
  locale: string
  defaultLocale: string
  locales: Locale[]
  
  // Translation methods
  t(key: string, params?: Params, defaultValue?: string | null, routeName?: string): CleanTranslation
  ts(key: string, params?: Params, defaultValue?: string, routeName?: string): string
  tc(key: string, count: number | Params, defaultValue?: string): string
  tn(value: number, options?: Intl.NumberFormatOptions): string
  td(value: Date | number | string, options?: Intl.DateTimeFormatOptions): string
  tdr(value: Date | number | string, options?: Intl.RelativeTimeFormatOptions): string
  has(key: string, routeName?: string): boolean
  
  // Route management
  getRoute(): string
  getRouteName(path?: string): string
  getLocaleFromPath(path?: string): string
  
  // Path utilities
  switchLocalePath(newLocale: string): string
  localizePath(path: string, targetLocale?: string): string
  getBasePath(url?: URL): string
  
  // Translation management
  addTranslations(locale: string, translations: Record<string, unknown>, merge?: boolean): void
  addRouteTranslations(locale: string, routeName: string, translations: Record<string, unknown>, merge?: boolean): void
  mergeTranslations(locale: string, routeName: string, translations: Record<string, unknown>): void
  mergeGlobalTranslations(locale: string, translations: Record<string, unknown>): void
  clearCache(): void
  
  // Get i18n instance
  getI18n(): AstroI18n
}
```

**Example:**

```astro
---
import { useI18n } from '@i18n-micro/astro'

const { t, locale, switchLocalePath, getRouteName } = useI18n(Astro)
---

<html lang={locale}>
  <body>
    <h1>{t('welcome')}</h1>
    <p>{t('greeting', { name: 'World' })}</p>
    <p>Current route: {getRouteName()}</p>
    <a href={switchLocalePath('fr')}>Switch to French</a>
  </body>
</html>
```

### Helper Functions

#### `getI18n(astro: AstroGlobal): AstroI18n`

Gets the i18n instance from Astro context.

```typescript
import { getI18n } from '@i18n-micro/astro'

const i18n = getI18n(Astro)
```

#### `getLocale(astro: AstroGlobal): string`

Gets the current locale from Astro context.

```typescript
import { getLocale } from '@i18n-micro/astro'

const locale = getLocale(Astro)
```

#### `getDefaultLocale(astro: AstroGlobal): string`

Gets the default locale from Astro context.

#### `getLocales(astro: AstroGlobal): Locale[]`

Gets all available locales from Astro context.

## 🛣️ Routing Utilities

### `getRouteName(path: string, locales: string[] = []): string`

Extracts route name from path, removing locale prefix.

```typescript
import { getRouteName } from '@i18n-micro/astro'

getRouteName('/en/about', ['en', 'fr']) // "about"
getRouteName('/about', ['en', 'fr']) // "about"
getRouteName('/', ['en', 'fr']) // "index"
```

### `getLocaleFromPath(path: string, defaultLocale: string = 'en', locales: string[] = []): string`

Extracts locale from path or returns default locale.

```typescript
import { getLocaleFromPath } from '@i18n-micro/astro'

getLocaleFromPath('/fr/about', 'en', ['en', 'fr']) // "fr"
getLocaleFromPath('/about', 'en', ['en', 'fr']) // "en"
```

### `switchLocalePath(path: string, newLocale: string, locales: string[] = [], defaultLocale?: string): string`

Switches locale in path, replacing or adding locale prefix.

```typescript
import { switchLocalePath } from '@i18n-micro/astro'

switchLocalePath('/en/about', 'fr', ['en', 'fr'], 'en') // "/fr/about"
switchLocalePath('/about', 'fr', ['en', 'fr'], 'en') // "/fr/about"
switchLocalePath('/fr/about', 'en', ['en', 'fr'], 'en') // "/about"
```

### `localizePath(path: string, locale: string, locales: string[] = [], defaultLocale?: string): string`

Localizes path with locale prefix.

```typescript
import { localizePath } from '@i18n-micro/astro'

localizePath('/about', 'fr', ['en', 'fr'], 'en') // "/fr/about"
localizePath('/about', 'en', ['en', 'fr'], 'en') // "/about"
```

### `removeLocaleFromPath(path: string, locales: string[] = []): string`

Removes locale prefix from path.

```typescript
import { removeLocaleFromPath } from '@i18n-micro/astro'

removeLocaleFromPath('/fr/about', ['en', 'fr']) // "/about"
removeLocaleFromPath('/about', ['en', 'fr']) // "/about"
```

## 🎨 Components

### `<I18nT>`

Translation component with support for pluralization, formatting, and HTML rendering.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `keypath` | `string` | ✅ | - | Translation key path |
| `plural` | `number \| string` | ❌ | - | Count for pluralization |
| `params` | `Params` | ❌ | `{}` | Parameters for interpolation |
| `defaultValue` | `string` | ❌ | `''` | Default value if key not found |
| `tag` | `string` | ❌ | `'span'` | HTML tag to wrap content |
| `html` | `boolean` | ❌ | `false` | Render as HTML |
| `number` | `number \| string` | ❌ | - | Number to format and interpolate |
| `date` | `Date \| string \| number` | ❌ | - | Date to format and interpolate |
| `relativeDate` | `Date \| string \| number` | ❌ | - | Relative date to format |

#### Examples

**Basic Usage:**

```astro
---
import I18nT from '@i18n-micro/astro/components/i18n-t.astro'
---

<I18nT keypath="welcome" />
```

**With Parameters:**

```astro
<I18nT keypath="greeting" params={{ name: 'John' }} />
```

**Pluralization:**

```astro
<I18nT keypath="apples" plural={5} />
```

```json
{
  "apples": "no apples | one apple | {count} apples"
}
```

**Number Formatting:**

```astro
<I18nT keypath="price" number={1234.56} />
```

```json
{
  "price": "Price: {number}"
}
```

**Date Formatting:**

```astro
<I18nT keypath="date" date={new Date()} />
```

**Relative Date:**

```astro
<I18nT keypath="relative" relativeDate={yesterday} />
```

**HTML Rendering:**

```astro
<I18nT keypath="htmlContent" html />
```

**Custom Tag:**

```astro
<I18nT keypath="title" tag="h1" />
```

### `<I18nLink>`

Localized link component that automatically handles locale prefixes.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `href` | `string` | ✅ | - | Link destination |
| `locale` | `string` | ❌ | Current locale | Target locale for the link |
| `class` | `string` | ❌ | - | CSS class |

#### Examples

**Basic Usage:**

```astro
---
import I18nLink from '@i18n-micro/astro/components/i18n-link.astro'
---

<I18nLink href="/about">About Us</I18nLink>
```

**With Custom Locale:**

```astro
<I18nLink href="/about" locale="fr">About Us (French)</I18nLink>
```

**With Class:**

```astro
<I18nLink href="/about" class="nav-link">About</I18nLink>
```

### `<I18nSwitcher>`

Language switcher component that generates links for all available locales.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `class` | `string` | ❌ | - | CSS class for wrapper |
| `activeClass` | `string` | ❌ | `'active'` | CSS class for active locale link |

#### Examples

**Basic Usage:**

```astro
---
import I18nSwitcher from '@i18n-micro/astro/components/i18n-switcher.astro'
---

<I18nSwitcher />
```

**With Custom Classes:**

```astro
<I18nSwitcher class="locale-switcher" activeClass="current-locale" />
```

The component automatically:
- Filters out disabled locales
- Highlights the current locale
- Generates localized paths for each locale
- Uses locale display names from configuration

### `<I18nGroup>`

Component for grouping translations with a common prefix (currently a placeholder for future route-specific grouping).

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `route` | `string` | ❌ | - | Route name for grouping |

#### Examples

```astro
---
import I18nGroup from '@i18n-micro/astro/components/i18n-group.astro'
---

<I18nGroup route="home">
  <slot />
</I18nGroup>
```

## 🔍 SEO and Meta Tags

### `useLocaleHead(astro: AstroGlobal, options?: LocaleHeadOptions)`

Generates SEO meta tags for locale-specific pages.

**Options:**

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `baseUrl` | `string` | ❌ | `'/'` | Base URL for canonical/hreflang links |
| `addDirAttribute` | `boolean` | ❌ | `true` | Add `dir` attribute to HTML |
| `addSeoAttributes` | `boolean` | ❌ | `true` | Generate SEO meta tags |

**Returns:**

```typescript
{
  htmlAttrs: {
    lang?: string
    dir?: 'ltr' | 'rtl' | 'auto'
  }
  link: Array<{
    rel: string
    href: string
    hreflang?: string
  }>
  meta: Array<{
    property: string
    content: string
  }>
}
```

**Example:**

```astro
---
import { useLocaleHead } from '@i18n-micro/astro'

const { htmlAttrs, link, meta } = useLocaleHead(Astro, {
  baseUrl: 'https://example.com',
  addSeoAttributes: true,
})
---

<html {...htmlAttrs}>
  <head>
    {link.map((l) => (
      <link rel={l.rel} href={l.href} hreflang={l.hreflang} />
    ))}
    {meta.map((m) => (
      <meta property={m.property} content={m.content} />
    ))}
  </head>
  <body>
    <slot />
  </body>
</html>
```

**Generated Meta Tags:**

- `html[lang]` - Language attribute
- `html[dir]` - Text direction (if enabled)
- `link[rel="canonical"]` - Canonical URL
- `link[rel="alternate"][hreflang]` - Alternate language links
- `meta[property="og:locale"]` - Open Graph locale
- `meta[property="og:url"]` - Open Graph URL
- `meta[property="og:locale:alternate"]` - Alternate Open Graph locales

## 🛠️ DevTools Integration

The integration automatically registers a DevTools app in development mode, providing a visual interface for managing translations.

### Features

- **View All Translations** - Browse all translation files in your project
- **Edit Translations** - Visual editor for editing translation keys and values
- **Save Changes** - Save translations directly to files
- **View Configuration** - See current i18n configuration
- **Statistics** - View translation statistics and missing keys

### Accessing DevTools

1. Start your Astro dev server: `npm run dev`
2. Open the Astro Dev Toolbar (usually appears at the bottom of the page)
3. Click on the i18n Micro icon (🌐) to open the DevTools

### Usage

The DevTools UI allows you to:
- Select translation files from the file tree
- Edit translations in a visual editor
- See default locale translations for reference
- Save changes with a single click
- View translation statistics

**Note:** DevTools are only available in development mode and require the `translationDir` option to be configured.

## 🔧 Advanced Features

### Custom Pluralization

Define custom pluralization rules:

```typescript
import { createI18n, defaultPlural } from '@i18n-micro/astro'

const i18n = createI18n({
  locale: 'en',
  plural: (key, count, params, locale, getTranslation) => {
    // Custom logic for specific keys
    if (key === 'special') {
      return count === 0 ? 'none' : count === 1 ? 'one' : 'many'
    }
    
    // Use default for others
    return defaultPlural(key, count, params, locale, getTranslation)
  },
  messages: {
    en: {
      special: 'none | one | many',
    },
  },
})
```

### Missing Translation Handler

Handle missing translations with custom logic:

```typescript
const i18n = createI18n({
  locale: 'en',
  missingHandler: (locale, key, routeName) => {
    // Send to error tracking service
    console.error(`Missing translation: ${key} in ${locale} for route ${routeName}`)
    
    // Or send to Sentry
    // Sentry.captureMessage(`Missing translation: ${key}`, {
    //   extra: { locale, routeName }
    // })
  },
})
```

### Translation Caching

The package uses an intelligent caching system:

```typescript
const { clearCache } = useI18n(Astro)

// Clear cache when needed
clearCache()
```

The `clone()` method allows creating per-request instances that share the same cache, improving performance in SSR scenarios.

### Route-Specific vs Global Translations

Translations are resolved in this priority order:

1. Route-specific translations (if route is set)
2. Global translations
3. Fallback locale translations

```typescript
// Global translation
i18n.addTranslations('en', {
  title: 'Global Title',
})

// Route-specific translation (higher priority)
i18n.addRouteTranslations('en', 'home', {
  title: 'Home Page Title',
})

i18n.setRoute('home')
i18n.t('title') // "Home Page Title" (route-specific)

i18n.setRoute('about')
i18n.t('title') // "Global Title" (global)
```

### Async Translation Loading

Load translations dynamically from JSON files or API:

```typescript
// In middleware or page
async function loadTranslations(locale: string) {
  try {
    const messages = await import(`../locales/${locale}.json`)
    i18n.addTranslations(locale, messages.default, false)
  } catch (error) {
    console.error(`Failed to load translations for locale: ${locale}`, error)
  }
}

// Load on demand
const { locale } = useI18n(Astro)
// Load translations when locale changes
```

## 📘 TypeScript Support

### Global Types (App.Locals)

The integration automatically injects types for `App.Locals`. You should see `i18n`, `locale`, `defaultLocale`, `locales`, and `currentUrl` available in your Astro components and middleware without any manual configuration.

The integration uses Astro's `injectTypes` hook to automatically add type references, so types are available as soon as you add the integration to your `astro.config.mjs`.

**Example:**

```typescript
// src/middleware.ts
import type { MiddlewareHandler } from 'astro'

export const onRequest: MiddlewareHandler = (context, next) => {
  // Types are automatically available
  const { i18n, locale, defaultLocale, locales } = context.locals
  
  // Use i18n instance
  const translation = i18n.t('welcome')
  
  return next()
}
```

```astro
---
// src/pages/index.astro
const { i18n, locale } = Astro.locals

// Types are automatically available
const translation = i18n.t('welcome')
---

<h1>{translation}</h1>
```

### Manual Type Reference (Fallback)

If for some reason types are not showing up automatically (e.g., with custom TypeScript configuration or older Astro versions), you can manually add the reference to your `src/env.d.ts` file:

```typescript
/// <reference path="../.astro/types.d.ts" />
/// <reference types="@i18n-micro/astro/env" />
```

### Type Definitions

All types are exported from the package:

```typescript
import type {
  I18nIntegrationOptions,
  AstroI18nOptions,
  I18nMiddlewareOptions,
  LocaleHeadOptions,
  LocaleHeadResult,
  Translations,
  Params,
  PluralFunc,
  CleanTranslation,
  Locale,
  LocaleCode,
} from '@i18n-micro/astro'
```

### Type-Safe Translations

You can create type-safe translation keys:

```typescript
type TranslationKeys = 
  | 'welcome'
  | 'greeting'
  | 'apples'

function t(key: TranslationKeys, params?: Params): string {
  const { t } = useI18n(Astro)
  return t(key, params) as string
}
```

### Custom Types

Extend types for your use case:

```typescript
interface MyTranslations extends Translations {
  welcome: string
  greeting: {
    morning: string
    evening: string
  }
}

const messages: Record<string, MyTranslations> = {
  en: {
    welcome: 'Welcome',
    greeting: {
      morning: 'Good morning',
      evening: 'Good evening',
    },
  },
}
```

## 📚 Complete Examples

### Full Application Setup

**`astro.config.mjs`:**

```javascript
import { defineConfig } from 'astro/config'
import { i18nIntegration } from '@i18n-micro/astro'

export default defineConfig({
  integrations: [
    i18nIntegration({
      locale: 'en',
      fallbackLocale: 'en',
      locales: [
        { code: 'en', displayName: 'English', iso: 'en-US' },
        { code: 'fr', displayName: 'Français', iso: 'fr-FR' },
        { code: 'de', displayName: 'Deutsch', iso: 'de-DE' },
      ],
      translationDir: 'src/locales',
      missingWarn: true,
    }),
  ],
})
```

**`src/middleware.ts`:**

```typescript
import { createI18nMiddleware, createI18n } from '@i18n-micro/astro'
import type { AstroI18nOptions } from '@i18n-micro/astro'

// Create global i18n instance
const globalI18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      welcome: 'Welcome',
      greeting: 'Hello, {name}!',
      apples: 'no apples | one apple | {count} apples',
    },
    fr: {
      welcome: 'Bienvenue',
      greeting: 'Bonjour, {name}!',
      apples: 'pas de pommes | une pomme | {count} pommes',
    },
    de: {
      welcome: 'Willkommen',
      greeting: 'Hallo, {name}!',
      apples: 'keine Äpfel | ein Apfel | {count} Äpfel',
    },
  },
})

export const onRequest = createI18nMiddleware({
  i18n: globalI18n,
  defaultLocale: 'en',
  locales: ['en', 'fr', 'de'],
  localeObjects: [
    { code: 'en', displayName: 'English', iso: 'en-US' },
    { code: 'fr', displayName: 'Français', iso: 'fr-FR' },
    { code: 'de', displayName: 'Deutsch', iso: 'de-DE' },
  ],
})
```

**`src/layouts/Layout.astro`:**

```astro
---
import { useLocaleHead } from '@i18n-micro/astro'
import I18nSwitcher from '@i18n-micro/astro/components/i18n-switcher.astro'

const { htmlAttrs, link, meta } = useLocaleHead(Astro, {
  baseUrl: 'https://example.com',
})
---

<!DOCTYPE html>
<html {...htmlAttrs}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Astro Site</title>
    
    {link.map((l) => (
      <link rel={l.rel} href={l.href} hreflang={l.hreflang} />
    ))}
    {meta.map((m) => (
      <meta property={m.property} content={m.content} />
    ))}
  </head>
  <body>
    <nav>
      <I18nSwitcher />
    </nav>
    <slot />
  </body>
</html>
```

**`src/pages/index.astro`:**

```astro
---
import Layout from '../layouts/Layout.astro'
import { useI18n } from '@i18n-micro/astro'
import I18nT from '@i18n-micro/astro/components/i18n-t.astro'
import I18nLink from '@i18n-micro/astro/components/i18n-link.astro'

const { t, locale } = useI18n(Astro)
---

<Layout>
  <main>
    <h1><I18nT keypath="welcome" tag="h1" /></h1>
    
    <p>
      <I18nT keypath="greeting" params={{ name: 'World' }} />
    </p>
    
    <p>
      <I18nT keypath="apples" plural={5} />
    </p>
    
    <p>
      <I18nLink href="/about">
        <I18nT keypath="nav.about" />
      </I18nLink>
    </p>
  </main>
</Layout>
```

**`src/pages/about.astro`:**

```astro
---
import Layout from '../layouts/Layout.astro'
import { useI18n } from '@i18n-micro/astro'
import I18nT from '@i18n-micro/astro/components/i18n-t.astro'
import I18nLink from '@i18n-micro/astro/components/i18n-link.astro'

const { t } = useI18n(Astro)
---

<Layout>
  <main>
    <h1><I18nT keypath="about.title" tag="h1" /></h1>
    <p><I18nT keypath="about.description" /></p>
    <I18nLink href="/">Back to Home</I18nLink>
  </main>
</Layout>
```

### Translation Files Structure

**`src/locales/en.json`:**

```json
{
  "welcome": "Welcome",
  "greeting": "Hello, {name}!",
  "apples": "no apples | one apple | {count} apples",
  "nav": {
    "about": "About Us"
  },
  "about": {
    "title": "About Us",
    "description": "Learn more about our company"
  }
}
```

**`src/locales/fr.json`:**

```json
{
  "welcome": "Bienvenue",
  "greeting": "Bonjour, {name}!",
  "apples": "pas de pommes | une pomme | {count} pommes",
  "nav": {
    "about": "À propos"
  },
  "about": {
    "title": "À propos",
    "description": "En savoir plus sur notre entreprise"
  }
}
```

## 🎯 Best Practices

1. **Use Middleware for Locale Detection** - Always set up middleware for automatic locale detection
2. **Organize Translations by Route** - Use route-specific translations for better maintainability
3. **Handle Missing Translations** - Set up a missing handler for production error tracking
4. **Use SEO Meta Tags** - Always use `useLocaleHead` for proper SEO optimization
5. **Lazy Load Translations** - Load translations on demand to reduce initial bundle size
6. **Use TypeScript** - Leverage type definitions for better IDE support
7. **Cache Management** - Use `clone()` for per-request instances to share cache efficiently
8. **Error Handling** - Always handle translation loading errors gracefully
9. **DevTools in Development** - Use DevTools for easier translation management during development
10. **Translation File Structure** - Organize translation files logically (by feature, route, or component)

## 🔗 Related Documentation

- [Getting Started](../guide/getting-started.md) - Nuxt I18n Micro setup
- [Components](../components/) - Component documentation
- [Composables](../composables/) - Composable documentation
- [API Reference](../api/) - Complete API documentation

