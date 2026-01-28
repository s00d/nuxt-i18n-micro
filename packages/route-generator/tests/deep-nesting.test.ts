import type { NuxtPage } from '@nuxt/schema'
import { RouteGenerator } from '../src/index'
import {
  locales,
  defaultLocaleCode,
  createDeepNestedPages,
  createVeryDeepNestedPages,
  createManager,
} from './helpers'

describe('RouteGenerator - Deep nesting (4 levels)', () => {
  test('prefix_except_default: deep nested without custom paths', () => {
    const generator = createManager('prefix_except_default')
    const pages = createDeepNestedPages()
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('prefix: deep nested without custom paths', () => {
    const generator = createManager('prefix')
    const pages = createDeepNestedPages()
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('prefix_and_default: deep nested without custom paths', () => {
    const generator = createManager('prefix_and_default')
    const pages = createDeepNestedPages()
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('no_prefix: deep nested without custom paths', () => {
    const generator = createManager('no_prefix')
    const pages = createDeepNestedPages()
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('globalLocaleRoutes at root level only (section)', () => {
    const globalLocaleRoutes = {
      '/section': { en: '/section', de: '/bereich', ru: '/razdel' },
    }
    const generator = createManager('prefix_except_default', globalLocaleRoutes)
    const pages = createDeepNestedPages()
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('globalLocaleRoutes at leaf level only (detail)', () => {
    const globalLocaleRoutes = {
      '/section/category/item/detail': {
        en: '/section/category/item/detail',
        de: '/bereich/kategorie/artikel/detail',
      },
    }
    const generator = createManager('prefix_except_default', globalLocaleRoutes)
    const pages = createDeepNestedPages()
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('globalLocaleRoutes at every level', () => {
    const globalLocaleRoutes = {
      '/section': { en: '/section', de: '/bereich' },
      '/section/category': { en: '/section/category', de: '/bereich/kategorie' },
      '/section/category/item': { en: '/section/category/item', de: '/bereich/kategorie/artikel' },
      '/section/category/item/detail': {
        en: '/section/category/item/detail',
        de: '/bereich/kategorie/artikel/detail',
      },
    }
    const generator = createManager('prefix_except_default', globalLocaleRoutes)
    const pages = createDeepNestedPages()
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('filesLocaleRoutes at every level', () => {
    const filesLocaleRoutes = {
      section: { en: '/section', de: '/bereich' },
      'section-category': { en: '/section/category', de: '/bereich/kategorie' },
      'section-category-item': { en: '/section/category/item', de: '/bereich/kategorie/artikel' },
      'section-category-item-detail': {
        en: '/section/category/item/detail',
        de: '/bereich/kategorie/artikel/detail',
      },
    }
    const generator = createManager('prefix_except_default', {}, {}, false, [], filesLocaleRoutes)
    const pages = createDeepNestedPages()
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('routeLocales at root only: section restricted to en, de', () => {
    const routeLocales = {
      '/section': ['en', 'de'],
    }
    const generator = createManager('prefix_except_default', {}, routeLocales)
    const pages = createDeepNestedPages()
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('routeLocales at each level: different restrictions', () => {
    const routeLocales = {
      '/section': ['en', 'de', 'ru'],
      '/section/category': ['en', 'de'],
      '/section/category/item': ['en'],
      '/section/category/item/detail': ['en', 'ru'],
    }
    const generator = createManager('prefix_except_default', {}, routeLocales)
    const pages = createDeepNestedPages()
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('globalLocaleRoutes + routeLocales: custom paths and restrictions at each level', () => {
    const globalLocaleRoutes = {
      '/section': { en: '/section', de: '/bereich' },
      '/section/category': { en: '/section/category', de: '/bereich/kategorie' },
      '/section/category/item': { en: '/section/category/item', de: '/bereich/kategorie/artikel' },
      '/section/category/item/detail': {
        en: '/section/category/item/detail',
        de: '/bereich/kategorie/artikel/detail',
      },
    }
    const routeLocales = {
      '/section': ['en', 'de'],
      '/section/category': ['en', 'de'],
      '/section/category/item': ['en', 'de'],
      '/section/category/item/detail': ['en', 'de'],
    }
    const generator = createManager('prefix_except_default', globalLocaleRoutes, routeLocales)
    const pages = createDeepNestedPages()
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('globalLocaleRoutes at middle level only (category)', () => {
    const globalLocaleRoutes = {
      '/section/category': { en: '/section/category', de: '/bereich/kategorie' },
    }
    const generator = createManager('prefix_except_default', globalLocaleRoutes)
    const pages = createDeepNestedPages()
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('globalLocaleRoutes: root disabled (false), children have custom paths', () => {
    const globalLocaleRoutes = {
      '/section': false,
      '/section/category': { en: '/category', de: '/kategorie' },
    }
    const generator = createManager('prefix_except_default', globalLocaleRoutes)
    const pages = createDeepNestedPages()
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('extractLocalizedPaths on deep nested pages with globalLocaleRoutes', () => {
    const globalLocaleRoutes = {
      '/section': { en: '/section', de: '/bereich' },
      '/section/category/item/detail': { en: '/detail', de: '/detail-de' },
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
    const pages = createDeepNestedPages()
    const extracted = generator.extractLocalizedPaths(pages)
    expect(extracted).toMatchSnapshot()
  })

  test('prefix: deep nested with custom paths, default routes removed', () => {
    const globalLocaleRoutes = {
      '/section': { en: '/section', de: '/bereich' },
      '/section/category': { en: '/section/category', de: '/bereich/kategorie' },
    }
    const generator = createManager('prefix', globalLocaleRoutes)
    const pages = createDeepNestedPages()
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('prefix_and_default: deep nested with custom paths at root and leaf', () => {
    const globalLocaleRoutes = {
      '/section': { en: '/section', de: '/bereich' },
      '/section/category/item/detail': { en: '/detail', de: '/detail-de' },
    }
    const generator = createManager('prefix_and_default', globalLocaleRoutes)
    const pages = createDeepNestedPages()
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('no_prefix: deep nested with custom paths at every level', () => {
    const globalLocaleRoutes = {
      '/section': { en: '/section', de: '/bereich' },
      '/section/category': { en: '/section/category', de: '/bereich/kategorie' },
      '/section/category/item': { en: '/section/category/item', de: '/bereich/kategorie/artikel' },
      '/section/category/item/detail': {
        en: '/section/category/item/detail',
        de: '/bereich/kategorie/artikel/detail',
      },
    }
    const generator = createManager('no_prefix', globalLocaleRoutes)
    const pages = createDeepNestedPages()
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('globalLocaleRoutes + filesLocaleRoutes: root from global, children from files', () => {
    const globalLocaleRoutes = {
      '/section': { en: '/section', de: '/bereich' },
    }
    const filesLocaleRoutes = {
      'section-category': { en: '/section/category', de: '/bereich/kategorie' },
      'section-category-item-detail': {
        en: '/section/category/item/detail',
        de: '/bereich/kategorie/artikel/detail',
      },
    }
    const generator = createManager(
      'prefix_except_default',
      globalLocaleRoutes,
      {},
      false,
      [],
      filesLocaleRoutes,
    )
    const pages = createDeepNestedPages()
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })
})

describe('RouteGenerator - Very deep nesting (6 levels)', () => {
  test('prefix_except_default: 6 levels without custom paths', () => {
    const generator = createManager('prefix_except_default')
    const pages = createVeryDeepNestedPages()
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('prefix: 6 levels without custom paths', () => {
    const generator = createManager('prefix')
    const pages = createVeryDeepNestedPages()
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('globalLocaleRoutes at root (a) and leaf (f) only', () => {
    const globalLocaleRoutes = {
      '/a': { en: '/a', de: '/a-de' },
      '/a/b/c/d/e/f': { en: '/a/b/c/d/e/f', de: '/a-de/b/c/d/e/f-de' },
    }
    const generator = createManager('prefix_except_default', globalLocaleRoutes)
    const pages = createVeryDeepNestedPages()
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('globalLocaleRoutes at every level (6 levels)', () => {
    const globalLocaleRoutes = {
      '/a': { en: '/a', de: '/a1' },
      '/a/b': { en: '/a/b', de: '/a1/b1' },
      '/a/b/c': { en: '/a/b/c', de: '/a1/b1/c1' },
      '/a/b/c/d': { en: '/a/b/c/d', de: '/a1/b1/c1/d1' },
      '/a/b/c/d/e': { en: '/a/b/c/d/e', de: '/a1/b1/c1/d1/e1' },
      '/a/b/c/d/e/f': { en: '/a/b/c/d/e/f', de: '/a1/b1/c1/d1/e1/f1' },
    }
    const generator = createManager('prefix_except_default', globalLocaleRoutes)
    const pages = createVeryDeepNestedPages()
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('routeLocales at alternating levels', () => {
    const routeLocales = {
      '/a': ['en', 'de'],
      '/a/b/c': ['en', 'ru'],
      '/a/b/c/d/e/f': ['en'],
    }
    const generator = createManager('prefix_except_default', {}, routeLocales)
    const pages = createVeryDeepNestedPages()
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('extractLocalizedPaths on 6-level nested pages', () => {
    const globalLocaleRoutes = {
      '/a': { en: '/a', de: '/a-de' },
      '/a/b/c': { en: '/a/b/c', de: '/a-de/b-de/c-de' },
      '/a/b/c/d/e/f': { en: '/leaf', de: '/blatt' },
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
    const pages = createVeryDeepNestedPages()
    const extracted = generator.extractLocalizedPaths(pages)
    expect(extracted).toMatchSnapshot()
  })

  test('prefix_and_default: 6 levels with custom path at root', () => {
    const globalLocaleRoutes = {
      '/a': { en: '/root', de: '/wurzel' },
    }
    const generator = createManager('prefix_and_default', globalLocaleRoutes)
    const pages = createVeryDeepNestedPages()
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })
})

describe('RouteGenerator - Deep nesting with multiple branches', () => {
  test('two deep branches from same root', () => {
    const pages: NuxtPage[] = [
      {
        path: '/shop',
        name: 'shop',
        file: '/pages/shop.vue',
        children: [
          {
            path: 'category',
            name: 'shop-category',
            file: '/pages/shop/category.vue',
            children: [
              {
                path: 'product',
                name: 'shop-category-product',
                file: '/pages/shop/category/product.vue',
                children: [
                  { path: 'reviews', name: 'shop-category-product-reviews', file: '/pages/shop/category/product/reviews.vue' },
                ],
              },
            ],
          },
          {
            path: 'brand',
            name: 'shop-brand',
            file: '/pages/shop/brand.vue',
            children: [
              {
                path: 'item',
                name: 'shop-brand-item',
                file: '/pages/shop/brand/item.vue',
                children: [
                  { path: 'specs', name: 'shop-brand-item-specs', file: '/pages/shop/brand/item/specs.vue' },
                ],
              },
            ],
          },
        ],
      },
    ]
    const globalLocaleRoutes = {
      '/shop': { en: '/shop', de: '/geschaeft' },
      '/shop/category/product': { en: '/shop/category/product', de: '/geschaeft/kategorie/produkt' },
      '/shop/brand/item': { en: '/shop/brand/item', de: '/geschaeft/marke/artikel' },
    }
    const generator = createManager('prefix_except_default', globalLocaleRoutes)
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('deep branch with routeLocales on each level of branch', () => {
    const pages: NuxtPage[] = [
      {
        path: '/docs',
        name: 'docs',
        children: [
          {
            path: 'guide',
            name: 'docs-guide',
            children: [
              {
                path: 'intro',
                name: 'docs-guide-intro',
                children: [
                  {
                    path: 'step1',
                    name: 'docs-guide-intro-step1',
                    children: [
                      { path: 'example', name: 'docs-guide-intro-step1-example' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ]
    const routeLocales = {
      '/docs': ['en', 'de'],
      '/docs/guide': ['en', 'de', 'ru'],
      '/docs/guide/intro': ['en'],
      '/docs/guide/intro/step1': ['en', 'de'],
      '/docs/guide/intro/step1/example': ['en', 'de', 'ru'],
    }
    const generator = createManager('prefix_except_default', {}, routeLocales)
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })

  test('deep nesting with globalLocaleRoutes + filesLocaleRoutes + routeLocales combined', () => {
    const pages = createDeepNestedPages()
    const globalLocaleRoutes = {
      '/section': { en: '/section', de: '/bereich' },
      '/section/category/item/detail': { en: '/detail', de: '/detail-de' },
    }
    const filesLocaleRoutes = {
      'section-category': { en: '/section/category', de: '/bereich/kategorie' },
      'section-category-item': { en: '/section/category/item', de: '/bereich/kategorie/artikel' },
    }
    const routeLocales = {
      '/section': ['en', 'de', 'ru'],
      '/section/category': ['en', 'de'],
      '/section/category/item': ['en', 'de'],
      '/section/category/item/detail': ['en', 'de'],
    }
    const generator = new RouteGenerator(
      locales,
      defaultLocaleCode,
      'prefix_except_default',
      globalLocaleRoutes,
      filesLocaleRoutes,
      routeLocales,
      false,
    )
    generator.extendPages(pages)
    expect(pages).toMatchSnapshot()
  })
})
