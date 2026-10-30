import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  PERF_LEAF_KEYS,
  PERF_LOCALE_CODES,
  PERF_PAGE_NAMES,
  PERF_SECONDARY_LEAF_KEYS,
  generateTranslationsForPage,
} from '../../perf-shared/config.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.resolve(__dirname)
const publicDir = path.resolve(__dirname, '../public/translations')

function cleanJsonDir(dir) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      cleanJsonDir(full)
      // remove empty dirs later
    } else if (entry.name.endsWith('.json')) {
      fs.unlinkSync(full)
    }
  }
}

// Source + public copies (public is what gets deployed / measured)
for (const root of [dataDir, publicDir]) {
  fs.mkdirSync(root, { recursive: true })
}

for (const entry of fs.readdirSync(dataDir, { withFileTypes: true })) {
  if (entry.isDirectory() && PERF_PAGE_NAMES.includes(entry.name)) {
    cleanJsonDir(path.join(dataDir, entry.name))
  } else if (entry.name.endsWith('.json')) {
    fs.unlinkSync(path.join(dataDir, entry.name))
  }
}
if (fs.existsSync(publicDir)) {
  fs.rmSync(publicDir, { recursive: true, force: true })
}
fs.mkdirSync(publicDir, { recursive: true })

for (const pageName of PERF_PAGE_NAMES) {
  fs.mkdirSync(path.join(dataDir, pageName), { recursive: true })
  fs.mkdirSync(path.join(publicDir, pageName), { recursive: true })
}

for (const locale of PERF_LOCALE_CODES) {
  for (const pageName of PERF_PAGE_NAMES) {
    const json = JSON.stringify(generateTranslationsForPage(pageName, locale))
    fs.writeFileSync(path.join(dataDir, pageName, `${locale}.json`), json)
    fs.writeFileSync(path.join(publicDir, pageName, `${locale}.json`), json)
  }
}

fs.writeFileSync(path.join(dataDir, 'index.json'), fs.readFileSync(path.join(dataDir, 'index', 'en.json')))
fs.writeFileSync(path.join(dataDir, 'page.json'), fs.readFileSync(path.join(dataDir, 'page', 'en.json')))

const legacyMap = path.resolve(__dirname, '../server/utils/generated-translations.ts')
if (fs.existsSync(legacyMap)) fs.unlinkSync(legacyMap)

console.log(
  `[plain-nuxt] generated ${PERF_LOCALE_CODES.length} locales × ${PERF_PAGE_NAMES.length} pages ` +
    `(index ${PERF_LEAF_KEYS.toLocaleString('en-US')} leaves, secondary ${PERF_SECONDARY_LEAF_KEYS.toLocaleString('en-US')} each; public/translations)`,
)
