// `react-router-dom` is an optional peer: an app without it must still load the main entry.
import { expect, it, vi } from 'vitest'

vi.mock('react-router-dom', () => {
  throw new Error('react-router-dom is not installed')
})

it('the main entry loads without react-router-dom; the adapter lives in ./router', async () => {
  const main = await import('../src')
  expect(main.createI18n).toBeTypeOf('function')
  expect('createReactRouterAdapter' in main).toBe(false)
})
