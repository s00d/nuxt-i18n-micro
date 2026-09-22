import { createI18n } from '@i18n-micro/runtime'

async function main() {
  console.log('=== i18n-micro Runtime Playground ===\n')

  const i18n = createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages: {
      en: {
        welcome: 'Welcome',
        greeting: 'Hello, {name}!',
        apples: 'no apples|one apple|{count} apples',
      },
      de: {
        welcome: 'Willkommen',
        greeting: 'Hallo, {name}!',
      },
    },
    routeMessages: {
      home: {
        en: { title: 'Home', description: 'Home page' },
        de: { title: 'Startseite', description: 'Startseite' },
      },
    },
  })

  console.log('1. Basic:', i18n.t('welcome'), '/', i18n.t('greeting', { name: 'World' }))
  console.log('2. Plural:', i18n.tc('apples', 0), '/', i18n.tc('apples', 5))

  i18n.setRoute('home')
  console.log('3. Route home:', i18n.t('title'), '—', i18n.t('description'))

  i18n.locale = 'de'
  console.log('4. German:', i18n.t('welcome'), '/', i18n.t('title'))

  const unsub = i18n.subscribe(() => {
    console.log('5. Subscribe fired, snapshot:', i18n.getSnapshot())
  })
  i18n.locale = 'en'
  unsub()

  console.log('\n=== Playground completed ===')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
