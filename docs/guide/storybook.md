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
    strategy: 'prefix', // Use language prefix in URLs
  },
});
```

## 🛠 Storybook Configuration

To integrate Storybook with Nuxt and nuxt-i18n, configure the `.storybook/main.ts` file. This involves setting up `viteFinal` and `webpackFinal` to handle localization and proxy requests.

### 📄 `.storybook/main.ts`

```typescript
import type { StorybookConfig } from '@storybook-vue/nuxt';

const config: StorybookConfig = {
  stories: [
    '../components/**/*.mdx',
    '../components/**/*.stories.@(js|jsx|ts|tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@chromatic-com/storybook',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook-vue/nuxt',
    options: {},
  },
  async viteFinal(config, { configType }) {
    // Configure Vite proxy for localization files
    config.server = {
      ...config.server,
      proxy: {
        '/_locales': {
          target: 'http://localhost:3000', // Replace with your Nuxt server URL
          changeOrigin: true,
          secure: false,
        },
      },
    };

    return config;
  },
  webpackFinal: async (config, { configType }) => {
    // Configure Webpack proxy for localization files
    config.devServer = {
      ...config.devServer,
      proxy: {
        '/_locales': {
          target: 'http://localhost:3000', // Replace with your Nuxt server URL
          changeOrigin: true,
          secure: false,
        },
      },
    };

    return config;
  },
};

export default config;
```

### 🔑 Key Points in Configuration

1. **Proxy Configuration**:
  - The `/_locales` path is proxied to your Nuxt server to ensure Storybook can access localization files.
  - Replace `http://localhost:3000` with the URL of your Nuxt server.

2. **Port Configuration**:
  - Ensure the port in the proxy configuration matches the port your Nuxt application is running on.

---


## 🚀 Example Projects

For complete examples, check out these projects:

1. **[Nuxt + Storybook + i18n Example on GitHub](https://github.com/s00d/nuxtjs-storybook-i18n-micro)**  
   This repository demonstrates how to integrate Nuxt, Storybook, and nuxt-i18n. It includes setup instructions and configuration details.

2. **[Storybook for Nuxt Documentation](https://storybook.nuxtjs.org/getting-started/setup)**  
   The official documentation for setting up Storybook with Nuxt. It provides detailed steps and best practices.

3. **[Interactive Example on StackBlitz](https://stackblitz.com/~/github.com/s00d/nuxtjs-storybook-i18n-micro)**  
   Explore a live example of Nuxt, Storybook, and nuxt-i18n integration directly in your browser.

<div>
 <iframe
   src="https://stackblitz.com/github/s00d/nuxtjs-storybook-i18n-micro?embed=1"
   width="100%"
   height="500px"
   style="border: none;"
 ></iframe>
</div>
