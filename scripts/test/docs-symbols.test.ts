import { describe, expect, it } from 'vitest'
import { readInterface, readModules } from '../src/utils/typedoc-model'

/**
 * The methods and composables pages are empty without these, and a helper added to the
 * interface without a comment produces a blank row rather than a failure — so the check
 * is that the source carries the prose, not that the reader works.
 */
describe('runtime reference sources', () => {
  it('documents every injected helper', async () => {
    const methods = await readInterface('src/runtime/plugins/01.plugin.ts', 'PluginsInjections')

    expect(methods.length).toBeGreaterThan(20)
    expect(methods.filter((method) => !method.description).map((method) => method.name)).toEqual([])
    expect(methods.every((method) => method.signature && method.signature !== 'unknown')).toBe(true)
  }, 120_000)

  it('renders a helper with the type written in the source, unions included', async () => {
    // TypeDoc normalises `string | null` to `string` here, so the written text wins.
    const methods = await readInterface('src/runtime/plugins/01.plugin.ts', 'PluginsInjections')
    expect(methods.find((method) => method.name === '$getLocaleName')?.signature).toBe('() => string | null')
  }, 120_000)

  it('names a destructured parameter something a reader recognises', async () => {
    const modules = await readModules('src/runtime/composables')
    const useLocaleHead = modules.flatMap((module) => module.symbols).find((symbol) => symbol.name === 'useLocaleHead')

    // TypeScript calls it `__namedParameters`, which explains nothing.
    expect(useLocaleHead?.signature).toContain('options')
    expect(useLocaleHead?.signature).not.toContain('__namedParameters')
  }, 120_000)

  it('documents every composable', async () => {
    const modules = await readModules('src/runtime/composables')
    const composables = modules.flatMap((module) => module.symbols).filter((symbol) => symbol.name.startsWith('use'))

    expect(composables.map((symbol) => symbol.name).sort()).toEqual(['useI18n', 'useI18nHead', 'useI18nLocale', 'useLocaleHead'])
    expect(composables.filter((symbol) => !symbol.description).map((symbol) => symbol.name)).toEqual([])
  }, 120_000)
})
