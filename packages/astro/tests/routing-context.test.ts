import { describe, expect, it } from 'vitest'
import { getGlobalRoutingStrategy, runWithRoutingStrategy, setGlobalRoutingStrategy } from '../src/routing-context'
import type { I18nRoutingStrategy } from '../src/router/types'

describe('routing context', () => {
  it('returns per-request strategy inside runWithRoutingStrategy', () => {
    const installed: I18nRoutingStrategy = {
      getCurrentPath: () => '/',
      getLocaleFromPath: () => 'en',
    }
    const perRequest: I18nRoutingStrategy = {
      getCurrentPath: () => '/de',
      getLocaleFromPath: () => 'de',
    }

    setGlobalRoutingStrategy(installed)

    let inside: string | undefined
    runWithRoutingStrategy(perRequest, () => {
      inside = getGlobalRoutingStrategy()?.getLocaleFromPath?.('/', 'en', ['en', 'de'])
    })

    expect(inside).toBe('de')
    expect(getGlobalRoutingStrategy()?.getLocaleFromPath?.('/', 'en', ['en', 'de'])).toBe('en')
  })
})
