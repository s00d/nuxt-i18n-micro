---
outline: deep
---

# React Package (`@i18n-micro/react`)

The `@i18n-micro/react` package provides a lightweight, high-performance internationalization solution for React applications. It shares the same core logic as Nuxt I18n Micro, offering reactive translations, route-specific support, and full TypeScript support.

## Overview

`@i18n-micro/react` is designed for React applications that need internationalization without the Nuxt framework. It provides:

- **Lightweight** - Uses shared core logic from `@i18n-micro/core`
- **Reactive** - Automatic component updates when translations change using `useSyncExternalStore`
- **Route-specific translations** - Support for page-level translations
- **Pluralization** - Built-in plural form support
- **Formatting** - Number, date, and relative time formatting
- **Type-safe** - Full TypeScript support
- **Router-agnostic** - Works with any router or without a router
- **DevTools Integration** - Vite plugin for managing translations during development

## Installation

Install the package using your preferred package manager:

::: code-group

```bash [npm]
npm install @i18n-micro/react
```

```bash [yarn]
yarn add @i18n-micro/react
```

```bash [pnpm]
pnpm add @i18n-micro/react
```

```bash [bun]
bun add @i18n-micro/react
```

:::

### Peer Dependencies

The package requires React and optionally React Router:

```json
{
  "peerDependencies": {
    "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0",
    "react-router-dom": "^6.0.0"
  }
}
```

## Quick Start

### Basic Setup (Without Router)

For applications that don't need routing features:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createI18n, I18nProvider } from '@i18n-micro/react'
import App from './App'

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      greeting: 'Hello, {name}!',
      apples: 'no apples | one apple | {count} apples',
    },
    fr: {
      greeting: 'Bonjour, {name}!',
      apples: 'pas de pommes | une pomme | {count} pommes',
    },
  },
})

const localesConfig = [
  { code: 'en', displayName: 'English', iso: 'en-US' },
  { code: 'fr', displayName: 'Français', iso: 'fr-FR' },
]

const root = ReactDOM.createRoot(document.getElementById('app')!)
root.render(
  <React.StrictMode>
    <I18nProvider 
      i18n={i18n}
      locales={localesConfig}
      defaultLocale="en"
    >
      <App />
    </I18nProvider>
  </React.StrictMode>,
)
```

### Setup With Router Adapter

For applications with routing:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom'
import { createI18n, I18nProvider } from '@i18n-micro/react'
import { createReactRouterAdapter } from '@i18n-micro/react'
import App from './App'
import type { Locale } from '@i18n-micro/types'

const localesConfig: Locale[] = [
  { code: 'en', displayName: 'English', iso: 'en-US' },
  { code: 'fr', displayName: 'Français', iso: 'fr-FR' },
  { code: 'de', displayName: 'Deutsch', iso: 'de-DE' },
]

const defaultLocale = 'en'

const i18n = createI18n({
  locale: defaultLocale,
  fallbackLocale: defaultLocale,
  messages: {
    en: {},
  },
})

// RouterRoot component that creates the adapter
function RouterRoot({ children }: { children?: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const routingStrategy = createReactRouterAdapter(localesConfig, defaultLocale, location, navigate)

  return (
    <I18nProvider
      i18n={i18n}
      locales={localesConfig}
      defaultLocale={defaultLocale}
      routingStrategy={routingStrategy}
    >
      {children}
    </I18nProvider>
  )
}

const root = ReactDOM.createRoot(document.getElementById('app')!)
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <RouterRoot>
        <App />
      </RouterRoot>
    </BrowserRouter>
  </React.StrictMode>,
)
```

### Usage in Components

```tsx
import { useI18n } from '@i18n-micro/react'

function MyComponent() {
  const { t, tc, tn, locale, setLocale } = useI18n()

  return (
    <div>
      <p>{t('greeting', { name: 'World' })}</p>
      <p>{tc('apples', 5)}</p>
      <p>{tn(1234.56)}</p>
      <button onClick={() => setLocale('fr')}>
        Switch to French
      </button>
    </div>
  )
}
```

## Core Concepts

### Router Adapter Abstraction

The package uses a router adapter pattern to decouple i18n functionality from specific router implementations. This allows you to:

- Use any router library (React Router, custom router, or no router)
- Implement routing logic in your application, not in the i18n package
- Keep the core package lightweight and router-agnostic

The `I18nRoutingStrategy` interface defines the contract between i18n and your router:

```typescript
interface I18nRoutingStrategy {
  getCurrentPath: () => string
  linkComponent?: string | React.ComponentType<{ /* ... */ }>
  push: (target: { path: string }) => void
  replace: (target: { path: string }) => void
  resolvePath?: (to: string | { path?: string }, locale: string) => string | { path?: string }
  getRoute?: () => { fullPath: string; query: Record<string, unknown> }
}
```

### Architecture

```mermaid
graph TB
    App[React App] -->|uses| I18nProvider[I18nProvider]
    App -->|uses| RouterAdapter[Router Adapter]
    I18nProvider -->|provides| ReactI18n[ReactI18n Instance]
    RouterAdapter -->|implements| I18nRoutingStrategy[I18nRoutingStrategy]
    ReactI18n -->|uses| RouterAdapter
    Components[Components] -->|use| useI18n[useI18n Hook]
    Components -->|use| useI18nRouter[useI18nRouter Hook]
    Components -->|use| I18nLink[I18nLink Component]
    Components -->|use| I18nSwitcher[I18nSwitcher Component]
```

## Setup & Configuration

### Basic Setup Without Router

For applications that don't need routing features:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createI18n, I18nProvider } from '@i18n-micro/react'
import App from './App'
import type { Locale } from '@i18n-micro/types'

