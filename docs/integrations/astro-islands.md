---
title: 'Astro islands'
description: 'Translations inside Vue, React and Svelte islands with @i18n-micro/astro.'
outline: 'deep'
---

# Astro islands

Astro Islands allow you to use interactive components (Vue, React, Svelte) within Astro pages. The `@i18n-micro/astro` package provides framework-specific adapters for seamless i18n integration in islands.

## Overview

Each island receives translations via props, ensuring:

- **Locality**: Each island only receives the translations it needs
- **Lightweight**: No global state, minimal bundle size
- **Framework-specific**: Native APIs for each framework (Vue provide/inject, React Context, Svelte stores)

## Setup

First, ensure you have the required framework integrations installed:

```bash
# For Vue
npm install @astrojs/vue vue

# For React
npm install @astrojs/react react react-dom

# For Svelte
npm install @astrojs/svelte svelte
```

Add integrations to `astro.config.mjs`:

```javascript
import { defineConfig } from 'astro/config'
import vue from '@astrojs/vue'
import react from '@astrojs/react'
import svelte from '@astrojs/svelte'
import { i18nIntegration } from '@i18n-micro/astro'

export default defineConfig({
  integrations: [
    vue(),
    react(),
    svelte(),
    i18nIntegration({
      locale: 'en',
      fallbackLocale: 'en',
      locales: [
        { code: 'en', displayName: 'English', iso: 'en-US' },
        { code: 'fr', displayName: 'Français', iso: 'fr-FR' },
      ],
      translationDir: 'src/locales',
    }),
  ],
})
```

## Preparing Translations for Islands

Use `getI18nProps()` to prepare translations for islands. **Important**: Pass only the keys your islands actually need to minimize bundle size:

```astro
---
// src/pages/islands.astro
import { getI18nProps } from '@i18n-micro/astro'
import { useI18n } from '@i18n-micro/astro'
import VueCounter from '../components/islands/VueCounter.vue'
import ReactCard from '../components/islands/ReactCard'
import SvelteWidget from '../components/islands/SvelteWidget.svelte'

const { t } = useI18n(Astro)

// Collect only the keys needed for islands
const i18nProps = getI18nProps(Astro, [
  'islands.vue.title',
  'islands.vue.description',
  'islands.react.title',
  'islands.react.description',
  'islands.svelte.title',
  'islands.svelte.description',
  'islands.apples',
  'islands.number',
])
---

<Layout title={t('islands.title')}>
  <main>
    <h1>{t('islands.title')}</h1>
    <p>{t('islands.description')}</p>

    <section>
      <h2>{t('islands.vue.title')}</h2>
      <VueCounter client:load i18n={i18nProps} />
    </section>

    <section>
      <h2>{t('islands.react.title')}</h2>
      <ReactCard client:load i18n={i18nProps} />
    </section>

    <section>
      <h2>{t('islands.svelte.title')}</h2>
      <SvelteWidget client:load i18n={i18nProps} />
    </section>
  </main>
</Layout>
```

## Vue Islands

For Vue components, use `provideI18n` and `useAstroI18n`:

