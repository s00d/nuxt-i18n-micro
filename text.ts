import type { NuxtPage } from '@nuxt/schema'
import type { Locale } from '@i18n-micro/types'
import { RouteGenerator } from '@i18n-micro/route-generator'

const globalLocaleRoutes
= {
  '/activity-locale': { en: '/change-activity', de: '/change-buchen' },
  '/activity-locale/skiing': { en: '/book-activity/skiing', de: '/aktivitaet-buchen/ski-fahren' },
  '/activity/hiking-locale': { en: '/book-activity/hiking', de: '/aktivitaet-buchen/wandern' },
  '/activity/skiing-locale': { en: '/book-activity/skiing', de: '/aktivitaet-buchen/ski-fahren' },
}

const locales: Locale[] = [
  { code: 'en', iso: 'en_EN', displayName: 'English' },
  { code: 'de', iso: 'de_DE', displayName: 'German' },
  { code: 'ru', iso: 'ru_RU', displayName: 'Russian' },
  { code: 'fr', iso: 'fr_FR', displayName: 'French', baseUrl: 'https://fr.example.com', baseDefault: true },
  { code: 'ch', iso: 'ch_CH', displayName: 'Chinese', baseUrl: 'https://test.example.com' },
]

const defaultLocaleCode = 'en'

// Creating a new RouteGenerator instance with globalLocaleRoutes
const routeGenerator = new RouteGenerator({ locales, defaultLocaleCode, strategy: 'prefix_except_default', globalLocaleRoutes, routeLocales: {}, noPrefixRedirect: false })

// const pages: NuxtPage[] = [{
//   path: '/activity',
//   name: 'activity',
//   children: [{ path: 'skiing', name: 'Skiing' }],
// }, {
//   path: '/unlocalized',
//   name: 'unlocalized',
// }]

const pages: NuxtPage[] = [
  {
    name: 'activity-locale',
    path: '/activity-locale',
    children: [
      {
        name: 'activity-locale-hiking',
        path: 'hiking',
      },
      {
        name: 'activity-locale-skiing',
        path: 'skiing',
      },
    ],
  },
  {
    name: 'activity',
    path: '/activity',
    children: [
      {
        name: 'activity-hiking-locale',
        path: 'hiking-locale',
      },
      {
        name: 'activity-hiking',
        path: 'hiking',
      },
      {
        name: 'activity-skiing-locale',
        path: 'skiing-locale',
      },
      {
        name: 'activity-skiing',
        path: 'skiing',
      },
    ],
  },
  {
    name: 'articles-id',
    path: '/articles/:id()',
  },
  {
    name: 'client',
    path: '/client',
  },
  {
    name: 'dir1-slug',
    path: '/dir1/:slug()',
  },
  {
    name: 'index',
    path: '/',
  },
  {
    name: 'locale-conf',
    path: '/locale-conf',
  },
  {
    name: 'locale-test',
    path: '/locale-test',
  },
  {
    name: 'news-id',
    path: '/news/:id()',
  },
  {
    name: 'old-product',
    path: '/old-product',
  },
  {
    name: 'page',
    path: '/page',
  },
  {
    name: 'page2',
    path: '/page2',
  },
  {
    name: 'unlocalized',
    path: '/unlocalized',
  },
]

// Extend pages with globalLocaleRoutes
routeGenerator.extendPages(pages)

console.log(1111, JSON.stringify(pages, null, 2))
