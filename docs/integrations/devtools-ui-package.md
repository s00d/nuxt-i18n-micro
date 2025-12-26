---
outline: deep
---

# DevTools UI Package (`@i18n-micro/devtools-ui`)

The `@i18n-micro/devtools-ui` package provides a standalone development tools interface for managing translations. It includes a Vite plugin for automatic integration and a universal bridge system for framework-agnostic i18n support.

## Overview

`@i18n-micro/devtools-ui` is a self-contained package that provides:

- **Vite Plugin** - Automatic button injection and API endpoints
- **Universal Bridge** - Framework-agnostic bridge creation for any i18n implementation
- **Web Component** - Custom element for the DevTools UI
- **File Operations** - List, load, and save translation files via API

## Installation

Install the package using your preferred package manager:

::: code-group

```bash [npm]
npm install -D @i18n-micro/devtools-ui
```

```bash [yarn]
yarn add -D @i18n-micro/devtools-ui
```

```bash [pnpm]
pnpm add -D @i18n-micro/devtools-ui
```

```bash [bun]
bun add -D @i18n-micro/devtools-ui
```

:::

## Quick Start

### Vite Plugin Setup

The easiest way to use DevTools is through the Vite plugin, which automatically injects a floating button and provides all necessary API endpoints:

```typescript
import { defineConfig } from 'vite'
import { i18nDevToolsPlugin } from '@i18n-micro/devtools-ui/vite'

export default defineConfig({
  plugins: [
    // ... other plugins
    i18nDevToolsPlugin({
      base: '/__i18n_api', // Optional: API endpoint base path (default: '/__i18n_api')
      translationDir: 'src/locales', // Optional: translation files directory
      injectButton: true, // Optional: automatically inject floating button (default: true)
    }),
  ],
})
```

### Plugin Options

```typescript
interface DevToolsPluginOptions {
  base?: string // API endpoint base path (default: '/__i18n_api')
  translationDir?: string // Translation files directory (default: 'src/locales')
  injectButton?: boolean // Automatically inject floating button (default: true)
}
```

## Features

### Automatic Button Injection

The plugin automatically injects a floating button in the bottom right corner of your application:

- **Smart Hiding** - Button hides when cursor is far away (>200px)
- **Partial Visibility** - Even when hidden, a small part remains visible for easy access
- **Smooth Animations** - Transitions and hover effects for better UX
- **Auto-show on Hover** - Button fully appears when you hover over the visible part

### API Endpoints

The plugin provides the following API endpoints:

#### `GET /__i18n_api/files`

Get list of all translation files and directory structure.

**Response:**
```json
{
  "files": ["en.json", "fr.json", "pages/home/en.json"],
  "structure": {
    "en.json": "en.json",
    "fr.json": "fr.json",
    "pages": {
      "home": {
        "en.json": "pages/home/en.json"
      }
    }
  }
}
```

#### `GET /__i18n_api/file?path=...`

Load a specific translation file.

**Query Parameters:**
- `path` - Relative path to the translation file (e.g., `en.json` or `pages/home/en.json`)

**Response:**
```json
{
  "success": true,
  "content": {
    "welcome": "Welcome",
    "hello": "Hello"
  },
  "path": "en.json"
}
```

#### `POST /__i18n_api/save`

Save translation content to a file.

**Request Body:**
```json
{
  "file": "en.json",
  "content": {
    "welcome": "Welcome",
    "hello": "Hello"
  }
}
```

**Response:**
```json
{
  "success": true
}
```

#### `GET /__i18n_api/config`

Get i18n configuration.

**Response:**
```json
{
  "defaultLocale": "en",
  "fallbackLocale": "en",
  "locales": [
    { "code": "en", "displayName": "English", "iso": "en-US" }
  ],
  "translationDir": "src/locales"
}
```

## Universal Bridge

The package provides a universal bridge creation function that works with any i18n implementation:

```typescript
import { createBridge } from '@i18n-micro/devtools-ui'
import type { BridgeAdapter } from '@i18n-micro/devtools-ui'

// Create an adapter for your i18n instance
const adapter: BridgeAdapter = {
  getGeneralCache: () => i18nInstance.cache.general,
  getRouteCache: () => i18nInstance.cache.route,
  addTranslations: (locale, content, merge) => {
    i18nInstance.addTranslations(locale, content, merge)
  },
  addRouteTranslations: (locale, routeName, content, merge) => {
    i18nInstance.addRouteTranslations(locale, routeName, content, merge)
  },
  subscribe: (callback) => {
    return i18nInstance.subscribe(callback)
  },
  getCurrentLocale: () => i18nInstance.locale,
  getFallbackLocale: () => i18nInstance.fallbackLocale,
}

// Create bridge
const bridge = createBridge({
  adapter,
  locales: localesConfig,
  defaultLocale: 'en',
  translationDir: 'src/locales',
})
```

