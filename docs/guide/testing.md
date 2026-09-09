---
title: 'Testing `Nuxt I18n Micro` Module'
description: 'Test i18n behavior in your Nuxt app.'
outline: 'deep'
---

# 🧪 Testing `Nuxt I18n Micro` Module

## 📖 Introduction to Testing

Testing the `Nuxt I18n Micro` module is crucial to ensure that your application's localization features work as expected. This documentation will guide you through setting up the testing environment, creating mock configurations for vitest, and writing tests for your components. For a practical example, you can refer to the [example project on GitHub](https://github.com/s00d/nuxt-i18n-micro/tree/main/packages/test-utils/example).

See [Testing routing strategies](/guide/testing-strategies) for how this repository runs its own suites — the `unit` / `integration` / `e2e` Vitest projects, the per-strategy files (`test/strategies-*.test.ts`), and generate regressions.

## 🛠️ Setting Up the Testing Environment

### 1. Install `@i18n-micro/test-utils`

```bash
npm install @i18n-micro/test-utils --save-dev
```

### 2. Create a Mock Configuration File

Use `createFakeI18n` (same shape as `useI18n()`) and `resetI18n` so each test starts clean:

```typescript
// tests/unit-setup.ts

import { createFakeI18n, resetI18n, setTranslationsFromJson } from '@i18n-micro/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, vi } from 'vitest'

const i18n = createFakeI18n({ spy: vi.fn })

mockNuxtImport<() => typeof i18n>('useI18n', () => vi.fn(() => i18n))

beforeEach(() => {
  resetI18n()
})

export { i18n, setTranslationsFromJson }
```

`createFakeI18n` returns both `$t` / `t` aliases. Pass `{ spy: vi.fn }` if you want Vitest spies on every method; omit `spy` for plain functions.

### 3. Configure Vitest

```typescript
// vitest.config.ts

import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    watch: false,
    setupFiles: ['./tests/unit-setup.ts'],
    include: ['./**/*.spec.ts'],
  },
})
```

## 🧪 Writing Tests

### Example Component

```vue
<script setup lang="ts">
const { $t } = useI18n()

const props = defineProps({
  message: {
    type: String,
    default: null,
  },
})

// Test to see that $t works in script setup as well as the template
const message = props.message || $t('defaultMessage')
</script>

<template>
  <div>
    <p>Test from component: {{ $t('welcome') }}</p>
    <p data-testid="message">Test message from props: {{ message }}</p>
  </div>
</template>
```

### Test File

```typescript
// tests/unit/example.spec.ts

import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ExampleComponent from '@/components/ExampleComponent.vue'
import fs from 'fs'
import path from 'path'
import { setTranslationsFromJson } from './unit-setup'

describe('ExampleComponent', () => {
  beforeEach(async () => {
    const fileContent = fs.readFileSync(path.join(__dirname, '../../locales/en-GB.json')).toString()
    await setTranslationsFromJson('en', JSON.parse(fileContent))
  })

  it('renders the welcome message correctly', () => {
    const wrapper = mount(ExampleComponent)
    expect(wrapper.text()).toContain('Test from component: Welcome')
  })

  it('renders the default message correctly', () => {
    const wrapper = mount(ExampleComponent)
    expect(wrapper.find('[data-testid="message"]').text()).toContain('Test message from props: Default Message')
  })

  it('renders the custom message correctly', () => {
    const wrapper = mount(ExampleComponent, {
      props: {
        message: 'Custom Message',
      },
    })
    expect(wrapper.find('[data-testid="message"]').text()).toContain('Test message from props: Custom Message')
  })
})
```

## 📝 Best Practices for Testing

- **🔧 Mock i18n Functions:** Use `createFakeI18n` + `mockNuxtImport('useI18n', …)` from `@i18n-micro/test-utils`.
- **♻️ Reset between tests:** Call `resetI18n()` in `beforeEach` so dictionaries and locale do not leak.
- **⚙️ Use Vitest for Unit Tests:** Pair with `@nuxt/test-utils` (`mountSuspended` / `renderSuspended`) or `@vue/test-utils`.
- **📚 Document Your Tests:** Clearly document the purpose and expected outcomes of each test.

## 📊 i18n Utility Methods

Below is a table describing the main helpers from `@i18n-micro/test-utils`.

| Method                                                  | Description                                                                 |
| ------------------------------------------------------- | --------------------------------------------------------------------------- |
| `resetI18n(options?)`                                   | Clears translation cache and restores default locale / route state.         |
| `createFakeI18n({ spy? })`                              | Builds a `useI18n()`-shaped mock (`$t` + `t` aliases).                      |
| `t(key, params, defaultValue)`                          | Translates a key with optional parameters and a default value.              |
| `tc(key, params, defaultValue)`                         | Translates a key with pluralization support.                                |
| `_t(route)` / `_ts(route)`                              | Bind `t` / `ts` to another route name (`$_t` / `$_ts`).                     |
| `setTranslationsFromJson(locale, translations)`         | Loads translations from a JSON object for a specific locale.                |
| `loadPageTranslations(locale, routeName, translations)` | Loads a page-specific dictionary chunk.                                     |
| `setMissingHandler(handler)`                            | Callback for unresolved keys (`null` to clear).                             |
| `getLocale()` / `setLocale(val)`                        | Read / set the current locale.                                              |
| `getLocaleName()` / `setLocaleName(val)`                | Read / set the current locale display name.                                 |
| `getLocales()` / `setLocales(val)`                      | Read / set the locale list.                                                 |
| `defaultLocale()` / `setDefaultLocale(val)`             | Read / set the default locale.                                              |
| `getRouteName()`                                        | Returns the current route name used for page translations.                  |
| `setRouteName(val)`                                     | Sets the route name (`settRouteName` kept as a typo alias).                 |
| `ts(key, params, defaultValue)`                         | Translates a key and returns the result as a string.                        |
| `tn(value, options?)`                                   | Formats a number with inline `Intl.NumberFormatOptions`.                    |
| `td(value, options?)`                                   | Formats a date with inline `Intl.DateTimeFormatOptions`.                    |
| `tdr(value, options?)`                                  | Formats a relative time with `Intl.RelativeTimeFormat`.                     |
| `has(key)`                                              | Checks if a translation key exists.                                         |
| `resolveTranslations()`                                 | Returns the active translation tree for the current locale and route.       |
| `setTranslation(key, value)`                            | Replaces the value at `key` in the active dictionary (replace, not merge).  |
| `mergeTranslations(newTranslations)`                    | Merges translations into the active locale at runtime.                      |
| `localePath(to, locale?)`                               | Prefix stub: `'/en/about'` (no real vue-router).                            |
| `switchLocalePath(locale)`                              | Switches locale and returns the stub path for the last `localePath` target. |

By following these steps, you can effectively test the `Nuxt I18n Micro` module and ensure that your application's localization features work as expected.
