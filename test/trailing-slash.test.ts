import { describe, expect, test } from 'vitest'
import { applyTrailingSlash } from '../src/runtime/utils/trailing-slash'

describe('applyTrailingSlash (NuxtLink parity)', () => {
  test('unset, append, remove, non-http links', () => {
    // step 1: unset → links as written
    expect(applyTrailingSlash('/en/about')).toBe('/en/about')
    expect(applyTrailingSlash('/en/about/', undefined)).toBe('/en/about/')

    // step 2: append → before the query, on paths and absolute http(s) URLs; `/` stays `/`
    expect(applyTrailingSlash('/en/about', 'append')).toBe('/en/about/')
    expect(applyTrailingSlash('/en/about?q=1', 'append')).toBe('/en/about/?q=1')
    expect(applyTrailingSlash('https://example.com/en/about', 'append')).toBe('https://example.com/en/about/')
    expect(applyTrailingSlash('https://example.com/en/about?q=1', 'append')).toBe('https://example.com/en/about/?q=1')
    expect(applyTrailingSlash('/', 'append')).toBe('/')

    // step 3: remove → the same places
    expect(applyTrailingSlash('/en/about/', 'remove')).toBe('/en/about')
    expect(applyTrailingSlash('/en/about/?q=1', 'remove')).toBe('/en/about?q=1')
    expect(applyTrailingSlash('https://example.com/en/about/', 'remove')).toBe('https://example.com/en/about')

    // step 4: mailto:/tel: are left alone, like NuxtLink
    expect(applyTrailingSlash('mailto:hi@example.com', 'append')).toBe('mailto:hi@example.com')
    expect(applyTrailingSlash('tel:+123', 'remove')).toBe('tel:+123')
  })
})