const localesConfig: Locale[] = [
  { code: 'en', displayName: 'English', iso: 'en-US' },
  { code: 'fr', displayName: 'Français', iso: 'fr-FR' },
]

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: { welcome: 'Welcome' },
    fr: { welcome: 'Bienvenue' },
  },
})

const root = ReactDOM.createRoot(document.getElementById('app')!)
root.render(
  <React.StrictMode>
    <I18nProvider 
      i18n={i18n}
      locales={localesConfig}
      defaultLocale="en"
    >
      <App />
    </I18nProvider>
  </React.StrictMode>,
)
```

### Setup With Router Adapter

For applications with routing:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom'
import { createI18n, I18nProvider } from '@i18n-micro/react'
import { createReactRouterAdapter } from '@i18n-micro/react'
import App from './App'
import type { Locale } from '@i18n-micro/types'

const localesConfig: Locale[] = [
  { code: 'en', displayName: 'English', iso: 'en-US' },
  { code: 'fr', displayName: 'Français', iso: 'fr-FR' },
  { code: 'de', displayName: 'Deutsch', iso: 'de-DE' },
]

const defaultLocale = 'en'

const i18n = createI18n({
  locale: defaultLocale,
  fallbackLocale: defaultLocale,
  messages: {
    en: {},
  },
})

// RouterRoot component that creates the adapter
function RouterRoot({ children }: { children?: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const routingStrategy = createReactRouterAdapter(localesConfig, defaultLocale, location, navigate)

  return (
    <I18nProvider
      i18n={i18n}
      locales={localesConfig}
      defaultLocale={defaultLocale}
      routingStrategy={routingStrategy}
    >
      {children}
    </I18nProvider>
  )
}

const root = ReactDOM.createRoot(document.getElementById('app')!)
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <RouterRoot>
        <App />
      </RouterRoot>
    </BrowserRouter>
  </React.StrictMode>,
)
```

## Core API

### `createI18n(options: ReactI18nOptions)`

Creates a new i18n instance for your React application.

**Parameters:**

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `locale` | `string` | ✅ | - | Current locale code (e.g., `'en'`) |
| `fallbackLocale` | `string` | ❌ | Same as `locale` | Fallback locale when translation is missing |
| `messages` | `Record<string, Translations>` | ❌ | `{}` | Initial translation messages |
| `plural` | `PluralFunc` | ❌ | `defaultPlural` | Custom pluralization function |
| `missingWarn` | `boolean` | ❌ | `false` | Show console warnings for missing translations |
| `missingHandler` | `(locale: string, key: string, routeName: string) => void` | ❌ | - | Custom handler for missing translations |

**Returns:** `ReactI18n`

**Example:**

```typescript
import { createI18n } from '@i18n-micro/react'

const i18n = createI18n({
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
  missingWarn: true,
  missingHandler: (locale, key, routeName) => {
    console.warn(`Missing translation: ${key} in ${locale} for route ${routeName}`)
  },
})
```

### `ReactI18n` Class

The core i18n instance class that handles all translation logic.

#### Properties

- `locale: string` - Current locale (getter/setter, triggers reactivity)
- `fallbackLocale: string` - Fallback locale (getter/setter)
- `currentRoute: string` - Current route name (getter)
- `cache: TranslationCache` - Translation cache object

#### Methods

##### `t(key: string, params?: Params, defaultValue?: string | null, routeName?: string): CleanTranslation`

Translates a key with optional parameters and fallback value.

```typescript
const i18n = createI18n({ /* ... */ })

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

##### `setRoute(routeName: string): void`

Sets the current route name for route-specific translations.

##### `getRoute(): string`

Gets the current route name.

##### `clearCache(): void`

Clears the translation cache.

## Hook: `useI18n`

The `useI18n` hook provides access to i18n functionality in React components. It uses `useSyncExternalStore` internally for reactivity, ensuring components re-render when translations or locale change. The hook automatically uses the routing strategy from `I18nProvider` if available.

### Basic Usage

```tsx
import { useI18n } from '@i18n-micro/react'

function MyComponent() {
  const { t, locale, fallbackLocale } = useI18n()
  
  return <div>{t('welcome')}</div>
}
```

### Using Router Methods

When a routing strategy is provided via `I18nProvider`, the hook exposes router-related methods:

```tsx
import { useI18n } from '@i18n-micro/react'

function Navigation() {
  const { t, locale, switchLocale, localeRoute, localePath } = useI18n()

  return (
    <nav>
      <a href={localePath('/')}>{t('nav.home')}</a>
      <a href={localePath('/about')}>{t('nav.about')}</a>
      <button onClick={() => switchLocale('fr')}>
        Switch to French
      </button>
    </nav>
  )
}
```

### API Reference

#### Reactive Properties

##### `locale: string`

Current locale (read-only getter, use `setLocale` to change).

```typescript
const { locale, setLocale } = useI18n()

// Read
console.log(locale) // "en"

// Write
setLocale('fr')
```

##### `fallbackLocale: string`

Fallback locale (read-only).

##### `currentRoute: string`

Current route name (read-only).

#### Translation Methods

##### `t(key: string, params?: Params, defaultValue?: string | null, routeName?: string): CleanTranslation`

```typescript
const { t } = useI18n()

// Basic
t('welcome')

// With params
t('greeting', { name: 'John' })

// With default
t('missing', {}, 'Default')

