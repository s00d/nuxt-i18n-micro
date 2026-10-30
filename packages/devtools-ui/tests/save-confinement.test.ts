// The dev-server endpoints read and write only existing translation files inside translationDir.
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { ViteDevServer } from 'vite'
import { expect, test, vi } from 'vitest'
import { i18nDevToolsPlugin } from '../vite/plugin'

type Handler = (req: unknown, res: unknown, next: () => void) => Promise<void>

function project() {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'i18n-devtools-save-')))
  mkdirSync(join(root, 'locales/pages'), { recursive: true })
  mkdirSync(join(root, 'outside'))
  writeFileSync(join(root, 'package.json'), '{"name":"app"}')
  writeFileSync(join(root, 'outside/secret.json'), '{"secret":1}')
  writeFileSync(join(root, 'locales/en.json'), '{}')
  symlinkSync(join(root, 'outside'), join(root, 'locales/escape'))
  const routes = new Map<string, Handler>()
  const server = { config: { root }, middlewares: { use: (route: string, handler: Handler) => routes.set(route, handler) } }
  const plugin = i18nDevToolsPlugin({ translationDir: 'locales' }) as { configureServer: (server: ViteDevServer) => void }
  plugin.configureServer(server as unknown as ViteDevServer)
  return { root, routes }
}

async function call(handler: Handler, method: string, url: string, body?: unknown) {
  const req = {
    method,
    url,
    headers: { host: 'localhost' },
    async *[Symbol.asyncIterator]() {
      if (body !== undefined) yield Buffer.from(JSON.stringify(body))
    },
  }
  let status = 0
  const res = { setHeader: () => {}, end: () => {} } as Record<string, unknown>
  Object.defineProperty(res, 'statusCode', { set: (code: number) => (status = code), get: () => status })
  await handler(req, res, () => {})
  return status
}

test('save writes an existing translation file and refuses anything outside translationDir', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  const { root, routes } = project()
  const save = (file: string) => call(routes.get('/__i18n_api/save')!, 'POST', '/', { file, content: { hacked: true } })

  const refused = ['../package.json', '../../package.json', 'locales/../package.json', '/etc/x.json', join(root, 'package.json'), '..%2Fpackage.json', 'escape/secret.json', 'new.json', 'en.txt']
  expect(await Promise.all(refused.map(save))).toEqual(refused.map(() => 403))
  expect(readFileSync(join(root, 'package.json'), 'utf-8')).toBe('{"name":"app"}')
  expect(readFileSync(join(root, 'outside/secret.json'), 'utf-8')).toBe('{"secret":1}')

  expect([await save('en.json'), await save('locales/en.json')]).toEqual([200, 200])
  expect(JSON.parse(readFileSync(join(root, 'locales/en.json'), 'utf-8'))).toEqual({ hacked: true })
})

test('file reads stay inside translationDir, encoded traversal included', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  const { routes } = project()
  const read = (path: string) => call(routes.get('/__i18n_api/file')!, 'GET', `/?path=${path}`)

  expect(await Promise.all(['..%2Fpackage.json', '%2Fetc%2Fx.json', 'escape%2Fsecret.json'].map(read))).toEqual([404, 404, 404])
  expect(await read('en.json')).toBe(200)
})
