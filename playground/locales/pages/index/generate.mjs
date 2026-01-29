import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Генерация случайного текста для каждой локали
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

// Генерация структуры переводов с заданной вложенностью
function generateTranslations(locale, level = 5) {
  const translations = {}
  const numberOfKeys = Math.floor(Math.random() * 10) + 5

  for (let i = 0; i < numberOfKeys; i++) {
    const key = `key${i}`

    if (level > 1) {
      translations[key] = generateTranslations(locale, level - 1)
    }
    else {
      translations[key] = generateTextForLocale(locale)
    }
  }

  return translations
}

// Генерация структуры переводов с одинаковыми ключами
function generateStructuredTranslations(locales, level = 5) {
  const baseStructure = generateTranslations(locales[0], level)
  const structuredTranslations = {}

  locales.forEach((locale) => {
    structuredTranslations[locale] = JSON.parse(
      JSON.stringify(baseStructure, (key, value) => {
        if (typeof value === 'string') {
          return generateTextForLocale(locale)
        }
        return value
      }),
    )
  })

  return structuredTranslations
}

// Запись переводов в файл
function writeTranslationsToFile(filePath, translations) {
  fs.writeFileSync(filePath, JSON.stringify(translations, null, 2), 'utf8')
}

// Путь к папке с переводами
const localesDir = path.resolve(__dirname)

// Создание папки locales, если она не существует
if (!fs.existsSync(localesDir)) {
  fs.mkdirSync(localesDir)
}

// Генерация и запись переводов для каждого языка
const locales = ['en', 'ru', 'de']
const translations = generateStructuredTranslations(locales)
locales.forEach((locale) => {
  writeTranslationsToFile(path.join(localesDir, `${locale}.json`), translations[locale])
})

console.log('Translation files generated successfully!')
