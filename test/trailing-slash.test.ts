import { joinURL } from 'ufo'
import { describe, expect, it } from 'vitest'
import { applyTrailingSlash } from '../src/runtime/utils/trailing-slash'

describe('applyTrailingSlash (NuxtLink parity)', () => {
  it('is a no-op when trailingSlash is unset', () => {
    expect(applyTrailingSlash('/en/about')).toBe('/en/about')
    expect(applyTrailingSlash('/en/about/', undefined)).toBe('/en/about/')
  })

  it('appends slash to path, query and absolute http(s) URLs', () => {
    expect(applyTrailingSlash('/en/about', 'append')).toBe('/en/about/')
    expect(applyTrailingSlash('/en/about?q=1', 'append')).toBe('/en/about/?q=1')
    expect(applyTrailingSlash('https://example.com/en/about', 'append')).toBe('https://example.com/en/about/')
    expect(applyTrailingSlash('https://example.com/en/about?q=1', 'append')).toBe('https://example.com/en/about/?q=1')
    expect(applyTrailingSlash('/', 'append')).toBe('/')
  })

  it('removes slash from path and absolute http(s) URLs', () => {
    expect(applyTrailingSlash('/en/about/', 'remove')).toBe('/en/about')
    expect(applyTrailingSlash('/en/about/?q=1', 'remove')).toBe('/en/about?q=1')
    expect(applyTrailingSlash('https://example.com/en/about/', 'remove')).toBe('https://example.com/en/about')
  })

  it('skips non-http protocols like NuxtLink', () => {
    expect(applyTrailingSlash('mailto:hi@example.com', 'append')).toBe('mailto:hi@example.com')
    expect(applyTrailingSlash('tel:+123', 'remove')).toBe('tel:+123')
  })

  it('restores root slash dropped by joinURL on a slashless absolute base', () => {
    expect(joinURL('https://example.com', '/')).toBe('https://example.com')
    expect(applyTrailingSlash(joinURL('https://example.com', '/'), 'append')).toBe('https://example.com/')
    expect(applyTrailingSlash(joinURL('https://example.com', '/en/'), 'append')).toBe('https://example.com/en/')
  })
})
