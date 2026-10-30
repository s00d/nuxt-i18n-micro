import { describe, expect, it } from 'vitest'
import { externalLinkHref } from '../src/link'

describe('externalLinkHref', () => {
  it.each([
    ['https://example.com/a', 'https://example.com/a'],
    ['http://example.com', 'http://example.com'],
    ['//cdn.example.com/a.js', '//cdn.example.com/a.js'],
    ['tel:+100', 'tel:+100'],
    ['mailto:hi@example.com', 'mailto:hi@example.com'],
    ['example.com/login', 'https://example.com/login'],
  ])('%s leaves the app as %s', (to, href) => {
    expect(externalLinkHref(to)).toBe(href)
  })

  it.each(['/about', '/contact/tel:100', '/mailto:a', 'about', '', { path: 'https://example.com' }])('%j stays a route', (to) => {
    expect(externalLinkHref(to)).toBeUndefined()
  })
})
