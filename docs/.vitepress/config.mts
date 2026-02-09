import { withMermaid } from 'vitepress-plugin-mermaid'
import { withChartjs } from 'vitepress-plugin-chartjs'
import { withFolderTree } from 'vitepress-plugin-folder-tree'
import pkg from '../../package.json'

// https://vitepress.dev/reference/site-config
export default withFolderTree(withChartjs(withMermaid({
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
      { text: 'News', link: '/news' },
      {
        text: 'Integrations',
        items: [
          { text: 'Overview', link: '/integrations/' },
          { text: 'Vue Package', link: '/integrations/vue-package' },
          { text: 'React Package', link: '/integrations/react-package' },
          { text: 'Preact Package', link: '/integrations/preact-package' },
          { text: 'Solid Package', link: '/integrations/solid-package' },
          { text: 'Astro Package', link: '/integrations/astro-package' },
          { text: 'Node.js Package', link: '/integrations/nodejs-package' },
          { text: 'Types Generator', link: '/integrations/types-generator' },
          { text: 'Devtools Package', link: '/integrations/devtools-ui-package' },
        ],
      },
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Using', link: '/guide/using' },
          { text: 'Firebase Deployment', link: '/guide/firebase' },
          { text: 'Performance', link: '/guide/performance' },
          { text: 'Performance Test Results', link: '/guide/performance-results' },
          { text: 'Folder Structure', link: '/guide/folder-structure' },
          { text: 'Layers', link: '/guide/layers' },
          { text: 'SEO', link: '/guide/seo' },
          { text: 'Migration from nuxt-i18n', link: '/guide/migration' },
          { text: 'Upgrade to v3', link: '/guide/v3-upgrade' },
          { text: 'Contribution', link: '/guide/contribution' },
          { text: 'Multi Domain Locales', link: '/guide/multi-domain-locales' },
          { text: 'Custom Localized Routes', link: '/guide/custom-locale-routes' },
          { text: 'Per Component Translations', link: '/guide/per-component-translations' },
          { text: 'Crowdin Integration', link: '/guide/crowdin' },
          { text: 'FAQ', link: '/guide/faq' },
          { text: 'Server Side Translations', link: '/guide/server-side-translations' },
          { text: 'Strategy', link: '/guide/strategy' },
          { text: 'DevTools', link: '/guide/devtools' },
          { text: 'Testing', link: '/guide/testing' },
          { text: 'Storybook', link: '/guide/storybook' },
          { text: 'Custom Auto Detect', link: '/guide/custom-auto-detect' },
          { text: 'Excluding Static Files', link: '/guide/excluding-static-files' },
          { text: 'CLI Tool', link: '/guide/cli' },
        ],
      },
      {
        text: 'API',
        items: [
          { text: 'Methods', link: '/api/methods' },
          { text: 'Events', link: '/api/events' },
          { text: 'Translations and Cache', link: '/api/i18n-cache-api' },
        ],
      },
      { text: 'Examples', link: '/examples' },
      {
        text: 'Components',
        items: [
          { text: 'i18n-t', link: '/components/i18n-t' },
          { text: 'i18n-switcher', link: '/components/i18n-switcher' },
          { text: 'i18n-link', link: '/components/i18n-link' },
          { text: 'i18n-group', link: '/components/i18n-group' },
        ],
      },
      {
        text: 'Composables',
        items: [
          { text: 'useI18n', link: '/composables/useI18n' },
          { text: 'useLocaleHead', link: '/composables/useLocaleHead' },
          { text: 'useI18nLocale', link: '/composables/useI18nLocale' },
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
      '/integrations/': [
        {
          text: 'Integrations',
          base: '/integrations',
          items: [
            { text: 'Overview', link: '/' },
            { text: 'Vue Package', link: '/vue-package' },
            { text: 'React Package', link: '/react-package' },
            { text: 'Preact Package', link: '/preact-package' },
            { text: 'Solid Package', link: '/solid-package' },
            { text: 'Astro Package', link: '/astro-package' },
            { text: 'Node.js Package', link: '/nodejs-package' },
            { text: 'Types Generator', link: '/types-generator' },
            { text: 'Devtools Package', link: '/devtools-ui-package' },
          ],
        },
      ],
      '/guide/': [
        {
          text: 'Guide',
          base: '/guide',
          items: [
            { text: 'Getting Started', link: '/getting-started' },
            { text: 'Using', link: '/using' },
            { text: 'Firebase Deployment', link: '/firebase' },
            { text: 'Performance', link: '/performance' },
            { text: 'Performance Test Results', link: '/performance-results' },
            { text: 'Folder Structure', link: '/folder-structure' },
            { text: 'Layers', link: '/layers' },
            { text: 'Seo', link: '/seo' },
            { text: 'Migration from nuxt-i18n', link: '/migration' },
            { text: 'Upgrade to v3', link: '/v3-upgrade' },
            { text: 'Contribution', link: '/contribution' },
            { text: 'Multi Domain Locales', link: '/multi-domain-locales' },
            { text: 'Custom Localized Routes', link: '/custom-locale-routes' },
            { text: 'Per Component Translations', link: '/per-component-translations' },
            { text: 'Crowdin Integration', link: '/crowdin' },
            { text: 'FAQ', link: '/faq' },
            { text: 'Server Side Translations', link: '/server-side-translations' },
            { text: 'Strategy', link: '/strategy' },
            { text: 'DevTools', link: '/devtools' },
            { text: 'Testing', link: '/testing' },
            { text: 'Storybook', link: '/storybook' },
            { text: 'Custom Auto Detect', link: '/custom-auto-detect' },
            { text: 'Excluding Static Files', link: '/excluding-static-files' },
            { text: 'CLI Tool', link: '/cli' },
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
            { text: 'Translations and Cache', link: '/api/i18n-cache-api' },
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
            { text: 'i18n-group Component', link: '/i18n-group' },
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
            { text: 'useI18nLocale', link: '/useI18nLocale' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/s00d/nuxt-i18n-micro' },
    ],
  },

  // Mermaid configuration
  mermaid: {
    theme: 'default',
  },
  mermaidPlugin: {
    class: 'mermaid-chart',
  },

  // Chart.js configuration
  chartjs: {
    defaultHeight: '400px',
    root: new URL('../', import.meta.url).pathname,
    colorPalette: [
      'rgba(75, 192, 192, 0.8)',
      'rgba(255, 99, 132, 0.8)',
      'rgba(46, 204, 113, 0.8)',
      'rgba(255, 159, 64, 0.8)',
      'rgba(153, 102, 255, 0.8)',
    ],
  },
})))
