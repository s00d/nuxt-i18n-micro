---
outline: deep
---

# 🏗️ Architecture

This document describes the internal architecture of `Nuxt I18n Micro` and how it works under the hood.

## 📐 Overview

`Nuxt I18n Micro` is built on a clean, modular architecture that separates concerns and maximizes code reuse. The core translation logic is shared across all framework integrations, while each integration provides framework-specific adapters.

## 🧩 Core Components

### 1. **@i18n-micro/core** - Shared Core Logic

The core package (`@i18n-micro/core`) contains the fundamental i18n logic that is shared across all framework integrations:

- **`BaseI18n`**: Abstract base class that provides common translation functionality
  - Translation lookup and caching
  - Pluralization support
  - Parameter interpolation
  - Compiled message caching for performance
  - Fallback locale handling

- **`RouteService`**: Handles locale detection, routing, and navigation logic
  - Locale detection from URL, cookies, and headers
  - Route name resolution
  - Locale switching logic

- **`TranslationHelper`**: Manages translation data caches
  - General locale cache
  - Route-specific cache
  - Dynamic translations cache
  - Server translation cache

- **`FormatService`**: Provides number, date, and relative time formatting

### 2. **NuxtI18n** - Nuxt-Specific Adapter

The `NuxtI18n` class (`src/runtime/i18n.ts`) extends `BaseI18n` and adapts it for the Nuxt environment:

```typescript
export class NuxtI18n extends BaseI18n {
  // Implements abstract methods from BaseI18n
  getLocale(): string
  getRoute(): string
  getFallbackLocale(): string

  // Overrides t() to support Route objects
  override t(
    key: TranslationKey,
    params?: Params,
    defaultValue?: string | null,
    routeOrName?: string | RouteLocationNormalizedLoaded | RouteLocationResolvedGeneric,
    locale?: string,
  ): CleanTranslation
}
```

**Key Features:**
- Integrates with Nuxt's reactivity system through `RouteService`
- Supports passing Vue Router route objects directly to `t()`
- Automatically clears compiled cache when switching locales
- Uses reactive refs for locale and route state

### 3. **Nuxt Plugin** - Integration Layer

The main plugin (`src/runtime/plugins/01.plugin.ts`) serves as the integration layer:

1. **Initialization**: Creates and configures all services
2. **State Management**: Sets up reactive state using `useState`
3. **Instance Creation**: Instantiates `NuxtI18n` with proper configuration
4. **Method Exposure**: Provides methods to the Nuxt app context

```typescript
// Global compiled cache (outside plugin for SSR safety)
const compiledMessageCache = createCompiledCache()

const i18n = new NuxtI18n({
  // BaseI18n options
  plural: plural,
  missingWarn: missingWarn,
  cache: translationCaches,
  compiledCache: compiledMessageCache, // Global cache for SSR

  // NuxtI18n options
  routeService: routeService,
  locales: computed(() => i18nConfig.locales || []),
  defaultLocale: computed(() => i18nConfig.defaultLocale || 'en'),
  // ...
})

// Methods are delegated to i18n instance
const provideData = {
  t: i18n.t.bind(i18n),
  tc: i18n.tc.bind(i18n),
  // ...
}
```

## 🔄 Translation Flow

### 1. Translation Request

When you call `$t('key')` in a component:

```typescript
// Component
const message = $t('welcome', { name: 'Alice' })
```

### 2. Method Delegation

The `$t` method is bound to `i18n.t()`:

```typescript
// Plugin provides
t: i18n.t.bind(i18n)
```

### 3. Route Context Resolution

`NuxtI18n.t()` determines the translation context:

```typescript
// If route object is passed
if (routeOrName && typeof routeOrName === 'object') {
  routeLocale = this._routeService.getCurrentLocale(routeOrName)
  routeName = this._routeService.getPluginRouteName(routeOrName, routeLocale)
}

// Otherwise uses current route
const currentLocale = locale || this.getLocale()
const currentRoute = routeName || this.getRoute()
```

### 4. Translation Lookup

`BaseI18n.t()` performs the actual lookup:

1. Checks compiled message cache
2. Looks up in route-specific translations
3. Falls back to general translations
4. Applies fallback locale if needed
5. Compiles and caches the result

### 5. Result Return

The translated value is returned, with parameter interpolation applied if needed.

## 💾 Caching Strategy

### Translation Caches

Multiple layers of caching ensure optimal performance:

1. **General Locale Cache**: Global translations shared across all routes
2. **Route Locale Cache**: Page-specific translations
3. **Dynamic Translations Cache**: Runtime-loaded translations
4. **Server Translation Cache**: Pre-rendered translations for SSR

### Compiled Message Cache

The compiled message cache stores pre-compiled translation functions:

```typescript
// Global cache (SSR-safe)
const compiledMessageCache = createCompiledCache()

// Stored as: Map<string, (params?: Params) => CleanTranslation>
// Key format: `${locale}:${routeName}:${key}`
```

**Benefits:**
- Avoids re-compilation on every request
- Critical for SSR performance
- Automatically cleared when locale changes

## 🔌 Plugin Architecture

The module consists of 5 core components:

1. **Module** (`src/module.ts`): Build-time configuration and setup
2. **Main Plugin** (`src/runtime/plugins/01.plugin.ts`): Core i18n initialization
3. **Meta Plugin** (`src/runtime/plugins/02.meta.ts`): SEO meta tags
4. **Hooks Plugin** (`src/runtime/plugins/05.hooks.ts`): Route hooks
5. **Redirect Plugin** (`src/runtime/plugins/06.redirect.ts`): Locale redirection

## 🌐 Framework Integrations

The same core logic is reused across different frameworks:

- **Vue 3**: `VueI18n` extends `BaseI18n` with Vue reactivity
- **React**: `ReactI18n` extends `BaseI18n` with `useSyncExternalStore`
- **Solid**: `SolidI18n` extends `BaseI18n` with Solid signals
- **Preact**: `PreactI18n` extends `BaseI18n` with Preact hooks
- **Node.js**: `I18n` extends `BaseI18n` for standalone use
- **Astro**: `AstroI18n` extends `BaseI18n` for Astro islands

All integrations share:
- Same translation file structure
- Same caching mechanisms
- Same pluralization logic
- Same API surface

## ⚡ Performance Optimizations

### 1. Compiled Message Cache

Pre-compiles translation functions to avoid runtime compilation overhead.

### 2. Route-Specific Translations

Only loads translations needed for the current route, reducing memory usage.

### 3. Efficient Caching

Multiple cache layers ensure translations are only loaded once and reused efficiently.

### 4. SSR Optimization

Global compiled cache avoids serialization issues in SSR environments.

## 🔧 Extensibility

The architecture is designed for easy extension:

- **Custom Plural Rules**: Override `plural` function in options
- **Custom Missing Handlers**: Set via `setMissingHandler()`
- **Custom Route Strategies**: Implement `I18nRoutingStrategy` interface
- **Custom Locale Detection**: Override `getCurrentLocale()` in `RouteService`

## 📚 Type Safety

Full TypeScript support throughout:

- Type-safe translation keys (with types generator)
- Type-safe route objects
- Type-safe parameters
- Type-safe return values

## 🎯 Key Design Decisions

1. **Separation of Concerns**: Core logic separated from framework-specific code
2. **Code Reuse**: Shared core across all framework integrations
3. **SSR Safety**: Global caches avoid serialization issues
4. **Reactivity**: Framework-agnostic reactivity patterns
5. **Performance First**: Multiple caching layers for optimal performance