// Route-specific
t('title', {}, null, 'home')
```

##### `ts(key: string, params?: Params, defaultValue?: string, routeName?: string): string`

Always returns a string.

##### `tc(key: string, count: number | Params, defaultValue?: string): string`

Pluralization.

```typescript
const { tc } = useI18n()
tc('apples', 5) // "5 apples"
```

##### `tn(value: number, options?: Intl.NumberFormatOptions): string`

Number formatting.

##### `td(value: Date | number | string, options?: Intl.DateTimeFormatOptions): string`

Date formatting.

##### `tdr(value: Date | number | string, options?: Intl.RelativeTimeFormatOptions): string`

Relative time formatting.

##### `has(key: string, routeName?: string): boolean`

Check if translation exists.

#### Locale Management

##### `setLocale(locale: string): void`

Change the current locale.

```typescript
const { setLocale, locale } = useI18n()

function handleLocaleChange(newLocale: string) {
  setLocale(newLocale)
}
```

#### Route Management

##### `setRoute(routeName: string): void`

Set current route.

##### `getRoute(): string`

Get current route.

#### Router Methods (when routing strategy is provided)

##### `switchLocale(locale: string): void`

Switch locale and navigate to the localized path. Uses the routing strategy if available.

```typescript
const { switchLocale } = useI18n()

// Switch to French and navigate to /fr/about
switchLocale('fr')
```

##### `localeRoute(to: string | { path?: string }, locale?: string): string | { path?: string }`

Resolve path for a specific locale. Returns localized path using the routing strategy.

```typescript
const { localeRoute } = useI18n()

// Get localized path for current locale
const path = localeRoute('/about') // "/fr/about" if current locale is 'fr'

// Get localized path for specific locale
const enPath = localeRoute('/about', 'en') // "/about"
const frPath = localeRoute('/about', 'fr') // "/fr/about"
```

##### `localePath(to: string | { path?: string }, locale?: string): string`

Same as `localeRoute` but always returns a string.

```typescript
const { localePath } = useI18n()

const path = localePath('/about', 'fr') // "/fr/about"
```

#### Translation Management

##### `addTranslations(locale: string, translations: Translations, merge?: boolean): void`

Add translations.

##### `addRouteTranslations(locale: string, routeName: string, translations: Translations, merge?: boolean): void`

Add route-specific translations.

##### `clearCache(): void`

Clear translation cache.

### Complete Example

```tsx
import { useI18n } from '@i18n-micro/react'

function HomePage() {
  const { t, tc, tn, td, tdr, locale, setLocale } = useI18n()

  return (
    <div>
      <h1>{t('home.title')}</h1>
      <p>{t('greeting', { name: 'World' })}</p>
      <p>{tc('apples', 5)}</p>
      <p>{t('number', { number: tn(1234.56) })}</p>
      <p>{t('date', { date: td(new Date()) })}</p>
      <p>{t('relativeDate', { relativeDate: tdr(Date.now() - 86400000) })}</p>
      
      <button onClick={() => setLocale('fr')}>
        Switch to French
      </button>
    </div>
  )
}
```

## Components

### `<I18nProvider>`

Context provider component that makes the i18n instance available to all child components. It also provides locales configuration and routing strategy.

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `i18n` | `ReactI18n` | ✅ | The i18n instance created with `createI18n` |
| `locales` | `Locale[]` | ❌ | Array of locale objects |
| `defaultLocale` | `string` | ❌ | Default locale code |
| `routingStrategy` | `I18nRoutingStrategy` | ❌ | Router adapter for routing features |
| `children` | `React.ReactNode` | ✅ | Child components |

#### Example

**Without Router:**

```tsx
import { createI18n, I18nProvider } from '@i18n-micro/react'

const i18n = createI18n({
  locale: 'en',
  messages: { /* ... */ },
})

function App() {
  return (
    <I18nProvider 
      i18n={i18n}
      locales={localesConfig}
      defaultLocale="en"
    >
      <YourApp />
    </I18nProvider>
  )
}
```

**With Router Adapter:**

```tsx
import { useLocation, useNavigate } from 'react-router-dom'
import { createI18n, I18nProvider, createReactRouterAdapter } from '@i18n-micro/react'

