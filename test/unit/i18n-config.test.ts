import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { expect, test } from 'vitest'
import { shippedOverrides } from '../../src/runtime/utils/i18n-config'

const build = () => ({ defaultLocale: 'en', fallbackLocale: 'de', locales: [{ code: 'en' }, { code: 'de' }] }) as ModuleOptionsExtend

test('the payload carries overrides only when the server resolved something the build does not say', () => {
  // Nitro and the app bundle each hold their own copy of the build config: another object, the same values
  expect(shippedOverrides(build(), build())).toBeNull()

  const disabled = { ...build(), locales: [{ code: 'en' }, { code: 'de', disabled: true }] }
  expect(shippedOverrides(disabled, build())).toMatchObject({ disabledLocales: ['de'] })
  expect(shippedOverrides({ ...build(), defaultLocale: 'de' }, build())).toMatchObject({ defaultLocale: 'de' })
  expect(shippedOverrides({ ...build(), fallbackLocale: undefined }, build())).toMatchObject({ fallbackLocale: undefined })
  expect(shippedOverrides({ ...build(), domain: 'de.example.com' }, build())).toMatchObject({ domain: 'de.example.com' })
})

test('a host config ships its domain and the overrides, never its host origin', () => {
  const domains = () =>
    ({
      defaultLocale: 'en',
      dateBuild: 'b1',
      metaBaseUrl: 'https://example.com',
      locales: [
        { code: 'en', baseUrl: 'https://example.com' },
        { code: 'de', baseUrl: 'https://example.de' },
      ],
    }) as ModuleOptionsExtend
  const host = {
    ...domains(),
    domain: 'example.de',
    defaultLocale: 'de',
    metaBaseUrl: 'https://example.de',
    locales: [{ code: 'de', baseUrl: 'https://example.de' }],
  }
  expect(shippedOverrides(host, domains())).toEqual({
    defaultLocale: 'de',
    fallbackLocale: undefined,
    disabledLocales: [],
    domain: 'example.de',
    dateBuild: 'b1',
  })
  // since the runtime metaBaseUrl: an origin the build does not have is shipped
  expect(shippedOverrides({ ...build(), metaBaseUrl: 'https://cdn.example' }, build())).toMatchObject({ metaBaseUrl: 'https://cdn.example' })
})

test('runtime origins: shipped only where they differ, never a host origin', () => {
  const domains = () =>
    ({
      defaultLocale: 'en',
      dateBuild: 'b1',
      metaBaseUrl: 'https://example.com',
      locales: [
        { code: 'en', baseUrl: 'https://example.com' },
        { code: 'de', baseUrl: 'https://example.de' },
      ],
    }) as ModuleOptionsExtend
  const moved = [
    { code: 'en', baseUrl: 'https://example.com' },
    { code: 'de', baseUrl: 'https://example.at' },
  ]
  // an unknown host: the moved locale only
  expect(shippedOverrides({ ...domains(), locales: moved }, domains())).toMatchObject({ localeBaseUrls: { de: 'https://example.at' } })
  expect(shippedOverrides({ ...domains(), locales: moved }, domains())).not.toHaveProperty('metaBaseUrl')
  // a host config: its served locales are a subset, linkLocales has the move; its own origin is not shipped
  const host = {
    ...domains(),
    domain: 'example.at',
    defaultLocale: 'de',
    metaBaseUrl: 'https://example.at',
    locales: [moved[1]!],
    linkLocales: moved,
  }
  const shipped = shippedOverrides(host, domains())
  expect(shipped).toMatchObject({ domain: 'example.at', localeBaseUrls: { de: 'https://example.at' } })
  expect(shipped).not.toHaveProperty('metaBaseUrl')
})
