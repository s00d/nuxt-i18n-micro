---
outline: deep
---

# 🌐 Vue Package (`@i18n-micro/vue`)

The `@i18n-micro/vue` package provides a lightweight, high-performance internationalization solution for Vue 3 applications. It shares the same core logic as Nuxt I18n Micro, offering reactive translations, route-specific support, and full TypeScript support.

## 📖 Overview

`@i18n-micro/vue` is designed for Vue 3 applications that need internationalization without the Nuxt framework. It provides:

- 🚀 **Lightweight** - Uses shared core logic from `@i18n-micro/core`
- ⚡ **Reactive** - Automatic component updates when translations change
- 🔄 **Route-specific translations** - Support for page-level translations
- 🌍 **Pluralization** - Built-in plural form support
- 📅 **Formatting** - Number, date, and relative time formatting
- 🔧 **Type-safe** - Full TypeScript support
- 🛣️ **Router integration** - Optional Vue Router support with two-way binding
- 🛠️ **DevTools Integration** - Built-in Vue DevTools support for managing translations

## 🚀 Installation

Install the package using your preferred package manager:

::: code-group

```bash [npm]
npm install @i18n-micro/vue
```

```bash [yarn]
yarn add @i18n-micro/vue
```

```bash [pnpm]
pnpm add @i18n-micro/vue
```

```bash [bun]
bun add @i18n-micro/vue
```

:::

### Peer Dependencies

The package requires Vue 3 and optionally Vue Router:

```json
{
  "peerDependencies": {
    "vue": "^3.3.0",
    "vue-router": "^4.0.0"
  }
}
```

## 🎯 Quick Start

### Basic Setup

```typescript
import { createApp } from 'vue'
import { createI18n } from '@i18n-micro/vue'
import App from './App.vue'

const app = createApp(App)

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

app.use(i18n)
app.mount('#app')
```

### Usage in Components

```vue
<template>
  <div>
    <p>{{ t('greeting', { name: 'World' }) }}</p>
    <p>{{ tc('apples', 5) }}</p>
    <p>{{ tn(1234.56) }}</p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@i18n-micro/vue'

const { t, tc, tn, locale } = useI18n()

// Change locale reactively
locale.value = 'fr'
</script>
```

## ⚙️ Core API

### `createI18n(options: VueI18nOptions)`

Creates and installs the i18n plugin for your Vue application.

**Parameters:**

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `locale` | `string` | ✅ | - | Current locale code (e.g., `'en'`) |
| `fallbackLocale` | `string` | ❌ | Same as `locale` | Fallback locale when translation is missing |
| `messages` | `Record<string, Translations>` | ❌ | `{}` | Initial translation messages |
| `plural` | `PluralFunc` | ❌ | `defaultPlural` | Custom pluralization function |
| `missingWarn` | `boolean` | ❌ | `false` | Show console warnings for missing translations |
| `missingHandler` | `(locale: string, key: string, routeName: string) => void` | ❌ | - | Custom handler for missing translations |

**Returns:** `Plugin & { global: VueI18n }`

The returned object contains:
- `global`: The `VueI18n` instance for direct access
- `install`: Vue plugin install function

**Example:**

```typescript
import { createApp } from 'vue'
import { createI18n } from '@i18n-micro/vue'

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

const app = createApp(App)
app.use(i18n)
```

### `VueI18n` Class

The core i18n instance class that handles all translation logic.

#### Properties

- `locale: Ref<string>` - Current locale (reactive)
- `fallbackLocale: Ref<string>` - Fallback locale (reactive)
- `currentRoute: Ref<string>` - Current route name (reactive)

#### Methods

##### `t(key: string, params?: Params, defaultValue?: string | null, routeName?: string): CleanTranslation`

Translates a key with optional parameters and fallback value.

```typescript
const i18n = createI18n({ /* ... */ })

// Basic translation
i18n.global.t('welcome') // "Welcome"

// With parameters
i18n.global.t('greeting', { name: 'John' }) // "Hello, John!"

// With default value
i18n.global.t('missing', {}, 'Default text') // "Default text"

// Route-specific translation
i18n.global.t('title', {}, null, 'home') // Uses 'home' route translations
```