function RouterRoot({ children }: { children?: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const routingStrategy = createReactRouterAdapter(localesConfig, defaultLocale, location, navigate)

  return (
    <I18nProvider
      i18n={i18n}
      locales={localesConfig}
      defaultLocale={defaultLocale}
      routingStrategy={routingStrategy}
    >
      {children}
    </I18nProvider>
  )
}
```

### DevTools Integration (Vite Plugin)

This package supports DevTools integration via the `@i18n-micro/devtools-ui` Vite plugin. See the [DevTools UI Package documentation](./devtools-ui-package.md) for details.

### `<I18nT>`

Translation component with support for pluralization, formatting, and HTML rendering. Automatically uses the routing strategy from `I18nProvider` if available.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `keypath` | `string` | ✅ | - | Translation key path |
| `params` | `Params` | ❌ | `{}` | Parameters for interpolation |
| `plural` | `number \| string` | ❌ | - | Count for pluralization |
| `defaultValue` | `string` | ❌ | `''` | Default value if key not found |
| `tag` | `string` | ❌ | `'span'` | HTML tag to wrap content |
| `html` | `boolean` | ❌ | `false` | Render as HTML |
| `number` | `number \| string` | ❌ | - | Number to format and interpolate |
| `date` | `Date \| string \| number` | ❌ | - | Date to format and interpolate |
| `relativeDate` | `Date \| string \| number` | ❌ | - | Relative date to format |

#### Examples

```tsx
import { I18nT } from '@i18n-micro/react'

// Basic usage
<I18nT keypath="welcome" />

// With parameters
<I18nT keypath="greeting" params={{ name: 'John' }} />

// Pluralization
<I18nT keypath="apples" plural={5} />

// Number formatting
<I18nT keypath="price" number={1234.56} />

// Date formatting
<I18nT keypath="date" date={new Date()} />

// HTML rendering
<I18nT keypath="htmlContent" html />

// Custom tag
<I18nT keypath="title" tag="h1" />
```

### `<I18nLink>`

Localized link component that automatically handles locale prefixes using the routing strategy from `I18nProvider` if available.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `to` | `string \| { path?: string }` | ✅ | - | Link destination |
| `activeStyle` | `React.CSSProperties` | ❌ | - | Styles to apply when link is active |
| `localeRoute` | `(to: string \| { path?: string }, locale?: string) => string \| { path?: string }` | ❌ | - | Custom locale route function (uses routing strategy if not provided) |
| `...restProps` | `React.AnchorHTMLAttributes<HTMLAnchorElement>` | ❌ | - | All standard anchor attributes |

#### Examples

```tsx
import { I18nLink } from '@i18n-micro/react'

// Basic usage
<I18nLink to="/about">About Us</I18nLink>

// With active style
<I18nLink 
  to="/" 
  activeStyle={{ fontWeight: 'bold', backgroundColor: '#e8f5e9' }}
>
  Home
</I18nLink>

// With custom locale route
<I18nLink 
  to="/about" 
  localeRoute={(to, locale) => `/${locale}${to}`}
>
  About
</I18nLink>
```

The component automatically:
- Uses the routing strategy's `linkComponent` if available (e.g., `Link` from `react-router-dom`)
- Falls back to a native `<a>` tag with `onClick` handler if no `linkComponent` is provided
- Handles active state detection using `getCurrentPath()` from the routing strategy
- Supports external links (detected automatically)

### `<I18nSwitcher>`

Language switcher component that generates links for all available locales. Uses the routing strategy from `I18nProvider` for path generation if available.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `locales` | `Locale[]` | ❌ | - | Array of locale objects (uses injected locales if not provided) |
| `currentLocale` | `string \| (() => string)` | ❌ | - | Current locale (uses injected locale if not provided) |
| `getLocaleName` | `() => string \| null` | ❌ | - | Function to get locale display name |
| `switchLocale` | `(locale: string) => void` | ❌ | - | Function to switch locale (uses routing strategy if not provided) |
| `localeRoute` | `(to: string \| { path?: string }, locale?: string) => string \| { path?: string }` | ❌ | - | Custom locale route function (uses routing strategy if not provided) |
| `customLabels` | `Record<string, string>` | ❌ | `{}` | Custom labels for locales |
| `...restProps` | `React.HTMLAttributes<HTMLDivElement>` | ❌ | - | All standard div attributes |

#### Examples

```tsx
import { I18nSwitcher } from '@i18n-micro/react'

// Basic usage (uses injected locales and routing strategy)
<I18nSwitcher />

// With custom props
<I18nSwitcher
  locales={localesConfig}
  currentLocale={locale}
  getLocaleName={() => getLocaleName()}
  switchLocale={switchLocale}
  localeRoute={localeRoute}
/>
```

The component automatically:
- Filters out disabled locales
- Highlights the current locale
- Generates localized paths for each locale using the routing strategy
- Uses locale display names from configuration
- Provides a dropdown interface for locale selection

### `<I18nGroup>`

Component for grouping translations with a common prefix.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `prefix` | `string` | ✅ | - | Translation key prefix |
| `groupClass` | `string` | ❌ | `''` | CSS class for the wrapper div |
| `children` | `React.ReactNode` | ✅ | - | Child components |

#### Examples

```tsx
import { I18nGroup, I18nT } from '@i18n-micro/react'

<I18nGroup prefix="home">
  <I18nT keypath="title" /> {/* Uses "home.title" */}
  <I18nT keypath="description" /> {/* Uses "home.description" */}
</I18nGroup>
```

## Router Integration

### I18nRoutingStrategy Interface

The `I18nRoutingStrategy` interface defines how i18n interacts with your router:

```typescript
interface I18nRoutingStrategy {
  /**
   * Returns current path (without locale prefix if needed, or full path)
   * Used for determining active classes in links
   */
  getCurrentPath: () => string

  /**
   * Component to use for rendering links (e.g., Link from react-router-dom)
   */
  linkComponent?: string | React.ComponentType<{
    href: string
    children?: React.ReactNode
    style?: React.CSSProperties
    className?: string
    [key: string]: unknown
  }>

  /**
   * Function to navigate to another route/locale
   */
  push: (target: { path: string }) => void

  /**
   * Function to replace current route
   */
  replace: (target: { path: string }) => void

  /**
   * Generate path for specific locale
   */
  resolvePath?: (to: string | { path?: string }, locale: string) => string | { path?: string }

  /**
   * (Optional) Get current route object for SEO/Meta tags
   */
  getRoute?: () => {
    fullPath: string
    query: Record<string, unknown>
  }
}
```

### Using the Built-in Router Adapter

The package exports `createReactRouterAdapter` for React Router integration:

```typescript
import { createReactRouterAdapter } from '@i18n-micro/react'

// In your RouterRoot component
function RouterRoot({ children }: { children?: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const routingStrategy = createReactRouterAdapter(localesConfig, defaultLocale, location, navigate)
  
  // ... rest of your code
}
```

### Setting Routing Strategy

You set the routing strategy by passing it to `I18nProvider`:

```typescript
function RouterRoot({ children }: { children?: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const routingStrategy = createReactRouterAdapter(localesConfig, defaultLocale, location, navigate)

  return (
    <I18nProvider
      i18n={i18n}
      locales={localesConfig}
      defaultLocale={defaultLocale}
      routingStrategy={routingStrategy}
    >
      {children}
    </I18nProvider>
  )
}
```

## Creating Custom Router Adapters

### Overview

A router adapter is an implementation of the `I18nRoutingStrategy` interface that defines how i18n interacts with your routing system. This allows you to:

- Support any routing strategy (React Router, Next.js Router, TanStack Router, custom)
- Customize locale detection and path generation
- Integrate with third-party routing libraries
- Implement domain-based or subdomain-based locale routing

### Interface Reference

The `I18nRoutingStrategy` interface defines the following methods:

| Method | Required | Description |
|--------|----------|-------------|
| `getCurrentPath()` | ✅ | Returns the current path (used for active link detection) |
| `linkComponent` | ❌ | Component to use for rendering links (e.g., `Link` from react-router-dom) |
| `push(target)` | ❌ | Function to navigate to another route/locale |
| `replace(target)` | ❌ | Function to replace current route |
| `resolvePath(to, locale)` | ❌ | Generate path for specific locale |
| `getRoute()` | ❌ | Returns current route object with query params |

### Step-by-Step Guide

#### Step 1: Understand Your Routing Strategy

Before creating an adapter, understand how your routing works:

- **Where is the locale in the URL?** (prefix, suffix, subdomain, query param)
- **How are routes named?** (file-based, programmatic, custom)
- **What is the default locale behavior?** (include prefix, hide prefix)

#### Step 2: Implement Required Methods

At minimum, you must implement `getCurrentPath()`. All other methods are optional but recommended for full functionality.

#### Step 3: Handle Edge Cases

Consider:
- Empty paths (`/`)
- Root locale (default locale - should it be in URL?)
- Invalid locales
- Query parameters and hash fragments

### Example 1: Next.js Router Adapter

This example shows how to create an adapter for Next.js App Router:

```typescript
// src/router-adapter-nextjs.tsx
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { I18nRoutingStrategy } from '@i18n-micro/react'
import type { Locale } from '@i18n-micro/types'
import type React from 'react'

export function createNextJsRouterAdapter(
  locales: Locale[],
  defaultLocale: string,
  pathname: string,
  router: ReturnType<typeof useRouter>,
): I18nRoutingStrategy {
  const localeCodes = locales.map(loc => loc.code)

  const resolvePath = (to: string | { path?: string }, locale: string): string | { path?: string } => {
    const path = typeof to === 'string' ? to : (to.path || '/')
    const pathSegments = path.split('/').filter(Boolean)
    
    // Remove existing locale if present
    if (pathSegments.length > 0 && localeCodes.includes(pathSegments[0])) {
      pathSegments.shift()
    }

    const cleanPath = '/' + pathSegments.join('/')
    
    // Next.js App Router uses locale prefix for all non-default locales
    if (locale === defaultLocale) {
      return cleanPath
    }
    
    return `/${locale}${cleanPath === '/' ? '' : cleanPath}`
  }

  return {
    linkComponent: ((props: {
      href: string
      children?: React.ReactNode
      className?: string
      style?: React.CSSProperties
      [key: string]: unknown
    }) => {
      const { href, children, className, style, ...restProps } = props
      return React.createElement(
        Link,
        {
          href,
          className,
          style,
          ...restProps,
        },
        children,
      )
    }) as React.ComponentType<{
      href: string
      children?: React.ReactNode
      style?: React.CSSProperties
      className?: string
      [key: string]: unknown
    }>,

    getCurrentPath: () => pathname,

    push: (target: { path: string }) => {
      router.push(target.path)
    },

    replace: (target: { path: string }) => {
      router.replace(target.path)
    },

    resolvePath: (to: string | { path?: string }, locale: string) => resolvePath(to, locale),

    getRoute: () => {
      const url = new URL(pathname, 'http://localhost')
      return {
        fullPath: pathname,
        query: Object.fromEntries(url.searchParams),
      }
    },
  }
}
```

**Usage:**

```typescript
// In your layout or root component
'use client'

import { usePathname, useRouter } from 'next/navigation'
import { createI18n, I18nProvider } from '@i18n-micro/react'
import { createNextJsRouterAdapter } from './router-adapter-nextjs'

function RouterRoot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const routingStrategy = createNextJsRouterAdapter(localesConfig, defaultLocale, pathname, router)

  return (
    <I18nProvider
      i18n={i18n}
      locales={localesConfig}
      defaultLocale={defaultLocale}
      routingStrategy={routingStrategy}
    >
      {children}
    </I18nProvider>
  )
}
```

### Example 2: TanStack Router Adapter

This example shows how to create an adapter for TanStack Router:

```typescript
// src/router-adapter-tanstack.tsx
import { useRouter, useLocation, Link } from '@tanstack/react-router'
import type { I18nRoutingStrategy } from '@i18n-micro/react'
import type { Locale } from '@i18n-micro/types'
import type React from 'react'

export function createTanStackRouterAdapter(
  locales: Locale[],
  defaultLocale: string,
  router: ReturnType<typeof useRouter>,
  location: ReturnType<typeof useLocation>,
): I18nRoutingStrategy {
  const localeCodes = locales.map(loc => loc.code)

  const resolvePath = (to: string | { path?: string }, locale: string): string | { path?: string } => {
    const path = typeof to === 'string' ? to : (to.path || '/')
    const pathSegments = path.split('/').filter(Boolean)
    
    if (pathSegments.length > 0 && localeCodes.includes(pathSegments[0])) {
      pathSegments.shift()
    }

    const cleanPath = '/' + pathSegments.join('/')
    return locale === defaultLocale ? cleanPath : `/${locale}${cleanPath === '/' ? '' : cleanPath}`
  }

  return {
    linkComponent: ((props: {
      href: string
      children?: React.ReactNode
      className?: string
      style?: React.CSSProperties
      [key: string]: unknown
    }) => {
      const { href, children, className, style, ...restProps } = props
      return React.createElement(
        Link,
        {
          to: href,
          className,
          style,
          ...restProps,
        },
        children,
      )
    }) as React.ComponentType<{
      href: string
      children?: React.ReactNode
      style?: React.CSSProperties
      className?: string
      [key: string]: unknown
    }>,

    getCurrentPath: () => location.pathname,

    push: (target: { path: string }) => {
      router.navigate({ to: target.path })
    },

    replace: (target: { path: string }) => {
      router.navigate({ to: target.path, replace: true })
    },

    resolvePath: (to: string | { path?: string }, locale: string) => resolvePath(to, locale),

    getRoute: () => ({
      fullPath: location.pathname + location.search,
      query: Object.fromEntries(new URLSearchParams(location.search)),
    }),
  }
}
```

### Example 3: Query Parameter-Based Locale Routing

This example uses query parameters for locale (e.g., `/?locale=fr`):

```typescript
// src/router-adapter-query.tsx
import type { I18nRoutingStrategy } from '@i18n-micro/react'
import type { Locale } from '@i18n-micro/types'

export function createQueryParamRouterAdapter(
  locales: Locale[],
  defaultLocale: string,
  getCurrentPath: () => string,
  navigate: (path: string, options?: { replace?: boolean }) => void,
  paramName: string = 'locale',
): I18nRoutingStrategy {
  const localeCodes = locales.map(loc => loc.code)

  const resolvePath = (to: string | { path?: string }, locale: string): string | { path?: string } => {
    const path = typeof to === 'string' ? to : (to.path || '/')
    const url = new URL(path, 'http://localhost')
    
    if (locale !== defaultLocale) {
      url.searchParams.set(paramName, locale)
    } else {
      url.searchParams.delete(paramName)
    }
    
    return url.pathname + url.search
  }

  return {
    getCurrentPath,
    push: (target) => navigate(target.path),
    replace: (target) => navigate(target.path, { replace: true }),
    resolvePath: (to, locale) => resolvePath(to, locale),
    getRoute: () => {
      const url = new URL(getCurrentPath(), 'http://localhost')
      return {
        fullPath: url.pathname + url.search,
        query: Object.fromEntries(url.searchParams),
      }
    },
  }
}
```

### Best Practices

1. **Always handle the default locale**: Decide whether the default locale should appear in URLs or be hidden.

2. **Preserve query parameters and hash**: When switching locales, maintain query params and hash fragments:

```typescript
const resolvePath = (to: string | { path?: string }, locale: string): string | { path?: string } => {
  const path = typeof to === 'string' ? to : (to.path || '/')
  const url = new URL(path, 'http://localhost')
  // ... locale switching logic ...
  return url.pathname + url.search + url.hash
}
```

3. **Handle edge cases**: Consider empty paths, root paths, and invalid locales:

```typescript
const getCurrentPath = (): string => {
  // Handle empty path
  const path = location.pathname
  return path || '/'
}
```

4. **Test with all locales**: Ensure your adapter works correctly with all configured locales, including edge cases like:
   - Very short locale codes (`en`, `fr`)
   - Long locale codes (`zh-Hans`, `pt-BR`)
   - Locale codes that might conflict with route segments

### Common Patterns

#### Pattern 1: Minimal Adapter (Only Required Methods)

If you only need basic functionality:

```typescript
export function createMinimalAdapter(getCurrentPathFn: () => string): I18nRoutingStrategy {
  return {
    getCurrentPath: getCurrentPathFn,
  }
}
```

#### Pattern 2: Extending Built-in Adapter

You can extend the built-in adapter and override specific methods:

```typescript
import { createReactRouterAdapter } from '@i18n-micro/react'

export function createExtendedAdapter(
  locales: Locale[],
  defaultLocale: string,
  location: Location,
  navigate: NavigateFunction,
) {
  const baseAdapter = createReactRouterAdapter(locales, defaultLocale, location, navigate)
  
  return {
    ...baseAdapter,
    // Override specific method
    resolvePath: (to: string | { path?: string }, locale: string) => {
      const basePath = baseAdapter.resolvePath?.(to, locale)
      // Custom logic
      return typeof basePath === 'string' ? `/custom${basePath}` : basePath
    },
  }
}
```

### Troubleshooting

**Problem**: Locale not detected correctly
- **Solution**: Check that `getCurrentPath` correctly returns the current path, and `resolvePath` properly handles locale prefixes

**Problem**: Links don't switch locale
- **Solution**: Ensure `push` and `replace` methods correctly update the URL using your router's navigation API

**Problem**: Active state detection doesn't work
- **Solution**: Verify `getCurrentPath` returns the correct path format that matches your routing strategy

## Async Translation Loading

### Loading from JSON Files

Load translations dynamically from JSON files:

```typescript
import { createI18n, I18nProvider } from '@i18n-micro/react'

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {}, // Start with empty, load async
  },
})

