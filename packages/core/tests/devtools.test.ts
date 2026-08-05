import { describe, expect, test } from 'vitest'
import {
  buildInspectorState,
  buildInspectorTree,
  countTranslationKeys,
  encodeInspectorPath,
  flattenTranslationNode,
  getByInspectorPath,
  parseInspectorNodeId,
} from '../src/devtools'
import type { TranslationStorage } from '../src/translation'

function createStorage(entries: Record<string, Record<string, unknown>>): TranslationStorage {
  return {
    translations: new Map(Object.entries(entries)),
  }
}

describe('devtools helpers', () => {
  test('parseInspectorNodeId handles root, locale, chunk, and key nodes', () => {
    expect(parseInspectorNodeId('root')).toEqual({ kind: 'root' })
    expect(parseInspectorNodeId('active')).toEqual({ kind: 'active' })
    expect(parseInspectorNodeId('locale|en')).toEqual({ kind: 'locale', locale: 'en' })
    expect(parseInspectorNodeId('chunk|en|about')).toEqual({ kind: 'chunk', locale: 'en', routeName: 'about' })
    expect(parseInspectorNodeId('key|en|index|nav%2Fhome')).toEqual({
      kind: 'key',
      locale: 'en',
      routeName: 'index',
      path: 'nav%2Fhome',
      segments: ['nav/home'],
    })
    expect(parseInspectorNodeId(`key|en|index|${encodeInspectorPath(['nav', 'home'])}`)).toEqual({
      kind: 'key',
      locale: 'en',
      routeName: 'index',
      path: 'nav/home',
      segments: ['nav', 'home'],
    })
  })

  test('buildInspectorTree lists locale chunks as flat selectable nodes', () => {
    const storage = createStorage({
      'en:index': { hello: 'Hello', nav: { home: 'Home' } },
      'en:about': { title: 'About' },
      'de:index': { hello: 'Hallo' },
    })

    const root = buildInspectorTree({
      nodeId: 'root',
      storage,
      configuredLocales: [{ code: 'en', displayName: 'English' }, { code: 'de' }],
      activeLocale: 'en',
      activeRouteName: 'index',
    })

    expect(root.map((node) => node.id)).toEqual(['active', 'locale|de', 'chunk|de|index', 'locale|en', 'chunk|en|about', 'chunk|en|index'])
    expect(root.find((node) => node.id === 'active')?.children).toBeUndefined()
    expect(root.find((node) => node.id === 'locale|en')?.label).toBe('en (English)')
    expect(root.find((node) => node.id === 'locale|en')?.children).toBeUndefined()
    expect(root.find((node) => node.id === 'chunk|en|about')?.label).toBe('en:about')
    expect(root.find((node) => node.id === 'chunk|en|index')?.tags?.[0]?.label).toBe('Active')

    const routes = buildInspectorTree({
      nodeId: 'locale|en',
      storage,
      configuredLocales: [{ code: 'en' }],
      activeLocale: 'en',
      activeRouteName: 'index',
    })

    expect(routes.map((node) => node.label)).toEqual(['about', 'index'])
    expect(routes.find((node) => node.label === 'index')?.tags?.[0]?.label).toBe('Active')
  })

  test('flattenTranslationNode lazily exposes nested keys', () => {
    const nodes = flattenTranslationNode({
      nav: { home: 'Home', about: 'About' },
      title: 'Welcome',
    })

    expect(nodes.map((node) => node.label)).toEqual(['nav', 'title: "Welcome"'])
    expect(nodes.find((node) => node.label === 'nav')?.children).toEqual([])
    expect(nodes.find((node) => node.label === 'nav')?.id).toBe(`key|${encodeInspectorPath(['nav'])}`)
  })

  test('flattenTranslationNode keeps literal dotted keys distinct from nested paths', () => {
    const nodes = flattenTranslationNode({
      'a.b': 'literal',
      a: { b: 'nested' },
    })

    const ids = nodes.map((node) => node.id)
    expect(ids).toContain(`key|${encodeInspectorPath(['a.b'])}`)
    expect(ids).toContain(`key|${encodeInspectorPath(['a'])}`)
    expect(new Set(ids).size).toBe(ids.length)

    const nested = flattenTranslationNode(
      {
        'a.b': 'literal',
        a: { b: 'nested' },
      },
      ['a'],
    )
    expect(nested.map((node) => node.id)).toEqual([`key|${encodeInspectorPath(['a', 'b'])}`])
    expect(nested[0]?.id).not.toBe(`key|${encodeInspectorPath(['a.b'])}`)
  })

  test('buildInspectorTree exposes active merged translations including fallback-only keys', () => {
    const storage = createStorage({
      'en:index': { hello: 'Hello' },
    })

    const nodes = buildInspectorTree({
      nodeId: 'active',
      storage,
      configuredLocales: [{ code: 'en' }],
      activeLocale: 'en',
      activeRouteName: 'index',
      activeTranslations: { hello: 'Hello', onlyFallback: 'From outgoing' },
    })

    expect(nodes.map((node) => node.label)).toEqual(['hello: "Hello"', 'onlyFallback: "From outgoing"'])

    const selected = parseInspectorNodeId(nodes.find((node) => node.label.startsWith('onlyFallback'))!.id)
    expect(getByInspectorPath({ hello: 'Hello', onlyFallback: 'From outgoing' }, selected.segments ?? [])).toBe('From outgoing')
  })

  test('buildInspectorState returns context and locales', () => {
    const state = buildInspectorState({
      locale: 'en',
      routeName: 'index',
      strategy: 'prefix',
      defaultLocale: 'en',
      fallbackLocale: 'en',
      cachedChunks: 2,
      locales: [{ code: 'en', displayName: 'English' }, { code: 'de' }],
    })

    expect(state.Context?.map((entry) => entry.key)).toEqual(['locale', 'routeName', 'strategy', 'defaultLocale', 'fallbackLocale', 'cachedChunks'])
    expect(state.Locales).toHaveLength(2)
  })

  test('countTranslationKeys counts nested paths', () => {
    expect(
      countTranslationKeys({
        hello: 'Hello',
        nav: { home: 'Home', about: 'About' },
      }),
    ).toBe(4)
  })
})
