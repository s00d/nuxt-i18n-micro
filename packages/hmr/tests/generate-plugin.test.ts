import { generateHmrPlugin } from '../src/generate-plugin'

describe('generateHmrPlugin', () => {
  it('uses $loadPageTranslations for root and page json files', () => {
    const code = generateHmrPlugin(['/project/locales/en.json', '/project/locales/pages/contact/de.json'])

    expect(code).toContain("$loadPageTranslations('en', 'index', data)")
    expect(code).toContain("$loadPageTranslations('de', 'contact', data)")
    expect(code).not.toContain('$loadTranslations')
  })
})
