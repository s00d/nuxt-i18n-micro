import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Generate random text for each locale
function generateTextForLocale(locale) {
  const loremIpsum = {
    en: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    ru: 'Лорем ипсум долор сит амет, консектетуэр адиписцинг элит. Сед до эиусмод темпор инцидидунт ут лаборе эт долоре магна аликуа.',
    de: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  }

  const words = loremIpsum[locale].split(' ')
  const length = Math.floor(Math.random() * 10) + 5
  return Array.from({ length }, () => words[Math.floor(Math.random() * words.length)]).join(' ')
}

// Generate translation structure with specified nesting depth
function generateTranslations(locale, level = 5) {
  const translations = {}
  const numberOfKeys = Math.floor(Math.random() * 10) + 5

  for (let i = 0; i < numberOfKeys; i++) {
    const key = `key${i}`

    if (level > 1) {
      translations[key] = generateTranslations(locale, level - 1)
    } else {
      translations[key] = generateTextForLocale(locale)
    }
  }

  return translations
}

// Generate translation structure with the same keys
function generateStructuredTranslations(locales, level = 5) {
  const baseStructure = generateTranslations(locales[0], level)
  const structuredTranslations = {}

  locales.forEach((locale) => {
    structuredTranslations[locale] = JSON.parse(
      JSON.stringify(baseStructure, (_key, value) => {
        if (typeof value === 'string') {
          return generateTextForLocale(locale)
        }
        return value
      }),
    )
  })

  return structuredTranslations
}

// Write translations to file
function writeTranslationsToFile(filePath, translations) {
  fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), 'utf8')
}

// Path to the translations directory
const localesDir = path.resolve(__dirname)

// Create locales directory if it doesn't exist
if (!fs.existsSync(localesDir)) {
  fs.mkdirSync(localesDir)
}

// Generate and write translations for each language
const locales = ['en', 'ru', 'de']
const translations = generateStructuredTranslations(locales)
locales.forEach((locale) => {
  writeTranslationsToFile(path.join(localesDir, `${locale}.json`), translations[locale])
})

console.log('Translation files generated successfully!')
