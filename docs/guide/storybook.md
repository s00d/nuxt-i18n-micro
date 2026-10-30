---
title: Storybook
description: Render components that use $t in Storybook for Nuxt by serving pre-merged translation payloads as static files.
outline: [2, 3]
---

# Storybook

Storybook for Nuxt (`@nuxtjs/storybook`) runs your components with the Nuxt app, but without the Nitro server that normally serves translation payloads. To make `$t` work in stories, write the payloads Storybook would fetch into a static folder before it starts. A complete project is in [s00d/nuxtjs-storybook-i18n-micro](https://github.com/s00d/nuxtjs-storybook-i18n-micro).

## Nuxt config

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-i18n-micro', '@nuxtjs/storybook'],
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', displayName: 'English' },
      { code: 'de', iso: 'de-DE', displayName: 'Deutsch' },
    ],
    defaultLocale: 'en',
  },
})
```

## Write the payloads

The browser loads `/_locales/<page>/<locale>/data.json`. Stories have no page route, so they load the `index` payload. Build one per locale that holds every page's keys plus the root keys:

```ts
// .storybook/main.ts
import fs from 'node:fs'
import path from 'node:path'
import type { StorybookConfig } from '@storybook-vue/nuxt'
import { deepMergeTranslations } from '@i18n-micro/utils/deep-merge'

type Tree = Record<string, unknown>

const localesDir = path.join(__dirname, '../locales')
const outDir = path.join(__dirname, '../storybook_locales/_locales/index')

const readJson = (file: string): Tree => JSON.parse(fs.readFileSync(file, 'utf-8'))

/** Every `<locale>.json` below `dir`, deep-merged. */
function collect(dir: string, locale: string): Tree {
  if (!fs.existsSync(dir)) return {}
  return fs.readdirSync(dir, { withFileTypes: true }).reduce<Tree>((acc, entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return deepMergeTranslations(acc, collect(full, locale))
    return entry.name === `${locale}.json` ? deepMergeTranslations(acc, readJson(full)) : acc
  }, {})
}

for (const file of fs.readdirSync(localesDir).filter((f) => f.endsWith('.json'))) {
  const locale = path.basename(file, '.json')
  // root keys first, page keys win (as in the module's build)
  const merged = deepMergeTranslations(readJson(path.join(localesDir, file)), collect(path.join(localesDir, 'pages'), locale))
  fs.mkdirSync(path.join(outDir, locale), { recursive: true })
  fs.writeFileSync(path.join(outDir, locale, 'data.json'), JSON.stringify(merged))
}

const config: StorybookConfig = {
  stories: ['../components/**/*.stories.@(ts|tsx|mdx)'],
  staticDirs: ['../storybook_locales'], // serves /_locales/index/<locale>/data.json
  framework: { name: '@storybook-vue/nuxt', options: {} },
}

export default config
```

`deepMergeTranslations` comes from `@i18n-micro/utils` (add it to your dev dependencies); it merges nested keys at any depth, like the module's own build. Add `storybook_locales/` to `.gitignore`.

## Related

- [Testing your app](/guide/testing)
- [Translation files](/guide/translations)
- [@nuxtjs/storybook](https://storybook.nuxtjs.org/getting-started/setup)
