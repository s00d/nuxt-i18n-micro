import type { PluralFunc } from '@i18n-micro/types'
import { defaultPlural } from '@i18n-micro/core'
import { describe, expect, it } from 'vitest'
import { buildI18nPluralTemplate } from '../../src/plural-template'

describe('buildI18nPluralTemplate', () => {
  const helpersPath = '/abs/path/to/@i18n-micro/core/dist/helpers.mjs'

  it('re-exports defaultPlural from the resolved helpers path', () => {
    const out = buildI18nPluralTemplate(defaultPlural, helpersPath)
    expect(out).toBe(`export { defaultPlural as plural } from '${helpersPath}'\n`)
    expect(out).not.toContain('@i18n-micro/core/helpers')
  })

  it('treats undefined plural as the default re-export', () => {
    expect(buildI18nPluralTemplate(undefined, helpersPath)).toContain('export { defaultPlural as plural }')
  })

  it('stringifies a custom plural and imports interpolate from the resolved path', () => {
    // Body must mention interpolate so the virtual module receives the injected import.
    const custom = ((key: string, count: number, params: Record<string, unknown>, _locale: string, getter: (k: string) => unknown) => {
      const raw = getter(key)
      return typeof raw === 'string' ? (interpolate as (t: string, p: Record<string, unknown>) => string)(raw, { ...params, count }) : null
    }) as PluralFunc
    const out = buildI18nPluralTemplate(custom, helpersPath)
    expect(out.startsWith(`import { interpolate } from '${helpersPath}'\n`)).toBe(true)
    expect(out).toContain('export const plural =')
    expect(out).toContain('getter(key)')
    expect(out).toContain('interpolate')
  })
})

declare function interpolate(template: string, params: Record<string, unknown>): string