// Async load translations
async function loadTranslations(locale: string) {
  try {
    const messages = await import(`./locales/${locale}.json`)
    return messages.default
  } catch (error) {
    console.error(`Failed to load translations for locale: ${locale}`, error)
    return {}
  }
}

// Initialize app
async function initApp() {
  // Detect initial locale from URL
  const path = window.location.pathname
  const firstSegment = path.split('/')[1]
  const initialLocale = ['en', 'fr', 'de'].includes(firstSegment) ? firstSegment : 'en'

  // Load initial locale
  const translations = await loadTranslations(initialLocale)
  i18n.addTranslations(initialLocale, translations, false)
  if (initialLocale !== 'en') {
    i18n.locale = initialLocale
  }

  // Preload other locales in background
  const otherLocales = ['en', 'fr', 'de'].filter(c => c !== initialLocale)
  Promise.all(
    otherLocales.map(code => 
      loadTranslations(code).then(msgs => ({ code, msgs }))
    )
  ).then((results) => {
    results.forEach(({ code, msgs }) => {
      i18n.addTranslations(code, msgs, false)
    })
  }).catch(() => {
    // Ignore errors for preloading
  })
}

// Start loading translations
initApp()

function App() {
  return (
    <I18nProvider i18n={i18n}>
      <YourApp />
    </I18nProvider>
  )
}
```

### Loading from API

Load translations from an API endpoint:

```typescript
async function loadTranslationsFromAPI(locale: string) {
  try {
    const response = await fetch(`/api/translations/${locale}`)
    const translations = await response.json()
    i18n.addTranslations(locale, translations, false)
  } catch (error) {
    console.error(`Failed to load translations: ${error}`)
  }
}

