import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  PERF_LEAF_KEYS,
  PERF_LOCALE_CODES,
  PERF_PAGE_NAMES,
  PERF_SECONDARY_LEAF_KEYS,
  generateRootTranslations,
  generateTranslationsForPage,
} from '../../perf-shared/config.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const localesRoot = path.resolve(__dirname)
const pagesRoot = path.join(localesRoot, 'pages')

fs.mkdirSync(pagesRoot, { recursive: true })

// Drop stale page dirs / locale JSON
for (const file of fs.readdirSync(localesRoot)) {
  if (file.endsWith('.json')) fs.unlinkSync(path.join(localesRoot, file))
}
if (fs.existsSync(pagesRoot)) {
  for (const entry of fs.readdirSync(pagesRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    if (!PERF_PAGE_NAMES.includes(entry.name)) {
      fs.rmSync(path.join(pagesRoot, entry.name), { recursive: true, force: true })
      continue
    }
    const dir = path.join(pagesRoot, entry.name)
    for (const file of fs.readdirSync(dir)) {
      if (file.endsWith('.json')) fs.unlinkSync(path.join(dir, file))
    }
  }
}

for (const pageName of PERF_PAGE_NAMES) {
  fs.mkdirSync(path.join(pagesRoot, pageName), { recursive: true })
}

for (const locale of PERF_LOCALE_CODES) {
  fs.writeFileSync(path.join(localesRoot, `${locale}.json`), JSON.stringify(generateRootTranslations(locale)))
  for (const pageName of PERF_PAGE_NAMES) {
    fs.writeFileSync(path.join(pagesRoot, pageName, `${locale}.json`), JSON.stringify(generateTranslationsForPage(pageName, locale)))
  }
}

console.log(
  `[i18n-micro] generated ${PERF_LOCALE_CODES.length} locales × ${PERF_PAGE_NAMES.length} pages ` +
    `(index ${PERF_LEAF_KEYS.toLocaleString('en-US')} leaves, secondary ${PERF_SECONDARY_LEAF_KEYS.toLocaleString('en-US')} each)`,
)
