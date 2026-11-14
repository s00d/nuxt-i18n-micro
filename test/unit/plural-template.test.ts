import type { PluralFunc } from '@i18n-micro/types'
import { defaultPlural } from '@i18n-micro/core'
import { describe, expect, it } from 'vitest'
import { buildI18nPluralTemplate } from '../../src/plural-template'

describe('buildI18nPluralTemplate', () => {
  const helpersPath = '/abs/path/to/@i18n-micro/core/dist/helpers.mjs'

  it('default plural is re-exported, a custom one is stringified with interpolate imported', () => {
    // step 1: the default → a re-export from the resolved helpers path (no bare specifier)
    expect(buildI18nPluralTemplate(defaultPlural, helpersPath)).toBe(`export { defaultPlural as plural } from '${helpersPath}'\n`)

    // step 2: a custom function → its source, with interpolate imported from the same path
    // Body must mention interpolate so the virtual module receives the injected import.
    const custom = ((key: string, count: number, params: Record<string, unknown>, _locale: string, getter: (k: string) => unknown) => {
      const raw = getter(key)
      return typeof raw === 'string' ? (interpolate as (t: string, p: Record<string, unknown>) => string)(raw, { ...params, count }) : null
    }) as PluralFunc
    const out = buildI18nPluralTemplate(custom, helpersPath)
    expect(out.split('\n')[0]).toBe(`import { interpolate } from '${helpersPath}'`)
    expect(out).toContain('export const plural =')
    expect(out).toContain('getter(key)')
    expect(out).toContain('interpolate')
  })

  it('a custom rule that does not call interpolate gets no import (#317)', () => {
    // the rule from the issue: Nitro's Rollup warned "interpolate is imported but never used" on every build
    const viaT = ((
      key: string,
      count: number,
      params: Record<string, unknown>,
      _locale: string,
      t: (k: string, p?: Record<string, unknown>) => unknown,
    ) => t(key, { ...params, count })?.toString() ?? key) as unknown as PluralFunc
    expect(buildI18nPluralTemplate(viaT, helpersPath)).toBe(`export const plural = ${viaT.toString()}\n`)
  })
})

declare function interpolate(template: string, params: Record<string, unknown>): string