// Load on demand
function MyComponent() {
  const { locale, setLocale } = useI18n()

  useEffect(() => {
    loadTranslationsFromAPI(locale)
  }, [locale])
}
```

### Lazy Loading Strategy

Load translations only when needed:

```typescript
const loadedLocales = new Set<string>()

async function ensureLocaleLoaded(locale: string) {
  if (loadedLocales.has(locale)) {
    return
  }
  
  await loadTranslations(locale)
  loadedLocales.add(locale)
}

// Use in component
function LocaleSwitcher() {
  const { locale, setLocale } = useI18n()

  async function handleLocaleSwitch(newLocale: string) {
    await ensureLocaleLoaded(newLocale)
    setLocale(newLocale)
  }

  return (
    <select value={locale} onChange={(e) => handleLocaleSwitch(e.target.value)}>
      <option value="en">English</option>
      <option value="fr">Français</option>
    </select>
  )
}
```

### Error Handling

Handle loading errors gracefully:

```typescript
async function loadTranslationsWithFallback(locale: string) {
  try {
    const messages = await import(`./locales/${locale}.json`)
    i18n.addTranslations(locale, messages.default, false)
  } catch (error) {
    console.warn(`Failed to load ${locale}, using fallback`)
    // Load fallback locale
    if (locale !== 'en') {
      await loadTranslationsWithFallback('en')
    }
  }
}
```

## DevTools Integration

This package supports DevTools integration via the `@i18n-micro/devtools-ui` Vite plugin. See the [DevTools UI Package documentation](./devtools-ui-package.md) for details.

## Advanced Features

### Custom Pluralization

Define custom pluralization rules:

```typescript
import { createI18n, defaultPlural } from '@i18n-micro/react'

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
const { clearCache } = useI18n()

