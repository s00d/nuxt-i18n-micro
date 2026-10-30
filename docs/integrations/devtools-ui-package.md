---
title: 'DevTools UI'
description: 'A translation editor for Vite dev servers, and a bridge that connects it to any @i18n-micro instance.'
outline: 'deep'
---

# DevTools UI

`@i18n-micro/devtools-ui` is the translation editor from the Nuxt DevTools tab, packaged as a web component with a Vite plugin. Add it to a Vue, React, Preact, Solid or Astro project to browse and edit the JSON files in your translation folder from the browser during development. Nuxt apps already have it in [Nuxt DevTools](/guide/devtools).

## Install

::: code-group

```bash [pnpm]
pnpm add -D @i18n-micro/devtools-ui
```

```bash [npm]
npm install -D @i18n-micro/devtools-ui
```

```bash [yarn]
yarn add -D @i18n-micro/devtools-ui
```

:::

No peer dependencies.

## Setup

```ts
// vite.config.ts (or the `vite` key of astro.config.mjs)
import { defineConfig } from 'vite'
import { i18nDevToolsPlugin } from '@i18n-micro/devtools-ui/vite'

export default defineConfig({
  plugins: [i18nDevToolsPlugin({ translationDir: 'src/locales' })],
})
```

| Option | Default | Notes |
| --- | --- | --- |
| `translationDir` | `'src/locales'` | Folder with the JSON files, relative to the Vite root. |
| `base` | `'/__i18n_api'` | Base path of the API endpoints. |
| `injectButton` | `true` | Add a floating button to pages served through Vite's `index.html` transform. |
| `defaultLocale` | first locale file in `translationDir` | Reported by `/config`. |
| `fallbackLocale` | `defaultLocale` | Reported by `/config`. |

The plugin runs on the dev server only (`apply: 'serve'`); a production build contains nothing from it. The button opens `/__i18n_devtools.html`, which reads and saves files through the plugin's endpoints:

| Endpoint | Does |
| --- | --- |
| `GET <base>/files` | `{ files, structure }`: every `.json` under `translationDir` |
| `GET <base>/file?path=en.json` | `{ success, content, path }`; 404 for anything but an existing `.json` inside `translationDir` |
| `POST <base>/save` | body `{ file, content }`; overwrites an existing `.json` inside `translationDir`, 403 for anything else. It never creates a file |
| `GET <base>/config` | `{ defaultLocale, fallbackLocale, locales, translationDir }`; `locales` come from the root files in `translationDir` |

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

`saveTranslation` updates the instance first, then POSTs to `<base>/save`. When there is no endpoint (a static preview build) the edit is kept in `localStorage`; any other save error restores the previous dictionary and throws.

## API

| Export | Entry |
| --- | --- |
| `i18nDevToolsPlugin(options)` | `@i18n-micro/devtools-ui/vite` |
| `register()`, `I18nDevToolsElement` | `@i18n-micro/devtools-ui` |
| `createBridge(options)`, types `BridgeAdapter`, `CreateBridgeOptions`, `I18nDevToolsBridge` | `@i18n-micro/devtools-ui` (also `/bridge/create`, `/bridge`) |
| `createRpcClient`, `setupRpcHost` | `@i18n-micro/devtools-ui` |

Full signatures: [package reference](/api/packages/devtools-ui).

## Related

- [Nuxt DevTools](/guide/devtools) — the same editor inside Nuxt
- [Frameworks](./) — the instance and its `storage`
