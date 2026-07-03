import { describe, expect, it } from 'vitest'
import { withoutAppBaseURL } from '../src/app-path'

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