```vue
<!-- src/components/islands/VueCounter.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { provideI18n } from '@i18n-micro/astro/client/vue'
import { translate } from '@i18n-micro/astro/client'
import { defaultPlural, FormatService } from '@i18n-micro/core'
import type { I18nClientProps } from '@i18n-micro/astro'
import type { Params, TranslationKey } from '@i18n-micro/types'

const props = defineProps<{
  i18n: I18nClientProps
}>()

// Initialize provider and get state directly
const state = provideI18n(props.i18n)
const formatter = new FormatService()

// Use state directly instead of inject
const t = (key: TranslationKey, params?: Params, defaultValue?: string | null, routeName?: string) => {
  return translate(state.value, key as string, params, defaultValue, routeName)
}

const tc = (key: TranslationKey, count: number | Params, defaultValue?: string) => {
  const { count: countValue, ...params } = typeof count === 'number' ? { count } : count

  if (countValue === undefined) {
    return defaultValue ?? (key as string)
  }

  const getter = (k: TranslationKey, p?: Params, dv?: string) => {
    return t(k, p, dv)
  }

  const result = defaultPlural(key, Number.parseInt(countValue.toString(), 10), params, state.value.locale, getter)

  return result ?? defaultValue ?? (key as string)
}

const tn = (value: number, options?: Intl.NumberFormatOptions): string => {
  return formatter.formatNumber(value, state.value.locale, options)
}

const locale = computed(() => state.value.locale)

const count = ref(0)
const increment = () => count.value++
</script>

<template>
  <div class="island-card vue-card">
    <h3>{{ t('islands.vue.title') }}</h3>
    <p>{{ t('islands.vue.description') }}</p>
    <div class="counter">
      <button @click="increment">+</button>
      <span>{{ count }}</span>
      <p>{{ tc('islands.apples', count) }}</p>
      <p>{{ t('islands.number', { number: tn(count) }) }}</p>
    </div>
    <p class="locale-info">Locale: {{ locale }}</p>
  </div>
</template>
```

## React Islands

For React components, use `I18nProvider` and `useAstroI18n`:

```tsx
// src/components/islands/ReactCard.tsx
import React, { useState } from 'react'
import { I18nProvider, useAstroI18n } from '@i18n-micro/astro/client/react'
import type { I18nClientProps } from '@i18n-micro/astro'
import './ReactCard.css'

interface ReactCardProps {
  i18n: I18nClientProps
}

function CardContent() {
  const { t, locale, tn, tc } = useAstroI18n()
  const [count, setCount] = useState(0)

  return (
    <div className="island-card react-card">
      <h3>{t('islands.react.title')}</h3>
      <p>{t('islands.react.description')}</p>
      <div className="counter">
        <button onClick={() => setCount(count + 1)}>+</button>
        <span>{count}</span>
        <p>{tc('islands.apples', count)}</p>
        <p>{t('islands.number', { number: tn(count) })}</p>
      </div>
      <p className="locale-info">Locale: {locale}</p>
    </div>
  )
}

export default function ReactCard({ i18n }: ReactCardProps) {
  return (
    <I18nProvider value={i18n}>
      <CardContent />
    </I18nProvider>
  )
}
```

## Svelte Islands

For Svelte components, use `createI18nStore` and `useAstroI18n`:

```svelte
<!-- src/components/islands/SvelteWidget.svelte -->
<script lang="ts">
  import { createI18nStore, useAstroI18n } from '@i18n-micro/astro/client/svelte'
  import type { I18nClientProps } from '@i18n-micro/astro'

  export let i18n: I18nClientProps

  // Create store and initialize hook
  const i18nStore = createI18nStore(i18n)
  const { t, locale, tn, tc, store } = useAstroI18n(i18nStore)

  let count = 0
  const increment = () => count++
</script>

<div class="island-card svelte-card">
  <h3>{t('islands.svelte.title')}</h3>
  <p>{t('islands.svelte.description')}</p>
  <div class="counter">
    <button on:click={increment}>+</button>
    <span>{count}</span>
    <p>{tc('islands.apples', count)}</p>
    <p>{t('islands.number', { number: tn(count) })}</p>
  </div>
  <p class="locale-info">Locale: {locale}</p>
</div>
```

## API Reference

### `getI18nProps(astro: AstroGlobal, keys?: string[]): I18nClientProps`

Prepares translation props for islands. **Important:** Always pass specific keys to minimize bundle size.

**Parameters:**

- `astro`: Astro global object
- `keys`: **Recommended** - Array of translation keys to include (e.g., `['islands.vue.title', 'islands.apples']`). If omitted, all route-specific translations are included, which may increase bundle size.

