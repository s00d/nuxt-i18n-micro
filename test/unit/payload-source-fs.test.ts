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

test.each(['ENOTDIR', 'ENAMETOOLONG'])('%s is a name a request made up: a miss', async (code) => {
  fs.readFile.mockRejectedValue(Object.assign(new Error(code), { code }))
  expect(await (await reader())('x/en/data.json')).toEqual({})
})

test.each([
  ['EACCES', Object.assign(new Error('EACCES'), { code: 'EACCES' })],
  ['EMFILE', Object.assign(new Error('EMFILE'), { code: 'EMFILE' })],
])('%s is a failed read, not an empty dictionary', async (_code, error) => {
  fs.readFile.mockRejectedValue(error)
  await expect((await reader())('de.json')).rejects.toBe(error)
})

test('a corrupt file is a failed read', async () => {
  fs.readFile.mockResolvedValue('{"title":')
  await expect((await reader())('de.json')).rejects.toThrow(SyntaxError)
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
