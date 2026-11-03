/**
 * Behaviour mutation testing found unpinned by core's own tests. `render.ts` runs through the adapters
 * too, but one wrong line there breaks Vue and the Nuxt module at once.
 */
import { describe, expect, test, vi } from 'vitest'
import { createLocaleSwitcher, foldTemplate, renderI18nT, type RenderApi, type SwitcherAdapter, type SwitcherVue } from '../src/render'
import { resolveCachedTranslation, TranslationHelper } from '../src/storage'
import type { TextHost } from '../src/text'
import { mergeTranslationChunk, mergeTranslationLayers } from '../src/tree'

const POLLUTED = '{"__proto__":{"polluted":1},"a":{"__proto__":{"polluted":1},"b":1}}'

describe('__proto__ in a dictionary file', () => {
  test('a node copied whole keeps a plain prototype', () => {
    const out = mergeTranslationChunk({ other: 1 }, JSON.parse(POLLUTED)) as Record<string, object>
    expect(Object.getPrototypeOf(out)).toBe(Object.prototype)
    expect(Object.getPrototypeOf(out.a)).toBe(Object.prototype)
    expect('polluted' in out.a!).toBe(false)
  })

  test('a node merged into an existing one keeps a plain prototype', () => {
    const out = mergeTranslationChunk({ a: { c: 2 } }, JSON.parse(POLLUTED)) as Record<string, object>
    expect(Object.getPrototypeOf(out)).toBe(Object.prototype)
    expect(Object.getPrototypeOf(out.a)).toBe(Object.prototype)
    expect(out.a).toEqual({ c: 2, b: 1 })
  })

  test('a flattened layer has no path through it', () => {
    const out = mergeTranslationLayers({ a: { b: 1 } }, JSON.parse(POLLUTED))
    expect(Object.keys(out).filter((key) => key.includes('polluted'))).toEqual([])
  })
})

describe('resolveCachedTranslation', () => {
  test('no tree, no answer', () => {
    expect(resolveCachedTranslation(null, 'a')).toBeNull()
    expect(resolveCachedTranslation(undefined, 'a')).toBeNull()
  })

  test('reads once per tree and key, and each tree has its own leaves', () => {
    const first = { a: 'one' }
    const second = { a: 'two' }
    expect(resolveCachedTranslation(first, 'a')).toBe('one')
    expect(resolveCachedTranslation(second, 'a')).toBe('two')
    first.a = 'changed'
    expect(resolveCachedTranslation(first, 'a')).toBe('one')
  })

  test('a miss stays a miss', () => {
    expect(resolveCachedTranslation({ a: 'one' }, 'b')).toBeNull()
  })

  test('the leaf cache of a tree is cleared whole at 50,000 leaves, not earlier', () => {
    const tree: Record<string, string> = {}
    for (let i = 0; i < 50_001; i++) tree[`k${i}`] = 'v'
    resolveCachedTranslation(tree, 'k0')
    tree.k0 = 'changed'
    for (let i = 1; i < 50_000; i++) resolveCachedTranslation(tree, `k${i}`)
    expect(resolveCachedTranslation(tree, 'k0')).toBe('v')
    resolveCachedTranslation(tree, 'k50000')
    expect(resolveCachedTranslation(tree, 'k0')).toBe('changed')
  })

  test('the helper answers through the same rule', () => {
    const helper = new TranslationHelper()
    helper.setTranslations('en', { a: 'one' }, 'p')
    expect(helper.getTranslation('en', 'p', 'b')).toBeNull()
  })
})

const api: RenderApi = { h: (type, props, children) => ({ type, props, children }), Fragment: 'fragment' }
const host: TextHost = {
  pluralFunc: () => null,
  getLocale: () => 'en',
  t: (key) => ({ hi: 'Hi {name}', plain: 'Plain', date: 'At {date}' })[key as string] ?? key,
  tc: (key) => String(key),
  tn: String,
  td: () => 'Monday',
  tdr: String,
}

