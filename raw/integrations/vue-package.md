# Vue

`@i18n-micro/vue` is a Vue 3 plugin with the translation core of Nuxt I18n Micro: reactive `t()`, global `$t`, four components and an optional vue-router adapter. Use it in a Vite or SSR Vue app that is not built with Nuxt. The instance model, router contract and component props are shared with the other packages and described in [Frameworks](./).

## Install

<code-group>

```bash [pnpm]
pnpm add @i18n-micro/vue
```

```bash [npm]
npm install @i18n-micro/vue
```

```bash [yarn]
yarn add @i18n-micro/vue
```

</code-group>

Peer dependencies: `vue` `^3.3.0`; `vue-router` `^4.5.1 || ^5.0.0` (optional, only for `@i18n-micro/vue/router`). The published types need Vue 3.5.5 or later with `skipLibCheck: false`; with `skipLibCheck: true`, the usual template setting, older versions compile too.

## Setup

```ts
// src/main.ts
import { createApp } from 'vue'
import { createI18n } from '@i18n-micro/vue'
import App from './App.vue'
import en from './locales/en.json'

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en },
  locales: [
    { code: 'en', iso: 'en-US', displayName: 'English' },
    { code: 'de', iso: 'de-DE', displayName: 'Deutsch' },
  ],
  defaultLocale: 'en',
})

createApp(App).use(i18n).mount('#app')
```

`locales` and `defaultLocale` are required for `useI18n()`: it throws `I18nLocalesKey not provided` without them. Pass them to `createI18n` (as above), to `useI18n({ locales, defaultLocale })`, or through `app.provide(I18nLocalesKey, …)` and `app.provide(I18nDefaultLocaleKey, …)`.

