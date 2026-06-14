import {
  buildTranslationPayloadFetchRequest,
  buildTranslationPayloadPath,
  resolveTranslationPayloadBaseURL,
  resolveTranslationPayloadPage,
} from '../src/payload-url'

describe('resolveTranslationPayloadPage', () => {
  it('defaults missing route names to index', () => {
    expect(resolveTranslationPayloadPage(undefined)).toBe('index')
    expect(resolveTranslationPayloadPage('')).toBe('index')
  })

  it('applies routesLocaleLinks aliases', () => {
    expect(
      resolveTranslationPayloadPage('contact-alias', {
        'contact-alias': 'contact',
      }),
    ).toBe('contact')
  })
})

describe('buildTranslationPayloadPath', () => {
  it('builds the canonical data.json path', () => {
    expect(buildTranslationPayloadPath('_locales', 'index', 'en')).toBe('/_locales/index/en/data.json')
    expect(buildTranslationPayloadPath('_locales', 'settings-profile', 'de')).toBe('/_locales/settings-profile/de/data.json')
  })

  it('normalizes duplicate slashes in apiBaseUrl', () => {
    expect(buildTranslationPayloadPath('/_locales/', 'index', 'en')).toBe('/_locales/index/en/data.json')
  })
})

describe('resolveTranslationPayloadBaseURL', () => {
  it('uses external hosts per runtime side', () => {
    expect(
      resolveTranslationPayloadBaseURL({
        isServer: true,
        baseURL: 'https://app.example.com',
        apiBaseClientHost: 'https://cdn.example.com',
        apiBaseServerHost: 'https://internal.example.com',
      }),
    ).toBe('https://internal.example.com')

    expect(
      resolveTranslationPayloadBaseURL({
        isServer: false,
        baseURL: 'https://app.example.com',
        apiBaseClientHost: 'https://cdn.example.com',
        apiBaseServerHost: 'https://internal.example.com',
      }),
    ).toBe('https://cdn.example.com')
  })

  it('falls back to app baseURL when external host is missing', () => {
    expect(
      resolveTranslationPayloadBaseURL({
        isServer: true,
        baseURL: 'https://app.example.com',
      }),
    ).toBe('https://app.example.com')
  })
})

describe('buildTranslationPayloadFetchRequest', () => {
  it('builds client fetch target from apiBaseClientHost', () => {
    expect(
      buildTranslationPayloadFetchRequest({
        apiBaseUrl: '_locales',
        routeName: 'index',
        locale: 'en',
        isServer: false,
        baseURL: 'https://app.example.com',
        apiBaseClientHost: 'https://cdn.example.com',
        dateBuild: 123,
      }),
    ).toEqual({
      path: '/_locales/index/en/data.json',
      baseURL: 'https://cdn.example.com',
      params: { v: 123 },
    })
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
