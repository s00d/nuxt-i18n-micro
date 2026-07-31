import { describe, expect, test } from 'vitest'
import { shouldAttemptLocaleRedirect } from '../src/auto-detect-path'

describe('shouldAttemptLocaleRedirect (#242)', () => {
  test('default `/` only allows the root path', () => {
    expect(shouldAttemptLocaleRedirect('/')).toBe(true)
    expect(shouldAttemptLocaleRedirect('')).toBe(true)
    expect(shouldAttemptLocaleRedirect('/about')).toBe(false)
    expect(shouldAttemptLocaleRedirect('/en/about', { hasLocalePrefix: true })).toBe(false)
  })

  test('`*` allows every path', () => {
    expect(shouldAttemptLocaleRedirect('/', { autoDetectPath: '*' })).toBe(true)
    expect(shouldAttemptLocaleRedirect('/about', { autoDetectPath: '*' })).toBe(true)
    expect(shouldAttemptLocaleRedirect('/en/about', { autoDetectPath: '*', hasLocalePrefix: true })).toBe(true)
  })

  test('`no_prefix` skips locale-prefixed paths', () => {
    expect(shouldAttemptLocaleRedirect('/', { autoDetectPath: 'no_prefix' })).toBe(true)
    expect(shouldAttemptLocaleRedirect('/about', { autoDetectPath: 'no_prefix' })).toBe(true)
    expect(shouldAttemptLocaleRedirect('/en/about', { autoDetectPath: 'no_prefix', hasLocalePrefix: true })).toBe(false)
    expect(shouldAttemptLocaleRedirect('/de', { autoDetectPath: 'no_prefix', hasLocalePrefix: true })).toBe(false)
  })

  test('custom path matches exactly', () => {
    expect(shouldAttemptLocaleRedirect('/welcome', { autoDetectPath: '/welcome' })).toBe(true)
    expect(shouldAttemptLocaleRedirect('/welcome/', { autoDetectPath: '/welcome' })).toBe(true)
    expect(shouldAttemptLocaleRedirect('/about', { autoDetectPath: '/welcome' })).toBe(false)
  })
})