describe('foldTemplate', () => {
  const fold = (template: string, params = {}, slots = {}, textChild?: (text: string) => unknown) =>
    foldTemplate((slot, key) => ({ key, content: slot() }), template, params, slots, textChild)

  test('without a placeholder the template is the answer', () => {
    expect(fold('plain')).toBe('plain')
  })

  test('params fill, an unknown or inherited name stays as written', () => {
    expect(fold('{a} {b} {constructor}', { a: 1 })).toBe('1 {b} {constructor}')
  })

  test('a slot is keyed by name and occurrence, the text around it is kept', () => {
    const slot = () => 'S'
    expect(fold('a {s} b {x} {s} c', { x: 'X' }, { s: slot })).toEqual([
      'a ',
      { key: 's:1', content: 'S' },
      ' b X ',
      { key: 's:2', content: 'S' },
      ' c',
    ])
  })

  test('no empty text between adjacent slots, and textChild wraps the text', () => {
    const slot = () => 'S'
    expect(fold('{s}{s}', {}, { s: slot })).toEqual([
      { key: 's:1', content: 'S' },
      { key: 's:2', content: 'S' },
    ])
    expect(fold('a{s}', {}, { s: slot }, (text) => `<${text}>`)).toEqual(['<a>', { key: 's:1', content: 'S' }])
  })
})

describe('renderI18nT', () => {
  const render = (props: Parameters<typeof renderI18nT>[2], slots = {}, attrs = {}, using = api) =>
    renderI18nT(using, host, props, slots, attrs) as { type: string; props: Record<string, unknown>; children: unknown }

  test('a span by default, another tag on request', () => {
    expect(render({ keypath: 'plain' })).toEqual({ type: 'span', props: {}, children: 'Plain' })
    expect(render({ keypath: 'plain', tag: 'b' }).type).toBe('b')
  })

  test('no content attribute gets past the html prop', () => {
    const attrs = { innerHTML: 'x', textContent: 'x', '.innerHTML': 'x', '.textContent': 'x', dangerouslySetInnerHTML: 'x', id: 'kept' }
    expect(render({ keypath: 'plain' }, {}, attrs).props).toEqual({ id: 'kept' })
  })

  test('html goes through innerHTML, or what the renderer names', () => {
    expect(render({ keypath: 'hi', html: true, params: { name: 'B' } }).props).toEqual({ innerHTML: 'Hi B' })
    const react = { ...api, markup: (html: string) => ({ dangerouslySetInnerHTML: { __html: html } }) }
    expect(render({ keypath: 'plain', html: true }, {}, {}, react).props).toEqual({ dangerouslySetInnerHTML: { __html: 'Plain' } })
  })

  test('the default slot gets the finished text', () => {
    const slot = vi.fn(() => 'child')
    expect(render({ keypath: 'hi', params: { name: 'B' } }, { default: slot }).children).toBe('child')
    expect(slot).toHaveBeenCalledWith({ translation: 'Hi B' })
  })

  test('a named slot renders as a keyed fragment', () => {
    const slot = () => 'S'
    expect(render({ keypath: 'hi' }, { name: slot }).children).toEqual(['Hi ', { type: 'fragment', props: { key: 'name:1' }, children: 'S' }])
  })

  test('dated text may differ from the server, on the element or on its own span', () => {
    const allowed = { 'data-allow-mismatch': 'text' }
    expect(render({ keypath: 'date', date: 1 }).props).toEqual(allowed)
    expect(render({ keypath: 'date', relativeDate: 1 }).props).toEqual(allowed)
    expect(render({ keypath: 'date', date: 1 }, { date: () => 'S' }).children).toEqual([
      { type: 'span', props: allowed, children: 'At ' },
      { type: 'fragment', props: { key: 'date:1' }, children: 'S' },
    ])
    const react = { ...api, dated: { suppressHydrationWarning: true } }
    expect(render({ keypath: 'date', date: 1 }, {}, {}, react).props).toEqual({ suppressHydrationWarning: true })
  })

  test('a number beside a date is not clock-dependent', () => {
    expect(render({ keypath: 'date', date: 1, number: 2 }).props).toEqual({})
  })

  test('no text: the default, or nothing for an empty one', () => {
    const missing: TextHost = { ...host, t: () => null as never }
    expect(renderI18nT(api, missing, { keypath: 'x', defaultValue: 'Fallback', hideIfEmpty: true }, {}, {})).toBeDefined()
  })
})

