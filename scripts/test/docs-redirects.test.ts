import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { redirectStub, writeRedirectStubs } from '../../docs/.vitepress/redirect-stubs'
import { installRedirects, redirects, redirectTarget } from '../../docs/.vitepress/redirects'
import { repoRoot } from '../src/utils/workspace'

const page = (route: string): string => join(repoRoot, 'docs', route.endsWith('/') ? `${route}index.md` : `${route}.md`)

/** The heading anchors of a page, as VitePress slugs them (an explicit `{#id}` wins). */
const anchors = (route: string): string[] =>
  [...readFileSync(page(route), 'utf8').matchAll(/^#{2,6} (.+?)(?: \{#(.+)\})?$/gm)].map(
    ([, title, id]) => id ?? title!.replace(/[`$]/g, '').trim().toLowerCase().replace(/\s+/g, '-'),
  )

describe('docs redirect map', () => {
  it('sends every old route to a page that exists, and no old route is still a page', () => {
    for (const [from, to] of Object.entries(redirects)) {
      expect(existsSync(page(from)), `${from} is still a page`).toBe(false)
      expect(existsSync(page(to.split('#')[0]!)), `${from} → ${to} has no page`).toBe(true)
    }
  })

  it('sends every hash to a section that exists', () => {
    for (const [from, to] of Object.entries(redirects)) {
      const [route, hash] = to.split('#')
      if (hash) expect(anchors(route!), `${from} → ${to}`).toContain(hash)
    }
  })

  it('resolves base, .html, index and hashes', () => {
    expect(redirectTarget('https://x.dev/nuxt-i18n-micro/guide/v3-upgrade.html#a', '/nuxt-i18n-micro/')).toBe('/nuxt-i18n-micro/guide/upgrade#a')
    expect(redirectTarget('/guide/firebase#old', '/')).toBe('/guide/deployment#firebase')
    expect(redirectTarget('/composables/index', '/')).toBe('/api/')
    expect(redirectTarget('/composables', '/')).toBe('/api/')
    expect(redirectTarget('/guide/strategy', '/')).toBeUndefined()
  })
})

describe('redirect stubs', () => {
  const outDirs: string[] = []
  const outDir = () => {
    const dir = mkdtempSync(join(tmpdir(), 'docs-redirects-'))
    outDirs.push(dir)
    return dir
  }
  afterEach(() => {
    for (const dir of outDirs.splice(0)) rmSync(dir, { recursive: true, force: true })
  })

  it('keeps the old hash only when the target has none', () => {
    expect(redirectStub('/base/guide/upgrade')).toContain('location.replace("/base/guide/upgrade" + location.hash)')
    expect(redirectStub('/base/guide/deployment#firebase')).toContain('location.replace("/base/guide/deployment#firebase")')
  })

  it('canonicalizes on the site origin, without the hash, and stays out of the index', () => {
    const stub = redirectStub('/nuxt-i18n-micro/guide/deployment#firebase')
    expect(stub).toContain('<link rel="canonical" href="https://s00d.github.io/nuxt-i18n-micro/guide/deployment">')
    expect(stub).toContain('<meta http-equiv="refresh" content="0; url=/nuxt-i18n-micro/guide/deployment#firebase">')
    expect(stub).toContain('<meta name="robots" content="noindex">')
  })

  it('writes one stub per route, a directory route as its index, under the base', () => {
    const dir = outDir()
    writeRedirectStubs(dir, '/base/', { '/old/page': '/new/page', '/old/': '/api/' })
    expect(readFileSync(join(dir, 'old/page.html'), 'utf8')).toContain('url=/base/new/page')
    expect(readFileSync(join(dir, 'old/index.html'), 'utf8')).toContain('url=/base/api/')
  })

  it('fails the build when an old route still renders a page', () => {
    const dir = outDir()
    mkdirSync(join(dir, 'guide'))
    writeFileSync(join(dir, 'guide/page.html'), 'real page')
    expect(() => writeRedirectStubs(dir, '/', { '/guide/page': '/new' })).toThrow('/guide/page is still a page')
    expect(readFileSync(join(dir, 'guide/page.html'), 'utf8')).toBe('real page')
  })
})

describe('installRedirects', () => {
  const setup = (href: string, previous?: (to: string) => unknown) => {
    const router = { go: vi.fn(async () => {}), onBeforeRouteChange: previous }
    const location = { href, replace: vi.fn() }
    installRedirects(router, '/base/', location)
    return { router, location }
  }

  it('replaces an old URL on load and leaves a current one alone', () => {
    expect(setup('https://x.dev/base/guide/v3-upgrade').location.replace).toHaveBeenCalledWith('/base/guide/upgrade')
    expect(setup('https://x.dev/base/guide/upgrade').location.replace).not.toHaveBeenCalled()
  })

  it('reroutes a link to an old route and cancels the navigation', async () => {
    const { router } = setup('https://x.dev/base/')
    await expect(router.onBeforeRouteChange!('/base/guide/v3-upgrade')).resolves.toBe(false)
    expect(router.go).toHaveBeenCalledWith('/base/guide/upgrade')
  })

  it('lets a current route through', async () => {
    const { router } = setup('https://x.dev/base/')
    await expect(router.onBeforeRouteChange!('/base/guide/upgrade')).resolves.toBeUndefined()
    expect(router.go).not.toHaveBeenCalled()
  })

  it('keeps the hook it replaced: a cancel there wins', async () => {
    const previous = vi.fn((_to: string) => false)
    const { router } = setup('https://x.dev/base/', previous)
    await expect(router.onBeforeRouteChange!('/base/guide/v3-upgrade')).resolves.toBe(false)
    expect(previous).toHaveBeenCalledWith('/base/guide/v3-upgrade')
    expect(router.go).not.toHaveBeenCalled()
  })
})
