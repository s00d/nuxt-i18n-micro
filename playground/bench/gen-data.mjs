// Page dictionaries of 1k, 10k and 100k keys, written under locales/pages/huge-*. The output is gitignored.
// en and de only: every other locale takes them through the fallback, so each payload still holds all the keys.
// Deterministic, so the fingerprint of the translations (`?v=`) does not move between builds.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
export const HUGE_SIZES = { '1k': 1_000, '10k': 10_000, '100k': 100_000 }

function dictionary(size, label) {
  const out = {}
  for (let index = 0; index < size; index++) {
    // every third key nested, as a real dictionary mixes both
    if (index % 3 === 0) (out[`sec_${index % 100}`] ??= {})[`key_${index}`] = `${label} nested ${index}`
    else out[`key_${index}`] = `${label} value ${index} with {name}`
  }
  return out
}

export function generateHugeData() {
  for (const [name, size] of Object.entries(HUGE_SIZES)) {
    for (const locale of ['en', 'de']) {
      const file = join(root, 'locales/pages', `huge-${name}`, `${locale}.json`)
      if (existsSync(file)) continue
      mkdirSync(dirname(file), { recursive: true })
      writeFileSync(file, JSON.stringify(dictionary(size, locale)))
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) generateHugeData()
