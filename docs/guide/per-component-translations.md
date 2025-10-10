---
outline: deep
---

# 📖 Per-Component Translations

Learn how to define translations directly within Vue components using `$defineI18nRoute` for modular and maintainable localization.

## 📖 Overview

Per-Component Translations in `Nuxt I18n Micro` allows you to define translations directly within specific components or pages using the `$defineI18nRoute` function. This approach is ideal for managing localized content that is unique to individual components, providing a more modular and maintainable method for handling translations.

## 🚀 Quick Start

### Basic Usage

```vue
<template>
  <div>
    <h1>{{ $t('greeting') }}</h1>
    <p>{{ $t('farewell') }}</p>
  </div>
</template>

<script setup lang="ts">
import { useNuxtApp } from '#imports'

const { $defineI18nRoute, $t } = useNuxtApp()

$defineI18nRoute({
  locales: {
    en: { greeting: 'Hello', farewell: 'Goodbye' },
    fr: { greeting: 'Bonjour', farewell: 'Au revoir' },
    de: { greeting: 'Hallo', farewell: 'Auf Wiedersehen' },
  }
})
</script>
```

## 🔧 `$defineI18nRoute` Function

The `$defineI18nRoute` function configures route behavior based on the current locale, offering a versatile solution to:

- Control access to specific routes based on available locales
- Provide translations for specific locales  
- Set custom routes for different locales
- Control meta tag generation

### Method Signature

```typescript
$defineI18nRoute(routeDefinition: DefineI18nRouteConfig)
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `locales` | `string[] \| Record<string, Translations>` | Available locales for the route |
| `localeRoutes` | `Record<string, string>` | Custom routes for specific locales |
| `disableMeta` | `boolean \| string[]` | Control i18n meta tag generation |

### Detailed Parameter Descriptions

#### `locales`

Defines which locales are available for the route:

::: code-group

```typescript [Array Format]
$defineI18nRoute({
  locales: ['en', 'fr', 'de'] // Simple array of locale codes
})
```

```typescript [Object Format]
$defineI18nRoute({
  locales: {
    en: { greeting: 'Hello', farewell: 'Goodbye' },
    fr: { greeting: 'Bonjour', farewell: 'Au revoir' },
    de: { greeting: 'Hallo', farewell: 'Auf Wiedersehen' },
    ru: {} // Russian locale allowed but no translations provided
  }
})
```

:::

#### `localeRoutes`

Allows custom routes for specific locales:

```typescript
$defineI18nRoute({
  localeRoutes: {
    en: '/welcome',
    fr: '/bienvenue', 
    de: '/willkommen',
    ru: '/privet' // Custom route path for Russian locale
  }
})
```

#### `disableMeta`

Controls i18n meta tag generation:

::: code-group

```typescript [Disable All Meta]
$defineI18nRoute({
  locales: ['en', 'fr', 'de'],
  disableMeta: true // Disables all i18n meta tags
})
```

```typescript [Disable Specific Locales]
$defineI18nRoute({
  locales: ['en', 'fr', 'de'],
  disableMeta: ['en', 'fr'] // Only English and French won't have meta tags
})
```

:::

## 💡 Use Cases

### 1. Controlling Access Based on Locales

Define which locales are allowed for specific routes:

```typescript
$defineI18nRoute({
  locales: ['en', 'fr', 'de'] // Only these locales are allowed for this route
})
```

### 2. Providing Component-Specific Translations

Use the `locales` object to provide specific translations for each route:

```typescript
$defineI18nRoute({
  locales: {
    en: { 
      greeting: 'Hello', 
      farewell: 'Goodbye',
      description: 'Welcome to our application'
    },
    fr: { 
      greeting: 'Bonjour', 
      farewell: 'Au revoir',
      description: 'Bienvenue dans notre application'
    },
    de: { 
      greeting: 'Hallo', 
      farewell: 'Auf Wiedersehen',
      description: 'Willkommen in unserer Anwendung'
    }
  }
})
```

### 3. Custom Routing for Locales

Define custom paths for specific locales:

```typescript
$defineI18nRoute({
  locales: ['en', 'fr', 'de'],
  localeRoutes: {
    en: '/welcome',
    fr: '/bienvenue',
    de: '/willkommen'
  }
})
```

### 4. Disabling Meta Tags

Control SEO meta tag generation for specific routes or locales:

```typescript
// Disable meta tags for all locales
$defineI18nRoute({
  locales: ['en', 'fr', 'de'],
  disableMeta: true
})