The plugin registers `I18nT`, `I18nLink`, `I18nGroup` and `I18nSwitcher` globally and adds `$t`, `$ts`, `$tc`, `$tn`, `$td`, `$tdr`, `$has` and `$i18n` to templates. The instance is `i18n.global` outside components. Other options are in [the instance](./#the-instance); `routeMessages` is not available in Vue, use `addRouteTranslations`.

## Translate

```vue
<script setup lang="ts">
import { useI18n } from '@i18n-micro/vue'

const { t, tc, tn } = useI18n()
</script>

<template>
  <h1>{{ t('greeting', { name: 'Ada' }) }}</h1>
  <!-- Hello, Ada! -->
  <p>{{ tc('apples', 3) }}</p>
  <!-- 3 apples -->
  <p>{{ $t('nav.home') }} · {{ tn(1234.5) }}</p>
</template>
```

`useI18n()` returns the translation methods (`t`, `ts`, `tc`, `tn`, `td`, `tdr`, `has`), `locale` (a writable computed), `getLocale`, `getLocales`, `defaultLocale()`, `getLocaleName`, `localePath`, `localeRoute`, `switchLocale`, `setRoute`, `getRoute`, `addTranslations`, `addRouteTranslations`, `mergeTranslations`, `resolveTranslations`, `setTranslation`, `clearCache` and `instance`.

Load more dictionaries at any time; every component that reads them re-renders:

```ts
const { addTranslations, addRouteTranslations, setRoute } = useI18n()

addTranslations('de', (await import('./locales/de.json')).default)
addRouteTranslations('en', 'about', { title: 'About us' })
setRoute('about') // t('title') now reads the 'about' dictionary first
```

## Switch locale

```ts
const { locale, switchLocale } = useI18n()

locale.value = 'de' // only the locale
switchLocale('de') // the locale, then router.push to the localized current path
```

Load the locale's dictionary before or after switching; switching does not fetch anything.

`<I18nGroup>` gives its slot a prefixed `t`. Keys inside `<I18nT>` or a plain `t()` are not prefixed:

```vue
<I18nGroup prefix="profile" v-slot="{ t }">
  <h2>{{ t('title') }}</h2>
  <!-- profile.title -->
</I18nGroup>
```

## Routing

The vue-router adapter lives in a subpath so the main entry never imports `vue-router`:

```ts
// src/main.ts
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createI18n } from '@i18n-micro/vue'
import { createVueRouterAdapter } from '@i18n-micro/vue/router'
import App from './App.vue'
import Home from './pages/Home.vue'
import About from './pages/About.vue'
import en from './locales/en.json'

const locales = [
  { code: 'en', iso: 'en-US', displayName: 'English' },
  { code: 'de', iso: 'de-DE', displayName: 'Deutsch' },
]

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/:locale(de)?', component: Home },
    { path: '/:locale(de)?/about', component: About },
  ],
})

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en },
  locales,
  defaultLocale: 'en',
  routingStrategy: createVueRouterAdapter(router, locales, 'en'),
})

createApp(App).use(router).use(i18n).mount('#app')
```

`createVueRouterAdapter(router, locales, defaultLocale)` prefixes every locale except the default one (`/about`, `/de/about`) and renders `<I18nLink>` as `RouterLink`. Read the locale from the route yourself, for example in `router.beforeEach`, and set `i18n.global.locale.value`. You can also attach an adapter later with `i18n.setRoutingStrategy(adapter)`; for a custom adapter see [Router adapter](./#router-adapter).

## SSR

- Create the router, the i18n instance and the app inside the per-request render function. One shared instance would leak one visitor's locale to another.
- Use `createMemoryHistory()` on the server, take the locale from the URL, and load its dictionary (and the fallback's) before `renderToString`.
- Send the locale to the client (for example in a `window.__STATE__` script) and create the client instance with the same `locale` so hydration matches.
- `<I18nSwitcher>` reads `window.location` only when the dropdown is open, so it renders on the server.

`packages/vue/playground` has a complete `entry-server.ts` / `entry-client.ts` pair.

## SEO head

`useLocaleHead(options)` builds `lang`/`dir`, canonical, `hreflang` and `og:locale` tags from the locales and the router adapter. Call `updateMeta()` when the route changes and pass `metaObject` to your head manager:

```ts
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import { useLocaleHead } from '@i18n-micro/vue'

const route = useRoute()
const { metaObject, updateMeta } = useLocaleHead({ baseUrl: 'https://example.com' })
watch(() => route.fullPath, () => updateMeta(), { immediate: true })
useHead(metaObject)
```

Options: `baseUrl` (string or function), `addDirAttribute` (default `true`), `addSeoAttributes` (default `true`), `identifierAttribute` (default `'id'`), `hreflangBaseLanguage` (default `false`). Locales with `disabled: true` or `seo: false` get no alternate link.

## API

<table>
<thead>
  <tr>
    <th>
      Export
    </th>
    
    <th>
      Entry
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        createI18n
      </code>
      
      , <code>
        useI18n
      </code>
      
      , <code>
        useLocaleHead
      </code>
    </td>
    
    <td>
      <code>
        @i18n-micro/vue
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        I18nT
      </code>
      
      , <code>
        I18nLink
      </code>
      
      , <code>
        I18nSwitcher
      </code>
      
      , <code>
        I18nGroup
      </code>
    </td>
    
    <td>
      <code>
        @i18n-micro/vue
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        VueI18n
      </code>
      
       (instance class), <code>
        I18nInjectionKey
      </code>
      
      , <code>
        I18nLocalesKey
      </code>
      
      , <code>
        I18nDefaultLocaleKey
      </code>
    </td>
    
    <td>
      <code>
        @i18n-micro/vue
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        defaultPlural
      </code>
      
      , <code>
        FormatService
      </code>
      
      , <code>
        interpolate
      </code>
    </td>
    
    <td>
      <code>
        @i18n-micro/vue
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      Types: <code>
        I18nRoutingStrategy
      </code>
      
      , <code>
        Locale
      </code>
      
      , <code>
        Translations
      </code>
      
      , <code>
        PluralFunc
      </code>
      
      , <code>
        Params
      </code>
      
      , <code>
        Getter
      </code>
      
      , <code>
        CleanTranslation
      </code>
      
      , <code>
        LocaleCode
      </code>
      
      , <code>
        VueI18nOptions
      </code>
      
      , <code>
        UseI18nOptions
      </code>
      
      , <code>
        UseLocaleHeadOptions
      </code>
      
      , <code>
        I18nPlugin
      </code>
    </td>
    
    <td>
      <code>
        @i18n-micro/vue
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        createVueRouterAdapter
      </code>
    </td>
    
    <td>
      <code>
        @i18n-micro/vue/router
      </code>
    </td>
  </tr>
</tbody>
</table>

`TranslationKey` is not re-exported from `@i18n-micro/vue`; import it from `@i18n-micro/types`. Full signatures: [package reference](/api/packages/vue).

## Related

<card-group>
<card icon="i-lucide-book-open" title="Frameworks" to="./">

Instance options, router adapter, component props

</card>

<card icon="i-lucide-book-open" title="Types generator" to="./types-generator">

Autocomplete for keys

</card>

<card icon="i-lucide-book-open" title="DevTools UI" to="./devtools-ui-package">

Edit translations in the browser

</card>
</card-group>
