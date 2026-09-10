---
url: 'https://s00d.github.io/nuxt-i18n-micro/guide/testing.md'
description: Test i18n behavior in your Nuxt app.
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

Prefer `setupNuxtI18nMock` — isolated state, optional factory seeds, and auto-`beforeEach` reseed. Keep `mockNuxtImport` in this file so `@nuxt/test-utils` can transform it:

```typescript
// tests/unit-setup.ts

import { setupNuxtI18nMock } from '@i18n-micro/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, vi } from 'vitest'

const { i18n, useI18n, setTranslationsFromJson } = setupNuxtI18nMock({
  spy: vi.fn,
  beforeEach,
  // optional: translations: { welcome: 'Welcome' },
})

mockNuxtImport('useI18n', () => useI18n)

export { i18n, setTranslationsFromJson }
```

`createFakeI18n({ spy, translations, strategy, isolated })` remains available for lower-level setups. Pass `{ spy: vi.fn }` for Vitest spies; omit `spy` for plain functions.

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

* **🔧 Mock i18n Functions:** Prefer `setupNuxtI18nMock` + `mockNuxtImport('useI18n', () => useI18n)`.
* **♻️ Isolation:** The harness uses a private cache; for shared helpers call `resetI18n()` in `beforeEach`.
* **⚙️ Use Vitest for Unit Tests:** Pair with `@nuxt/test-utils` (`mountSuspended` / `renderSuspended`) or `@vue/test-utils`.
* **📚 Document Your Tests:** Clearly document the purpose and expected outcomes of each test.

## 📊 i18n Utility Methods

Below is a table describing the main helpers from `@i18n-micro/test-utils`.

| Method                                                  | Description                                                                |
| ------------------------------------------------------- | -------------------------------------------------------------------------- |
| `setupNuxtI18nMock(options?)`                           | Isolated fake + `useI18n` factory; pass `beforeEach` to auto-reseed.       |
| `createIsolatedFakeI18n(options?)`                      | Isolated fake without Nuxt wiring.                                         |
| `createI18nTestContext(options?)`                       | Low-level context (`t`, path stubs, `createFake`).                         |
| `resetI18n(options?)`                                   | Clears the **shared** translation cache and restores default locale state. |
| `createFakeI18n({ spy?, translations?, strategy?, … })` | Builds a `useI18n()`-shaped mock (`$t` + `t` + `helper`).                  |
| `t(key, params, defaultValue)`                          | Translates a key with optional parameters and a default value.             |
| `tc(key, params, defaultValue)`                         | Translates a key with pluralization support.                               |
| `_t(route)` / `_ts(route)`                              | Bind `t` / `ts` to another route name (`$_t` / `$_ts`).                    |
| `setTranslationsFromJson(locale, translations)`         | Loads translations from a JSON object for a specific locale.               |
| `loadPageTranslations(locale, routeName, translations)` | Loads a page-specific dictionary chunk.                                    |
| `setMissingHandler(handler)`                            | Callback for unresolved keys (`null` to clear).                            |
| `getLocale()` / `setLocale(val)`                        | Read / set the current locale.                                             |
| `getLocaleName()` / `setLocaleName(val)`                | Read / set the current locale display name.                                |
| `getLocales()` / `setLocales(val)`                      | Read / set the locale list.                                                |
| `defaultLocale()` / `setDefaultLocale(val)`             | Read / set the default locale.                                             |
| `getRouteName()`                                        | Returns the current route name used for page translations.                 |
| `setRouteName(val)`                                     | Sets the route name (`settRouteName` kept as a typo alias).                |
| `ts(key, params, defaultValue)`                         | Translates a key and returns the result as a string.                       |
| `tn(value, options?)`                                   | Formats a number with inline `Intl.NumberFormatOptions`.                   |
| `td(value, options?)`                                   | Formats a date with inline `Intl.DateTimeFormatOptions`.                   |
| `tdr(value, options?)`                                  | Formats a relative time with `Intl.RelativeTimeFormat`.                    |
| `has(key)`                                              | Checks if a translation key exists.                                        |
| `resolveTranslations()`                                 | Returns the active translation tree for the current locale and route.      |
| `setTranslation(key, value)`                            | Replaces the value at `key` in the active dictionary (replace, not merge). |
| `mergeTranslations(newTranslations)`                    | Merges translations into the active locale at runtime.                     |
| `localePath(to, locale?)`                               | Prefix stub: `'/en/about'` (respects `strategy`; no real vue-router).      |
| `switchLocalePath(locale)`                              | Stub path for the last `localePath` target — **does not** change locale.   |

By following these steps, you can effectively test the `Nuxt I18n Micro` module and ensure that your application's localization features work as expected.