##### `ts(key: string, params?: Params, defaultValue?: string, routeName?: string): string`

Same as `t()` but always returns a string.

##### `tc(key: string, count: number | Params, defaultValue?: string): string`

Pluralization-aware translation.

```typescript
// With count number
i18n.global.tc('apples', 0) // "no apples"
i18n.global.tc('apples', 1) // "one apple"
i18n.global.tc('apples', 5) // "5 apples"

// With params object
i18n.global.tc('items', { count: 3, type: 'books' })
```

##### `tn(value: number, options?: Intl.NumberFormatOptions): string`

Formats a number according to the current locale.

```typescript
i18n.global.tn(1234.56) // "1,234.56" (en) or "1 234,56" (fr)
i18n.global.tn(1234.56, { style: 'currency', currency: 'USD' }) // "$1,234.56"
```

##### `td(value: Date | number | string, options?: Intl.DateTimeFormatOptions): string`

Formats a date according to the current locale.

```typescript
i18n.global.td(new Date()) // "12/31/2023" (en) or "31/12/2023" (fr)
i18n.global.td(new Date(), { dateStyle: 'full' }) // "Sunday, December 31, 2023"
```

##### `tdr(value: Date | number | string, options?: Intl.RelativeTimeFormatOptions): string`

Formats a relative time (e.g., "2 hours ago").

```typescript
const yesterday = new Date()
yesterday.setDate(yesterday.getDate() - 1)
i18n.global.tdr(yesterday) // "yesterday"
i18n.global.tdr(Date.now() - 3600000) // "1 hour ago"
```

##### `has(key: string, routeName?: string): boolean`

Checks if a translation key exists.

```typescript
i18n.global.has('welcome') // true
i18n.global.has('missing') // false
```

##### `addTranslations(locale: string, translations: Translations, merge?: boolean): void`

Adds or merges translations for a locale.

```typescript
// Add new translations
i18n.global.addTranslations('en', {
  newKey: 'New translation',
})

// Replace existing (merge = false)
i18n.global.addTranslations('en', {
  welcome: 'New Welcome',
}, false)
```

##### `addRouteTranslations(locale: string, routeName: string, translations: Translations, merge?: boolean): void`

Adds route-specific translations.

```typescript
i18n.global.addRouteTranslations('en', 'home', {
  title: 'Home Page',
  description: 'Welcome to our home page',
})
```

##### `mergeTranslations(locale: string, routeName: string, translations: Translations): void`

Merges translations into existing route translations.

##### `mergeGlobalTranslations(locale: string, translations: Translations): void`

Merges translations into global translations.

##### `clearCache(): void`

Clears the translation cache.

##### `setRoute(routeName: string): void`

Sets the current route name for route-specific translations.

##### `getRoute(): string`

Gets the current route name.

## 🛠️ Composable: `useI18n`

The `useI18n` composable provides access to i18n functionality in Vue components.

### Basic Usage

```vue
<script setup lang="ts">
import { useI18n } from '@i18n-micro/vue'

const { t, locale, fallbackLocale } = useI18n()
</script>
```

### API Reference

#### Reactive Properties

##### `locale: ComputedRef<string>`

Current locale (writable).

```typescript
const { locale } = useI18n()

// Read
console.log(locale.value) // "en"

// Write
locale.value = 'fr'
```

##### `fallbackLocale: ComputedRef<string>`

Fallback locale (writable).

##### `currentRoute: ComputedRef<string>`

Current route name (writable).

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

#### Route Management

##### `setRoute(routeName: string): void`

Set current route.

##### `getRoute(): string`

Get current route.

##### `getRouteName(r?: Route): string`

Get route name from Vue Router route.

##### `getLocale(r?: Route): string`

Get locale from Vue Router route.

#### Locale Management

##### `getLocales(): Locale[]`

Get all available locales.

```typescript
const { getLocales } = useI18n()
const locales = getLocales()
// [{ code: 'en', iso: 'en-US' }, { code: 'fr', iso: 'fr-FR' }]
```

##### `defaultLocale(): string`

Get default locale.

##### `getLocaleName(): string | null`

Get current locale display name.