**Returns:** `I18nClientProps` object with:

- `locale`: Current locale
- `fallbackLocale`: Fallback locale
- `currentRoute`: Current route name
- `translations`: Object containing only the requested translations (or all route translations if keys not provided)

**Example:**

```typescript
// ✅ Recommended: Include only specific keys your islands need
const i18nProps = getI18nProps(Astro, ['islands.vue.title', 'islands.apples'])

// ⚠️ Use with caution: Includes all route-specific translations
// This may increase bundle size if you have many translations
const i18nProps = getI18nProps(Astro)
```

**Best Practice:** Always specify the keys your islands actually use to keep bundle size minimal.

### Vue Adapter

**`provideI18n(props: I18nClientProps): Ref<I18nState>`**

Initializes i18n provider for Vue islands. Returns a reactive state ref.

**`useAstroI18n(): I18nHookReturn`**

Hook for using i18n in Vue components. Must be called after `provideI18n`.

### React Adapter

**`I18nProvider: React.FC<{ children: React.ReactNode, value: I18nClientProps }>`**

Provider component for React islands. Wrap your component content with it.

**`useAstroI18n(): I18nHookReturn`**

Hook for using i18n in React components. Must be used within `I18nProvider`.

### Svelte Adapter

**`createI18nStore(props: I18nClientProps): Writable<I18nState>`**

Creates a Svelte store for i18n state.

**`useAstroI18n(store: Writable<I18nState>): I18nHookReturn`**

Hook for using i18n in Svelte components. Pass the store created by `createI18nStore`.

## Translation Keys in Islands

All adapters provide the same translation methods:

- `t(key, params?, defaultValue?, routeName?)` - Basic translation
- `ts(key, params?, defaultValue?, routeName?)` - Always returns string
- `tc(key, count | params, defaultValue?)` - Pluralization
- `tn(value, options?)` - Number formatting
- `td(value, options?)` - Date formatting
- `tdr(value, options?)` - Relative time formatting
- `has(key, routeName?)` - Check if translation exists
- `locale` - Current locale (reactive)
- `fallbackLocale` - Fallback locale
- `currentRoute` - Current route name

## Best Practices

1. **Minimize Translation Keys**: Only pass the keys your islands actually use
2. **Use `client:load` or `client:only`**: Islands need client-side hydration
3. **Keep Islands Isolated**: Each island should be self-contained
4. **Reuse i18nProps**: If multiple islands use the same translations, reuse the props object
5. **Type Safety**: Use TypeScript for better IDE support and type checking

## Example: Complete Islands Page

```astro
---
// src/pages/islands.astro
import { getI18nProps } from '@i18n-micro/astro'
import { useI18n } from '@i18n-micro/astro'
import Layout from '../layouts/Layout.astro'
import VueCounter from '../components/islands/VueCounter.vue'
import ReactCard from '../components/islands/ReactCard'
import SvelteWidget from '../components/islands/SvelteWidget.svelte'

const { t } = useI18n(Astro)

// Collect only the keys needed for islands
const i18nProps = getI18nProps(Astro, [
  'islands.vue.title',
  'islands.vue.description',
  'islands.react.title',
  'islands.react.description',
  'islands.svelte.title',
  'islands.svelte.description',
  'islands.apples',
  'islands.number',
])
---

<Layout title={t('islands.title')}>
  <main>
    <h1>{t('islands.title')}</h1>
    <p>{t('islands.description')}</p>

    <section>
      <h2>{t('islands.vue.title')}</h2>
      <VueCounter client:load i18n={i18nProps} />
    </section>

    <section>
      <h2>{t('islands.react.title')}</h2>
      <ReactCard client:load i18n={i18nProps} />
    </section>

    <section>
      <h2>{t('islands.svelte.title')}</h2>
      <SvelteWidget client:load i18n={i18nProps} />
    </section>
  </main>
</Layout>
```
