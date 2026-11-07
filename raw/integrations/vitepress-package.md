# VitePress

`@i18n-micro/vitepress` adds runtime dictionaries to a VitePress site: `$t` and `<I18nT>` inside markdown, path helpers and SEO tags, built on [`@i18n-micro/vue`](./vue-package). Use it when the same UI strings appear on many pages and you do not want to duplicate them per locale. The locale follows VitePress's own path locales (`/`, `/fr/`).

## When to use it

<table>
<thead>
  <tr>
    <th>
      Need
    </th>
    
    <th>
      Solution
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      Duplicate <code>
        .md
      </code>
      
      , URL prefixes
    </td>
    
    <td>
      VitePress <code>
        locales
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      Runtime <code>
        $t
      </code>
      
       / components / path sync / SEO head
    </td>
    
    <td>
      <code>
        @i18n-micro/vitepress
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      Default theme chrome labels (<code>
        docFooter
      </code>
      
      , search UI)
    </td>
    
    <td>
      Your own <code>
        themeConfig
      </code>
      
       per locale
    </td>
  </tr>
</tbody>
</table>

<tip>

**Playground** — [`packages/vitepress/playground`](https://github.com/s00d/nuxt-i18n-micro/tree/main/packages/vitepress/playground) — `pnpm -C packages/vitepress/playground dev`

</tip>

## Install

<code-group>

```bash [pnpm]
pnpm add @i18n-micro/vitepress
```

```bash [npm]
npm install @i18n-micro/vitepress
```

```bash [yarn]
yarn add @i18n-micro/vitepress
```

</code-group>

Peer dependencies: `vitepress` `>=1.0.0 || >=2.0.0-alpha.0`, `vue` `^3.3.0`. Node scripts use `@i18n-micro/node`, installed with the package and re-exported through `/node`. The published types need Vue 3.5.5 or later with `skipLibCheck: false`; with `skipLibCheck: true`, the usual template setting, older versions compile too.

## Setup

```text
locales/en.json
locales/fr.json
locales/pages/guide/demo/en.json   # optional page-scoped
locales/pages/guide/demo/fr.json
```

Page files map to route names the same way as Nuxt/Astro (`guide/demo` → `guide-demo`).

### 1. Config — `@i18n-micro/vitepress/config`

```ts
// .vitepress/config.mts
import { defineConfig } from 'vitepress'
import { withI18n, buildVitePressLocales } from '@i18n-micro/vitepress/config'

const locales = [
  { code: 'en', iso: 'en-US', displayName: 'English', og: 'en_US' },
  { code: 'fr', iso: 'fr-FR', displayName: 'Français', og: 'fr_FR' },
]
const defaultLocale = 'en'

export default defineConfig(
  withI18n(
    {
      locales: buildVitePressLocales(locales, defaultLocale),
      // themeConfig.i18nRouting is injected automatically
    },
    {
      locale: defaultLocale,
      defaultLocale,
      locales,
      translationDir: 'locales',
      metaBaseUrl: 'https://example.com', // optional SEO head
    },
  ),
)
```

### 2. Theme — `@i18n-micro/vitepress/theme`

```ts
// .vitepress/theme/index.ts
import DefaultTheme from 'vitepress/theme'
import { defineI18nTheme } from '@i18n-micro/vitepress/theme'

export default defineI18nTheme(DefaultTheme)
```

Initial locale is taken from the current path before install (no default-locale flash on `/fr/…`).

### Advanced: manual `createI18n`

One factory for the client: Vue plugin + path methods + `enhanceApp` (no separate router helper exports).

```ts
import { createI18n, messagesFromGlob } from '@i18n-micro/vitepress'

const i18n = createI18n({
  locale: 'en',
  defaultLocale: 'en',
  locales: [{ code: 'en' }, { code: 'fr' }],
  messages: messagesFromGlob(import.meta.glob('../../locales/*.json', { eager: true })),
})

i18n.localizePath('/guide', 'fr')
// in theme enhanceApp:
i18n.enhanceApp({ app, router })
```

### Node scripts — `@i18n-micro/vitepress/node`

Uses `@i18n-micro/node` `createI18n` / `loadTranslations` (same as Astro & CLI), then attaches VitePress path methods with `BaseI18n.extend`:

```ts
import { createI18n } from '@i18n-micro/vitepress/node'

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  translationDir: './locales',
  locales: ['en', 'fr'],
  defaultLocale: 'en',
})
await i18n.loadTranslations()
i18n.t('cta.readMore')
i18n.localizePath('/guide', 'fr')
```

Plain Node without paths: `import { createI18n } from '@i18n-micro/node'`.

## In-page translations

Each VitePress markdown file is a Vue SFC.

### Global components and `$t` (recommended in markdown)

`createI18n` / `defineI18nTheme` install `@i18n-micro/vue`, which registers `I18nT` / `I18nLink` / `I18nGroup` / `I18nSwitcher` and `$t` / `$tc` / `$ts`.

```md
{{ $t('cta.readMore') }}

<I18nT keypath="greeting" :params="{ name: 'VitePress' }" />

<I18nLink to="/guide/demo">Demo</I18nLink>
```

### `useI18n` in `<script setup>`

```md
<script setup>
import { useI18n } from '@i18n-micro/vitepress'
const { t, tc, locale, localePath, switchLocale } = useI18n()
</script>

# {{ t('section.title') }}
```

## Language dropdown

When `locales` has more than one entry, VitePress shows its own language menu (`VPNavBarTranslations`). `withI18n` wires `themeConfig.i18nRouting` so the globe matches `<I18nSwitcher>` / path helpers.

Use `<I18nSwitcher>` only in custom layouts, not next to the default globe.

## SSR notes

- Locale on prerender comes from the URL path, not cookies.
- Theme code must not touch `window` at import time.
- Import `defineI18nTheme` from `/theme` so Node config evaluation never loads `virtual:i18n-micro/*`.

## API surface

<table>
<thead>
  <tr>
    <th>
      Export
    </th>
    
    <th>
      Role
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        createI18n
      </code>
      
       (<code>
        .
      </code>
      
      )
    </td>
    
    <td>
      Client: Vue plugin + path methods + <code>
        enhanceApp
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        getLocaleFromPath
      </code>
      
       / <code>
        stripSiteBase
      </code>
      
       / <code>
        routeNameFromPath
      </code>
      
       (<code>
        .
      </code>
      
      )
    </td>
    
    <td>
      Manual locale sync when <code>
        syncWithVitePress: false
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        createI18n
      </code>
      
       (<code>
        /node
      </code>
      
      )
    </td>
    
    <td>
      Node: <code>
        @i18n-micro/node
      </code>
      
       + path methods
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        defineI18nTheme
      </code>
      
       (<code>
        /theme
      </code>
      
      )
    </td>
    
    <td>
      Zero-boilerplate theme
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        withI18n
      </code>
      
       (<code>
        /config
      </code>
      
      )
    </td>
    
    <td>
      Config + virtual modules + optional SEO
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        buildVitePressLocales
      </code>
      
       (<code>
        /config
      </code>
      
      )
    </td>
    
    <td>
      Build VitePress <code>
        locales
      </code>
      
       from <code>
        Locale[]
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        buildVitePressLocaleHead
      </code>
      
       (<code>
        /config
      </code>
      
      )
    </td>
    
    <td>
      Manual SEO head (also used by <code>
        metaBaseUrl
      </code>
      
      )
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        messagesFromGlob
      </code>
    </td>
    
    <td>
      Optional glob → messages map for <code>
        createI18n
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        useI18n
      </code>
      
       / <code>
        I18nT
      </code>
      
       / …
    </td>
    
    <td>
      Re-exported from <code>
        @i18n-micro/vue
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        BaseI18n.extend
      </code>
      
       (<code>
        @i18n-micro/core
      </code>
      
      )
    </td>
    
    <td>
      Attach custom methods on any i18n instance
    </td>
  </tr>
</tbody>
</table>

## OpenAPI-style sites (integration locks)

Regression suite: `packages/vitepress/tests/integration-openapi.test.ts` (deep paths, `base=/openapi_docs/`, sync off + manual locale, Node generators, SEO).

<table>
<thead>
  <tr>
    <th>
      Pattern
    </th>
    
    <th>
      Do this
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      Deep <code>
        /…/{spec}/{op}
      </code>
      
       pages, only root UI JSON
    </td>
    
    <td>
      Prefer default <code>
        syncWithVitePress: true
      </code>
      
       (keeps <code>
        setRoute('index')
      </code>
      
       when no page dict) <strong>
        or
      </strong>
      
       <code>
        syncWithVitePress: false
      </code>
      
       + <code>
        getLocaleFromPath
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      Never call <code>
        setRoute(deepName)
      </code>
      
       without page dictionaries
    </td>
    
    <td>
      Root UI keys disappear until <code>
        setRoute('index')
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      Generators / <code>
        getTranslation
      </code>
    </td>
    
    <td>
      <code>
        createI18n
      </code>
      
       from <code>
        /node
      </code>
      
       + <code>
        await loadTranslations()
      </code>
      
       + <code>
        i18n.t(key)
      </code>
      
       (set <code>
        i18n.locale
      </code>
      
      )
    </td>
  </tr>
  
  <tr>
    <td>
      Custom canonical in <code>
        transformPageData
      </code>
    </td>
    
    <td>
      Pass <code>
        meta: false
      </code>
      
       to <code>
        withI18n
      </code>
      
       (avoid double tags)
    </td>
  </tr>
  
  <tr>
    <td>
      Package SEO with site base
    </td>
    
    <td>
      <code>
        metaBaseUrl
      </code>
      
       + VitePress <code>
        base
      </code>
      
       → absolute URLs include base
    </td>
  </tr>
  
  <tr>
    <td>
      Rename from older package builds
    </td>
    
    <td>
      <code>
        withI18nMicro
      </code>
      
       → <code>
        withI18n
      </code>
      
      , <code>
        createVitePressI18n
      </code>
      
       → <code>
        createI18n
      </code>
      
      , <code>
        loadMessages
      </code>
      
       → node <code>
        createI18n
      </code>
    </td>
  </tr>
</tbody>
</table>

## Related

<card-group>
<card icon="i-lucide-book-open" title="Vue" to="./vue-package">

The components and `useI18n` this package re-exports

</card>

<card icon="i-lucide-book-open" title="Node.js" to="./nodejs-package">

The loader behind `/node`

</card>

<card icon="i-lucide-braces" title="Package reference" to="/api/packages/vitepress">



</card>
</card-group>
