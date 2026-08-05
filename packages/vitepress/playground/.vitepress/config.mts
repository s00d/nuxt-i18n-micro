import { defineConfig } from 'vitepress'
import {
  createI18nRoutingFromAdapter,
  withI18nMicro,
} from '@i18n-micro/vitepress/config'

const locales = [
  { code: 'en', iso: 'en-US', displayName: 'English' },
  { code: 'fr', iso: 'fr-FR', displayName: 'Français' },
]

const defaultLocale = 'en'

const i18nMicroOptions = {
  locale: defaultLocale,
  defaultLocale,
  fallbackLocale: defaultLocale,
  locales,
  translationDir: 'locales',
  missingWarn: true,
}

export default defineConfig(
  withI18nMicro(
    {
      title: 'i18n-micro VitePress Playground',
      description: 'Runtime dictionaries + switcher demo',
      cleanUrls: true,
      locales: {
        root: {
          label: 'English',
          lang: 'en-US',
          themeConfig: {
            nav: [
              { text: 'Home', link: '/' },
              { text: 'Demo', link: '/guide/demo' },
            ],
            sidebar: [
              {
                text: 'Guide',
                items: [{ text: 'In-page demo', link: '/guide/demo' }],
              },
            ],
          },
        },
        fr: {
          label: 'Français',
          lang: 'fr-FR',
          link: '/fr/',
          themeConfig: {
            nav: [
              { text: 'Accueil', link: '/fr/' },
              { text: 'Démo', link: '/fr/guide/demo' },
            ],
            sidebar: [
              {
                text: 'Guide',
                items: [{ text: 'Démo in-page', link: '/fr/guide/demo' }],
              },
            ],
          },
        },
      },
      themeConfig: {
        langMenuLabel: 'Change language',
        i18nRouting: createI18nRoutingFromAdapter({
          defaultLocale,
          localeCodes: locales.map((l) => l.code),
        }),
        socialLinks: [],
      },
    },
    i18nMicroOptions,
  ),
)
