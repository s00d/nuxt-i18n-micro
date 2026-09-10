---
url: 'https://s00d.github.io/nuxt-i18n-micro/integrations.md'
description: 'Vue, React, Preact, Solid, Astro, and Node packages.'
---

# Integrations

The `@i18n-micro` packages are lightweight, framework-specific versions of Nuxt I18n Micro designed for integration into various frameworks and environments. These packages provide core internationalization functionality with a minimal footprint, focusing on essential translation features and basic components.

## Overview

These integration packages are **miniature versions** of the full Nuxt I18n Micro module, containing only the essential functionality needed for internationalization:

* **Core Translation Features** - Basic translation methods, pluralization, and formatting
* **Essential Components** - A small set of UI components for common i18n tasks
* **Router Adapter Pattern** - Flexible routing integration through adapter abstraction
* **TypeScript Support** - Full type definitions for type-safe development

Unlike the full Nuxt module, these packages:

* Do not include framework-specific routing logic
* Require you to implement a router adapter for routing features
* Focus on translation functionality rather than framework integration
* Are designed to be lightweight and framework-agnostic where possible

## Available Packages

### Framework Packages

* **[Vue Package](./vue-package.md)** (`@i18n-micro/vue`) - For Vue 3 applications
* **[React Package](./react-package.md)** (`@i18n-micro/react`) - For React applications
* **[Preact Package](./preact-package.md)** (`@i18n-micro/preact`) - For Preact applications
* **[Solid Package](./solid-package.md)** (`@i18n-micro/solid`) - For SolidJS applications
* **[Astro Package](./astro-package.md)** (`@i18n-micro/astro`) - For Astro applications with SSR support
* **[VitePress Package](./vitepress-package.md)** (`@i18n-micro/vitepress`) - For VitePress docs (runtime `$t` / components / switcher)

### Utility Packages

* **[Node.js Package](./nodejs-package.md)** (`@i18n-micro/node`) - For Node.js server-side applications
* **[Types Generator](./types-generator.md)** (`@i18n-micro/types-generator`) - For generating TypeScript types from translation files
* **[DevTools UI Package](./devtools-ui-package.md)** (`@i18n-micro/devtools-ui`) - Development tools for managing translations

## Playgrounds

Each integration ships a small app under `packages/<name>/playground` so you can see wiring end-to-end (createI18n / provider, router adapter, components, locale switch) without building a project from scratch. Clone the monorepo, `pnpm install`, then run the package’s `dev` script.