// Clear cache when needed
clearCache()
```

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

## TypeScript Support

### Type Definitions

All types are exported from the package:

```typescript
import type {
  ReactI18nOptions,
  ReactI18n,
  Translations,
  Params,
  PluralFunc,
  CleanTranslation,
  Locale,
  LocaleCode,
  TranslationKey,
  I18nProviderProps,
  UseI18nReturn,
  UseI18nOptions,
  I18nRoutingStrategy,
  I18nTProps,
  I18nLinkProps,
  I18nSwitcherProps,
  I18nGroupProps,
} from '@i18n-micro/react'
```

### Type-Safe Translations

You can create type-safe translation keys:

```typescript
type TranslationKeys = 
  | 'welcome'
  | 'greeting'
  | 'apples'

function t(key: TranslationKeys, params?: Params): string {
  const { t } = useI18n()
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

## Complete Examples

### Full Application Setup

**`main.tsx`:**

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { createI18n, I18nProvider } from '@i18n-micro/react'
import type { Locale } from '@i18n-micro/types'
import App from './App'

const localesConfig: Locale[] = [
  { code: 'en', displayName: 'English', iso: 'en-US' },
  { code: 'fr', displayName: 'Français', iso: 'fr-FR' },
  { code: 'de', displayName: 'Deutsch', iso: 'de-DE' },
]

const defaultLocale = 'en'

// Async load translations
async function loadTranslations(locale: string) {
  try {
    const messages = await import(`./locales/${locale}.json`)
    return messages.default
  } catch (error) {
    console.error(`Failed to load translations for locale: ${locale}`, error)
    return {}
  }
}

// Create i18n instance
const i18n = createI18n({
  locale: defaultLocale,
  fallbackLocale: defaultLocale,
  messages: {
    en: {},
  },
})

// Initialize app
async function initApp() {
  // Detect initial locale from URL
  const path = window.location.pathname
  const firstSegment = path.split('/')[1]
  const initialLocale = localesConfig.some(l => l.code === firstSegment) ? firstSegment : defaultLocale

  // Load initial locale
  const translations = await loadTranslations(initialLocale)
  i18n.addTranslations(initialLocale, translations, false)
  if (initialLocale !== defaultLocale) {
    i18n.locale = initialLocale
  }

  // Preload other locales in background
  const otherLocales = localesConfig.map(l => l.code).filter(c => c !== initialLocale)
  Promise.all(
    otherLocales.map(code => loadTranslations(code).then(msgs => ({ code, msgs })))
  ).then((results) => {
    results.forEach(({ code, msgs }) => {
      i18n.addTranslations(code, msgs, false)
    })
  }).catch(() => {})

  const root = ReactDOM.createRoot(document.getElementById('app')!)
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  )
}