describe('createLocaleSwitcher', () => {
  type Node = { type: string; props: Record<string, never>; children: Node[] | string }
  const vue = (): SwitcherVue & { open: { value: boolean } } => {
    const open = { value: false }
    let first = true
    return {
      ...api,
      open,
      ref<T>(value: T) {
        if (!first) return { value }
        first = false
        return open as unknown as { value: T }
      },
      onMounted: () => {},
      onUnmounted: () => {},
    }
  }
  const adapter = (over: Partial<SwitcherAdapter> = {}): SwitcherAdapter => ({
    locales: () => [
      { code: 'en', displayName: 'English' },
      { code: 'de', iso: 'de-DE' },
      { code: 'fr', disabled: true },
    ],
    locale: () => 'en',
    href: (code) => `/${code}`,
    select: () => {},
    ...over,
  })
  const find = (node: Node, type: string): Node | undefined => {
    if (node?.type === type) return node
    if (!Array.isArray(node?.children)) return undefined
    for (const child of node.children) {
      const hit = find(child, type)
      if (hit) return hit
    }
    return undefined
  }
  const links = (root: Node) =>
    (find(root, 'ul')!.children as Node[]).flatMap((item) => (item.children as Node[]).filter((child) => child.type === 'a'))

  test('a closed list is not rendered, unless the server needs its links', () => {
    expect(find(createLocaleSwitcher(vue(), adapter(), {}, {})() as Node, 'ul')).toBeUndefined()
    const kept = find(createLocaleSwitcher(vue(), adapter({ keepList: true }), {}, {})() as Node, 'ul')!
    expect((kept.props as { style: { display: string } }).style.display).toBe('none')
  })

  test('an open list has every enabled locale; the current one is marked', () => {
    const state = vue()
    state.open.value = true
    const [en, de, ...rest] = links(createLocaleSwitcher(state, adapter(), {}, {})() as Node)
    expect(rest).toEqual([])
    expect(en!.props).toMatchObject({ class: 'switcher-locale-en', href: '/en', 'aria-current': 'page', lang: 'en' })
    expect(de!.props).toMatchObject({ href: '/de', hreflang: 'de-DE', lang: 'de-DE' })
    expect((de!.props as Record<string, unknown>)['aria-current']).toBeUndefined()
  })

  test('a label is custom, then the display name, then the code; an inherited name is no label', () => {
    const state = vue()
    state.open.value = true
    const missing = vi.fn()
    const render = createLocaleSwitcher(state, adapter({ onMissingLabel: missing }), { customLabels: { en: 'EN!' } }, {})
    const [en, de] = links(render() as Node)
    expect(en!.children).toContain('EN!')
    expect(de!.children).toContain('de')
    expect(missing).toHaveBeenCalledWith('de')

    const hostile = adapter({ locales: () => [{ code: 'constructor' }], locale: () => 'constructor' })
    const state2 = vue()
    state2.open.value = true
    expect(links(createLocaleSwitcher(state2, hostile, { customLabels: {} }, {})() as Node)[0]!.children).toContain('constructor')
  })

  test("a plain click selects and closes; a modified click is the browser's", () => {
    const state = vue()
    state.open.value = true
    const select = vi.fn()
    const [, de] = links(createLocaleSwitcher(state, adapter({ select }), {}, {})() as Node)
    const click = (de!.props as unknown as { onClick: (event: Partial<MouseEvent>) => void }).onClick

    const modified = { button: 0, ctrlKey: true, preventDefault: vi.fn() }
    click(modified)
    expect(select).not.toHaveBeenCalled()
    expect(modified.preventDefault).not.toHaveBeenCalled()

    const plain = { button: 0, preventDefault: vi.fn() }
    click(plain)
    expect(select).toHaveBeenCalledWith('de')
    expect(plain.preventDefault).toHaveBeenCalled()
    expect(state.open.value).toBe(false)
  })

  test('the browser navigates when the adapter says so', () => {
    const state = vue()
    state.open.value = true
    const [en] = links(createLocaleSwitcher(state, adapter({ browserNavigates: () => true }), {}, {})() as Node)
    const plain = { button: 0, preventDefault: vi.fn() }
    ;(en!.props as unknown as { onClick: (event: Partial<MouseEvent>) => void }).onClick(plain)
    expect(plain.preventDefault).not.toHaveBeenCalled()
  })
})
