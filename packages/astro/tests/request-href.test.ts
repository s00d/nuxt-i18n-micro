import { describe, expect, it } from 'vitest'
import { localizeHref } from '../src/request'
import type { I18nRoutingStrategy } from '../src'

const context = (from: string) => ({
  base: '',
  defaultLocale: 'en',
  codes: ['en', 'de'],
  from,
  strategy: { localizePath: (path: string) => path } as unknown as I18nRoutingStrategy,
})

describe('localizeHref, a request path of slashes', () => {
  it('stays linear on a run that does not reach the end', () => {
    const from = `${'/'.repeat(1 << 16)}x`
    const start = performance.now()
    localizeHref('a', 'de', context(from))
    expect(performance.now() - start).toBeLessThan(500)
  })
})
