import { describe, expect, test } from 'vitest'
import { splitLocaleRoutes } from '../src/split-locale-routes'

describe('splitLocaleRoutes (#244)', () => {
  test('splits one registry into pages + globalLocaleRoutes keyed by name', () => {
    const result = splitLocaleRoutes([
      {
        name: 'products_tag',
        path: '/products/:tag',
        file: '~/pages/_dynamic.vue',
        paths: { fr: '/produits/:tag', de: '/produkte/:tag' },
      },
      {
        name: 'products_category',
        path: '/products/category/:category',
        file: '~/pages/_dynamic.vue',
        paths: { fr: '/produits/categorie/:category' },
      },
    ])

    expect(result.pages).toEqual([
      { name: 'products_tag', path: '/products/:tag', file: '~/pages/_dynamic.vue' },
      { name: 'products_category', path: '/products/category/:category', file: '~/pages/_dynamic.vue' },
    ])
    expect(result.globalLocaleRoutes).toEqual({
      products_tag: { fr: '/produits/:tag', de: '/produkte/:tag' },
      products_category: { fr: '/produits/categorie/:category' },
    })
  })

  test('shared wrapper file does not collapse locale paths', () => {
    const shared = '~/pages/_dynamic.vue'
    const { pages, globalLocaleRoutes } = splitLocaleRoutes([
      { name: 'a', path: '/a', file: shared, paths: { fr: '/aa' } },
      { name: 'b', path: '/b', file: shared, paths: { fr: '/bb' } },
    ])

    expect(pages).toHaveLength(2)
    expect(pages[0]!.file).toBe(pages[1]!.file)
    expect(globalLocaleRoutes.a).toEqual({ fr: '/aa' })
    expect(globalLocaleRoutes.b).toEqual({ fr: '/bb' })
  })

  test('supports false to disable localization; omits paths when unset', () => {
    const { pages, globalLocaleRoutes } = splitLocaleRoutes([
      { name: 'plain', path: '/plain', file: '~/pages/plain.vue' },
      { name: 'fixed', path: '/fixed', file: '~/pages/fixed.vue', paths: false },
    ])

    expect(pages.map((p) => p.name)).toEqual(['plain', 'fixed'])
    expect(globalLocaleRoutes).toEqual({ fixed: false })
    expect(globalLocaleRoutes).not.toHaveProperty('plain')
  })

  test('throws on duplicate or incomplete entries', () => {
    expect(() =>
      splitLocaleRoutes([
        { name: 'x', path: '/x', file: '~/x.vue' },
        { name: 'x', path: '/y', file: '~/y.vue' },
      ]),
    ).toThrow(/duplicate route name "x"/)

    expect(() => splitLocaleRoutes([{ name: '', path: '/x', file: '~/x.vue' }])).toThrow(/non-empty `name`/)
    expect(() => splitLocaleRoutes([{ name: 'x', path: '', file: '~/x.vue' }])).toThrow(/needs a `path`/)
    expect(() => splitLocaleRoutes([{ name: 'x', path: '/x', file: '' }])).toThrow(/needs a `file`/)
  })
})
