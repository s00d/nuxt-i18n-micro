import type { NuxtPage } from '@nuxt/schema'
import { extractLocalizedPaths } from '../src/core/localized-paths'
import { createNestedPages } from './helpers'

describe('extractLocalizedPaths (core)', () => {
  test('empty pages array returns empty object', () => {
    const result = extractLocalizedPaths([], {}, {})
    expect(result).toMatchSnapshot()
  })

  test('pages with no globalLocaleRoutes or filesLocaleRoutes returns empty', () => {
    const pages: NuxtPage[] = [
      { path: '/about', name: 'about' },
      { path: '/contact', name: 'contact' },
    ]
    const result = extractLocalizedPaths(pages, {}, {})
    expect(result).toMatchSnapshot()
  })

  test('globalLocaleRoutes only: returns paths by normalized key', () => {
    const globalLocaleRoutes = {
      '/about': { en: '/about', de: '/ueber-uns' },
      '/contact': { en: '/contact', de: '/kontakt' },
    }
    const pages: NuxtPage[] = [
      { path: '/about', name: 'about' },
      { path: '/contact', name: 'contact' },
    ]
    const result = extractLocalizedPaths(pages, globalLocaleRoutes, {})
    expect(result).toMatchSnapshot()
  })

  test('filesLocaleRoutes only: returns paths by page name and path', () => {
    const filesLocaleRoutes = {
      about: { en: '/about', de: '/ueber-uns' },
      contact: { en: '/contact', ru: '/kontakt' },
    }
    const pages: NuxtPage[] = [
      { path: '/about', name: 'about' },
      { path: '/contact', name: 'contact' },
    ]
    const result = extractLocalizedPaths(pages, {}, filesLocaleRoutes)
    expect(result).toMatchSnapshot()
  })

  test('nested pages: extracts with parentPath', () => {
    const globalLocaleRoutes = {
      '/parent': { en: '/parent', de: '/eltern' },
      '/parent/child': { en: '/parent/child', de: '/eltern/kind' },
    }
    const pages = createNestedPages()
    const result = extractLocalizedPaths(pages, globalLocaleRoutes, {})
    expect(result).toMatchSnapshot()
  })

  test('globalLocaleRoutes with false value: key not in result for that path', () => {
    const globalLocaleRoutes = {
      '/about': { en: '/about', de: '/ueber' },
      '/disabled': false,
    }
    const pages: NuxtPage[] = [
      { path: '/about', name: 'about' },
      { path: '/disabled', name: 'disabled' },
    ]
    const result = extractLocalizedPaths(pages, globalLocaleRoutes, {})
    expect(result).toMatchSnapshot()
  })

  test('lookup by pageName when path differs', () => {
    const globalLocaleRoutes = {
      'about-page': { en: '/about-us', de: '/ueber-uns' },
    }
    const pages: NuxtPage[] = [{ path: '/about', name: 'about-page' }]
    const result = extractLocalizedPaths(pages, globalLocaleRoutes, {})
    expect(result).toMatchSnapshot()
  })

  test('dynamic segments in path: normalized key [id] -> :id', () => {
    const globalLocaleRoutes = {
      '/users/:id': { en: '/users/:id', de: '/benutzer/:id' },
    }
    const pages: NuxtPage[] = [{ path: '/users/[id]', name: 'users-id' }]
    const result = extractLocalizedPaths(pages, globalLocaleRoutes, {})
    expect(result).toMatchSnapshot()
  })

  test('multiple levels of nesting with mixed global and files', () => {
    const globalLocaleRoutes = {
      '/level1': { en: '/l1', de: '/ebene1' },
    }
    const filesLocaleRoutes = {
      'level1-level2': { en: '/l1/l2', de: '/ebene1/ebene2' },
    }
    const pages: NuxtPage[] = [
      {
        path: '/level1',
        name: 'level1',
        children: [{ path: 'level2', name: 'level1-level2' }],
      },
    ]
    const result = extractLocalizedPaths(pages, globalLocaleRoutes, filesLocaleRoutes)
    expect(result).toMatchSnapshot()
  })
})
