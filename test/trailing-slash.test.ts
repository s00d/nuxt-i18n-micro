import { beforeEach, describe, expect, it } from 'vitest'
import { nuxtLinkDefaults } from './stubs/nuxt-config'
import { applyNuxtTrailingSlash } from '../src/runtime/utils/trailing-slash'

describe('applyNuxtTrailingSlash (NuxtLink parity)', () => {
  beforeEach(() => {
    delete nuxtLinkDefaults.trailingSlash
  })

  it('is a no-op when trailingSlash is unset', () => {
    expect(applyNuxtTrailingSlash('/en/about')).toBe('/en/about')
    expect(applyNuxtTrailingSlash('/en/about/')).toBe('/en/about/')
  })

  it('appends slash to path, query and absolute http(s) URLs', () => {
    nuxtLinkDefaults.trailingSlash = 'append'
    expect(applyNuxtTrailingSlash('/en/about')).toBe('/en/about/')
    expect(applyNuxtTrailingSlash('/en/about?q=1')).toBe('/en/about/?q=1')
    expect(applyNuxtTrailingSlash('https://example.com/en/about')).toBe('https://example.com/en/about/')
    expect(applyNuxtTrailingSlash('https://example.com/en/about?q=1')).toBe('https://example.com/en/about/?q=1')
    expect(applyNuxtTrailingSlash('/')).toBe('/')
  })

  it('removes slash from path and absolute http(s) URLs', () => {
    nuxtLinkDefaults.trailingSlash = 'remove'
    expect(applyNuxtTrailingSlash('/en/about/')).toBe('/en/about')
    expect(applyNuxtTrailingSlash('/en/about/?q=1')).toBe('/en/about?q=1')
    expect(applyNuxtTrailingSlash('https://example.com/en/about/')).toBe('https://example.com/en/about')
  })

  it('skips non-http protocols like NuxtLink', () => {
    nuxtLinkDefaults.trailingSlash = 'append'
    expect(applyNuxtTrailingSlash('mailto:hi@example.com')).toBe('mailto:hi@example.com')
    nuxtLinkDefaults.trailingSlash = 'remove'
    expect(applyNuxtTrailingSlash('tel:+123')).toBe('tel:+123')
  })
})
