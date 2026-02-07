import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createI18n } from '@i18n-micro/node'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function main() {
  console.log('=== i18n-micro Node.js Playground ===\n')

  // 1. Create I18n instance
  console.log('1. Creating I18n instance...')
  const i18n = createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    translationDir: join(__dirname, 'locales'),
    missingWarn: true,
  })
  console.log(`   Locale: ${i18n.locale}`)
  console.log(`   Fallback locale: ${i18n.fallbackLocale}`)
  console.log(`   Current route: ${i18n.currentRoute}\n`)

  // 2. Load translations from directory
  console.log('2. Loading translations from directory...')
  await i18n.loadTranslations()
  console.log('   Translations loaded!\n')

  // 3. Basic translations with t()
  console.log('3. Basic translations:')
  console.log(`   ${i18n.t('welcome')}`)
  console.log(`   ${i18n.t('nav.home')}`)
  console.log(`   ${i18n.t('home.title')}\n`)

  // 4. Interpolation
  console.log('4. Interpolation:')
  console.log(`   ${i18n.t('greeting', { name: 'World' })}`)
  console.log(`   ${i18n.t('number', { number: 42 })}\n`)

  // 5. Pluralization with tc()
  console.log('5. Pluralization:')
  console.log(`   0 apples: ${i18n.tc('apples', 0)}`)
  console.log(`   1 apple: ${i18n.tc('apples', 1)}`)
  console.log(`   5 apples: ${i18n.tc('apples', 5)}`)
  console.log(`   10 apples: ${i18n.tc('apples', { count: 10 })}\n`)

  // 6. Number formatting with tn()
  console.log('6. Number formatting:')
  console.log(`   ${i18n.tn(1234.56)}`)
  console.log(`   ${i18n.tn(1234.56, { style: 'currency', currency: 'USD' })}`)
  console.log(`   ${i18n.tn(1234567.89, { notation: 'compact' })}\n`)

  // 7. Date formatting with td() and tdr()
  console.log('7. Date formatting:')
  const now = new Date()
  console.log(`   Date: ${i18n.td(now)}`)
  console.log(`   Date (formatted): ${i18n.td(now, { dateStyle: 'full', timeStyle: 'short' })}`)

  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  console.log(`   Relative time: ${i18n.tdr(yesterday)}`)
  console.log(`   Relative time (2 days ago): ${i18n.tdr(now.getTime() - 2 * 24 * 60 * 60 * 1000)}\n`)

  // 8. Working with page-specific translations via setRoute()
  console.log('8. Page-specific translations:')
  console.log(`   Current route: ${i18n.getRoute()}`)
  console.log(`   Global translation for 'home.title': ${i18n.t('home.title')}`)

  // Set route to 'home' to access page-specific translations
  i18n.setRoute('home')
  console.log(`   Route set to: ${i18n.getRoute()}`)
  console.log(`   Page-specific 'title' (home route): ${i18n.t('title', undefined, undefined, 'home')}`)
  console.log(`   Page-specific 'description' (home route): ${i18n.t('description', undefined, undefined, 'home')}`)
  console.log(`   Page-specific 'hero.title' (home route): ${i18n.t('hero.title', undefined, undefined, 'home')}\n`)

  // 9. Dynamic addition of translations
  console.log('9. Dynamic translation addition:')
  i18n.addTranslations('en', {
    custom: 'This is a custom translation',
    dynamic: {
      message: 'Dynamically added message',
    },
  })
  console.log(`   Global: ${i18n.t('custom')}`)
  console.log(`   Nested: ${i18n.t('dynamic.message')}`)

  // Add route-specific translations dynamically
  i18n.addRouteTranslations('en', 'custom-route', {
    title: 'Custom Route Title',
    description: 'This is a dynamically added route translation',
  })
  console.log(`   Route-specific (custom-route): ${i18n.t('title', undefined, undefined, 'custom-route')}\n`)

  // 10. Locale switching
  console.log('10. Locale switching:')
  console.log(`   English: ${i18n.t('welcome')}`)

  i18n.locale = 'fr'
  console.log(`   French: ${i18n.t('welcome')}`)
  console.log(`   French greeting: ${i18n.t('greeting', { name: 'Monde' })}`)

  i18n.locale = 'de'
  console.log(`   German: ${i18n.t('welcome')}`)
  console.log(`   German greeting: ${i18n.t('greeting', { name: 'Welt' })}`)

  // Switch back to English
  i18n.locale = 'en'
  console.log(`   Back to English: ${i18n.t('welcome')}\n`)

  // 11. Fallback locale demonstration
  console.log('11. Fallback locale:')
  i18n.locale = 'de'
  // 'nested.message' doesn't exist in de.json, should fallback to en
  console.log(`   Looking for 'nested.message' in German: ${i18n.t('nested.message')}`)
  console.log(`   (Falls back to English since it doesn't exist in German)\n`)

  // 12. Route-specific translations with explicit routeName
  console.log('12. Route-specific translations (about page):')
  i18n.locale = 'en'
  i18n.setRoute('about')
  console.log(`   Current route: ${i18n.getRoute()}`)
  console.log(`   Global 'about.title': ${i18n.t('about.title')}`)
  console.log(`   Page-specific 'title' (about route): ${i18n.t('title', undefined, undefined, 'about')}`)
  console.log(`   Page-specific 'content.heading' (about route): ${i18n.t('content.heading', undefined, undefined, 'about')}`)

  // Demonstrate with different locales
  i18n.locale = 'fr'
  console.log(`   French page-specific 'title' (about route): ${i18n.t('title', undefined, undefined, 'about')}`)
  i18n.locale = 'de'
  console.log(`   German page-specific 'title' (about route): ${i18n.t('title', undefined, undefined, 'about')}`)
  i18n.locale = 'en'
  console.log()

  // 13. Missing translation handling
  console.log('13. Missing translation handling:')
  console.log(`   Missing key: ${i18n.t('nonexistent.key')}`)
  console.log(`   Missing key with default: ${i18n.t('nonexistent.key', undefined, 'Default value')}\n`)

  // 14. Translation existence check
  console.log('14. Translation existence check:')
  console.log(`   Has 'welcome': ${i18n.hasTranslation('welcome')}`)
  console.log(`   Has 'nonexistent.key': ${i18n.hasTranslation('nonexistent.key')}\n`)

  // 15. Reload demonstration
  console.log('15. Cache and reload:')
  console.log(`   Before reload: ${i18n.t('welcome')}`)
  // Add a translation dynamically
  i18n.addTranslations('en', { welcome: 'Welcome (modified)' })
  console.log(`   After dynamic addition: ${i18n.t('welcome')}`)
  // Reload will clear cache and reload from disk, restoring original
  await i18n.reload()
  console.log(`   After reload (from disk): ${i18n.t('welcome')}\n`)

  console.log('=== Playground completed ===')
}

// Run the playground
main().catch((error) => {
  console.error('Error running playground:', error)
  process.exit(1)
})
