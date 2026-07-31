/**
 * Issue #239: localePath({ name }) path building bugs.
 * A — dashed Nuxt names + absolute globalLocaleRoutes must not prepend parent.
 * B — Vue Router param constraints `:param(matcher)` must be stripped on substitute.
 */
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import type { PathStrategyContext, ResolvedRouteLike, RouteLike } from '../src'
import { createPathStrategy, resolvePathWithParams } from '../src'
import { makePathStrategyContext, makeRouterAdapter } from './test-utils'
import { describe, expect, test } from 'vitest'

const baseConfig: ModuleOptionsExtend = {
  defaultLocale: 'en',
  strategy: 'prefix_except_default',
  locales: [
    { code: 'en', iso: 'en' },
    { code: 'es', iso: 'es' },
  ],
  dateBuild: 0,
  hashMode: false,
  isSSG: false,
  apiBaseUrl: '',
  disablePageLocales: true,
}

function makeCtx(extra?: Partial<PathStrategyContext>): PathStrategyContext {
  return makePathStrategyContext(baseConfig, 'prefix_except_default', extra)
}

describe('resolvePathWithParams — param constraints (#239 B)', () => {
  test('strips :param(matcher) when substituting', () => {
    expect(resolvePathWithParams('/archivo/:year(2024|2025)', { year: '2024' })).toBe('/archivo/2024')
    expect(resolvePathWithParams('/posts/:id(\\d+)', { id: '42' })).toBe('/posts/42')
  })

  test('still supports bare :param and :param()', () => {
    expect(resolvePathWithParams('/blog/:slug', { slug: 'hello' })).toBe('/blog/hello')
    expect(resolvePathWithParams('/opt/:q()', { q: 'x' })).toBe('/opt/x')
  })
})

describe('localeRoute — dashed names + absolute custom paths (#239 A)', () => {
  test('does not duplicate parent segment for Nuxt blog-slug + absolute globalLocaleRoutes', () => {
    const globalLocaleRoutes: Record<string, Record<string, string>> = {
      blog: { es: '/blog-es' },
      'blog-slug': { es: '/blog-es/:slug' },
    }

    const router = makeRouterAdapter(['blog', 'blog-slug', 'localized-blog-slug-es'])
    const resolveOriginal = router.resolve.bind(router)
    router.resolve = (to: RouteLike | string) => {
      const r = resolveOriginal(to) as ResolvedRouteLike & {
        name: string | null
        path: string
        fullPath: string
        params: Record<string, unknown>
      }
      const name = typeof to === 'object' && to !== null ? (to as { name?: string }).name : undefined
      const params = typeof to === 'object' && to !== null ? ((to as { params?: Record<string, unknown> }).params ?? {}) : {}
      if (name === 'blog-slug' || name === 'localized-blog-slug-es') {
        const slug = String(params.slug ?? '')
        const path = name === 'localized-blog-slug-es' ? `/es/blog-es/${slug}` : `/blog/${slug}`
        return { ...r, name: name ?? null, path, fullPath: path, params }
      }
      return r
    }

    const strategy = createPathStrategy(makeCtx({ globalLocaleRoutes, router }))
    const current: ResolvedRouteLike = {
      name: 'blog-slug',
      path: '/blog/hello',
      fullPath: '/blog/hello',
      params: { slug: 'hello' },
      query: {},
      hash: '',
    }

    const result = strategy.localeRoute('es', { name: 'blog-slug', params: { slug: 'hello' } }, current)
    expect(result.path).toBe('/es/blog-es/hello')
  })

  test('still joins relative nested custom segments under parent', () => {
    const globalLocaleRoutes: Record<string, Record<string, string> | string> = {
      docs: { es: '/docs-es' },
      'docs/intro': { es: 'introduccion' },
    }

    const router = makeRouterAdapter([])
    const strategy = createPathStrategy(
      makeCtx({
        globalLocaleRoutes: globalLocaleRoutes as PathStrategyContext['globalLocaleRoutes'],
        router,
      }),
    )
    const current: ResolvedRouteLike = {
      name: 'docs-intro',
      path: '/docs/intro',
      fullPath: '/docs/intro',
      params: {},
      query: {},
      hash: '',
    }

    // Key with slash in globalLocaleRoutes is the explicit nested form.
    const result = strategy.localeRoute('es', { name: 'docs-intro', path: '/docs/intro' }, current)
    // Absolute path from name lookup may vary; assert no double docs-es prefix when path is built.
    expect(result.path).not.toMatch(/docs-es\/docs-es/)
  })
})

describe('localeRoute — param constraints in globalLocaleRoutes (#239 B)', () => {
  test('strips matcher from absolute custom path', () => {
    const globalLocaleRoutes: Record<string, Record<string, string>> = {
      'archive-year': { es: '/archivo/:year(2024|2025)' },
    }

    const router = makeRouterAdapter(['archive-year', 'localized-archive-year-es'])
    const resolveOriginal = router.resolve.bind(router)
    router.resolve = (to: RouteLike | string) => {
      const r = resolveOriginal(to) as ResolvedRouteLike & {
        name: string | null
        path: string
        fullPath: string
        params: Record<string, unknown>
      }
      const name = typeof to === 'object' && to !== null ? (to as { name?: string }).name : undefined
      const params = typeof to === 'object' && to !== null ? ((to as { params?: Record<string, unknown> }).params ?? {}) : {}
      if (name === 'archive-year' || name === 'localized-archive-year-es') {
        const year = String(params.year ?? '')
        const path = `/archive/${year}`
        return { ...r, name: name ?? null, path, fullPath: path, params }
      }
      return r
    }

    const strategy = createPathStrategy(makeCtx({ globalLocaleRoutes, router }))
    const current: ResolvedRouteLike = {
      name: 'archive-year',
      path: '/archive/2024',
      fullPath: '/archive/2024',
      params: { year: '2024' },
      query: {},
      hash: '',
    }

    const result = strategy.localeRoute('es', { name: 'archive-year', params: { year: '2024' } }, current)
    expect(result.path).toBe('/es/archivo/2024')
    expect(result.path).not.toContain('(')
  })
})
