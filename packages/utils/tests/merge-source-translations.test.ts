import {
  buildFallbackLocaleChain,
  buildSourcePagePath,
  buildSourceRootPath,
  mergeSourceTranslations,
  toPremergedStorageKey,
  toSourceStorageKey,
} from '../src/merge-source'
import { describe, expect, it, vi } from 'vitest'

describe('source translation paths', () => {
  it('maps source files to Nitro storage keys', () => {
    expect(buildSourceRootPath('en')).toBe('en.json')
    expect(buildSourcePagePath('contact', 'de')).toBe('pages/contact/de.json')
    expect(toSourceStorageKey('pages/contact/de.json')).toBe('pages/contact/de.json')
    expect(toSourceStorageKey('/pages/about/de.json')).toBe('pages/about/de.json')
    expect(toPremergedStorageKey('index', 'en')).toBe('index/en/data.json')
    expect(toPremergedStorageKey('blog/post', 'de')).toBe('blog/post/de/data.json')
  })
})

describe('mergeSourceTranslations', () => {
  it('reads the root only when disablePageLocales is true (no pages/ file, not even pages/index)', async () => {
    const readLocaleFile = vi.fn((relativePath: string) => {
      if (relativePath === 'en.json') return { greeting: 'Hello' }
      if (relativePath === 'pages/index/en.json') return { page: 'Index' }
      return {}
    })

    const data = await mergeSourceTranslations({
      locale: 'en',
      pageName: 'contact',
      locales: [{ code: 'en' }],
      disablePageLocales: true,
      readLocaleFile,
    })

    expect(data).toEqual({ greeting: 'Hello' })
    expect(readLocaleFile).not.toHaveBeenCalledWith('pages/index/en.json')
    expect(readLocaleFile).not.toHaveBeenCalledWith('pages/contact/en.json')
  })
})
