import { afterEach, beforeEach, expect, test, vi } from 'vitest'

const fs = vi.hoisted(() => ({ readFile: vi.fn(), access: vi.fn() }))
vi.mock('node:fs/promises', () => fs)
vi.mock('#i18n-internal/config', () => ({ getI18nPrivateConfig: () => ({ payloadPublicRel: '_locales', payloadFsDir: '/build' }) }))

const enoent = () => Object.assign(new Error('ENOENT'), { code: 'ENOENT' })

async function reader() {
  vi.resetModules()
  return (await import('../../src/runtime/server/payload-source.fs')).readPayload
}

beforeEach(() => {
  fs.readFile.mockReset().mockRejectedValue(enoent())
  fs.access.mockReset().mockResolvedValue(undefined)
})

afterEach(() => {
  vi.restoreAllMocks()
})

test('a page with no folder is an ordinary miss: nothing is logged', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  const read = await reader()
  expect(await read('no-such-page/en/data.json')).toEqual({})
  expect(await read('other/en/data.json')).toEqual({})
  expect(error).not.toHaveBeenCalled()
  expect(fs.access).toHaveBeenCalledTimes(1)
})

test('a payload tree that did not reach the server is logged once, not per request', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  fs.access.mockRejectedValue(enoent())
  const read = await reader()
  expect(await read('index/en/data.json')).toEqual({})
  expect(await read('about/de/data.json')).toEqual({})
  expect(error).toHaveBeenCalledTimes(1)
  expect(error.mock.calls[0]![0]).toContain('_locales')
})
