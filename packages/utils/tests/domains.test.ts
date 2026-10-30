import type { Locale, ModuleOptionsExtend } from '@i18n-micro/types'
import { describe, expect, test } from 'vitest'
import { configForHost, withHostDefaults } from '../src/domains'

const locales: Locale[] = [
  { code: 'en', baseUrl: 'https://example.com/', baseDefault: true },
  { code: 'de', baseUrl: 'https://example.de', baseDefault: true },
  { code: 'nl', baseUrl: 'https://example.de' },
  { code: 'fr' },
]
const config = { locales, defaultLocale: 'en' } as ModuleOptionsExtend
const codes = (c: ModuleOptionsExtend) => c.locales!.map((l) => l.code)

describe('configForHost', () => {
  test('a configured host: its default, its locales, every locale with no domain, its origin', () => {
    const de = configForHost(config, 'example.de')
    expect(de).toMatchObject({ domain: 'example.de', defaultLocale: 'de', metaBaseUrl: 'https://example.de', linkLocales: locales })
    expect(codes(de)).toEqual(['de', 'nl', 'fr'])
    expect(configForHost(config, 'example.com').metaBaseUrl).toBe('https://example.com')
  })

  test('case and a default port name the same host; one answer per host', () => {
    expect(configForHost(config, 'EXAMPLE.de:443')).toBe(configForHost(config, 'example.de'))
    expect(configForHost(config, 'example.de:80')).toBe(configForHost(config, 'example.de'))
  })

  test('anything else is the config itself: nothing is added to the table', () => {
    for (const host of ['evil.test', 'example.de.evil.test', 'www.example.de', 'example.de:8443', '', '__proto__']) {
      expect(configForHost(config, host)).toBe(config)
    }
  })

  test('without baseDefault: the build default when the host serves it, else its first locale', () => {
    const open = { locales: [{ code: 'en' }, { code: 'fr', baseUrl: 'https://example.fr' }], defaultLocale: 'en' } as ModuleOptionsExtend
    expect(configForHost(open, 'example.fr').defaultLocale).toBe('en')
    const closed = {
      locales: [
        { code: 'en', baseUrl: 'https://a.test' },
        { code: 'fr', baseUrl: 'https://b.test' },
      ],
      defaultLocale: 'en',
    } as ModuleOptionsExtend
    expect(configForHost(closed, 'b.test').defaultLocale).toBe('fr')
  })

  test('a disabled locale stays a 404 on every host, never a link target', () => {
    const off = { locales: [{ ...locales[0]!, disabled: true }, locales[1]!, locales[3]!], defaultLocale: 'en' } as ModuleOptionsExtend
    expect(codes(configForHost(off, 'example.de'))).toEqual(['en', 'de', 'fr'])
    // its own host still answers with what is left
    expect(configForHost(off, 'example.com').defaultLocale).toBe('fr')
  })

  test('a host with nothing left to serve serves nothing, not other domains; a broken baseUrl is no host', () => {
    const none = {
      locales: [{ code: 'de', baseUrl: 'https://example.de', disabled: true }, { code: 'en', baseUrl: 'https://example.com' }],
      defaultLocale: 'de',
    } as ModuleOptionsExtend
    const hosted = configForHost(none, 'example.de')
    expect(hosted.domain).toBe('example.de')
    expect(codes(hosted)).toEqual(['de'])
    expect(hosted.locales!.every((l) => l.disabled)).toBe(true)
    const broken = { locales: [{ code: 'de', baseUrl: 'example.de' }], defaultLocale: 'de' } as ModuleOptionsExtend
    expect(configForHost(broken, 'example.de')).toBe(broken)
  })

  test('the input config is not mutated', () => {
    const before = structuredClone(config)
    configForHost(config, 'example.de')
    expect(config).toEqual(before)
  })
})

describe('withHostDefaults', () => {
  const flagged = (list: Locale[], fallback = 'en') => withHostDefaults(list, fallback).flatMap((l) => (l.baseDefault ? [l.code] : []))

  test('the default of every host is flagged, named or not', () => {
    expect(flagged(locales)).toEqual(['en', 'de'])
    expect(
      flagged([
        { code: 'en', baseUrl: 'https://a.test' },
        { code: 'de', baseUrl: 'https://b.test' },
        { code: 'nl', baseUrl: 'https://b.test' },
      ]),
    ).toEqual(['en', 'de'])
    // the build default is served there: the host needs no default of its own
    expect(flagged([{ code: 'en' }, { code: 'fr', baseUrl: 'https://example.fr' }])).toEqual([])
  })
})

describe('a host default disabled at runtime', () => {
  const off = (strategy: string) =>
    ({
      strategy,
      defaultLocale: 'en',
      locales: [
        { code: 'en' },
        { code: 'de', baseUrl: 'https://b.test', baseDefault: true, disabled: true },
        { code: 'nl', baseUrl: 'https://b.test' },
      ],
    }) as ModuleOptionsExtend

  test('stays on under the strategies that serve it unprefixed, goes off under prefix', () => {
    expect(configForHost(off('prefix_except_default'), 'b.test').defaultLocale).toBe('de')
    expect(configForHost(off('prefix_and_default'), 'b.test').defaultLocale).toBe('de')
    expect(configForHost(off('prefix'), 'b.test').defaultLocale).toBe('en')
  })
})