// Disable meta tags only for specific locales
$defineI18nRoute({
  locales: ['en', 'fr', 'de'],
  disableMeta: ['en', 'fr']
})
```

## ✅ Supported Configuration Formats

The `$defineI18nRoute` parser supports various JavaScript configurations:

### Static Configurations

::: code-group

```typescript [Static Arrays]
$defineI18nRoute({
  locales: ['en', 'de', 'fr']
})
```

```typescript [Static Objects]
$defineI18nRoute({
  locales: {
    en: { greeting: 'Hello' },
    de: { greeting: 'Hallo' }
  },
  localeRoutes: {
    en: '/welcome',
    de: '/willkommen'
  }
})
```

:::

### Dynamic Configurations

::: code-group

```typescript [Variables and Functions]
const locales = ['en', 'de', 'fr']
const routes = { en: '/welcome', de: '/willkommen' }

$defineI18nRoute({
  locales: locales,
  localeRoutes: routes
})
```

```typescript [Template Literals]
const prefix = 'api'

$defineI18nRoute({
  locales: [`${prefix}-en`, `${prefix}-de`],
  localeRoutes: {
    [`${prefix}-en`]: `/api/welcome`,
    [`${prefix}-de`]: `/api/willkommen`
  }
})
```

:::

### Advanced Configurations

::: code-group

```typescript [Spread Operator]
const baseLocales = ['en', 'de']
const additionalLocales = ['fr', 'es']

$defineI18nRoute({
  locales: [...baseLocales, ...additionalLocales]
})
```

```typescript [Array of Objects]
$defineI18nRoute({
  locales: [
    { code: 'en', name: 'English' },
    { code: 'de', name: 'German' }
  ]
})
```

:::

### Conditional Logic

```typescript
$defineI18nRoute({
  locales: process.env.NODE_ENV === 'production' 
    ? ['en', 'de'] 
    : ['en', 'de', 'fr', 'es']
})
```

### Complex Nested Objects

```typescript
$defineI18nRoute({
  locales: {
    'en-us': { 
      region: 'US',
      currency: 'USD',
      format: {
        date: 'MM/DD/YYYY',
        time: '12h'
      }
    },
    'de-de': { 
      region: 'DE',
      currency: 'EUR',
      format: {
        date: 'DD.MM.YYYY',
        time: '24h'
      }
    }
  }
})
```

### Comments and Formatting

```typescript
$defineI18nRoute({
  // Supported locales for this component
  locales: [
    'en', // English
    'de', // German
    'fr'  // French
  ],
  // Custom routes for each locale
  localeRoutes: {
    en: '/welcome',
    de: '/willkommen',
    fr: '/bienvenue'
  }
})
```

## ❌ Not Supported

The parser has limitations and cannot handle:

- **External imports** (`import` statements)
- **Async/await functions**
- **Class methods**
- **Complex control flow** (loops, try-catch, switch)
- **Arrow functions** in configuration
- **Generator functions**

## 📝 Complete Example

Here's a comprehensive example showing all features:

```vue
<template>
  <div class="welcome-page">
    <header>
      <h1>{{ $t('title') }}</h1>
      <p>{{ $t('subtitle') }}</p>
    </header>
    
    <main>
      <section>
        <h2>{{ $t('features.title') }}</h2>
        <ul>
          <li v-for="feature in $t('features.list')" :key="feature">
            {{ feature }}
          </li>
        </ul>
      </section>
      
      <section>
        <h2>{{ $t('contact.title') }}</h2>
        <p>{{ $t('contact.description') }}</p>
        <a :href="$t('contact.email')">{{ $t('contact.email') }}</a>
      </section>
    </main>
    
    <footer>
      <p>{{ $t('footer.copyright') }}</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useNuxtApp } from '#imports'

const { $defineI18nRoute, $t } = useNuxtApp()

