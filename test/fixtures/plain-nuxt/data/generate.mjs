import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const LOCALES = ['en', 'de', 'ru']

const KEY1_BY_LOCALE = {
  en: 'en en en',
  de: 'de de de',
  ru: 'ru ru ru',
}

const PAGE_KEY1_BY_LOCALE = {
  en: 'page en',
  de: 'page de',
  ru: 'page ru',
}

const WELCOME_BY_LOCALE = {
  en: 'Welcome, {username}! You have {unreadCount} unread messages.',
  de: 'Willkommen, {username}! Sie haben {unreadCount} ungelesene Nachrichten.',
  ru: 'Добро пожаловать, {username}! У вас {unreadCount} непрочитанных сообщений.',
}

// Deterministic text generation for reproducible builds
function generateText(seed) {
  const loremIpsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
  const words = loremIpsum.split(' ')
  const length = (seed % 10) + 5
  let result = ''
  for (let i = 0; i < length; i++) {
    result += words[(seed + i) % words.length] + ' '
  }
  return result.trim()
}

// Generate translations structure matching generateKeys(4) - key0..key4 at 5 levels
function generateIndexTranslations(locale, level = 5, seed = 0) {
  const translations = {}
  const keys = ['key0', 'key1', 'key2', 'key3', 'key4']
  const localeSeed = LOCALES.indexOf(locale) * 1000

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (level > 1) {
      translations[key] = generateIndexTranslations(locale, level - 1, seed + i * 100 + localeSeed)
    }
    else {
      translations[key] = generateText(seed + i + localeSeed)
    }
  }

  return translations
}

// Add key1.key1.key1.key1.key1 for compatibility
function addKey1Structure(translations, locale) {
  return {
    key1: {
      key1: {
        key1: {
          key1: {
            key1: KEY1_BY_LOCALE[locale] || 'en en en',
          },
        },
      },
    },
    ...translations,
  }
}

function generatePageData(locale) {
  return {
    welcome: WELCOME_BY_LOCALE[locale] || WELCOME_BY_LOCALE.en,
    apples: 'no apples | one apple | {count} apples',
    feedback: {
      text: 'test link: {link}',
      link: 'click',
    },
    key1: {
      key1: {
        key1: {
          key1: {
            key1: PAGE_KEY1_BY_LOCALE[locale] || PAGE_KEY1_BY_LOCALE.en,
          },
        },
      },
    },
  }
}

const dataDir = path.resolve(__dirname)
const indexDir = path.join(dataDir, 'index')
const pageDir = path.join(dataDir, 'page')

for (const dir of [dataDir, indexDir, pageDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

for (const locale of LOCALES) {
  const indexData = addKey1Structure(generateIndexTranslations(locale), locale)
  fs.writeFileSync(path.join(indexDir, `${locale}.json`), JSON.stringify(indexData, null, 2), 'utf8')

  const pageData = generatePageData(locale)
  fs.writeFileSync(path.join(pageDir, `${locale}.json`), JSON.stringify(pageData, null, 2), 'utf8')
}

// Keep root index.json and page.json for backward compat (en)
fs.writeFileSync(
  path.join(dataDir, 'index.json'),
  fs.readFileSync(path.join(indexDir, 'en.json'), 'utf8'),
)
fs.writeFileSync(
  path.join(dataDir, 'page.json'),
  fs.readFileSync(path.join(pageDir, 'en.json'), 'utf8'),
)

console.log('Data files generated successfully!')
