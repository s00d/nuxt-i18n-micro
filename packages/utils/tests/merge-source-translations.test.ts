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

  it('the active locale wins over every fallback layer: root beats the fallback page, page beats root', async () => {
    const files: Record<string, Record<string, unknown>> = {
      'en.json': { rootOnly: 'en root', title: 'en root', shared: 'en root' },
      'pages/about/en.json': { title: 'en page', shared: 'en page', pageOnly: 'en page' },
      'de.json': { title: 'de root', shared: 'de root' },
      'pages/about/de.json': { shared: 'de page' },
    }

    const data = await mergeSourceTranslations({
      locale: 'de',
      pageName: 'about',
      locales: [{ code: 'en' }, { code: 'de', fallbackLocale: 'en' }],
      readLocaleFile: (file) => files[file] ?? {},
    })

    expect(data).toEqual({ rootOnly: 'en root', title: 'de root', shared: 'de page', pageOnly: 'en page' })
  })
})
