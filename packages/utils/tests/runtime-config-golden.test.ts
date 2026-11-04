/**
 * Characterization of the runtime overrides: every call is one `call → result` line in
 * `__golden__/runtime-config.md`, so a behaviour change shows up as a one-line diff.
 */
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { expect, test } from 'vitest'
import { applyI18nRuntimeOverrides, i18nOverridesKey, mergeI18nOverrides, readI18nEnvOverrides, readI18nRuntimeOverrides } from '../src/runtime-config'
import { configForHost } from '../src/domains'

const show = (value: unknown) => (value === undefined ? 'undefined' : JSON.stringify(value))

const base = (extra: Partial<ModuleOptionsExtend> = {}): ModuleOptionsExtend => ({
  locales: [{ code: 'en' }, { code: 'de' }, { code: 'ru' }],
  defaultLocale: 'en',
  strategy: 'prefix',
  dateBuild: 'b1',
  hashMode: false,
  apiBaseUrl: '_locales',
  disablePageLocales: false,
  ...extra,
})

const bases: Record<string, () => ModuleOptionsExtend> = {
  plain: () => base(),
  'plain+metaBaseUrl': () => base({ metaBaseUrl: 'https://site.example' }),
  // what the build writes for a domains app: metaBaseUrl from the default locale's baseUrl
  domains: () =>
    base({
      locales: [{ code: 'en', baseUrl: 'https://example.com' }, { code: 'de', baseUrl: 'https://example.de' }, { code: 'ru' }],
      metaBaseUrl: 'https://example.com',
    }),
  'domains+explicit': () =>
    base({
      locales: [{ code: 'en', baseUrl: 'https://example.com' }, { code: 'de', baseUrl: 'https://example.de' }, { code: 'ru' }],
      metaBaseUrl: 'https://site.example',
    }),
}

/** The fields an override can touch, and whether the build config itself came back. */
function summary(config: ModuleOptionsExtend, from: ModuleOptionsExtend) {
  return {
    same: config === from,
    defaultLocale: config.defaultLocale,
    fallbackLocale: config.fallbackLocale,
    metaBaseUrl: config.metaBaseUrl,
    dateBuild: config.dateBuild,
    locales: (config.locales ?? []).map((locale) => `${locale.code}${locale.baseUrl ? `@${locale.baseUrl}` : ''}${locale.disabled ? ':off' : ''}`),
  }
}

function report(): string {
  const lines: string[] = []
  const section = (title: string) => lines.push('', `## ${title}`, '')
  const run = (label: string, fn: () => unknown) => {
    let out: string
    try {
      out = show(fn())
    } catch (error) {
      out = `throws ${(error as Error).name}: ${(error as Error).message}`
    }
    lines.push(`- \`${label}\` → ${out}`)
  }

  const runtimeInputs: Record<string, unknown>[] = [
    {},
    { i18nRuntime: null },
    { i18nRuntime: { defaultLocale: ' de ' } },
    { i18nRuntime: { disabledLocales: 'de, ru' } },
    { i18nRuntime: { metaBaseUrl: 'https://cdn.example' } },
    { i18nRuntime: { localeBaseUrls: 'de=https://de.example.net' } },
    { i18nRuntime: { localeBaseUrls: { de: 'https://de.example.net' } } },
  ]
  section('readI18nRuntimeOverrides')
  for (const input of runtimeInputs) run(`read(${show(input)})`, () => readI18nRuntimeOverrides(input))

  section('readI18nEnvOverrides')
  const envs: Record<string, string>[] = [
    {},
    { NUXT_I18N_META_BASE_URL: 'https://cdn.example' },
    { NUXT_PUBLIC_I18N_RUNTIME_META_BASE_URL: 'https://cdn.example' },
    { NUXT_I18N_LOCALE_BASE_URLS: 'de=https://de.example.net,en=https://example.net' },
    { NUXT_I18N_LOCALE_BASE_URLS: ' de = https://de.example.net , , x' },
    { NUXT_PUBLIC_I18N_RUNTIME_LOCALE_BASE_URLS: 'de=https://de.example.net' },
  ]
  for (const env of envs) {
    run(`env(${show(env)})`, () => {
      const saved = { ...process.env }
      Object.assign(process.env, env)
      try {
        return readI18nEnvOverrides()
      } finally {
        for (const key of Object.keys(env)) if (!(key in saved)) delete process.env[key]
      }
    })
  }

  section('mergeI18nOverrides / i18nOverridesKey')
  const pairs: [Record<string, unknown>, Record<string, unknown>][] = [
    [{}, {}],
    [{ defaultLocale: 'de' }, { defaultLocale: 'ru', dateBuild: 'x' }],
    [{ metaBaseUrl: 'https://a.example' }, { metaBaseUrl: 'https://b.example' }],
    [{ localeBaseUrls: { de: 'https://a.example' } }, { localeBaseUrls: { en: 'https://b.example' } }],
  ]
  for (const [primary, secondary] of pairs) {
    run(`merge(${show(primary)}, ${show(secondary)})`, () => mergeI18nOverrides(primary as never, secondary as never))
    run(`key(merge(${show(primary)}, ${show(secondary)}))`, () => i18nOverridesKey(mergeI18nOverrides(primary as never, secondary as never)))
  }

  section('applyI18nRuntimeOverrides')
  const overrides: Record<string, unknown>[] = [
    {},
    { defaultLocale: 'de' },
    { disabledLocales: ['ru'] },
    { strategy: 'no_prefix' },
    { dateBuild: 'b2' },
    { metaBaseUrl: 'https://cdn.example' },
    { localeBaseUrls: { de: 'https://de.example.net' } },
    { localeBaseUrls: { en: 'https://example.net' } },
    { localeBaseUrls: { en: 'https://example.net' }, metaBaseUrl: 'https://cdn.example' },
    { localeBaseUrls: { ru: 'https://example.ru' } },
    { localeBaseUrls: { xx: 'https://example.xx' } },
    { localeBaseUrls: { de: 'not a url' } },
    { localeBaseUrls: JSON.parse('{"__proto__":"https://evil.example"}') },
  ]
  for (const [name, make] of Object.entries(bases)) {
    for (const requested of overrides) {
      run(`apply(${name}, ${show(requested)})`, () => {
        const warnings: string[] = []
        const from = make()
        const config = applyI18nRuntimeOverrides(from, requested as never, (message) => warnings.push(message))
        return { ...summary(config, from), warnings }
      })
    }
  }

  section('configForHost after overrides')
  const domainOverrides: Record<string, unknown>[] = [{}, { localeBaseUrls: { de: 'https://de.example.net' } }, { localeBaseUrls: { en: 'https://example.net' } }]
  for (const requested of domainOverrides) {
    for (const host of ['example.com', 'example.de', 'de.example.net', 'example.net', 'evil.test']) {
      run(`host(${show(requested)}, ${host})`, () => {
        const config = configForHost(applyI18nRuntimeOverrides(bases.domains!(), requested as never, () => {}), host)
        return { domain: config.domain, defaultLocale: config.defaultLocale, metaBaseUrl: config.metaBaseUrl }
      })
    }
  }

  return `${lines.join('\n').trim()}\n`
}

test('runtime overrides characterization', async () => {
  await expect(report()).toMatchFileSnapshot('./__golden__/runtime-config.md')
})
