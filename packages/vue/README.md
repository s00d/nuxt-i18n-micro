# @i18n-micro/vue

Vue 3 plugin for internationalization using the same core logic as Nuxt I18n Micro. Provides reactive translations, route-specific support, and full TypeScript support.

## Installation

```bash
pnpm add @i18n-micro/vue
# or
npm install @i18n-micro/vue
# or
yarn add @i18n-micro/vue
```

## Quick Start

```typescript
import { createApp } from 'vue'
import { createI18n } from '@i18n-micro/vue'

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
  </div>
</template>

<script setup>
import { useI18n } from '@i18n-micro/vue'

const { t, tc, locale } = useI18n()

// Change locale reactively
locale.value = 'fr'
</script>
```

## Resources

- **Repository**: [https://github.com/s00d/nuxt-i18n-micro](https://github.com/s00d/nuxt-i18n-micro)
- **Documentation**: [https://s00d.github.io/nuxt-i18n-micro/](https://s00d.github.io/nuxt-i18n-micro/)

## License

MIT
