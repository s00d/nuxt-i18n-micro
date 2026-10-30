import { describe, expect, test, vi } from 'vitest'
import { createNuxtBridge } from '../../client/bridge/nuxt-bridge'

function fakeClient() {
  let clientFunctions: { localesUpdated(data: unknown): void }
  const rpc = {
    getLocalesAndTranslations: vi.fn(async () => ({ 'en.json': {} })),
    getConfigs: vi.fn(async () => ({})),
    saveTranslationContent: vi.fn(),
  }
  const client = {
    devtools: {
      extendClientRpc: (_namespace: string, functions: typeof clientFunctions) => {
        clientFunctions = functions
        return rpc
      },
    },
  }
  return { client, rpc, push: (data: unknown) => clientFunctions.localesUpdated(data) }
}

describe('Nuxt devtools bridge', () => {
  test('what the server pushes reaches every subscriber until it leaves', () => {
    const { client, push } = fakeClient()
    const bridge = createNuxtBridge(client)
    const first = vi.fn()
    const second = vi.fn()
    const stop = bridge.onLocalesUpdate(first)
    bridge.onLocalesUpdate(second)
    push({ 'en.json': { a: 1 } })
    stop()
    push({ 'en.json': { a: 2 } })
    expect(first.mock.calls).toEqual([[{ 'en.json': { a: 1 } }]])
    expect(second).toHaveBeenCalledTimes(2)
  })

  test('reads and saves go over the RPC', async () => {
    const { client, rpc } = fakeClient()
    const bridge = createNuxtBridge(client)
    expect(await bridge.getLocalesAndTranslations()).toEqual({ 'en.json': {} })
    await bridge.saveTranslation('en.json', { a: 'b' } as never)
    expect(rpc.saveTranslationContent).toHaveBeenCalledWith('en.json', { a: 'b' })
  })
})
