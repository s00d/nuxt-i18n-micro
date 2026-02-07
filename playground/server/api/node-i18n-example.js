import { join } from 'node:path'
import { createI18n } from '@i18n-micro/node'
import { defineEventHandler, getQuery } from 'h3'

// Create a singleton I18n instance (in production, you'd want to cache this)
let i18nInstance = null

async function getI18n() {
  if (!i18nInstance) {
    // Get locales directory path (relative to playground root)
    const localesPath = join(process.cwd(), 'playground', 'locales')

    i18nInstance = createI18n({
      locale: 'en',
      fallbackLocale: 'en',
      translationDir: localesPath,
    })
  }

  return i18nInstance
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const locale = query.locale || 'en'
  const route = query.route || 'general'

  console.log('[i18n-node] Loaded config:', locale, route)

  const i18n = await getI18n()

  // Set locale and route for this request
  i18n.locale = locale
  i18n.setRoute(route)

  // Load translations on first use
  await i18n.loadTranslations()

  // Demonstrate various translation methods
  return {
    locale: i18n.locale,
    route: i18n.getRoute(),
    translations: {
      // Simple translation
      welcome: i18n.t('welcome'),
      // Translation with interpolation
      greeting: i18n.t('greeting', { name: 'Node.js User' }),
      // Nested key
      nested: i18n.t('nested.message'),
      // Pluralization
      apples: {
        zero: i18n.tc('apples', 0),
        one: i18n.tc('apples', 1),
        many: i18n.tc('apples', 5),
      },
      // Number formatting
      number: i18n.tn(1234.56),
      // Date formatting
      date: i18n.td(new Date()),
      // Relative time
      relativeTime: i18n.tdr(new Date(Date.now() - 3600000)),
      // Route-specific translation (if available)
      routeSpecific: i18n.t('title', undefined, undefined, route),
    },
    // Show available methods
    methods: {
      hasTranslation: i18n.hasTranslation('welcome'),
      currentRoute: i18n.getRoute(),
      currentLocale: i18n.locale,
    },
  }
})