#### Router Integration (if Vue Router is available)

##### `switchLocale(locale: string): void`

Switch locale and navigate to localized route.

```typescript
const { switchLocale } = useI18n()
switchLocale('fr') // Navigates to /fr/current-path
```

##### `switchLocaleRoute(locale: string): RouteLocationRaw`

Switch locale and return the new route location.

##### `switchLocalePath(locale: string): string`

Switch locale and return the new path.

##### `localeRoute(to: RouteLocationRaw | string, locale?: string): RouteLocationRaw | string`

Get localized route for a given route.

```typescript
const { localeRoute } = useI18n()
const route = localeRoute('/about', 'fr') // Returns localized route
```

##### `localePath(to: RouteLocationRaw | string, locale?: string): string`

Get localized path for a given route.

#### Translation Management

##### `addTranslations(locale: string, translations: Record<string, unknown>, merge?: boolean): void`

Add translations.

##### `addRouteTranslations(locale: string, routeName: string, translations: Record<string, unknown>, merge?: boolean): void`

Add route-specific translations.

##### `mergeTranslations(locale: string, routeName: string, translations: Record<string, unknown>): void`

Merge route translations.

##### `mergeGlobalTranslations(locale: string, translations: Record<string, unknown>): void`

Merge global translations.

##### `clearCache(): void`

Clear translation cache.

### Complete Example

```vue
<template>
  <div>
    <h1>{{ t('welcome') }}</h1>
    <p>{{ t('greeting', { name: userName }) }}</p>
    <p>{{ tc('items', itemCount) }}</p>
    <p>{{ tn(price) }}</p>
    <p>{{ td(new Date()) }}</p>
    
    <button @click="switchLocale('fr')">
      Switch to French
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@i18n-micro/vue'

const { t, tc, tn, td, switchLocale } = useI18n()

const userName = ref('John')
const itemCount = ref(5)
const price = ref(1234.56)
</script>
```

## 🎨 Components

### `<I18nT>`

Translation component with support for pluralization, formatting, and slots.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `keypath` | `string` | ✅ | - | Translation key path |
| `params` | `Record<string, string \| number \| boolean>` | ❌ | `{}` | Parameters for interpolation |
| `defaultValue` | `string` | ❌ | `''` | Default value if key not found |
| `plural` | `number \| string` | ❌ | - | Count for pluralization |
| `number` | `number \| string` | ❌ | - | Number to format and interpolate |
| `date` | `Date \| string \| number` | ❌ | - | Date to format and interpolate |
| `relativeDate` | `Date \| string \| number` | ❌ | - | Relative date to format |
| `tag` | `string` | ❌ | `'span'` | HTML tag to wrap content |
| `html` | `boolean` | ❌ | `false` | Render as HTML |
| `hideIfEmpty` | `boolean` | ❌ | `false` | Hide if translation is empty |
| `customPluralRule` | `PluralFunc` | ❌ | - | Custom pluralization function |

#### Examples

**Basic Usage:**

```vue
<template>
  <I18nT keypath="welcome" />
</template>
```

**With Parameters:**

```vue
<template>
  <I18nT keypath="greeting" :params="{ name: 'John' }" />
</template>
```

**Pluralization:**

```vue
<template>
  <I18nT keypath="apples" :plural="5" />
</template>
```

```json
{
  "apples": "no apples | one apple | {count} apples"
}
```

**Number Formatting:**

```vue
<template>
  <I18nT keypath="price" :number="1234.56" />
</template>
```

```json
{
  "price": "Price: {number}"
}
```

**Date Formatting:**

```vue
<template>
  <I18nT keypath="date" :date="new Date()" />
</template>
```

**Relative Date:**

```vue
<template>
  <I18nT keypath="relative" :relative-date="yesterday" />
</template>
```

**HTML Rendering:**

```vue
<template>
  <I18nT keypath="htmlContent" html />
</template>
```

**Custom Tag:**

```vue
<template>
  <I18nT keypath="title" tag="h1" />
</template>
```

**With Slots:**

```vue
<template>
  <I18nT keypath="message">
    <template #link>
      <a href="/about">Learn more</a>
    </template>
  </I18nT>
</template>
```

