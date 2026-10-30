import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

// the real `extendServerRpc` of @nuxt/devtools hands back `{ broadcast }` and nothing else
const kit = vi.hoisted(() => ({
  ready: undefined as undefined | (() => void),
  localesUpdated: undefined as unknown as ReturnType<typeof vi.fn>,
  hooks: new Map<string, (event: string, file: string) => void>(),
  rootDir: '',
}))
vi.mock('@nuxt/devtools-kit', () => ({
  addCustomTab: () => {},
  startSubprocess: () => {},
  onDevToolsInitialized: (fn: () => void) => (kit.ready = fn),
  extendServerRpc: () => ({ broadcast: { localesUpdated: { asEvent: kit.localesUpdated } } }),
}))
vi.mock('@nuxt/kit', () => ({
  addDevServerHandler: () => {},
  useNuxt: () => ({
    options: { rootDir: kit.rootDir, app: {} },
    hook: (name: string, fn: (event: string, file: string) => void) => kit.hooks.set(name, fn),
  }),
}))

beforeEach(() => {
  kit.rootDir = mkdtempSync(join(tmpdir(), 'i18n-devtools-rpc-'))
  mkdirSync(join(kit.rootDir, 'locales'))
  writeFileSync(join(kit.rootDir, 'locales/en.json'), '{"hello":"Hello"}')
  kit.localesUpdated = vi.fn()
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
  rmSync(kit.rootDir, { recursive: true, force: true })
})

test('a locale file edit reaches the tab, read through the functions it registered', async () => {
  const { setupDevToolsUI } = await import('../../src/devtools')
  setupDevToolsUI({ translationDir: 'locales' } as never, [kit.rootDir])
  kit.ready!()
  kit.hooks.get('builder:watch')!('change', join(kit.rootDir, 'pages/a.vue'))
  kit.hooks.get('builder:watch')!('change', join(kit.rootDir, 'locales/en.json'))
  await vi.advanceTimersByTimeAsync(200)
  expect(kit.localesUpdated).toHaveBeenCalledTimes(1)
  expect(kit.localesUpdated).toHaveBeenCalledWith({ 'en.json': { hello: 'Hello' } })
})

test('a tab that is gone does not take the dev server down', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  kit.localesUpdated.mockRejectedValue(new Error('no client'))
  const { setupDevToolsUI } = await import('../../src/devtools')
  setupDevToolsUI({ translationDir: 'locales' } as never, [kit.rootDir])
  kit.ready!()
  kit.hooks.get('builder:watch')!('change', join(kit.rootDir, 'locales/en.json'))
  await vi.advanceTimersByTimeAsync(200)
  expect(error).toHaveBeenCalled()
  error.mockRestore()
})
