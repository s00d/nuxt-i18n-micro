import { describe, expect, it } from 'vitest'
import { externalLinkHref, isPlainClick, isSamePage } from '../src/link'

describe('externalLinkHref', () => {
  it.each([
    ['https://example.com/a', 'https://example.com/a'],
    ['http://example.com', 'http://example.com'],
    ['//cdn.example.com/a.js', '//cdn.example.com/a.js'],
    ['tel:+100', 'tel:+100'],
    ['mailto:hi@example.com', 'mailto:hi@example.com'],
    ['example.com/login', 'https://example.com/login'],
    ['www.example.com', 'https://www.example.com'],
    ['example.com/report.pdf', 'https://example.com/report.pdf'],
    ['example.com?x=1', 'https://example.com?x=1'],
    ['HTTPS://example.com', 'HTTPS://example.com'],
    ['Mailto:hi@example.com', 'Mailto:hi@example.com'],
    ['TEL:+100', 'TEL:+100'],
  ])('%s leaves the app as %s', (to, href) => {
    expect(externalLinkHref(to)).toBe(href)
  })

  it.each([
    '/about',
    '/contact/tel:100',
    '/mailto:a',
    'about',
    '',
    'report.pdf',
    'index.html',
    'INDEX.HTM',
    'data.json?x=1',
    'a.b',
    'javascript:alert(1)',
    { path: 'https://example.com' },
  ])('%j stays a route', (to) => {
    expect(externalLinkHref(to)).toBeUndefined()
  })
})

describe('isSamePage', () => {
  it.each([
    ['/about', '/about'],
    ['/about', '/about/'],
    ['/about', '/about?x=1'],
    ['/about', '/about#top'],
    ['/about/?x=1#y', '/about'],
    ['/', ''],
    ['/', '/?x=1'],
  ])('%s is %s', (a, b) => {
    expect(isSamePage(a, b)).toBe(true)
  })

  it.each([
    ['/about', '/about/team'],
    ['/about', '/'],
    ['/de/about', '/about'],
  ])('%s is not %s', (a, b) => {
    expect(isSamePage(a, b)).toBe(false)
  })
})

describe('isPlainClick', () => {
  const click = (init: Partial<MouseEvent> & { target?: string } = {}) => {
    const { target, ...event } = init
    return { defaultPrevented: false, button: 0, currentTarget: { getAttribute: () => target ?? null }, ...event } as unknown as MouseEvent
  }

  it('a primary click on a link without a target', () => {
    expect(isPlainClick(click())).toBe(true)
    expect(isPlainClick(click({ target: '_self' }))).toBe(true)
  })

  it.each([
    { ctrlKey: true },
    { metaKey: true },
    { shiftKey: true },
    { altKey: true },
    { button: 1 },
    { defaultPrevented: true },
    { target: '_blank' },
  ])('not with %j', (init) => {
    expect(isPlainClick(click(init))).toBe(false)
  })
})
