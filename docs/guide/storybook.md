# 🌐 Storybook Integration Guide

## 📖 Introduction

Integrating **Nuxt**, **Storybook**, and **nuxt-i18n-micro** into your project allows you to build a robust, localized application with a component-driven development approach. This guide provides a step-by-step walkthrough on setting up these tools together, including configuration, localization, and Storybook integration.

## 🛠 Nuxt Configuration

To enable localization and Storybook in your Nuxt project, configure your `nuxt.config.ts` file as follows:

### 📄 `nuxt.config.ts`

```typescript
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    'nuxt-i18n-micro', // Localization module
    '@nuxtjs/storybook', // Storybook module
  ],

  i18n: {
    locales: [
      { code: 'en', iso: 'en_EN', displayName: 'English' },
      { code: 'de', iso: 'de_DE', displayName: 'German' },
    ],
    strategy: 'prefix',
  },
});
```

## 🛠 Storybook Configuration

To integrate Storybook with Nuxt and nuxt-i18n-micro, configure the `.storybook/main.ts` file, add `mergeTranslations` and `staticDirs`.

### 📄 `.storybook/main.ts`

```typescript
import type { StorybookConfig } from '@storybook-vue/nuxt'
import fs from 'node:fs'
import path from 'node:path'

type TranslationValue = string | number | boolean | TranslationStructure | unknown | null
interface TranslationStructure {
  [key: string]: TranslationValue
}

const localesRoot = 'locales'

function mergeAllTranslations(target: TranslationStructure, ...sources: TranslationStructure[]): TranslationStructure {
  return sources.reduce((acc, source) => {
    for (const [key, value] of Object.entries(source)) {
      acc[key] = value
    }
    return acc
  }, target)
}

const getLocales = (): string[] => {
  const localesDir = path.join(__dirname, '../', localesRoot)
  try {
    return fs.readdirSync(localesDir)
      .filter(file => file.endsWith('.json'))
      .map(file => path.basename(file, '.json'))
  }
  catch (error) {
    console.error('Error reading locales directory:', error)
    return []
  }
}

const mergeTranslations = () => {
  const localesDir = path.join(__dirname, '../', localesRoot)
  const outputDir = path.join(__dirname, '../storybook_locales/_locales/general')
  const locales = getLocales()

  const collectAllTranslations = (dir: string, lang: string): TranslationStructure => {
    let translations: TranslationStructure = {}
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        translations = mergeAllTranslations(translations, collectAllTranslations(entryPath, lang))
      }
      else if (entry.isFile() && entry.name === `${lang}.json`) {
        const content = JSON.parse(fs.readFileSync(entryPath, 'utf-8'))
        translations = mergeAllTranslations(translations, content)
      }
    }
    return translations
  }

  locales.forEach((lang) => {
    // 1. Collect all page translations
    let merged = collectAllTranslations(path.join(localesDir, 'pages'), lang)

    // 2. Add general translations with priority
    const generalFilePath = path.join(localesDir, `${lang}.json`)
    if (fs.existsSync(generalFilePath)) {
      const generalContent = JSON.parse(fs.readFileSync(generalFilePath, 'utf-8'))
      merged = mergeAllTranslations(merged, generalContent)
    }

    // 3. Save result
    const outputPath = path.join(outputDir, `${lang}/data.json`)
    fs.mkdirSync(path.dirname(outputPath), { recursive: true })
    fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2))
  })
}

mergeTranslations()

const config: StorybookConfig = {
  stories: [
    '../components/**/*.mdx',
    '../components/**/*.stories.@(js|jsx|ts|tsx|mdx)',
  ],
  staticDirs: ['../storybook_locales'],
  addons: [
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook-vue/nuxt',
    options: {},
  }
}
export default config
```


## 🚀 Example Projects

For complete examples, check out these projects:

1. **[Nuxt + Storybook + i18n Example on GitHub](https://github.com/s00d/nuxtjs-storybook-i18n-micro)**  
   This repository demonstrates how to integrate Nuxt, Storybook, and nuxt-i18n-micro. It includes setup instructions and configuration details.

2. **[Storybook for Nuxt Documentation](https://storybook.nuxtjs.org/getting-started/setup)**  
   The official documentation for setting up Storybook with Nuxt. It provides detailed steps and best practices.

3. **[Interactive Example on StackBlitz](https://stackblitz.com/~/github.com/s00d/nuxtjs-storybook-i18n-micro)**  
   Explore a live example of Nuxt, Storybook, and nuxt-i18n-micro integration directly in your browser.

<div>
 <iframe
   src="https://stackblitz.com/github/s00d/nuxtjs-storybook-i18n-micro?embed=1"
   width="100%"
   height="500px"
   style="border: none;"
 ></iframe>
</div>
