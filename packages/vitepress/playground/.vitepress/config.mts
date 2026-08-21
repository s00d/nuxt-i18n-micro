import { defineConfig } from 'vitepress'
import { buildVitePressLocales, withI18n } from '@i18n-micro/vitepress/config'

const locales = [
  { code: 'en', iso: 'en-US', displayName: 'English', og: 'en_US' },
  { code: 'fr', iso: 'fr-FR', displayName: 'Français', og: 'fr_FR' },
  { code: 'de', iso: 'de-DE', displayName: 'Deutsch', og: 'de_DE' },
]

const defaultLocale = 'en'
const vpLocales = buildVitePressLocales(locales, defaultLocale)

function localeTheme(nav: { text: string; link: string }[], demoLabel: string, noSeoLabel: string) {
  return {
    nav,
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: demoLabel, link: '/guide/demo' },
          { text: noSeoLabel, link: '/guide/no-seo' },
        ],
      },
    ],
  }
}

export default defineConfig(
  withI18n(
    {
      title: 'i18n-micro VitePress Playground',
      description: 'Runtime dictionaries, routing helpers, SEO head',
      cleanUrls: true,
      locales: {
        root: {
          ...vpLocales.root,
          themeConfig: localeTheme(
            [
              { text: 'Home', link: '/' },
              { text: 'Demo', link: '/guide/demo' },
              { text: 'No SEO', link: '/guide/no-seo' },
            ],
            'In-page demo',
            'No SEO meta',
          ),
        },
        fr: {
          ...vpLocales.fr!,
          themeConfig: localeTheme(
            [
              { text: 'Accueil', link: '/' },
              { text: 'Démo', link: '/guide/demo' },
              { text: 'Sans SEO', link: '/guide/no-seo' },
            ],
            'Démo in-page',
            'Sans meta SEO',
          ),
        },
        de: {
          ...vpLocales.de!,
          themeConfig: localeTheme(
            [
              { text: 'Start', link: '/' },
              { text: 'Demo', link: '/guide/demo' },
              { text: 'Ohne SEO', link: '/guide/no-seo' },
            ],
            'In-page Demo',
            'Ohne SEO-Meta',
          ),
        },
      },
      themeConfig: {
        langMenuLabel: 'Change language',
        socialLinks: [],
      },
    },
    {
      locale: defaultLocale,
      defaultLocale,
      fallbackLocale: defaultLocale,
      locales,
      translationDir: 'locales',
      missingWarn: true,
      metaBaseUrl: 'https://example.com',
      hreflangBaseLanguage: false,
    },
  ),
)