```json
{
  "message": "Click {link} to learn more"
}
```

**Default Slot:**

```vue
<template>
  <I18nT keypath="welcome">
    <template #default="{ translation }">
      <strong>{{ translation }}</strong>
    </template>
  </I18nT>
</template>
```

### `<I18nLink>`

Localized router link component that automatically handles locale prefixes.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `to` | `RouteLocationRaw \| string` | ✅ | - | Route to navigate to |
| `activeStyle` | `Partial<CSSStyleDeclaration>` | ❌ | `{}` | Styles when link is active |

#### Examples

**Basic Usage:**

```vue
<template>
  <I18nLink to="/about">
    About Us
  </I18nLink>
</template>
```

**With Active State:**

```vue
<template>
  <I18nLink to="/about" :active-style="{ fontWeight: 'bold' }">
    About Us
  </I18nLink>
</template>
```

**External Links:**

The component automatically detects external links and renders them as `<a>` tags with `target="_blank"`.

```vue
<template>
  <I18nLink to="https://example.com">
    External Link
  </I18nLink>
</template>
```

### `<I18nGroup>`

Component for grouping translations with a common prefix using scoped slots.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `prefix` | `string` | ✅ | - | Translation key prefix |
| `groupClass` | `string` | ❌ | `''` | CSS class for the wrapper |

#### Examples

```vue
<template>
  <I18nGroup prefix="user">
    <template #default="{ t }">
      <h1>{{ t('name') }}</h1>
      <p>{{ t('email') }}</p>
      <p>{{ t('bio') }}</p>
    </template>
  </I18nGroup>
</template>
```

This will translate keys like `user.name`, `user.email`, `user.bio` using the `t` function provided by the slot.

### `<I18nSwitcher>`

Language switcher dropdown component with full customization support.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `customLabels` | `Record<string, string>` | ❌ | `{}` | Custom labels for locales |
| `customWrapperStyle` | `CSSProperties` | ❌ | `{}` | Custom wrapper styles |
| `customButtonStyle` | `CSSProperties` | ❌ | `{}` | Custom button styles |
| `customDropdownStyle` | `CSSProperties` | ❌ | `{}` | Custom dropdown styles |
| `customItemStyle` | `CSSProperties` | ❌ | `{}` | Custom item styles |
| `customLinkStyle` | `CSSProperties` | ❌ | `{}` | Custom link styles |
| `customActiveLinkStyle` | `CSSProperties` | ❌ | `{}` | Custom active link styles |
| `customDisabledLinkStyle` | `CSSProperties` | ❌ | `{}` | Custom disabled link styles |
| `customIconStyle` | `CSSProperties` | ❌ | `{}` | Custom icon styles |

#### Slots

- `before-button` - Content before the button
- `before-selected-locale` - Content before selected locale in button
- `after-selected-locale` - Content after selected locale in button
- `before-dropdown` - Content before dropdown
- `before-dropdown-items` - Content before dropdown items
- `before-item` - Content before each locale item
- `before-link-content` - Content before link text
- `after-link-content` - Content after link text
- `after-item` - Content after each locale item
- `after-dropdown-items` - Content after dropdown items
- `after-dropdown` - Content after dropdown

#### Examples

**Basic Usage:**

```vue
<template>
  <I18nSwitcher />
</template>
```

**With Custom Labels:**

```vue
<template>
  <I18nSwitcher :custom-labels="{
    en: 'English',
    fr: 'Français',
    de: 'Deutsch'
  }" />
</template>
```

**With Custom Styling:**

```vue
<template>
  <I18nSwitcher
    :custom-button-style="{
      backgroundColor: '#007bff',
      color: 'white',
      borderRadius: '4px'
    }"
    :custom-dropdown-style="{
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }"
  />
</template>
```

**With Slots:**

```vue
<template>
  <I18nSwitcher>
    <template #before-selected-locale>
      <span>🌐</span>
    </template>
    <template #after-selected-locale>
      <span>▼</span>
    </template>
  </I18nSwitcher>
</template>
```


## 🛣️ Router Integration

### `setupRouterIntegration(options: RouterIntegrationOptions)`