| Package | Playground | Run from monorepo root |
| ------- | ---------- | ---------------------- |
| Vue | [`packages/vue/playground`](https://github.com/s00d/nuxt-i18n-micro/tree/main/packages/vue/playground) | `pnpm -C packages/vue dev` |
| React | [`packages/react/playground`](https://github.com/s00d/nuxt-i18n-micro/tree/main/packages/react/playground) | `pnpm -C packages/react dev` |
| Preact | [`packages/preact/playground`](https://github.com/s00d/nuxt-i18n-micro/tree/main/packages/preact/playground) | `pnpm -C packages/preact dev` |
| Solid | [`packages/solid/playground`](https://github.com/s00d/nuxt-i18n-micro/tree/main/packages/solid/playground) | `pnpm -C packages/solid dev` |
| Astro | [`packages/astro/playground`](https://github.com/s00d/nuxt-i18n-micro/tree/main/packages/astro/playground) | `pnpm -C packages/astro dev` |
| VitePress | [`packages/vitepress/playground`](https://github.com/s00d/nuxt-i18n-micro/tree/main/packages/vitepress/playground) | `pnpm -C packages/vitepress/playground dev` |
| Node.js | [`packages/node/playground`](https://github.com/s00d/nuxt-i18n-micro/tree/main/packages/node/playground) | `pnpm -C packages/node dev` |

## Core Components

All framework packages include the following essential components:

### `<I18nT>`

A translation component that renders translated text with support for:

* **Parameter interpolation** - Replace placeholders with dynamic values
* **Pluralization** - Automatic plural form selection based on count
* **Number formatting** - Format numbers according to locale
* **Date formatting** - Format dates and relative times
* **HTML rendering** - Optional HTML content rendering
* **Default values** - Fallback text when translation is missing

**Example:**

```vue
<!-- Vue -->
<I18nT keypath="greeting" :params="{ name: 'World' }" />
```

```tsx
// React
<I18nT keypath="greeting" params={{ name: 'World' }} />
```

```tsx
// Solid
<I18nT keypath="greeting" params={{ name: 'World' }} />
```

```astro
<!-- Astro -->
<I18nT keypath="greeting" params={{ name: 'World' }} />
```

### `<I18nLink>`

A localized link component that automatically handles locale prefixes in URLs. Features:

* **Automatic path localization** - Adds/removes locale prefixes based on routing strategy
* **Active state detection** - Highlights the current route
* **External link support** - Automatically detects and handles external URLs
* **Router integration** - Uses router adapter's link component when available
* **Custom styling** - Supports active and hover states

**Example:**

```vue
<!-- Vue -->
<I18nLink to="/about" active-class="active">
  About Us
</I18nLink>
```

```tsx
// React
<I18nLink to="/about" activeStyle={{ fontWeight: 'bold' }}>
  About Us
</I18nLink>
```

```tsx
// Solid
<I18nLink to="/about" activeStyle={{ fontWeight: 'bold' }}>
  About Us
</I18nLink>
```

```astro
<!-- Astro -->
<I18nLink href="/about" class="nav-link">
  About Us
</I18nLink>
```

### `<I18nSwitcher>`

A language switcher component that provides a dropdown or list interface for changing locales. Features:

* **Automatic locale list** - Generates options from configured locales
* **Current locale highlighting** - Visually indicates the active language
* **Custom labels** - Support for custom display names per locale
* **Router integration** - Automatically navigates to localized paths
* **Accessibility** - Proper ARIA attributes and keyboard navigation

**Example:**

```vue
<!-- Vue -->
<I18nSwitcher />
```

```tsx
// React
<I18nSwitcher locales={locales} currentLocale={locale} switchLocale={switchLocale} />
```

```tsx
// Solid
<I18nSwitcher locales={locales} currentLocale={locale} switchLocale={switchLocale} />
```

```astro
<!-- Astro -->
<I18nSwitcher />
```

### `<I18nGroup>`

A component for grouping translations with a common prefix, useful for organizing translations by page or feature. Features:

* **Prefix scoping** - Automatically prepends prefix to all translation keys within the group
* **Nested groups** - Support for nested translation groups
* **Clean organization** - Helps maintain organized translation structures

**Example:**

```vue
<!-- Vue -->
<I18nGroup prefix="home">
  <I18nT keypath="title" /> <!-- Uses "home.title" -->
  <I18nT keypath="description" /> <!-- Uses "home.description" -->
</I18nGroup>
```

```tsx
// React
<I18nGroup prefix="home">
  <I18nT keypath="title" /> {/* Uses "home.title" */}
  <I18nT keypath="description" /> {/* Uses "home.description" */}
</I18nGroup>
```

```tsx
// Solid
<I18nGroup prefix="home">
  <I18nT keypath="title" /> {/* Uses "home.title" */}
  <I18nT keypath="description" /> {/* Uses "home.description" */}
</I18nGroup>
```

```astro
<!-- Astro -->
<I18nGroup prefix="home">
  <I18nT keypath="title" /> <!-- Uses "home.title" -->
  <I18nT keypath="description" /> <!-- Uses "home.description" -->
</I18nGroup>
```

### DevTools Integration

All framework packages support DevTools integration through the `@i18n-micro/devtools-ui` Vite plugin. See the [DevTools UI Package documentation](./devtools-ui-package.md) for details.

## Shared `createI18n` options {#create-i18n-options}

Every framework package is created the same way — only the options type is named after
the framework (`ReactI18nOptions`, `SolidI18nOptions`, and so on). The options themselves
are identical:

| Property         | Type                                                       | Required | Default          | Description                                    |
| ---------------- | ---------------------------------------------------------- | -------- | ---------------- | ---------------------------------------------- |
| `locale`         | `string`                                                   | ✅       | -                | Current locale code (e.g., `'en'`)             |
| `fallbackLocale` | `string`                                                   | ❌       | Same as `locale` | Fallback locale when translation is missing    |
| `messages`       | `Record<string, Translations>`                             | ❌       | `{}`             | Initial translation messages                   |
| `plural`         | `PluralFunc`                                               | ❌       | `defaultPlural`  | Custom pluralization function                  |
| `missingWarn`    | `boolean`                                                  | ❌       | `true`           | Show console warnings for missing translations |
| `missingHandler` | `(locale: string, key: string, routeName: string) => void` | ❌       | -                | Custom handler for missing translations        |

Anything beyond these is framework-specific and documented on that package's page.

## Router Adapter Abstraction

All framework packages use a **router adapter pattern** to decouple i18n functionality from specific router implementations. This design allows:

* **Flexibility** - Use any router library or no router at all
* **Framework independence** - Keep routing logic in your application, not in the i18n package
* **Lightweight core** - The i18n package remains small and focused

### Implementing a Router Adapter

To use routing features, you need to implement the `I18nRoutingStrategy` interface:

```typescript
interface I18nRoutingStrategy {
  getCurrentPath: () => string
  linkComponent?: Component
  push: (target: { path: string }) => void
  replace: (target: { path: string }) => void
  resolvePath?: (to: string | { path?: string }, locale: string) => string | { path?: string }
  getRoute?: () => { fullPath: string; query: Record<string, unknown> }
}
```

Each package documentation includes complete examples of implementing adapters for popular routers:

* **Vue**: Vue Router adapter example
* **React**: React Router adapter example
* **Solid**: Solid Router adapter example
* **Astro**: File-based routing adapter example

## Core Features

All packages share these core features:

### Translation Methods

* `t()` - Basic translation with parameter interpolation
* `ts()` - Translation that always returns a string
* `tc()` - Pluralization-aware translation
* `tn()` - Number formatting
* `td()` - Date formatting
* `tdr()` - Relative time formatting
* `has()` - Check if translation key exists

### Locale Management

* **Locale switching** - Change current locale programmatically
* **Fallback locale** - Automatic fallback when translation is missing
* **Route-specific translations** - Page-level translation organization
* **Translation caching** - Intelligent caching for performance

### TypeScript Support

All packages provide:

* Full TypeScript definitions
* Type-safe translation keys (with types generator)
* IntelliSense support in IDEs
* Compile-time error checking

## Getting Started

1. **Skim a playground** - Open the [table above](#playgrounds) for your stack to see a full setup
2. **Choose your package** - Select the package for your framework
3. **Install the package** - Use your preferred package manager
4. **Read the documentation** - Each package has detailed setup instructions
5. **Implement router adapter** - If you need routing features, implement the adapter
6. **Start translating** - Use components and methods to add translations

For detailed setup instructions, see the documentation for your specific package:

* [Vue Package Documentation](./vue-package.md)
* [React Package Documentation](./react-package.md)
* [Preact Package Documentation](./preact-package.md)
* [Solid Package Documentation](./solid-package.md)
* [Astro Package Documentation](./astro-package.md)
* [VitePress Package Documentation](./vitepress-package.md)
* [VitePress Package Documentation](./vitepress-package.md)

## Comparison with Nuxt Module

| Feature                | Nuxt Module    | Integration Packages |
| ---------------------- | -------------- | -------------------- |
| Translation methods    | ✅             | ✅                   |
| Components             | ✅             | ✅ (subset)          |
| Router integration     | ✅ (automatic) | ✅ (via adapter)     |
| SSR support            | ✅             | ✅ (Astro / VitePress prerender) |
| DevTools               | ✅             | ✅                   |
| Auto locale detection  | ✅             | ✅ (Astro primarily) |
| SEO meta tags          | ✅             | ✅ (Astro primarily) |
| File-based routing     | ✅             | ❌ (VitePress uses its own `locales`) |
| Nuxt-specific features | ✅             | ❌                   |

## License

MIT
