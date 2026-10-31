import { afterEach, expect, test, vi } from 'vitest'
import { createBrowserHistoryAdapter } from '../src/router'

afterEach(() => vi.unstubAllGlobals())

test('on a server the adapter answers the URL it is given', () => {
  vi.stubGlobal('window', undefined)
  const strategy = createBrowserHistoryAdapter([{ code: 'en' }, { code: 'de' }], 'en', '/de/about?a=1#b')
  expect(strategy.getCurrentPath()).toBe('/de/about?a=1#b')
  expect(strategy.getRoute?.()).toEqual({ fullPath: '/de/about?a=1#b', query: { a: '1' } })
})

test('without a URL a server answers the root, and a browser its address', () => {
  vi.stubGlobal('window', undefined)
  expect(createBrowserHistoryAdapter([{ code: 'en' }], 'en').getCurrentPath()).toBe('/')
  vi.unstubAllGlobals()
  expect(createBrowserHistoryAdapter([{ code: 'en' }], 'en', '/ignored').getCurrentPath()).toBe(
    `${location.pathname}${location.search}${location.hash}`,
  )
})