Sets up automatic route and locale detection from Vue Router with two-way binding. This function automatically:
- Syncs route changes to i18n state (Route → State)
- Syncs locale changes to URL (State → Route)
- Handles locale redirects automatically

**Options:**

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `router` | `Router` | ✅ | Vue Router instance |
| `i18n` | `VueI18n` | ✅ | VueI18n instance |
| `defaultLocale` | `string` | ❌ | Default locale code |
| `locales` | `string[]` | ❌ | Available locale codes |

**Returns:** `() => void` - Cleanup function to unsubscribe from router and locale watchers

**Example:**

```typescript
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createI18n, setupRouterIntegration } from '@i18n-micro/vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/:locale', component: Home },
    { path: '/:locale/about', component: About },
  ],
})

const i18n = createI18n({
  locale: 'en',
  messages: { /* ... */ },
})

const app = createApp(App)
app.use(router)
app.use(i18n)

// Setup router integration
const unwatchRouterIntegration = setupRouterIntegration({
  router,
  i18n: i18n.global,
  defaultLocale: 'en',
  locales: ['en', 'fr', 'de'],
})

// Cleanup on app unmount (optional, but recommended)
app.onUnmount(() => {
  unwatchRouterIntegration()
})
```

**Two-Way Binding:**

The integration provides automatic two-way synchronization:

1. **Route → State**: When the route changes, the locale and route name are automatically updated in i18n state
2. **State → Route**: When you change `locale.value` programmatically, the URL is automatically updated

```typescript
const { locale } = useI18n()

// Changing locale will automatically update the URL
locale.value = 'fr' // URL changes to /fr/current-path
```

### Route-Specific Translations

You can add translations specific to routes:

```typescript
import { useI18n } from '@i18n-micro/vue'

const { addRouteTranslations, setRoute } = useI18n()

// Add translations for 'home' route
addRouteTranslations('en', 'home', {
  title: 'Home Page',
  description: 'Welcome to our home page',
})

// Set current route
setRoute('home')

// Now t() will use route-specific translations
const { t } = useI18n()
console.log(t('title')) // "Home Page"
```

### Automatic Route Detection

With `setupRouterIntegration`, the route and locale are automatically detected from Vue Router:

- Route name is extracted from `route.name` or `route.path`
- Locale is extracted from `route.params.locale` or path segments
- Updates happen automatically on route changes
- Locale redirects are handled automatically (no need for `<LocaleRedirect>` component)

## 📥 Async Translation Loading

### Loading from JSON Files

Load translations dynamically from JSON files:

```typescript
import { createApp } from 'vue'
import { createI18n } from '@i18n-micro/vue'

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
    i18n.global.addTranslations(locale, messages.default, false)
  } catch (error) {
    console.error(`Failed to load translations for locale: ${locale}`, error)
  }
}

// Initialize app
async function initApp() {
  // Load initial locale
  await loadTranslations('en')

  // Preload other locales in background
  Promise.all([
    loadTranslations('fr'),
    loadTranslations('de'),
  ]).catch(() => {
    // Ignore errors for preloading
  })

  const app = createApp(App)
  app.use(i18n)
  app.mount('#app')
}

// Start the app
initApp()
```

### Loading from API

Load translations from an API endpoint:

```typescript
async function loadTranslationsFromAPI(locale: string) {
  try {
    const response = await fetch(`/api/translations/${locale}`)
    const translations = await response.json()
    i18n.global.addTranslations(locale, translations, false)
  } catch (error) {
    console.error(`Failed to load translations: ${error}`)
  }
}

// Load on demand
const { locale } = useI18n()
watch(locale, async (newLocale) => {
  await loadTranslationsFromAPI(newLocale)
})
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
const { locale, switchLocale } = useI18n()

async function handleLocaleSwitch(newLocale: string) {
  await ensureLocaleLoaded(newLocale)
  switchLocale(newLocale)
}
```

### Error Handling

Handle loading errors gracefully:

```typescript
async function loadTranslationsWithFallback(locale: string) {
  try {
    const messages = await import(`./locales/${locale}.json`)
    i18n.global.addTranslations(locale, messages.default, false)
  } catch (error) {
    console.warn(`Failed to load ${locale}, using fallback`)
    // Load fallback locale
    if (locale !== 'en') {
      await loadTranslationsWithFallback('en')
    }
  }
}
```

