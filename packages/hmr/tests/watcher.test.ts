import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { handleTranslationWatchChange, parseTranslationWatchRelativePath, readTranslationFile } from '../src/watcher'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('parseTranslationWatchRelativePath', () => {
  it('parses page locale files', () => {
    expect(parseTranslationWatchRelativePath('pages/contact/en.json')).toEqual({
      type: 'page',
      pageName: 'contact',
      locale: 'en',
    })
  })

  it('parses root locale files', () => {
    expect(parseTranslationWatchRelativePath('de.json')).toEqual({ type: 'root', locale: 'de' })
  })

  it('ignores invalid paths', () => {
    expect(parseTranslationWatchRelativePath('pages/contact.json')).toEqual({ type: 'ignore' })
    expect(parseTranslationWatchRelativePath('readme.txt')).toEqual({ type: 'ignore' })
  })
})

describe('handleTranslationWatchChange', () => {
  it('updates cache for page file changes', async () => {
    const cache = new Map<string, { data: Record<string, unknown>; json: string }>()
    const serverCache = {
      set: (key: string, value: { data: Record<string, unknown>; json: string }) => cache.set(key, value),
      delete: (key: string) => cache.delete(key),
    }

    const result = await handleTranslationWatchChange({
      relativePath: 'pages/contact/en.json',
      configuredLocales: new Set(['en']),
      listPageNames: () => ['contact'],
      serverCache,
      mergeInput: {
        readLocaleFile: (path) => {
          if (path === 'en.json') return { shared: 'Root' }
          if (path === 'pages/contact/en.json') return { title: 'Contact' }
          return {}
        },
      },
    })

    expect(result).toBe('page')
    expect(cache.get('en:contact')?.data).toEqual({ shared: 'Root', title: 'Contact' })
  })

  it('re-merges all pages when root locale file changes', async () => {
    const cache = new Map<string, { data: Record<string, unknown>; json: string }>()
    const serverCache = {
      set: (key: string, value: { data: Record<string, unknown>; json: string }) => cache.set(key, value),
      delete: (key: string) => cache.delete(key),
    }

    const result = await handleTranslationWatchChange({
      relativePath: 'en.json',
      configuredLocales: new Set(['en']),
      listPageNames: () => ['contact'],
      serverCache,
      mergeInput: {
        readLocaleFile: (path) => {
          if (path === 'en.json') return { shared: 'Root' }
          if (path === 'pages/contact/en.json') return { title: 'Contact' }
          if (path === 'pages/index/en.json') return { page: 'Index' }
          return {}
        },
      },
    })

    expect(result).toBe('root')
    expect(cache.has('en:contact')).toBe(true)
    expect(cache.has('en:index')).toBe(true)
  })
})

describe('readTranslationFile', () => {
  let dir: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'i18n-hmr-'))
  })

  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  it('reads a locale file', () => {
    const file = join(dir, 'en.json')
    writeFileSync(file, JSON.stringify({ hello: 'Hello' }))
    expect(readTranslationFile(file)).toEqual({ hello: 'Hello' })
  })

  it('treats an absent file as empty — a page without its own locale file is normal', () => {
    expect(readTranslationFile(join(dir, 'nope.json'))).toEqual({})
  })

  it('throws on a file that exists but does not parse', () => {
    // The half-written file a `change` event can arrive for. Returning `{}` here merged a
    // chunk with every key of this file missing and cached it as current.
    const file = join(dir, 'partial.json')
    writeFileSync(file, '{ "hello": "Hel')
    expect(() => readTranslationFile(file)).toThrow()
  })
})
