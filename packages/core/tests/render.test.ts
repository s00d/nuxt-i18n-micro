import { describe, expect, it } from 'vitest'
import { renderI18nT, type RenderApi } from '../src/render'
import { convertible, textOf, type TextHost } from '../src/text'

const api: RenderApi = { h: (type, props, children) => ({ type, props, children }), Fragment: 'fragment' }
const host: TextHost = {
  pluralFunc: () => null,
  getLocale: () => 'en',
  t: (key) => ({ empty: '' })[key as string] ?? key,
  tc: (key) => String(key),
  tn: String,
  td: String,
  tdr: String,
}

describe('renderI18nT hideIfEmpty', () => {
  // a component's `defaultValue` prop defaults to '': an empty text node has no twin in server HTML, so hydration breaks
  it('renders nothing for an empty default', () => {
    expect(renderI18nT(api, host, { keypath: 'empty', hideIfEmpty: true, defaultValue: '' }, {}, {})).toBeNull()
  })

  it('renders a default that has text', () => {
    expect(renderI18nT(api, host, { keypath: 'empty', hideIfEmpty: true, defaultValue: 'Default' }, {}, {})).toBe('Default')
  })
})

describe('renderI18nT with a subtree under the key', () => {
  // `{ "tree": { "toString": "..." } }`: `String()` throws on it, which took a whole page down with a 500
  it('a key named toString in the subtree is no method', () => {
    const tree = { toString: 'a key' } as never
    const node = renderI18nT(api, { ...host, t: () => tree }, { keypath: 'tree' }, {}, {}) as { children: unknown }
    expect(node.children).toBe('[object Object]')
  })
})

describe('renderI18nT with a translation equal to the sentinel for a miss', () => {
  const nul = (known: boolean): TextHost => ({ ...host, t: () => '\0' as never, has: () => known })

  it('is the translation, not a miss', () => {
    expect(renderI18nT(api, nul(true), { keypath: 'nul' }, {}, {})).toMatchObject({ children: '\0' })
  })

  it('a real miss still shows the key', () => {
    expect(renderI18nT(api, nul(false), { keypath: 'gone' }, {}, {})).toMatchObject({ children: 'gone' })
  })
})

describe('convertible', () => {
  // `v-html` and a template literal convert what `$t` returns: `String()` of these threw, and that was a 500
  const subtree = JSON.parse('{ "toString": "a key", "title": "T" }') as Record<string, unknown>

  it('a subtree with a `toString` key converts, and reads as the subtree it is', () => {
    const value = convertible(subtree)
    expect(String(value)).toBe('[object Object]')
    expect(`${value}`).toBe('[object Object]')
    expect(value).toEqual(subtree)
    expect(JSON.stringify(value)).toBe(JSON.stringify(subtree))
    expect(Object.keys(value)).toEqual(['toString', 'title'])
  })

  it('an array holding one too', () => {
    const value = convertible(['a', subtree, null])
    expect(`${value}`).toBe('a,[object Object],')
    expect(Array.isArray(value)).toBe(true)
    expect(value.length).toBe(3)
    expect(textOf(value)).toBe('a,[object Object],')
    expect(textOf(['a', subtree, null])).toBe('a,[object Object],')
  })

  it('what converts already is handed back as it is', () => {
    const tree = { title: 'T' }
    const list = ['a', 'b']
    expect(convertible(tree)).toBe(tree)
    expect(convertible(list)).toBe(list)
  })

  it('leaves the stored tree alone', () => {
    const stored = Object.freeze({ toString: 'a key' })
    expect(`${convertible(stored)}`).toBe('[object Object]')
    expect(Object.getOwnPropertySymbols(stored)).toEqual([])
  })
})
