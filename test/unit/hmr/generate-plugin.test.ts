import { describe, expect, test } from 'vitest'
import { generateHmrPlugin, TRANSLATIONS_HMR_EVENT } from '../../../src/hmr-plugin'
import { translationRelativePath } from '../../../src/runtime/server/utils/translation-watcher'

describe('generateHmrPlugin', () => {
  test('listens for the custom event and reloads through the plugin nuxtApp', () => {
    const code = generateHmrPlugin()
    expect(code).toContain(`import.meta.hot.on(${JSON.stringify(TRANSLATIONS_HMR_EVENT)}`)
    expect(code).toContain('nuxtApp.$clearCache()')
    // accept() on JSON nothing imports makes Vite full-reload: the plugin must not register it
    expect(code).not.toContain('accept(')
    expect(code).not.toContain('useNuxtApp')
  })
})

describe('translationRelativePath', () => {
  const dirs = { translationRoots: ['/app/locales', '/layer/locales'], additionalRoots: ['/app/extra'] }

  test('any .json under a translationDir root, any depth, any layer', () => {
    expect(translationRelativePath('/app/locales/en.json', dirs)).toBe('en.json')
    expect(translationRelativePath('/layer/locales/pages/contact/de.json', dirs)).toBe('pages/contact/de.json')
  })

  test('only top-level {locale}.json in an additional root', () => {
    expect(translationRelativePath('/app/extra/fr.json', dirs)).toBe('fr.json')
    expect(translationRelativePath('/app/extra/nested/fr.json', dirs)).toBeNull()
  })

  test('anything else is not a translation file', () => {
    expect(translationRelativePath('/app/pages/index.vue', dirs)).toBeNull()
    expect(translationRelativePath('/app/locales/readme.md', dirs)).toBeNull()
    expect(translationRelativePath('/app/locales-old/en.json', dirs)).toBeNull()
  })
})
