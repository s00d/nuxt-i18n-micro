/**
 * Тесты под критические моменты из REFACTORING_PLAN.md (раздел 6).
 * Покрывают сценарии, которые могут сломаться после рефакторинга:
 * - 6.1 Потеря контекста «оригинального пути» при рекурсии (parentOriginalPath)
 * - 6.2 Обработка алиасов (alias → отдельные маршруты, префикс)
 * - 6.3 Слияние путей родитель–ребёнок (resolveChildPath: относительный/абсолютный)
 * - 6.4 Мутация vs Immutability (оригинальный page не мутируется)
 */

import type { NuxtPage } from '@nuxt/schema'
import { RouteGenerator } from '../src/index'
import { locales, defaultLocaleCode, createNestedPages, createManager } from './helpers'

describe('Critical: Original path lookup (parentOriginalPath)', () => {
  test('nested: parent has custom path, child has no custom path — child path joins to parent localized path', () => {
    const globalLocaleRoutes = {
      '/parent': { en: '/parent', de: '/eltern' },
      // child /parent/child — нет кастомного пути, должен склеиться с путём родителя
    }
    const generator = new RouteGenerator(
      locales,
      defaultLocaleCode,
      'prefix_except_default',
      globalLocaleRoutes,
      {},
      {},
      false,
    )
    const pages: NuxtPage[] = [
      {
        path: '/parent',
        name: 'parent',
        children: [{ path: 'child', name: 'parent-child', children: [{ path: 'grandchild', name: 'parent-child-grandchild' }] }],
      },
    ]
    generator.extendPages(pages)

    // Дефолтная локаль (en): parent path = /parent, child = /parent/child
    const defaultRoute = pages.find(p => p.path === '/parent' && p.name === 'parent')
    expect(defaultRoute).toBeDefined()
    expect(defaultRoute!.children).toHaveLength(1)
    expect(defaultRoute!.children![0].path).toBe('child')
    const childRoute = defaultRoute!.children![0]
    expect(childRoute.children).toHaveLength(1)
    expect(childRoute.children![0].path).toBe('grandchild')

    // Локаль de: parent path = /eltern (кастом), child должен быть /eltern/child (join к кастомному родителю)
    const dePrefixed = pages.find(p => p.name === 'localized-parent-de')
    expect(dePrefixed).toBeDefined()
    expect(dePrefixed!.path).toMatch(/eltern/)
    expect(dePrefixed!.children).toHaveLength(1)
    expect(dePrefixed!.children![0].path).toBe('child')
    // Полный путь ребёнка в дереве — относительный segment; итоговый путь = /de/eltern/child
    const deChild = dePrefixed!.children![0]
    expect(deChild.children).toHaveLength(1)
    expect(deChild.children![0].path).toBe('grandchild')

    expect(pages).toMatchSnapshot()
  })

  test('nested: parent and child both have custom paths — lookup by original full path /parent/child', () => {
    const globalLocaleRoutes = {
      '/parent': { en: '/parent', de: '/eltern' },
      '/parent/child': { en: '/parent/child', de: '/eltern/kind' },
    }
    const generator = new RouteGenerator(
      locales,
      defaultLocaleCode,
      'prefix_except_default',
      globalLocaleRoutes,
      {},
      {},
      false,
    )
    const pages: NuxtPage[] = [
      {
        path: '/parent',
        name: 'parent',
        children: [{ path: 'child', name: 'parent-child' }],
      },
    ]
    generator.extendPages(pages)

    // Для de: parent path = /eltern, child path — кастомный для /parent/child (lookup по оригинальному пути): kind или eltern/kind
    const dePrefixed = pages.find(p => p.name === 'localized-parent-de')
    expect(dePrefixed).toBeDefined()
    expect(dePrefixed!.path).toMatch(/eltern$/)
    expect(dePrefixed!.children).toHaveLength(1)
    expect(dePrefixed!.children![0].path).toMatch(/kind/)
    expect(pages).toMatchSnapshot()
  })

  test('child with absolute custom path — path is standalone, not joined with parent', () => {
    const globalLocaleRoutes = {
      '/parent': { en: '/parent', de: '/eltern' },
      '/parent/child': { en: '/parent/child', de: '/standalone' }, // абсолютный кастом для de
    }
    const generator = new RouteGenerator(
      locales,
      defaultLocaleCode,
      'prefix_except_default',
      globalLocaleRoutes,
      {},
      {},
      false,
    )
    const pages: NuxtPage[] = [
      {
        path: '/parent',
        name: 'parent',
        children: [{ path: 'child', name: 'parent-child' }],
      },
    ]
    generator.extendPages(pages)

    const dePrefixed = pages.find(p => p.name === 'localized-parent-de')
    expect(dePrefixed).toBeDefined()
    expect(dePrefixed!.children).toHaveLength(1)
    // Ребёнок с абсолютным кастомным путём /standalone → в префиксной версии /de/standalone
    expect(dePrefixed!.children![0].path).toBe('standalone')
    expect(pages).toMatchSnapshot()
  })
})

