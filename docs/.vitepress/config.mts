import { defineConfig } from 'vitepress'
import pkg from '../../package.json'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'en-US',
  title: 'Nuxt I18n Micro',
  description: 'Fast, simple, and lightweight i18n for Nuxt',
  lastUpdated: true,
  cleanUrls: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/methods', activeMatch: '/api/' },
      { text: 'Configuration', link: '/configuration/setup', activeMatch: '/configuration/' },
      { text: 'Components', link: '/components/i18n-t', activeMatch: '/components/' },
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
      '/configuration/': [
        {
          text: 'Configuration',
          base: '/configuration',
          items: [
            { text: 'Setup', link: '/setup' },
            { text: 'Module Options', link: '/options' },
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
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/s00d/nuxt-i18n-micro' },
    ],
  },
})
