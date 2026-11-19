# DevTools UI

`@i18n-micro/devtools-ui` is the translation editor from the Nuxt DevTools tab, packaged as a web component with a Vite plugin. Add it to a Vue, React, Preact, Solid or Astro project to browse and edit the JSON files in your translation folder from the browser during development. Nuxt apps already have it in [Nuxt DevTools](/guide/devtools).

![The DevTools UI: a file tree and an editor with the default-locale text next to each key](/devtools/02-translations-editor-dark.webp)

## Install

<code-group>

```bash [pnpm]
pnpm add -D @i18n-micro/devtools-ui
```

```bash [npm]
npm install -D @i18n-micro/devtools-ui
```

```bash [yarn]
yarn add -D @i18n-micro/devtools-ui
```

</code-group>

No peer dependencies.

## Setup

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { i18nDevToolsPlugin } from '@i18n-micro/devtools-ui/vite'

export default defineConfig({
  plugins: [i18nDevToolsPlugin({ translationDir: 'src/locales' })],
})
```

<table>
<thead>
  <tr>
    <th>
      Option
    </th>
    
    <th>
      Default
    </th>
    
    <th>
      Notes
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        translationDir
      </code>
    </td>
    
    <td>
      <code>
        'src/locales'
      </code>
    </td>
    
    <td>
      Folder with the JSON files, relative to the Vite root.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        base
      </code>
    </td>
    
    <td>
      <code>
        '/__i18n_api'
      </code>
    </td>
    
    <td>
      Base path of the API endpoints.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        injectButton
      </code>
    </td>
    
    <td>
      <code>
        true
      </code>
    </td>
    
    <td>
      Add a floating button to pages served through Vite's <code>
        index.html
      </code>
      
       transform. Astro has no such pages: see below.
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        defaultLocale
      </code>
    </td>
    
    <td>
      first locale file in <code>
        translationDir
      </code>
    </td>
    
    <td>
      Reported by <code>
        /config
      </code>
      
      .
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        fallbackLocale
      </code>
    </td>
    
    <td>
      <code>
        defaultLocale
      </code>
    </td>
    
    <td>
      Reported by <code>
        /config
      </code>
      
      .
    </td>
  </tr>
</tbody>
</table>

The plugin runs on the dev server only (`apply: 'serve'`); a production build contains nothing from it. The button opens `/__i18n_devtools.html`, which reads and saves files through the plugin's endpoints:

<table>
<thead>
  <tr>
    <th>
      Endpoint
    </th>
    
    <th>
      Does
    </th>
  </tr>
</thead>

<tbody>
  <tr>
    <td>
      <code>
        GET <base>/translations
      </code>
    </td>
    
    <td>
      every dictionary under <code>
        translationDir
      </code>
      
      , by relative path
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        POST <base>/save
      </code>
    </td>
    
    <td>
      body <code>
        { file, content }
      </code>
      
      ; overwrites an existing <code>
        .json
      </code>
      
       inside <code>
        translationDir
      </code>
      
      , 403 for anything else. It never creates a file
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        GET <base>/config
      </code>
    </td>
    
    <td>
      <code>
        { defaultLocale, fallbackLocale, locales, translationDir }
      </code>
      
      ; <code>
        locales
      </code>
      
       come from the root files in <code>
        translationDir
      </code>
    </td>
  </tr>
</tbody>
</table>

The endpoints answer the devtools page only: a request from another origin or host is a `403`, and `/save` takes `application/json` only (`415`). The page hears about file changes over Vite's HMR socket.

In Astro, add the integration instead of the plugin. It adds an app to the dev toolbar:

```ts
// astro.config.mjs
import { defineConfig } from 'astro/config'
import { i18nDevToolsIntegration } from '@i18n-micro/devtools-ui/vite'

export default defineConfig({
  integrations: [i18nDevToolsIntegration({ translationDir: 'src/locales' })],
})
```

Saving only writes the file. An app that imports the JSON through Vite gets it through HMR; for edits applied to the running instance directly, use a bridge.

## Bridge to a live instance

To embed the editor in your own page and have edits applied to the running instance at once, create a bridge from an adapter and pass it to the `<i18n-devtools-ui>` element:

```ts
import { createBridge, register } from '@i18n-micro/devtools-ui'
import { i18n, locales } from './i18n' // a runtime, React, Preact or Solid instance

register() // defines <i18n-devtools-ui> once

const bridge = createBridge({
  adapter: {
    getRouteCache: () => Object.fromEntries(i18n.storage.translations),
    addTranslations: (locale, content, merge) => i18n.addTranslations(locale, content, merge),
    addRouteTranslations: (locale, route, content, merge) => i18n.addRouteTranslations(locale, route, content, merge),
    subscribe: (cb) => i18n.subscribe(cb),
    getCurrentLocale: () => i18n.locale,
  },
  locales,
  defaultLocale: 'en',
  translationDir: 'src/locales',
})

const el = document.createElement('i18n-devtools-ui') as HTMLElement & { bridge: typeof bridge }
el.bridge = bridge
document.body.append(el)
```

`getRouteCache` must return the dictionaries keyed `locale:route` (`en:index`, `en:blog-post`), which is what `i18n.storage.translations` holds. For a Vue instance use `i18n.global.getRouteCache()` and `i18n.global.subscribeToChanges(cb)`.

`saveTranslation` updates the instance first, then POSTs to `<base>/save`. When there is no endpoint (a static preview build) or the dev server cannot be reached, the edit is kept in `localStorage`; any other save error restores the previous dictionary and throws.

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
        i18nDevToolsPlugin(options)
      </code>
      
      , <code>
        i18nDevToolsIntegration(options)
      </code>
    </td>
    
    <td>
      <code>
        @i18n-micro/devtools-ui/vite
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        register()
      </code>
      
      , <code>
        I18nDevToolsElement
      </code>
    </td>
    
    <td>
      <code>
        @i18n-micro/devtools-ui
      </code>
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        createBridge(options)
      </code>
      
      , types <code>
        BridgeAdapter
      </code>
      
      , <code>
        CreateBridgeOptions
      </code>
    </td>
    
    <td>
      <code>
        @i18n-micro/devtools-ui
      </code>
      
       (also <code>
        /bridge/create
      </code>
      
      )
    </td>
  </tr>
  
  <tr>
    <td>
      type <code>
        I18nDevToolsBridge
      </code>
    </td>
    
    <td>
      <code>
        @i18n-micro/devtools-ui
      </code>
      
       (also <code>
        /bridge
      </code>
      
      )
    </td>
  </tr>
  
  <tr>
    <td>
      <code>
        createRpcClient
      </code>
      
      , <code>
        setupRpcHost
      </code>
    </td>
    
    <td>
      <code>
        @i18n-micro/devtools-ui
      </code>
    </td>
  </tr>
</tbody>
</table>

Full signatures: [package reference](/api/packages/devtools-ui).

## Related

<card-group>
<card icon="i-lucide-book-open" title="Nuxt DevTools" to="/guide/devtools">

The same editor inside Nuxt

</card>

<card icon="i-lucide-book-open" title="Frameworks" to="./">

The instance and its `storage`

</card>
</card-group>
