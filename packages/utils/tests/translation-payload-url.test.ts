import {
  buildTranslationPayloadCacheControl,
  buildTranslationPayloadFetchRequest,
  buildTranslationPayloadPath,
  resolveTranslationPayloadBaseURL,
  resolveTranslationPayloadPage,
} from '../src/payload-url'
import { describe, expect, it } from 'vitest'

describe('resolveTranslationPayloadPage', () => {
  it('defaults missing route names to index', () => {
    expect(resolveTranslationPayloadPage(undefined)).toBe('index')
    expect(resolveTranslationPayloadPage('')).toBe('index')
  })
})

describe('buildTranslationPayloadPath', () => {
  it('normalizes duplicate slashes in apiBaseUrl', () => {
    expect(buildTranslationPayloadPath('/_locales/', 'index', 'en')).toBe('/_locales/index/en/data.json')
  })
})

describe('resolveTranslationPayloadBaseURL', () => {
  const hosts = {
    baseURL: 'https://app.example.com',
    apiBaseClientHost: 'https://cdn.example.com',
    apiBaseServerHost: 'https://internal.example.com',
  }

  it('picks the host of the side that fetches and falls back to baseURL on either side', () => {
    expect(resolveTranslationPayloadBaseURL({ ...hosts, isServer: true })).toBe('https://internal.example.com')
    expect(resolveTranslationPayloadBaseURL({ ...hosts, isServer: false })).toBe('https://cdn.example.com')
    expect(resolveTranslationPayloadBaseURL({ baseURL: hosts.baseURL, isServer: true })).toBe(hosts.baseURL)
    expect(resolveTranslationPayloadBaseURL({ baseURL: hosts.baseURL, isServer: false })).toBe(hosts.baseURL)
    // the other side's host is no fallback: a browser cannot reach the internal one
    expect(resolveTranslationPayloadBaseURL({ baseURL: hosts.baseURL, apiBaseServerHost: hosts.apiBaseServerHost, isServer: false })).toBe(
      hosts.baseURL,
    )
    expect(resolveTranslationPayloadBaseURL({ baseURL: hosts.baseURL, apiBaseClientHost: hosts.apiBaseClientHost, isServer: true })).toBe(
      hosts.baseURL,
    )
  })
})

describe('buildTranslationPayloadFetchRequest', () => {
  it('sends the browser to the client host, with dateBuild as the cache buster', () => {
    expect(
      buildTranslationPayloadFetchRequest({
        apiBaseUrl: '_locales',
        routeName: 'index',
        locale: 'en',
        isServer: false,
        baseURL: 'https://app.example.com',
        apiBaseClientHost: 'https://cdn.example.com',
        apiBaseServerHost: 'https://internal.example.com',
        dateBuild: 123,
      }),
    ).toEqual({ path: '/_locales/index/en/data.json', baseURL: 'https://cdn.example.com', params: { v: 123 } })
  })

  it('resolves routesLocaleLinks before building the path', () => {
    expect(
      buildTranslationPayloadFetchRequest({
        apiBaseUrl: '_locales',
        routeName: 'alias-page',
        locale: 'de',
        isServer: true,
        baseURL: 'https://app.example.com',
        apiBaseServerHost: 'https://cdn.example.com',
        routesLocaleLinks: { 'alias-page': 'contact' },
      }),
    ).toEqual({
      path: '/_locales/contact/de/data.json',
      baseURL: 'https://cdn.example.com',
      params: undefined,
    })
  })
})

describe('buildTranslationPayloadCacheControl', () => {
  it('builds public immutable Cache-Control for positive durations', () => {
    expect(buildTranslationPayloadCacheControl(31536000)).toBe('public, max-age=31536000, immutable')
    expect(buildTranslationPayloadCacheControl(10)).toBe('public, max-age=10, immutable')
    expect(buildTranslationPayloadCacheControl(10.9)).toBe('public, max-age=10, immutable')
  })

  it('forces revalidation when cache-buster is disabled', () => {
    expect(buildTranslationPayloadCacheControl(3600, false)).toBe('public, max-age=0, must-revalidate')
  })

  it('returns null when caching is disabled', () => {
    expect(buildTranslationPayloadCacheControl(0)).toBeNull()
    expect(buildTranslationPayloadCacheControl(-1)).toBeNull()
    expect(buildTranslationPayloadCacheControl(undefined)).toBeNull()
    expect(buildTranslationPayloadCacheControl(Number.NaN)).toBeNull()
    expect(buildTranslationPayloadCacheControl(Number.POSITIVE_INFINITY)).toBeNull()
    expect(buildTranslationPayloadCacheControl(1e21)).toBeNull()
  })
})