describe('Critical: Alias handling', () => {
  test('alias routes are separate entries with localized path (prefix strategy)', () => {
    const generator = new RouteGenerator(locales, defaultLocaleCode, 'prefix', {}, {}, {}, false)
    const pages: NuxtPage[] = [
      {
        path: '/about',
        name: 'about',
        alias: ['/about-us', '/company'],
      },
    ]
    generator.extendPages(pages)

    const aboutMain = pages.filter(p => p.name === 'localized-about' || p.name?.toString().startsWith('localized-about-'))
    expect(aboutMain.length).toBeGreaterThan(0)
    const aliasRoutes = pages.filter(p => p.path?.includes('about-us') || p.path?.includes('company'))
    expect(aliasRoutes.length).toBeGreaterThan(0)
    aliasRoutes.forEach(r => {
      expect(r.path).toMatch(/^\/:locale\(|^\/[deru]+\//)
    })
    expect(pages).toMatchSnapshot()
  })

  test('main localized route has alias undefined when alias routes are generated as separate', () => {
    const generator = new RouteGenerator(locales, defaultLocaleCode, 'prefix_except_default', {}, {}, {}, false)
    const pages: NuxtPage[] = [
      {
        path: '/about',
        name: 'about',
        alias: ['/about-us'],
      },
    ]
    generator.extendPages(pages)

    const prefixedMain = pages.find(p => p.name === 'localized-about' && p.path?.includes(':locale'))
    if (prefixedMain) {
      expect(prefixedMain.alias === undefined || (Array.isArray(prefixedMain.alias) && prefixedMain.alias.length === 0)).toBe(true)
    }
    const aliasEntry = pages.find(p => p.path?.includes('about-us'))
    expect(aliasEntry).toBeDefined()
    expect(pages).toMatchSnapshot()
  })

  test('nested page with alias — alias routes exist and are prefixed', () => {
    const generator = new RouteGenerator(locales, defaultLocaleCode, 'prefix_except_default', {}, {}, {}, false)
    const pages: NuxtPage[] = [
      {
        path: '/parent',
        name: 'parent',
        alias: ['/parent-alias'],
        children: [{ path: 'child', name: 'parent-child' }],
      },
    ]
    generator.extendPages(pages)

    const hasParentAlias = pages.some(p => p.path?.includes('parent-alias'))
    expect(hasParentAlias).toBe(true)
    expect(pages).toMatchSnapshot()
  })

  test('all strategies with alias: no_prefix, prefix, prefix_and_default', () => {
    const pageWithAlias: NuxtPage[] = [{ path: '/x', name: 'x', alias: ['/y'] }]

    const noPrefix = new RouteGenerator(locales, defaultLocaleCode, 'no_prefix', {}, {}, {}, false)
    const pagesNoPrefix: NuxtPage[] = [...pageWithAlias.map(p => ({ ...p }))]
    noPrefix.extendPages(pagesNoPrefix)
    expect(pagesNoPrefix.some(r => r.path === '/x' || r.path === '/y')).toBe(true)
    expect(pagesNoPrefix).toMatchSnapshot()

    const prefix = new RouteGenerator(locales, defaultLocaleCode, 'prefix', {}, {}, {}, false)
    const pagesPrefix: NuxtPage[] = [{ path: '/x', name: 'x', alias: ['/y'] }]
    prefix.extendPages(pagesPrefix)
    expect(pagesPrefix).toMatchSnapshot()

    const prefixAndDefault = new RouteGenerator(locales, defaultLocaleCode, 'prefix_and_default', {}, {}, {}, false)
    const pagesPrefixAndDefault: NuxtPage[] = [{ path: '/x', name: 'x', alias: ['/y'] }]
    prefixAndDefault.extendPages(pagesPrefixAndDefault)
    expect(pagesPrefixAndDefault).toMatchSnapshot()
  })
})

describe('Critical: Path joining (resolveChildPath)', () => {
  test('parent custom path + child relative segment — child path is join(parentLocalizedPath, child.path)', () => {
    const globalLocaleRoutes = {
      '/products': { en: '/products', de: '/produkte' },
      // нет кастомного для /products/category — category должен приклеиться к /produkte
    }
    const generator = createManager('prefix_except_default', globalLocaleRoutes)
    const pages: NuxtPage[] = [
      {
        path: '/products',
        name: 'products',
        children: [
          { path: 'category', name: 'products-category' },
        ],
      },
    ]
    generator.extendPages(pages)

    const deProducts = pages.find(p => p.name === 'localized-products-de')
    expect(deProducts).toBeDefined()
    expect(deProducts!.path).toMatch(/produkte/)
    expect(deProducts!.children).toHaveLength(1)
    expect(deProducts!.children![0].path).toBe('category')
    expect(pages).toMatchSnapshot()
  })

  test('empty parent path segment + child — normalized correctly', () => {
    const generator = createManager('prefix_except_default')
    const pages: NuxtPage[] = [
      {
        path: '/',
        name: 'index',
        children: [{ path: 'dashboard', name: 'index-dashboard' }],
      },
    ]
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })
})

describe('Critical: Immutability (original page not mutated)', () => {
  test('after extendPages, original page object reference is not mutated (path and children unchanged)', () => {
    const pages: NuxtPage[] = [
      {
        path: '/about',
        name: 'about',
        children: [{ path: 'team', name: 'about-team' }],
      },
    ]
    const ref = pages[0]
    const originalPath = ref.path
    const originalChildren = ref.children
    const originalChildrenLength = originalChildren?.length ?? 0

    const generator = createManager('prefix_except_default')
    generator.extendPages(pages)

    expect(ref.path).toBe(originalPath)
    expect(ref.children).toBe(originalChildren)
    expect(ref.children?.length ?? 0).toBe(originalChildrenLength)
  })

  test('passed pages array is replaced in place (length then push), but original refs unchanged', () => {
    const pages: NuxtPage[] = [
      { path: '/a', name: 'a' },
      { path: '/b', name: 'b' },
    ]
    const refA = pages[0]
    const refB = pages[1]

    const generator = createManager('prefix_except_default')
    generator.extendPages(pages)

    expect(refA.path).toBe('/a')
    expect(refB.path).toBe('/b')
    expect(pages.length).toBeGreaterThan(2)
  })
})

describe('Critical: Meta, file preserved in generated routes', () => {
  test('generated route preserves meta and file from original page', () => {
    const pages: NuxtPage[] = [
      {
        path: '/about',
        name: 'about',
        file: '/pages/about.vue',
        meta: { layout: 'default', auth: true },
      },
    ]
    const generator = createManager('prefix_except_default')
    generator.extendPages(pages)

    const localized = pages.find(p => p.name === 'localized-about' && p.path?.includes(':locale'))
    expect(localized).toBeDefined()
    expect(localized!.file).toBe('/pages/about.vue')
    expect(localized!.meta).toEqual(expect.objectContaining({ layout: 'default', auth: true }))
    expect(pages).toMatchSnapshot()
  })
})

describe('Critical: extractLocalizedPaths keys are full original paths', () => {
  test('nested structure: keys in extractLocalizedPaths use full path (e.g. /parent/child)', () => {
    const globalLocaleRoutes = {
      '/parent': { en: '/parent', de: '/eltern' },
      '/parent/child': { en: '/parent/child', de: '/eltern/kind' },
    }
    const generator = new RouteGenerator(
      locales,
      defaultLocaleCode,
      'prefix_except_default',
      globalLocaleRoutes,
      {},
      {},
      false,
    )
    const pages: NuxtPage[] = [
      {
        path: '/parent',
        name: 'parent',
        children: [{ path: 'child', name: 'parent-child' }],
      },
    ]
    const result = generator.extractLocalizedPaths(pages)

    expect(Object.keys(result).some(k => k.includes('parent') && !k.includes('child'))).toBe(true)
    expect(Object.keys(result).some(k => k.includes('parent') && k.includes('child'))).toBe(true)
    expect(result).toMatchSnapshot()
  })
})
