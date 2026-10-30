import { readdirSync } from 'node:fs'
import llmstxt from 'vitepress-plugin-llms'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { withChartjs } from 'vitepress-plugin-chartjs'
import { withFolderTree } from 'vitepress-plugin-folder-tree'
import pkg from '../../package.json'
import { writeRedirectStubs } from './redirect-stubs'
import { redirectTarget } from './redirects'
import { SITE, transformHead } from './seo'

const docsBase = process.env.NODE_ENV === 'production' ? '/nuxt-i18n-micro/' : '/'

// `docs:generate` writes one page per workspace package, so the list is read from disk
// and a new package appears without touching this file.
const packagePages = readdirSync(new URL('../api/packages/', import.meta.url))
  .filter((file) => file.endsWith('.md'))
  .map((file) => file.replace(/\.md$/, ''))
  .sort()

/** `/api/`, `/composables/` and `/components/` are one reference with one sidebar. */
const apiSidebar = [
  {
    text: 'Nuxt module',
    items: [
      { text: 'Overview', link: '/api/' },
      { text: 'Module options', link: '/api/module-options' },
      { text: 'Helpers ($t, $localePath, …)', link: '/api/methods' },
      { text: 'Hooks', link: '/api/events' },
    ],
  },
  {
    text: 'Composables',
    base: '/composables',
    items: [
      { text: 'useI18n', link: '/useI18n' },
      { text: 'useI18nLocale', link: '/useI18nLocale' },
      { text: 'useI18nHead', link: '/useI18nHead' },
      { text: 'useLocaleHead', link: '/useLocaleHead' },
    ],
  },
  {
    text: 'Components',
    base: '/components',
    items: [
      { text: 'i18n-t', link: '/i18n-t' },
      { text: 'i18n-link', link: '/i18n-link' },
      { text: 'i18n-switcher', link: '/i18n-switcher' },
      { text: 'i18n-group', link: '/i18n-group' },
    ],
  },
  {
    text: 'Packages',
    base: '/api',
    collapsed: true,
    items: [{ text: 'Package APIs', link: '/packages' }, ...packagePages.map((slug) => ({ text: `@i18n-micro/${slug}`, link: `/packages/${slug}` }))],
  },
]

