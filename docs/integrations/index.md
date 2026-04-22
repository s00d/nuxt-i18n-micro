---
outline: deep
---

# Integrations

The `@i18n-micro` packages are lightweight, framework-specific versions of Nuxt I18n Micro designed for integration into various frameworks and environments. These packages provide core internationalization functionality with a minimal footprint, focusing on essential translation features and basic components.

## Overview

These integration packages are **miniature versions** of the full Nuxt I18n Micro module, containing only the essential functionality needed for internationalization:

- **Core Translation Features** - Basic translation methods, pluralization, and formatting
- **Essential Components** - A small set of UI components for common i18n tasks
- **Router Adapter Pattern** - Flexible routing integration through adapter abstraction
- **TypeScript Support** - Full type definitions for type-safe development

Unlike the full Nuxt module, these packages:

- Do not include framework-specific routing logic
- Require you to implement a router adapter for routing features
- Focus on translation functionality rather than framework integration
- Are designed to be lightweight and framework-agnostic where possible

## Available Packages

### Framework Packages

- **[Vue Package](./vue-package.md)** (`@i18n-micro/vue`) - For Vue 3 applications
- **[React Package](./react-package.md)** (`@i18n-micro/react`) - For React applications
- **[Preact Package](./preact-package.md)** (`@i18n-micro/preact`) - For Preact applications
- **[Solid Package](./solid-package.md)** (`@i18n-micro/solid`) - For SolidJS applications
- **[Astro Package](./astro-package.md)** (`@i18n-micro/astro`) - For Astro applications with SSR support

### Utility Packages

- **[Node.js Package](./nodejs-package.md)** (`@i18n-micro/node`) - For Node.js server-side applications
- **[Types Generator](./types-generator.md)** (`@i18n-micro/types-generator`) - For generating TypeScript types from translation files
- **[DevTools UI Package](./devtools-ui-package.md)** (`@i18n-micro/devtools-ui`) - Development tools for managing translations

## Core components

Each integration ships a small set of building blocks — typically **`<I18nT>`** (translate / pluralize / format), **`<I18nLink>`** (localized navigation), **`<I18nSwitcher>`**, and **`<I18nGroup>`** (key prefix scope). Exact props and import paths differ by framework; use the package page for copy-paste examples:

- [Vue](./vue-package.md) · [React](./react-package.md) · [Preact](./preact-package.md) · [Solid](./solid-package.md) · [Astro](./astro-package.md)

Minimal Vue illustration:

```vue
<I18nT keypath="greeting" :params="{ name: 'World' }" />
```

### DevTools

Optional in dev: `@i18n-micro/devtools-ui` Vite plugin. See [DevTools UI Package](./devtools-ui-package.md).

## Router Adapter Abstraction

All framework packages use a **router adapter pattern** to decouple i18n functionality from specific router implementations. This design allows:

- **Flexibility** - Use any router library or no router at all
- **Framework independence** - Keep routing logic in your application, not in the i18n package
- **Lightweight core** - The i18n package remains small and focused

### Implementing a Router Adapter

To use routing features, you need to implement the `I18nRoutingStrategy` interface:

```typescript
interface I18nRoutingStrategy {
  getCurrentPath: () => string;
  linkComponent?: Component;
  push: (target: { path: string }) => void;
  replace: (target: { path: string }) => void;
  resolvePath?: (to: string | { path?: string }, locale: string) => string | { path?: string };
  getRoute?: () => { fullPath: string; query: Record<string, unknown> };
}
```

Each package documentation includes complete examples of implementing adapters for popular routers:

- **Vue**: Vue Router adapter example
- **React**: React Router adapter example
- **Solid**: Solid Router adapter example
- **Astro**: File-based routing adapter example

## Core Features

All packages share these core features:

### Translation Methods

- `t()` - Basic translation with parameter interpolation
- `ts()` - Translation that always returns a string
- `tc()` - Pluralization-aware translation
- `tn()` - Number formatting
- `td()` - Date formatting
- `tdr()` - Relative time formatting
- `has()` - Check if translation key exists

### Locale Management

- **Locale switching** - Change current locale programmatically
- **Fallback locale** - Automatic fallback when translation is missing
- **Route-specific translations** - Page-level translation organization
- **Translation caching** - Intelligent caching for performance

### TypeScript Support

All packages provide:

- Full TypeScript definitions
- Type-safe translation keys (with types generator)
- IntelliSense support in IDEs
- Compile-time error checking

## Getting Started

1. **Choose your package** - Select the package for your framework
2. **Install the package** - Use your preferred package manager
3. **Read the documentation** - Each package has detailed setup instructions
4. **Implement router adapter** - If you need routing features, implement the adapter
5. **Start translating** - Use components and methods to add translations

For detailed setup instructions, see the documentation for your specific package:

- [Vue Package Documentation](./vue-package.md)
- [React Package Documentation](./react-package.md)
- [Solid Package Documentation](./solid-package.md)
- [Astro Package Documentation](./astro-package.md)

## Comparison with Nuxt Module

| Feature                | Nuxt Module    | Integration Packages |
| ---------------------- | -------------- | -------------------- |
| Translation methods    | ✅             | ✅                   |
| Components             | ✅             | ✅ (subset)          |
| Router integration     | ✅ (automatic) | ✅ (via adapter)     |
| SSR support            | ✅             | ✅ (Astro only)      |
| DevTools               | ✅             | ✅                   |
| Auto locale detection  | ✅             | ✅ (Astro only)      |
| SEO meta tags          | ✅             | ✅ (Astro only)      |
| File-based routing     | ✅             | ❌                   |
| Nuxt-specific features | ✅             | ❌                   |

## License

MIT
