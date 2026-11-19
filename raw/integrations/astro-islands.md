# Astro islands

An island runs in the browser, where the server's i18n instance does not exist. `@i18n-micro/astro` lets the page pick the keys an island needs, pass them as one prop, and read them in the island through a small framework adapter. You get `t`, `tc`, `tn`, `td`, `tdr` and `has` in Vue, React, Preact and Svelte islands, with only the chosen strings in the HTML.

## Setup

Set up the [Astro integration and middleware](./astro-package#setup) first, then add the framework integration you use (`@astrojs/vue`, `@astrojs/react`, `@astrojs/preact`, `@astrojs/svelte`). The island adapters need that framework as a peer: `vue` `^3.3.0`, `react` `^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0`, `preact` `^10.0.0 || ^11.0.0` or `svelte` `^4.0.0 || ^5.0.0`.

## Pass translations to an island

```astro
---
// src/pages/index.astro
import { getI18nProps } from '@i18n-micro/astro'
import Counter from '../components/Counter.vue'

const i18n = getI18nProps(Astro, ['counter.title', 'counter.apples'])
---

<Counter client:load i18n={i18n} />
```

`getI18nProps(Astro, keys?)` returns `{ locale, fallbackLocale, currentRoute, translations }` (type `I18nClientProps`). Pass the keys the island uses: each is resolved on the server like `t()` (route, root and fallback dictionaries) and only found keys go into the HTML. Without `keys`, everything `t()` can answer on this page is sent, in every island, so 2000 root keys are about 100 KB per island; in dev a warning says so above 20 KB.

Islands translate from that object only. `t` returns the key for anything not passed, and linked messages are not resolved.

## Vue

Call `provideI18n(() => props.i18n)` in the island's root component and `useAstroI18n()` in its children. Vue's `inject` does not see a value provided by the same component, so the hook must run in a child, not in the root:

```vue
<!-- src/components/Counter.vue -->
<script setup lang="ts">
import { provideI18n } from '@i18n-micro/astro/client/vue'
import type { I18nClientProps } from '@i18n-micro/astro'
import CounterBody from './CounterBody.vue'

const props = defineProps<{ i18n: I18nClientProps }>()
provideI18n(() => props.i18n)
</script>

<template><CounterBody /></template>
```

```vue
<!-- src/components/CounterBody.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useAstroI18n } from '@i18n-micro/astro/client/vue'

const { t, tc } = useAstroI18n()
const count = ref(0)
</script>

<template>
  <h3>{{ t('counter.title') }}</h3>
  <button @click="count++">{{ tc('counter.apples', count) }}</button>
</template>
```

## React and Preact

```tsx
// src/components/Counter.tsx
import { useState } from 'react'
import { I18nProvider, useAstroI18n } from '@i18n-micro/astro/client/react'
import type { I18nClientProps } from '@i18n-micro/astro'

function Body() {
  const { t, tc } = useAstroI18n()
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{t('counter.title')}: {tc('counter.apples', count)}</button>
}

export default function Counter({ i18n }: { i18n: I18nClientProps }) {
  return (
    <I18nProvider value={i18n}>
      <Body />
    </I18nProvider>
  )
}
```

For Preact import `I18nProvider` and `useAstroI18n` from `@i18n-micro/astro/client/preact`; the API is the same.

## Svelte

```svelte
<!-- src/components/Counter.svelte -->
<script lang="ts">
  import { createI18nStore, useAstroI18n } from '@i18n-micro/astro/client/svelte'
  import type { I18nClientProps } from '@i18n-micro/astro'

  export let i18n: I18nClientProps
  const { t, tc } = useAstroI18n(createI18nStore(i18n))
  let count = 0
</script>

<button on:click={() => count++}>{t('counter.title')}: {tc('counter.apples', count)}</button>
```

`useAstroI18n(store)` also returns the `store` for `$store` reads in the template.

## Persisted islands

An island with `transition:persist` gets new props after a navigation. React, Preact and Vue (given a getter) follow them. In Svelte, keep the store and pass them on: `const store = createI18nStore(i18n)`, `const { t } = useAstroI18n(store)`, then `$: store.set(i18n)` (with runes, `$effect(() => store.set(i18n))`).

## API

<table>
<thead>
  <tr>
    <th>
      Entry
    </th>
    
    <th>
      Exports
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        @i18n-micro/astro
      </code>
    </td>
    
    <td>
      <code>
        getI18nProps
      </code>
      
      , type <code>
        I18nClientProps
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        @i18n-micro/astro/client/vue
      </code>
    </td>
    
    <td>
      <code>
        provideI18n(props | () => props)
      </code>
      
      , <code>
        useAstroI18n()
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        @i18n-micro/astro/client/react
      </code>
    </td>
    
    <td>
      <code>
        I18nProvider
      </code>
      
       (<code>
        value
      </code>
      
       prop), <code>
        useAstroI18n()
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        @i18n-micro/astro/client/preact
      </code>
    </td>
    
    <td>
      <code>
        I18nProvider
      </code>
      
       (<code>
        value
      </code>
      
       prop), <code>
        useAstroI18n()
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        @i18n-micro/astro/client/svelte
      </code>
    </td>
    
    <td>
      <code>
        createI18nStore(props)
      </code>
      
      , <code>
        useAstroI18n(store)
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        @i18n-micro/astro/client
      </code>
    </td>
    
    <td>
      the pure <code>
        translate
      </code>
      
      , <code>
        hasTranslation
      </code>
      
      , with no framework
    </td>
  </tr>
</tbody>
</table>

Every `useAstroI18n` returns `t`, `ts`, `tc`, `tn`, `td`, `tdr`, `has`, `setLocale`, `setRoute` and the `locale`. An island has one merged dictionary, so its `has` is true for a key `t` can answer, also from the fallback locale; on the server `has` looks at the active locale only.

## Related

<card-group>
<card icon="i-lucide-book-open" title="Astro" to="./astro-package">

Middleware, routes, SEO

</card>

<card icon="i-lucide-book-open" title="Frameworks" to="./">

Translation and plural rules

</card>
</card-group>
