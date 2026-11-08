# Testing your app

Components that call `useI18n()` need an i18n instance in unit tests. `@i18n-micro/test-utils` gives you a fake `useI18n()` with real translation, plural and formatting logic, so you can mount a component with your own dictionaries and no Nuxt server. For routing and redirects, run the real module end to end with `@nuxt/test-utils`.

This page is about testing your application. How this repository tests the module itself is on [Testing the module](/contributing/testing).

## Install

<code-group>

```bash [pnpm]
pnpm add -D @i18n-micro/test-utils @nuxt/test-utils vitest @vue/test-utils happy-dom
```

```bash [npm]
npm install -D @i18n-micro/test-utils @nuxt/test-utils vitest @vue/test-utils happy-dom
```

</code-group>

## Mock useI18n

```ts
// tests/unit-setup.ts
import { setupNuxtI18nMock } from '@i18n-micro/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, vi } from 'vitest'

export const { i18n, useI18n, setTranslationsFromJson } = setupNuxtI18nMock({
  spy: vi.fn, // every method becomes a vi.fn, so you can assert calls
  beforeEach, // reset state and reseed `translations` before each test
  translations: { welcome: 'Welcome' },
})

mockNuxtImport('useI18n', () => useI18n)
```

```ts
// vitest.config.ts
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    setupFiles: ['./tests/unit-setup.ts'],
  },
})
```

Keep `mockNuxtImport` in the setup file: `@nuxt/test-utils` has to transform it. `setupNuxtI18nMock` uses a private translation cache, so parallel test files do not share state.

## Write a test

```vue
<!-- components/Greeting.vue -->
<script setup lang="ts">
const { $t } = useI18n()
</script>

<template>
  <p>{{ $t('welcome') }}</p>
</template>
```

```ts
// tests/greeting.spec.ts
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { expect, it } from 'vitest'
import Greeting from '~/components/Greeting.vue'
import de from '~/locales/de.json'
import { i18n, setTranslationsFromJson } from './unit-setup'

it('renders the German greeting', async () => {
  await setTranslationsFromJson('de', de)
  i18n.setLocale('de')

  const wrapper = await mountSuspended(Greeting)
  expect(wrapper.text()).toBe('Willkommen') // de.json: { "welcome": "Willkommen" }
})
```

The fake exposes the same methods as the real `useI18n()` (`$t`, `$tc`, `$tn`, `$td`, `$has`, `$localePath`, …, with and without `$`) plus setters for tests: `setLocale`, `setLocales`, `setDefaultLocale`, `setRouteName`, `setTranslationsFromJson`, `loadPageTranslations`, `mergeTranslations`, `setMissingHandler`.

`$localePath` and `$switchLocalePath` are stubs that prefix the path according to the `strategy` option (no real router). Test real links and redirects end to end.

## Lower-level helpers

<table>
<thead>
  <tr>
    <th>
      Helper
    </th>
    
    <th>
      Use it for
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        createIsolatedFakeI18n(options)
      </code>
    </td>
    
    <td>
      An isolated fake without the Nuxt <code>
        useI18n
      </code>
      
       wiring, e.g. for plain <code>
        @vue/test-utils
      </code>
      
       <code>
        mount
      </code>
      
       with <code>
        global.mocks
      </code>
      
      .
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        createFakeI18n(options)
      </code>
    </td>
    
    <td>
      A fake on the shared module cache (call <code>
        resetI18n()
      </code>
      
       in <code>
        beforeEach
      </code>
      
      ), or isolated with <code>
        isolated: true
      </code>
      
      .
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        createI18nTestContext(options)
      </code>
    </td>
    
    <td>
      The context behind both, when you need several fakes.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        t
      </code>
      
      , <code>
        tc
      </code>
      
      , <code>
        ts
      </code>
      
      , <code>
        tn
      </code>
      
      , <code>
        td
      </code>
      
      , <code>
        tdr
      </code>
      
      , <code>
        has
      </code>
    </td>
    
    <td>
      Direct calls on the shared context, for testing plain functions.
    </td>
  </tr>
</tbody>
</table>

The mock is a `BaseI18n`: `t`, `tc`, `tn`, `td`, `tdr` and `has` are the real ones, on real dictionaries, so a test sees what the app shows.

The factory helpers above accept `locale`, `defaultLocale`, `locales`, `routeName`, `strategy`, `translations` and `messages` (dictionaries per locale). A complete example project lives in [`packages/test-utils/example`](https://github.com/s00d/nuxt-i18n-micro/tree/main/packages/test-utils/example).

## End-to-end tests

Routing, redirects, SEO tags and payload loading need the real module. Start your app with `@nuxt/test-utils/e2e`:

```ts
// tests/e2e/locales.test.ts
import { $fetch, fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

describe('locales', async () => {
  await setup({ server: true })

  it('serves the German page', async () => {
    expect(await $fetch('/de')).toContain('lang="de-DE"')
  })

  it('redirects / for a German browser', async () => {
    const res = await fetch('/', { headers: { 'accept-language': 'de' }, redirect: 'manual' })
    expect(res.headers.get('location')).toBe('/de')
  })
})
```

The second test assumes `prefix` (or `prefix_except_default` with another default locale); see [Locale detection](/guide/locale-detection) for when `/` redirects.

## Related

<card-group>
<card icon="i-lucide-git-pull-request" title="Testing the module" to="/contributing/testing">



</card>

<card icon="i-lucide-braces" title="useI18n" to="/composables/useI18n">



</card>

<card icon="i-lucide-book-open" title="Locale detection" to="/guide/locale-detection">



</card>

<card icon="i-lucide-book-open" title="Storybook" to="/guide/storybook">



</card>
</card-group>
