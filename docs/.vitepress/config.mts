import { defineConfig } from 'vitepress'
import pkg from '../../package.json'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'en-US',
  title: 'Nuxt I18n Micro',
  description: 'Fast, simple, and lightweight i18n for Nuxt',
  lastUpdated: true,
  cleanUrls: true,
  base: process.env.NODE_ENV === 'production' ? '/nuxt-i18n-micro/' : '/',

  themeConfig: {
    search: {
      provider: 'local',
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Performance', link: '/guide/performance' },
          { text: 'Performance Test Results', link: '/guide/performance-results' },
          { text: 'Folder Structure', link: '/guide/folder-structure' },
          { text: 'Layers', link: '/guide/layers' },
          { text: 'SEO', link: '/guide/seo' },
          { text: 'Migration', link: '/guide/migration' },
          { text: 'Contribution', link: '/guide/contribution' },
          { text: 'Multi Domain Locales', link: '/guide/multi-domain-locales' },
          { text: 'Custom Localized Routes', link: '/guide/custom-locale-routes' },
          { text: 'Per Component Translations', link: '/guide/per-component-translations' },
        ],
      },
      {
        text: 'API',
        items: [
          { text: 'Methods', link: '/api/methods' },
          { text: 'Events', link: '/api/events' },
        ],
      },
      { text: 'Examples', link: '/examples' },
      {
        text: 'Components',
        items: [
          { text: 'i18n-t', link: '/components/i18n-t' },
          { text: 'i18n-switcher', link: '/components/i18n-switcher' },
          { text: 'i18n-link', link: '/components/i18n-link' },
        ],
      },
      {
        text: 'Composables',
        items: [
          { text: 'useI18n', link: '/composables/useI18n' },
          { text: 'useLocaleHead', link: '/composables/useLocaleHead' },
        ],
      },
      {
        text: pkg.version,
        items: [
          {
            text: 'Changelog',
            link: 'https://github.com/s00d/nuxt-i18n-micro/blob/main/CHANGELOG.md',
          },
        ],
      },
    ],

    editLink: {
      pattern: 'https://github.com/s00d/nuxt-i18n-micro/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },

    footer: {
      message: 'Released under the MIT License.',
    },

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          base: '/guide',
          items: [
            { text: 'Getting Started', link: '/getting-started' },
            { text: 'Performance', link: '/performance' },
            { text: 'Folder Structure', link: '/folder-structure' },
            { text: 'Layers', link: '/layers' },
            { text: 'Seo', link: '/seo' },
            { text: 'Migration', link: '/migration' },
            { text: 'Contribution', link: '/contribution' },
            { text: 'Multi Domain Locales', link: '/multi-domain-locales' },
            { text: 'Custom Localized Routes', link: '/custom-locale-routes' },
            { text: 'Per Component Translations', link: '/per-component-translations' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API',
          base: '/api',
          items: [
            { text: 'Methods', link: '/methods' },
            { text: 'Events', link: '/events' },
          ],
        },
      ],
      '/components/': [
        {
          text: 'Components',
          base: '/components',
          items: [
            { text: 'i18n-t Component', link: '/i18n-t' },
            { text: 'ii18n-switcher Component', link: '/i18n-switcher' },
            { text: 'i18n-link Component', link: '/i18n-link' },
          ],
        },
      ],
      '/composables/': [
        {
          text: 'Composables',
          base: '/composables',
          items: [
            { text: 'useI18n', link: '/useI18n' },
            { text: 'useLocaleHead', link: '/useLocaleHead' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/s00d/nuxt-i18n-micro' },
    ],
  },
})