## 🔧 Advanced Features

### Custom Pluralization

Define custom pluralization rules:

```typescript
import { createI18n, defaultPlural } from '@i18n-micro/vue'

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
i18n.global.addTranslations('en', {
  title: 'Global Title',
})

// Route-specific translation (higher priority)
i18n.global.addRouteTranslations('en', 'home', {
  title: 'Home Page Title',
})

i18n.global.setRoute('home')
i18n.global.t('title') // "Home Page Title" (route-specific)

i18n.global.setRoute('about')
i18n.global.t('title') // "Global Title" (global)
```

## 🛠️ DevTools Integration

The package includes built-in Vue DevTools integration for managing translations during development.

### Setup

Install Vue DevTools plugin for Vite:

```bash
npm add -D vite-plugin-vue-devtools @vue/devtools-api
```

Add to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevtools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    VueDevtools(),
  ],
})
```

### Usage

Call `setupVueDevTools` after creating your i18n instance:

```typescript
import { createI18n, setupVueDevTools } from '@i18n-micro/vue'

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: { /* ... */ },
})

// Setup DevTools integration
setupVueDevTools({
  i18n: i18n.global,
  locales: [
    { code: 'en', displayName: 'English', iso: 'en-US' },
    { code: 'fr', displayName: 'Français', iso: 'fr-FR' },
  ],
  defaultLocale: 'en',
  translationDir: 'src/locales', // Optional: for file-based translations
})
```

### Features

The DevTools integration provides:

- **View All Translations** - Browse all translation files in your project
- **Edit Translations** - Visual editor for editing translation keys and values
- **Save Changes** - Save translations directly (uses localStorage in browser, file system in Node.js)
- **View Configuration** - See current i18n configuration
- **Statistics** - View translation statistics and missing keys

### Accessing DevTools

1. Start your dev server: `npm run dev`
2. Open Vue DevTools (browser extension or standalone app)
3. Click on the "i18n Micro" tab to open the translation editor

**Note:** DevTools are only available in development mode.

## 🔍 SEO and Meta Tags

### `useLocaleHead(options?: UseLocaleHeadOptions)`

Composable for generating SEO meta tags.

**Options:**

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `addDirAttribute` | `boolean` | ❌ | `true` | Add `dir` attribute to HTML |
| `identifierAttribute` | `string` | ❌ | `'id'` | Attribute name for meta tag identification |
| `addSeoAttributes` | `boolean` | ❌ | `true` | Generate SEO meta tags |
| `baseUrl` | `string \| (() => string)` | ❌ | `'/'` | Base URL for canonical/hreflang links |

**Returns:**

```typescript
{
  metaObject: Ref<MetaObject>,
  updateMeta: (canonicalQueryWhitelist?: string[]) => void
}
```

**Example:**

```vue
<template>
  <div>
    <!-- Your content -->
  </div>
</template>

<script setup lang="ts">
import { useLocaleHead } from '@i18n-micro/vue'
import { useHead } from '@unhead/vue' // or useHead from VueUse

const { metaObject, updateMeta } = useLocaleHead({
  baseUrl: 'https://example.com',
  addSeoAttributes: true,
})

// Update meta when route changes
watch(() => route.path, () => {
  updateMeta(['page', 'sort']) // Whitelist query params for canonical
})

// Use with useHead
useHead({
  htmlAttrs: computed(() => metaObject.value.htmlAttrs),
  link: computed(() => metaObject.value.link),
  meta: computed(() => metaObject.value.meta),
})
</script>
```

**Generated Meta Tags:**

- `html[lang]` - Language attribute
- `html[dir]` - Text direction (if enabled)
- `link[rel="canonical"]` - Canonical URL
- `link[rel="alternate"][hreflang]` - Alternate language links
- `meta[property="og:locale"]` - Open Graph locale
- `meta[property="og:url"]` - Open Graph URL
- `meta[property="og:locale:alternate"]` - Alternate Open Graph locales

## 📘 TypeScript Support

### Type Definitions

All types are exported from the package:

```typescript
import type {
  VueI18nOptions,
  Translations,
  Params,
  PluralFunc,
  CleanTranslation,
  Locale,
  LocaleCode,
  Getter,
} from '@i18n-micro/vue'
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

