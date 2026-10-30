import { expect, test, vi } from 'vitest'

vi.mock('nuxt/config', () => ({ defineNuxtConfig: (config: unknown) => config }))

// a variable path: the fixtures are not part of the typechecked project
const load = (file: string) => import(/* @vite-ignore */ `../../scripts/perf-fixtures/${file}`)
const locales = async (fixture: string): Promise<unknown> => (await load(`${fixture}/nuxt.config.ts`)).default.i18n.locales
const profile = async (): Promise<{ code: string; iso: string; language: string }[]> => (await load('perf-shared/config.mjs')).PERF_LOCALES

test('i18n-micro takes its locales from the shared profile, with iso as the BCP-47 tag <html lang> and hreflang print', async () => {
  const shared = await profile()
  expect(shared.length).toBeGreaterThan(0)
  expect(await locales('i18n-micro')).toEqual(shared.map(({ code, iso }) => ({ code, iso })))
})

test('@nuxtjs/i18n takes the same locales, with one file each', async () => {
  const shared = await profile()
  expect(await locales('i18n')).toEqual(shared.map(({ code, language }) => ({ code, language, file: `${code}.json` })))
})
