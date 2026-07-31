import {
  PERF_LEAF_KEYS,
  PERF_LOCALE_CODES,
  PERF_PAGE_NAMES,
  PERF_SECONDARY_LEAF_KEYS,
  generateMergedLocaleFile,
} from '../../../perf-shared/config.mjs'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const localesDir = path.resolve(__dirname)

fs.mkdirSync(localesDir, { recursive: true })

for (const file of fs.readdirSync(localesDir)) {
  if (file.endsWith('.json')) fs.unlinkSync(path.join(localesDir, file))
}

for (const locale of PERF_LOCALE_CODES) {
  fs.writeFileSync(path.join(localesDir, `${locale}.json`), JSON.stringify(generateMergedLocaleFile(locale)))
}

console.log(
  `[i18n] generated ${PERF_LOCALE_CODES.length} merged locales × ${PERF_PAGE_NAMES.length} pages ` +
    `(index ${PERF_LEAF_KEYS.toLocaleString('en-US')} + secondary ${PERF_SECONDARY_LEAF_KEYS.toLocaleString('en-US')} nested)`,
)
