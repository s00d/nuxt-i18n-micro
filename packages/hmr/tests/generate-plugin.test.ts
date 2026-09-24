import { generateHmrPlugin } from '../src/generate-plugin'
import { describe, expect, it } from 'vitest'

describe('generateHmrPlugin', () => {
  it('uses $loadPageTranslations for root and page json files', () => {
    const code = generateHmrPlugin(['/project/locales/en.json', '/project/locales/pages/contact/de.json'])

    expect(code).toContain("$loadPageTranslations('en', 'index', data)")
    expect(code).toContain("$loadPageTranslations('de', 'contact', data)")
    expect(code).not.toContain('$loadTranslations')
    expect(code).toContain('deepMergeTranslationsRecursive')
  })

  it('merges additional root files with primary before $loadPageTranslations', () => {
    const code = generateHmrPlugin(['/project/frontend/en.json'], {
      additionalRootFiles: ['/project/common/en.json', '/project/shared/en.json'],
    })

    expect(code).toContain("import.meta.hot.accept(['/project/common/en.json', '/project/shared/en.json', '/project/frontend/en.json']")
    expect(code).toContain('await import(/* @vite-ignore */ path)')
    expect(code).toContain("$loadPageTranslations('en', 'index', data)")
    expect(code).toContain('deepMergeTranslationsRecursive')
  })

  it('watches additional-only locale roots without a primary file', () => {
    const code = generateHmrPlugin([], {
      additionalRootFiles: ['/project/common/en.json'],
    })

    expect(code).toContain("import.meta.hot.accept(['/project/common/en.json']")
    expect(code).toContain("$loadPageTranslations('en', 'index', data)")
  })
})
