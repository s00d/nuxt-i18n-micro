// `@solidjs/router` is an optional peer: an app without it must still load the main entry.
import { expect, it, vi } from 'vitest'

vi.mock('@solidjs/router', () => {
  throw new Error('@solidjs/router is not installed')
})

it('the main entry loads without @solidjs/router; the adapter lives in ./router', async () => {
  const main = await import('../src')
  expect(main.createI18n).toBeTypeOf('function')
  expect('createSolidRouterAdapter' in main).toBe(false)
})
