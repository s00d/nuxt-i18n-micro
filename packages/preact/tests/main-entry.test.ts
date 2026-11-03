// The history adapter is a separate entry, as in the React and Solid packages.
import { expect, it } from 'vitest'

it('the main entry has the API and no adapter; the adapter lives in ./router', async () => {
  const main = await import('../src')
  expect(main.createI18n).toBeTypeOf('function')
  expect(new main.PreactI18n({ locale: 'en' })).toBeInstanceOf(main.PreactI18n)
  expect('createBrowserHistoryAdapter' in main).toBe(false)
  expect(Object.keys(await import('../src/router'))).toEqual(['createBrowserHistoryAdapter'])
})