// Start the app
initApp()
```


**`App.tsx`:**

```tsx
import React, { useEffect } from 'react'
import { Routes, Route, useParams, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { createI18n, I18nProvider, useI18n, I18nLink, I18nSwitcher, createReactRouterAdapter } from '@i18n-micro/react'
import type { Locale } from '@i18n-micro/types'
import { Home } from './pages/Home'
import { About } from './pages/About'
import { Components } from './pages/Components'

const localesConfig: Locale[] = [
  { code: 'en', displayName: 'English', iso: 'en-US' },
  { code: 'fr', displayName: 'Français', iso: 'fr-FR' },
  { code: 'de', displayName: 'Deutsch', iso: 'de-DE' },
]

const defaultLocale = 'en'

// Create i18n instance (same as in main.tsx)
const i18n = createI18n({
  locale: defaultLocale,
  fallbackLocale: defaultLocale,
  messages: {
    en: {},
  },
})

// RouterRoot component that creates the adapter
function RouterRoot({ children }: { children?: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const routingStrategy = createReactRouterAdapter(localesConfig, defaultLocale, location, navigate)

  return (
    <I18nProvider
      i18n={i18n}
      locales={localesConfig}
      defaultLocale={defaultLocale}
      routingStrategy={routingStrategy}
    >
      {children}
    </I18nProvider>
  )
}

// Component to handle locale synchronization from URL
function LocaleHandler() {
  const { locale: urlLocale } = useParams<{ locale?: string }>()
  const { setLocale, locale: currentLocale } = useI18n({ locales: localesConfig, defaultLocale })

  useEffect(() => {
    const targetLocale = urlLocale || defaultLocale
    if (currentLocale !== targetLocale) {
      setLocale(targetLocale)
    }
  }, [urlLocale, currentLocale, setLocale])

  return <Outlet />
}

// Navigation component
function Navigation() {
  const { t, getLocales, locale, getLocaleName, switchLocale, localeRoute } = useI18n({ locales: localesConfig, defaultLocale })

  return (
    <nav style={{ marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
      <I18nLink to="/" localeRoute={localeRoute} activeStyle={{ fontWeight: 'bold', backgroundColor: '#e8f5e9' }}>
        {t('nav.home')}
      </I18nLink>
      <I18nLink to="/about" localeRoute={localeRoute} activeStyle={{ fontWeight: 'bold', backgroundColor: '#e8f5e9' }}>
        {t('nav.about')}
      </I18nLink>
      <I18nLink to="/components" localeRoute={localeRoute} activeStyle={{ fontWeight: 'bold', backgroundColor: '#e8f5e9' }}>
        {t('nav.components')}
      </I18nLink>

      <div style={{ marginLeft: 'auto' }}>
        <I18nSwitcher
          locales={getLocales()}
          currentLocale={locale}
          getLocaleName={() => getLocaleName()}
          switchLocale={switchLocale}
          localeRoute={localeRoute}
        />
      </div>
    </nav>
  )
}

function Layout() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <Navigation />
      <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <Outlet />
      </div>
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Default locale routes (en) */}
        <Route element={<LocaleHandler />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/components" element={<Components />} />
        </Route>

        {/* Localized routes */}
        <Route path="/:locale" element={<LocaleHandler />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="components" element={<Components />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <RouterRoot>
      <AppRoutes />
    </RouterRoot>
  )
}
```

### Component Example

```tsx
// pages/Home.tsx
import { useI18n } from '@i18n-micro/react'

export function Home() {
  const { t, tc, tn, td, tdr, locale } = useI18n()

  return (
    <div>
      <h1>{t('home.title')}</h1>
      <p>{t('home.description')}</p>
      <p>{t('welcome')}</p>
      <p>{t('greeting', { name: 'World' })}</p>
      <p>{tc('apples', 0)}</p>
      <p>{tc('apples', 1)}</p>
      <p>{tc('apples', 5)}</p>
      <p>{t('number', { number: tn(1234.56) })}</p>
      <p>{t('date', { date: td(new Date()) })}</p>
      <p>{t('relativeDate', { relativeDate: tdr(Date.now() - 86400000) })}</p>
      <p>Current locale: {locale}</p>
    </div>
  )
}
```

### Router Integration Example

See the "Full Application Setup" example above for a complete router integration example using the adapter pattern.

## Best Practices

1. **Use Router Adapter**: Always create and provide a router adapter for proper locale path handling
2. **Create Adapter in RouterRoot**: Create the router adapter inside a component that has access to router hooks (`useLocation`, `useNavigate`)
3. **Lazy Load Translations**: Load translations on demand to reduce initial bundle size
4. **Use Route-Specific Translations**: Organize translations by route for better maintainability
5. **Handle Missing Translations**: Set up a missing handler for production error tracking
6. **Preload Common Locales**: Preload frequently used locales in the background
7. **Use TypeScript**: Leverage type definitions for better IDE support
8. **Cache Management**: Clear cache when needed, especially after updates
9. **Error Handling**: Always handle translation loading errors gracefully
10. **Use Components**: Prefer `I18nLink` and `I18nSwitcher` components over manual link generation
11. **Router Adapter Reusability**: Create the router adapter once in `RouterRoot` and reuse it throughout the app
12. **URL-based Locale Detection**: Use URL-based locale detection for better SEO and user experience

## Resources

- **Repository**: [https://github.com/s00d/nuxt-i18n-micro](https://github.com/s00d/nuxt-i18n-micro)
- **Documentation**: [https://s00d.github.io/nuxt-i18n-micro/](https://s00d.github.io/nuxt-i18n-micro/)

## License

MIT