// Define comprehensive i18n route configuration
$defineI18nRoute({
  locales: {
    en: {
      title: 'Welcome to Our Platform',
      subtitle: 'The best solution for your needs',
      features: {
        title: 'Key Features',
        list: [
          'High Performance',
          'Easy to Use',
          'Scalable Architecture'
        ]
      },
      contact: {
        title: 'Get in Touch',
        description: 'We\'d love to hear from you',
        email: 'mailto:contact@example.com'
      },
      footer: {
        copyright: '© 2024 Example Company. All rights reserved.'
      }
    },
    fr: {
      title: 'Bienvenue sur Notre Plateforme',
      subtitle: 'La meilleure solution pour vos besoins',
      features: {
        title: 'Fonctionnalités Clés',
        list: [
          'Haute Performance',
          'Facile à Utiliser',
          'Architecture Évolutive'
        ]
      },
      contact: {
        title: 'Contactez-Nous',
        description: 'Nous aimerions avoir de vos nouvelles',
        email: 'mailto:contact@example.com'
      },
      footer: {
        copyright: '© 2024 Example Company. Tous droits réservés.'
      }
    },
    de: {
      title: 'Willkommen auf Unserer Plattform',
      subtitle: 'Die beste Lösung für Ihre Bedürfnisse',
      features: {
        title: 'Hauptfunktionen',
        list: [
          'Hohe Leistung',
          'Einfach zu Verwenden',
          'Skalierbare Architektur'
        ]
      },
      contact: {
        title: 'Kontaktieren Sie Uns',
        description: 'Wir würden gerne von Ihnen hören',
        email: 'mailto:contact@example.com'
      },
      footer: {
        copyright: '© 2024 Example Company. Alle Rechte vorbehalten.'
      }
    }
  },
  localeRoutes: {
    en: '/welcome',
    fr: '/bienvenue',
    de: '/willkommen'
  },
  disableMeta: false // Enable SEO meta tags
})
</script>

<style scoped>
.welcome-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

header {
  text-align: center;
  margin-bottom: 3rem;
}

section {
  margin-bottom: 2rem;
}

footer {
  text-align: center;
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}
</style>
```

## ⚡ Performance Considerations

Embedding translations in Single File Components (SFCs) can impact performance:

### Potential Issues

- **Increased file size**: All locales reside in the SFC, unlike separate translation files that enable locale-aware loading
- **Slower rendering**: In-file translations are processed at runtime
- **Memory usage**: All translations are loaded regardless of the current locale

### Best Practices

- **Use page-by-page translations** for optimal performance
- **Reserve component-level translations** for specific cases like:
  - Reusable components published on npm
  - Translations unsuitable for global files
  - Components that need to be self-contained

### Performance vs Modularity

Balance your project's needs when choosing an approach:

| Approach | Performance | Modularity | Use Case |
|----------|-------------|------------|----------|
| **Global Files** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Most applications |
| **Page-Specific** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Large applications |
| **Component-Level** | ⭐⭐ | ⭐⭐⭐⭐⭐ | Reusable components |

## 🎯 Best Practices

### 1. Keep Translations Close to Components

Define translations directly within the relevant component to keep localized content organized and maintainable.

### 2. Use Locale Objects for Flexibility

Utilize the object format for the `locales` property when specific translations or access control based on locales are required.

### 3. Document Custom Routes

Clearly document any custom routes set for different locales to maintain clarity and simplify development and maintenance.

### 4. Consider Performance Impact

Evaluate whether component-level translations are necessary for your use case, considering the performance implications.

### 5. Use TypeScript

Leverage TypeScript for better type safety and IntelliSense support:

```typescript
interface ComponentTranslations {
  title: string
  subtitle: string
  features: {
    title: string
    list: string[]
  }
}

$defineI18nRoute({
  locales: {
    en: {
      title: 'Welcome',
      subtitle: 'Subtitle',
      features: {
        title: 'Features',
        list: ['Feature 1', 'Feature 2']
      }
    } as ComponentTranslations
  }
})
```

## 📚 Related Topics

- **[Getting Started](./getting-started.md)** - Basic setup and configuration
- **[API Reference](../api/methods.md)** - Complete method documentation
- **[Examples](../examples.md)** - Real-world usage examples

## Summary

The Per-Component Translations feature, powered by the `$defineI18nRoute` function, offers a powerful and flexible way to manage localization within your Nuxt application. By allowing localized content and routing to be defined at the component level, it helps create a highly customized and user-friendly experience tailored to the language and regional preferences of your audience.

Choose the approach that best fits your project's needs, considering both performance requirements and maintainability concerns.