## 📚 Complete Examples

### Full Application Setup

```typescript
// main.ts
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createI18n, setupRouterIntegration, I18nLocalesKey, I18nDefaultLocaleKey } from '@i18n-micro/vue'
import type { Locale } from '@i18n-micro/types'
import App from './App.vue'
import Home from './pages/Home.vue'
import About from './pages/About.vue'

const localesConfig: Locale[] = [
  { code: 'en', displayName: 'English', iso: 'en-US' },
  { code: 'fr', displayName: 'Français', iso: 'fr-FR' },
  { code: 'de', displayName: 'Deutsch', iso: 'de-DE' },
]

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About },
    { path: '/:locale', component: Home },
    { path: '/:locale/about', component: About },
  ],
})

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {},
  },
})

// Async load translations
// Async load translations
async function loadTranslations(locale: string) {
  try {
    const messages = await import(`./locales/${locale}.json`)
    i18n.global.addTranslations(locale, messages.default, false)
  } catch (error) {
    console.error(`Failed to load translations for locale: ${locale}`, error)
  }
}

// Initialize app
async function initApp() {
  // Load initial locale
  await loadTranslations('en')

  // Preload other locales in background
  Promise.all([
    loadTranslations('fr'),
    loadTranslations('de'),
  ]).catch(() => {
    // Ignore errors for preloading
  })

  const app = createApp(App)
  app.use(router)
  app.use(i18n)

  // Setup router integration
  const unwatchRouterIntegration = setupRouterIntegration({
    router,
    i18n: i18n.global,
    defaultLocale: 'en',
    locales: ['en', 'fr', 'de'],
  })

  // Cleanup on app unmount (optional, but recommended)
  app.onUnmount(() => {
    unwatchRouterIntegration()
  })

  // Provide locales configuration
  app.provide(I18nLocalesKey, localesConfig)
  app.provide(I18nDefaultLocaleKey, 'en')

  app.mount('#app')
}

// Start the app
initApp()
```

### Component Example

```vue
<template>
  <div>
    <h1><I18nT keypath="welcome" tag="h1" /></h1>
    
    <p>
      <I18nT keypath="greeting" :params="{ name: userName }" />
    </p>
    
    <p>
      <I18nT keypath="items" :plural="itemCount" />
    </p>
    
    <div>
      <I18nLink to="/about" :active-style="{ fontWeight: 'bold' }">
        <I18nT keypath="nav.about" />
      </I18nLink>
    </div>
    
    <I18nSwitcher />
    
    <I18nGroup prefix="user">
      <template #default="{ t }">
        <h2>{{ t('profile') }}</h2>
        <p>{{ t('name') }}: {{ userName }}</p>
        <p>{{ t('email') }}: {{ userEmail }}</p>
      </template>
    </I18nGroup>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { I18nT, I18nLink, I18nSwitcher, I18nGroup, useI18n } from '@i18n-micro/vue'

const { t, locale } = useI18n()

const userName = ref('John Doe')
const userEmail = ref('john@example.com')
const itemCount = ref(5)
</script>
```

## 🎯 Best Practices

1. **Lazy Load Translations**: Load translations on demand to reduce initial bundle size
2. **Use Route-Specific Translations**: Organize translations by route for better maintainability
3. **Handle Missing Translations**: Set up a missing handler for production error tracking
4. **Preload Common Locales**: Preload frequently used locales in the background
5. **Use TypeScript**: Leverage type definitions for better IDE support
6. **Cache Management**: Clear cache when needed, especially after updates
7. **SEO Optimization**: Use `useLocaleHead` for proper SEO meta tags
8. **Error Handling**: Always handle translation loading errors gracefully

## 🔗 Related Documentation

- [Getting Started](../guide/getting-started.md) - Nuxt I18n Micro setup
- [Components](../components/) - Component documentation
- [Composables](../composables/) - Composable documentation
- [API Reference](../api/) - Complete API documentation

