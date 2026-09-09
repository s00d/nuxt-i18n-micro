import { isInternalPath, isStaticAssetPathname, resolveContainedRelPath, withoutAppBaseURL } from '../src/app-path'
import { describe, expect, it } from 'vitest'

describe('withoutAppBaseURL', () => {
  it('returns pathname unchanged when baseURL is empty or root', () => {
    expect(withoutAppBaseURL('/examples/ja', '/')).toBe('/examples/ja')
    expect(withoutAppBaseURL('/examples/ja', null)).toBe('/examples/ja')
    expect(withoutAppBaseURL('/examples/ja', undefined)).toBe('/examples/ja')
  })

  it('strips baseURL prefix from app root path', () => {
    expect(withoutAppBaseURL('/examples', '/examples')).toBe('/')
    expect(withoutAppBaseURL('/examples/', '/examples')).toBe('/')
    expect(withoutAppBaseURL('/examples', '/examples/')).toBe('/')
  })

  it('strips baseURL prefix from localized paths', () => {
    expect(withoutAppBaseURL('/examples/ja', '/examples')).toBe('/ja')
    expect(withoutAppBaseURL('/examples/en/about', '/examples')).toBe('/en/about')
  })

  it('leaves paths outside baseURL unchanged', () => {
    expect(withoutAppBaseURL('/api/health', '/examples')).toBe('/api/health')
    expect(withoutAppBaseURL('/_nuxt/entry.js', '/examples')).toBe('/_nuxt/entry.js')
  })
})

describe('isStaticAssetPathname', () => {
  it('does not treat dotted slugs as static files', () => {
    expect(isStaticAssetPathname('/en/user/john.doe')).toBe(false)
    expect(isStaticAssetPathname('/docs/v1.2')).toBe(false)
    expect(isStaticAssetPathname('/releases/1.0.0')).toBe(false)
    expect(isStaticAssetPathname('/en/about.html')).toBe(false)
  })

  it('recognizes last-segment static extensions', () => {
    expect(isStaticAssetPathname('/favicon.ico')).toBe(true)
    expect(isStaticAssetPathname('/en/sitemap.xml')).toBe(true)
    expect(isStaticAssetPathname('/assets/app.js')).toBe(true)
    expect(isStaticAssetPathname('/logo.PNG')).toBe(true)
    expect(isStaticAssetPathname('/static/app.css/')).toBe(true)
  })
})

describe('isInternalPath', () => {
  it('skips well-known prefixes and __ internals', () => {
    expect(isInternalPath('/api')).toBe(true)
    expect(isInternalPath('/_nuxt/entry.js')).toBe(true)
    expect(isInternalPath('/_locales/index/en/data.json')).toBe(true)
    expect(isInternalPath('/__')).toBe(true)
    expect(isInternalPath('/__nuxt_content')).toBe(true)
    expect(isInternalPath('/en/__nuxt_content/query')).toBe(true)
    expect(isInternalPath('/apiculture')).toBe(false)
  })

  it('skips static assets including trailing-slash paths', () => {
    expect(isInternalPath('/static/app.css/')).toBe(true)
    expect(isInternalPath('/en/user/john.doe')).toBe(false)
  })

  it('treats wildcard excludePatterns metacharacters as literals', () => {
    expect(isInternalPath('/blog/[slug]/extra', ['/blog/[slug]*'])).toBe(true)
    expect(isInternalPath('/blog/other', ['/blog/[slug]*'])).toBe(false)
  })

  it('resets lastIndex on global excludePatterns regexes', () => {
    const pattern = /^\/admin(?:\/|$)/g
    expect(isInternalPath('/admin', [pattern])).toBe(true)
    expect(isInternalPath('/admin', [pattern])).toBe(true)
    expect(pattern.lastIndex).toBe(0)
  })
})

describe('resolveContainedRelPath', () => {
  it('keeps normal payload keys', () => {
    expect(resolveContainedRelPath('index/en/data.json')).toBe('index/en/data.json')
    expect(resolveContainedRelPath('/pages/about/de.json')).toBe('pages/about/de.json')
  })

  it('rejects traversal out of the payload root', () => {
    expect(resolveContainedRelPath('../en/data.json')).toBeNull()
    expect(resolveContainedRelPath('../../server/chunks/index.mjs')).toBeNull()
    expect(resolveContainedRelPath('foo/../../secret.json')).toBeNull()
    expect(resolveContainedRelPath('..')).toBeNull()
    expect(resolveContainedRelPath('foo/bar/../..')).toBeNull()
  })

  it('normalizes inner dots without escaping', () => {
    expect(resolveContainedRelPath('foo/./bar/../baz.json')).toBe('foo/baz.json')
  })
})