### Bridge Adapter Interface

```typescript
interface BridgeAdapter {
  // Get general (global) translations cache
  getGeneralCache: () => Record<string, TranslationContent>

  // Get route-specific translations cache
  // Keys are in format "locale:routeName" (e.g., "en:home")
  getRouteCache: () => Record<string, TranslationContent>

  // Add or update translations for a locale
  addTranslations: (locale: string, content: TranslationContent, merge: boolean) => void

  // Add or update route-specific translations
  addRouteTranslations: (locale: string, routeName: string, content: TranslationContent, merge: boolean) => void

  // Subscribe to changes in translations
  subscribe: (callback: () => void) => () => void

  // Get current locale (optional)
  getCurrentLocale?: () => string

  // Get fallback locale (optional)
  getFallbackLocale?: () => string
}
```

## Web Component

The package exports a custom element that can be used directly:

```typescript
import { register } from '@i18n-micro/devtools-ui'

// Register the custom element
register()

// Create and use the element
const element = document.createElement('i18n-devtools-ui')
element.bridge = bridge
document.body.appendChild(element)
```

## Framework Integration

### Vue

```typescript
import { i18nDevToolsPlugin } from '@i18n-micro/devtools-ui/vite'

export default defineConfig({
  plugins: [
    vue(),
    i18nDevToolsPlugin({
      translationDir: 'src/locales',
    }),
  ],
})
```

### React

```typescript
import { i18nDevToolsPlugin } from '@i18n-micro/devtools-ui/vite'

export default defineConfig({
  plugins: [
    react(),
    i18nDevToolsPlugin({
      translationDir: 'src/locales',
    }),
  ],
})
```

### Solid

```typescript
import { i18nDevToolsPlugin } from '@i18n-micro/devtools-ui/vite'

export default defineConfig({
  plugins: [
    solidPlugin(),
    i18nDevToolsPlugin({
      translationDir: 'src/locales',
    }),
  ],
})
```

### Astro

```javascript
import { i18nDevToolsPlugin } from '@i18n-micro/devtools-ui/vite'

export default defineConfig({
  vite: {
    plugins: [
      i18nDevToolsPlugin({
        translationDir: 'src/locales',
      }),
    ],
  },
})
```

## Security

The plugin includes security measures:

- **Path Traversal Prevention** - All file paths are validated to ensure they stay within the project root
- **File Extension Validation** - Only `.json` files can be saved
- **Project Root Validation** - Files can only be accessed within the configured project root

## Development vs Production

- **Development Only** - The plugin only works in development mode (`apply: 'serve'`)
- **No Production Impact** - The plugin is automatically excluded from production builds
- **Zero Runtime Overhead** - No code is included in production bundles

## TypeScript Support

The package provides full TypeScript support:

```typescript
import type { 
  I18nDevToolsBridge,
  BridgeAdapter,
  CreateBridgeOptions,
  TranslationContent,
  LocaleData
} from '@i18n-micro/devtools-ui'
```

## Examples

### Custom Bridge Implementation

```typescript
import { createBridge } from '@i18n-micro/devtools-ui'
import type { BridgeAdapter } from '@i18n-micro/devtools-ui'

class CustomI18n {
  private cache = {
    general: {},
    route: {},
  }

  addTranslations(locale: string, content: Record<string, unknown>) {
    this.cache.general[locale] = content
  }

  subscribe(callback: () => void) {
    // Your subscription logic
    return () => {} // unsubscribe
  }
}

const customI18n = new CustomI18n()

const adapter: BridgeAdapter = {
  getGeneralCache: () => customI18n.cache.general,
  getRouteCache: () => customI18n.cache.route,
  addTranslations: (locale, content) => {
    customI18n.addTranslations(locale, content)
  },
  addRouteTranslations: () => {}, // Not implemented
  subscribe: (callback) => customI18n.subscribe(callback),
}

const bridge = createBridge({
  adapter,
  locales: [{ code: 'en', displayName: 'English' }],
  defaultLocale: 'en',
})
```

## Resources

- **Repository**: [https://github.com/s00d/nuxt-i18n-micro](https://github.com/s00d/nuxt-i18n-micro)
- **Documentation**: [https://s00d.github.io/nuxt-i18n-micro/](https://s00d.github.io/nuxt-i18n-micro/)

## License

MIT