// https://vitepress.dev/reference/site-config
export default withFolderTree(
  withChartjs(
    withMermaid({
      vite: {
        plugins: [
          // Publishes the docs in the form an LLM can actually read: `/llms.txt` as an
          // index, `/llms-full.txt` as one bundle, and a `.md` twin of every page — so an
          // assistant answering about this module quotes the docs instead of guessing
          // from the HTML it scraped.
          llmstxt({
            // Origin only: the plugin prepends VitePress's own `base`, so a domain that
            // already contains it produces `/nuxt-i18n-micro/nuxt-i18n-micro/…`.
            domain: new URL(SITE.url).origin,
            title: 'Nuxt I18n Micro',
            description: SITE.defaultDescription,
            // Only the landing page: it is a marketing hero with no prose an assistant
            // could answer from. Every section index carries real documentation — the
            // news entries, the integration overview, the API overview — and excluding
            // them cost the bundle several hundred lines of exactly the content it is for.
            ignoreFiles: ['index.md'],
          }),
        ],
        build: {
          chunkSizeWarningLimit: 1000,
          rollupOptions: {
            output: {
              manualChunks(id) {
                if (id.includes('chart.js')) return 'chartjs'
                if (id.includes('mermaid')) return 'mermaid'
                if (id.includes('vitepress-plugin-folder-tree')) return 'folder-tree'
                if (id.includes('vitepress-plugin-chartjs')) return 'vp-chartjs'
              },
            },
          },
        },
      },
      lang: 'en-US',
      title: 'Nuxt I18n Micro',
      description: SITE.defaultDescription,
      titleTemplate: ':title | Nuxt I18n Micro',
      lastUpdated: true,
      cleanUrls: true,
      base: docsBase,

      transformHead,

      // A link to a moved page still works: the redirect map sends it on.
      ignoreDeadLinks: [(url: string) => redirectTarget(url) !== undefined],

      buildEnd(site) {
        writeRedirectStubs(site.outDir, site.site.base)
      },

      sitemap: {
        hostname: 'https://s00d.github.io',
        transformItems(items) {
          const prefix = '/nuxt-i18n-micro'
          return items.map((item) => {
            const path = item.url === '/' ? '/' : item.url.startsWith('/') ? item.url : `/${item.url}`
            return { ...item, url: `${prefix}${path}` }
          })
        },
      },

      head: [
        ['link', { rel: 'icon', href: `${docsBase}favicon.ico`, sizes: 'any' }],
        ['link', { rel: 'icon', type: 'image/svg+xml', href: `${docsBase}favicon.svg` }],
        ['link', { rel: 'apple-touch-icon', href: `${docsBase}apple-touch-icon.png` }],
        ['meta', { name: 'application-name', content: SITE.name }],
        ['meta', { name: 'keywords', content: 'nuxt,i18n,internationalization,nuxt-module,localization,vue,ssr,seo' }],
        ['link', { rel: 'dns-prefetch', href: 'https://github.com' }],
        ['link', { rel: 'dns-prefetch', href: 'https://widget.mintlify.com' }],
        ['script', { type: 'module', src: 'https://widget.mintlify.com/v1/embed.js' }],
        [
          'script',
          { type: 'module' },
          `const isDark = () => document.documentElement.classList.contains('dark')
const theme = () => (isDark() ? 'dark' : 'light')

const trigger = document.createElement('button')
trigger.type = 'button'
trigger.className = 'ni18n-ask-ai'
trigger.setAttribute('aria-label', 'Ask AI')
trigger.innerHTML = '<span class="ni18n-ask-ai__icon" aria-hidden="true">✦</span><span>Ask AI</span>'
document.body.appendChild(trigger)

await window.MintlifyAssistant.init({
  id: "mint_widget_fe4a84f3-0f6c-4dc0-94d6-3941d70125c2",
  appearance: {
    variant: "widget",
    theme: theme(),
    accent: "#32ba8c",
    radius: "16px",
    side: "bottom",
    align: "end",
    logo: "${SITE.url}/favicon.svg",
    zIndex: 40,
  },
  labels: {
    title: "Ask AI",
    trigger: "Ask AI",
    placeholder: "Ask about Nuxt I18n Micro…",
    suggestions: "Try asking",
  },
  starterQuestions: [
    "How do I install nuxt-i18n-micro?",
    "Which routing strategy should I use?",
    "How do page-level translations work?",
  ],
})

// Keep our trigger mounted over the closed Shadow DOM vendor button (z-index 50 > 40).
// Mintlify does not expose a supported way to hide the built-in trigger.
trigger.addEventListener('click', () => {
  void window.MintlifyAssistant.open({ source: 'custom-trigger', focus: true })
})

new MutationObserver(() => {
  void window.MintlifyAssistant.update({
    appearance: { theme: theme() },
  })
}).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["class"],
})`,
        ],
      ],

      themeConfig: {
        search: {
          provider: 'local',
        },
        // https://vitepress.dev/reference/default-theme-config
        // One entry per audience, no dropdowns: each opens its own sidebar.
        nav: [
          { text: 'Guide', link: '/guide/getting-started' },
          { text: 'Frameworks', link: '/integrations/' },
          { text: 'API', link: '/api/' },
          { text: 'Contributing', link: '/contributing/' },
          { text: 'News', link: '/news' },
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
              text: 'Getting started',
              base: '/guide',
              items: [
                { text: 'Getting started', link: '/getting-started' },
                { text: 'Migrating from @nuxtjs/i18n', link: '/migration' },
                { text: 'Upgrading', link: '/upgrade' },
              ],
            },
            {
              text: 'Concepts',
              base: '/guide',
              items: [
                { text: 'Translation files', link: '/translations' },
                { text: 'Routing strategies', link: '/strategy' },
                { text: 'Locale detection', link: '/locale-detection' },
              ],
            },
            {
              text: 'Guides',
              base: '/guide',
              items: [
                { text: 'Page config', link: '/per-component-translations' },
                { text: 'Localized paths', link: '/custom-locale-routes' },
                { text: 'Custom locale detection', link: '/custom-auto-detect' },
                { text: 'SEO', link: '/seo' },
                { text: 'Server routes and API', link: '/server-side-translations' },
                { text: 'Excluding paths', link: '/excluding-static-files' },
                { text: 'Layers and domains', link: '/layers' },
                { text: 'Runtime overrides', link: '/runtime-overrides' },
              ],
            },
            {
              text: 'Deploy and performance',
              base: '/guide',
              items: [
                { text: 'Deployment', link: '/deployment' },
                { text: 'Performance tuning', link: '/performance' },
                { text: 'Benchmarks', link: '/performance-results' },
              ],
            },
            {
              text: 'Testing and tools',
              base: '/guide',
              items: [
                { text: 'Testing your app', link: '/testing' },
                { text: 'DevTools', link: '/devtools' },
                { text: 'CLI', link: '/cli' },
                { text: 'Crowdin', link: '/crowdin' },
                { text: 'Storybook', link: '/storybook' },
              ],
            },
            {
              text: 'Help',
              base: '/guide',
              items: [{ text: 'FAQ', link: '/faq' }],
            },
          ],
          '/integrations/': [
            {
              text: 'Overview',
              base: '/integrations',
              items: [{ text: 'Packages and shared concepts', link: '/' }],
            },
            {
              text: 'Frameworks',
              base: '/integrations',
              items: [
                { text: 'Vue', link: '/vue-package' },
                { text: 'React and Preact', link: '/react-package' },
                { text: 'Solid', link: '/solid-package' },
                { text: 'Astro', link: '/astro-package' },
                { text: 'Astro islands', link: '/astro-islands' },
              ],
            },
            {
              text: 'Other runtimes',
              base: '/integrations',
              items: [
                { text: 'VitePress', link: '/vitepress-package' },
                { text: 'Runtime', link: '/runtime-package' },
                { text: 'Node.js', link: '/nodejs-package' },
              ],
            },
            {
              text: 'Tooling',
              base: '/integrations',
              items: [
                { text: 'Types generator', link: '/types-generator' },
                { text: 'DevTools UI', link: '/devtools-ui-package' },
              ],
            },
          ],
          '/api/': apiSidebar,
          '/composables/': apiSidebar,
          '/components/': apiSidebar,
          '/contributing/': [
            {
              text: 'Contributing',
              base: '/contributing',
              items: [
                { text: 'Contributing', link: '/' },
                { text: 'Architecture', link: '/architecture' },
                { text: 'Testing the module', link: '/testing' },
                { text: 'Maintenance commands', link: '/maintenance-commands' },
                { text: 'Release smoke and presets', link: '/release-smoke' },
                { text: 'Benchmark methodology', link: '/performance-methodology' },
              ],
            },
          ],
          '/news/': [
            {
              text: 'News',
              base: '/news',
              items: [{ text: 'Release notes', link: '/' }],
            },
          ],
        },

        socialLinks: [{ icon: 'github', link: 'https://github.com/s00d/nuxt-i18n-micro' }],
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
    }),
  ),
)
