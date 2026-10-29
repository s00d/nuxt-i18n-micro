import { generateHmrPlugin } from '../src/generate-plugin'
import { describe, expect, it } from 'vitest'

describe('generateHmrPlugin', () => {
  it('accepts every root, page and additional file and reloads the page dictionary from the dev server', () => {
    const code = generateHmrPlugin(['/project/locales/en.json', '/project/locales/pages/contact/de.json'], {
      additionalRootFiles: ['/project/common/en.json'],
    })
    expect(code).toContain('import.meta.hot.accept(["/project/locales/en.json","/project/locales/pages/contact/de.json","/project/common/en.json"]')
    expect(code).toContain('$clearCache()')
    expect(code).not.toContain('$loadPageTranslations')
  })

  it('reads paths as plain file paths: a project under a /pages/ directory, quotes in a path', () => {
    const code = generateHmrPlugin(["/home/o'neil/pages/site/locales/en.json"])
    expect(code).toContain(JSON.stringify(["/home/o'neil/pages/site/locales/en.json"]))
    // the path is one JSON string literal, never a quote-delimited one the apostrophe would end
    expect(code).not.toContain("'/home/o'neil")
  })

  it('is an empty plugin without files', () => {
    expect(generateHmrPlugin([])).not.toContain('accept')
  })
})
