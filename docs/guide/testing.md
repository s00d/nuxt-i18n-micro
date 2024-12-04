---
outline: deep
---

# 🧪 Testing `Nuxt I18n Micro` Module

## 📖 Introduction to Testing

Testing the `Nuxt I18n Micro` module is crucial to ensure that your application's localization features work as expected. This documentation will guide you through setting up the testing environment, creating mock configurations for vitest, and writing tests for your components. For a practical example, you can refer to the [example project on GitHub](https://github.com/s00d/nuxt-i18n-micro/tree/main/packages/test-utils/example).

## 🛠️ Setting Up the Testing Environment

### 1. Install `nuxt-i18n-micro-test-utils`

First, you need to install the testing utilities for `Nuxt I18n Micro`. This package provides the necessary tools to mock and test your i18n configurations.

```bash
npm install nuxt-i18n-micro-test-utils --save-dev
```

### 2. Create a Mock Configuration File

Next, create a file to set up the mock i18n configuration. This file will be used to mock the i18n functions and utilities during your tests.

```typescript
// tests/unit-setup.ts

import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { vi } from 'vitest'
import { i18nUtils } from 'nuxt-i18n-micro-test-utils'

export function createFakeI18n() {
  return {
    $getLocale: vi.fn(i18nUtils.getLocale),
    $t: vi.fn(i18nUtils.t),
    $tc: vi.fn(i18nUtils.tc),
    $setLocale: vi.fn(i18nUtils.setLocale),
    $getLocaleName: vi.fn(i18nUtils.getLocaleName),
    $setLocaleName: vi.fn(i18nUtils.setLocaleName),
    $getLocales: vi.fn(i18nUtils.getLocales),
    $setLocales: vi.fn(i18nUtils.setLocales),
    $defaultLocale: vi.fn(i18nUtils.defaultLocale),
    $setDefaultLocale: vi.fn(i18nUtils.setDefaultLocale),
    $getRouteName: vi.fn(i18nUtils.getRouteName),
    $settRouteName: vi.fn(i18nUtils.settRouteName),
    $ts: vi.fn(i18nUtils.ts),
    $tn: vi.fn(i18nUtils.tn),
    $td: vi.fn(i18nUtils.td),
    $has: vi.fn(i18nUtils.has),
    $mergeTranslations: vi.fn(i18nUtils.mergeTranslations),
    $switchLocaleRoute: vi.fn(i18nUtils.switchLocaleRoute),
    $switchLocalePath: vi.fn(i18nUtils.switchLocalePath),
    $switchLocale: vi.fn(i18nUtils.switchLocale),
    $switchRoute: vi.fn(i18nUtils.switchRoute),
    $localeRoute: vi.fn(i18nUtils.localeRoute),
    $localePath: vi.fn(i18nUtils.localePath),
    $setI18nRouteParams: vi.fn(i18nUtils.setI18nRouteParams),
  }
}

mockNuxtImport<() => ReturnType<typeof createFakeI18n>>('useI18n', () =>
  vi.fn(() => createFakeI18n()),
)

export const setTranslationsFromJson = i18nUtils.setTranslationsFromJson
```

### 3. Configure Vitest

Now, configure Vitest to use the mock configuration file and set up the testing environment.

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

Here’s an example of a simple component that uses the `useI18n` composable to translate messages.

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
    <p data-testid="message">
      Test message from props: {{ message }}
    </p>
  </div>
</template>
```

### Test File

Now, let’s write a test for this component.

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

- **🔧 Mock i18n Functions:** Always mock the i18n functions using `nuxt-i18n-micro-test-utils` to ensure consistent and predictable test results.
- **⚙️ Use Vitest for Unit Tests:** Vitest is a powerful testing framework for Vue applications. Use it to write unit tests for your components.
- **📚 Document Your Tests:** Clearly document the purpose and expected outcomes of each test. This will help maintain clarity and make it easier for others (or future you) to understand the tests.

## 📊 i18n Utility Methods

Below is a table describing all the utility methods provided by `nuxt-i18n-micro-test-utils`.

| Method                                          | Description                                                    |
|-------------------------------------------------|----------------------------------------------------------------|
| `t(key, params, defaultValue)`                  | Translates a key with optional parameters and a default value. |
| `tc(key, params, defaultValue)`                 | Translates a key with pluralization support.                   |
| `setTranslationsFromJson(locale, translations)` | Loads translations from a JSON object for a specific locale.   |
| `getLocale()`                                   | Returns the current locale.                                    |
| `setLocale(val)`                                | Sets the current locale.                                       |
| `getLocaleName()`                               | Returns the current locale name.                               |
| `setLocaleName(val)`                            | Sets the current locale name.                                  |
| `getLocales()`                                  | Returns the list of available locales.                         |
| `setLocales(val)`                               | Sets the list of available locales.                            |
| `defaultLocale()`                               | Returns the default locale.                                    |
| `setDefaultLocale(val)`                         | Sets the default locale.                                       |
| `getRouteName()`                                | Returns the current route name.                                |
| `settRouteName(val)`                            | Sets the current route name.                                   |
| `ts(key, params, defaultValue)`                 | Translates a key and returns the result as a string.           |
| `tn(value, options)`                            | Formats a number according to the current locale.              |
| `td(value, options)`                            | Formats a date according to the current locale.                |
| `has(key)`                                      | Checks if a translation key exists.                            |

By following these steps, you can effectively test the `Nuxt I18n Micro` module and ensure that your application's localization features work as expected.
