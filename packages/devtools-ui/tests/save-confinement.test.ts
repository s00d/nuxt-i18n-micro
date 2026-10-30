// The dev-server endpoints read and write only existing translation files inside translationDir.
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { ViteDevServer } from 'vite'
import { expect, test, vi } from 'vitest'
import { resolveTranslationFile } from '../src/safe-path'
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
  const server = {
    config: { root },
    watcher: {
      add: () => {},
      on() {
        return this
      },
    },
    ws: { send: () => {} },
    middlewares: { use: (route: string, handler: Handler) => routes.set(route, handler) },
  }
  const plugin = i18nDevToolsPlugin({ translationDir: 'locales' }) as { configureServer: (server: ViteDevServer) => void }
  plugin.configureServer(server as unknown as ViteDevServer)
  return { root, routes }
}

async function call(handler: Handler, method: string, url: string, body?: unknown) {
  const req = {
    method,
    url,
    headers: { host: 'localhost', 'content-type': 'application/json' },
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

  const refused = [
    '../package.json',
    '../../package.json',
    'locales/../package.json',
    '/etc/x.json',
    join(root, 'package.json'),
    '..%2Fpackage.json',
    'escape/secret.json',
    'new.json',
    'en.txt',
  ]
  expect(await Promise.all(refused.map(save))).toEqual(refused.map(() => 403))
  expect(readFileSync(join(root, 'package.json'), 'utf-8')).toBe('{"name":"app"}')
  expect(readFileSync(join(root, 'outside/secret.json'), 'utf-8')).toBe('{"secret":1}')

  expect([await save('en.json'), await save('locales/en.json')]).toEqual([200, 200])
  expect(JSON.parse(readFileSync(join(root, 'locales/en.json'), 'utf-8'))).toEqual({ hacked: true })
})

test('the real target must be a regular .json file inside the project', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  const { root, routes } = project()
  writeFileSync(join(root, 'locales/app.ts'), 'export {}')
  symlinkSync(join(root, 'locales/app.ts'), join(root, 'locales/alias.json'))
  mkdirSync(join(root, 'locales/dir.json'))
  const save = (file: string) => call(routes.get('/__i18n_api/save')!, 'POST', '/', { file, content: { hacked: true } })

  expect(await Promise.all(['alias.json', 'dir.json'].map(save))).toEqual([403, 403])
  expect(readFileSync(join(root, 'locales/app.ts'), 'utf-8')).toBe('export {}')
})

test('a translationDir out of the project reaches nothing, by `../` or by a symlink', () => {
  const sandbox = realpathSync(mkdtempSync(join(tmpdir(), 'i18n-devtools-outside-')))
  mkdirSync(join(sandbox, 'app/locales'), { recursive: true })
  mkdirSync(join(sandbox, 'outside'))
  writeFileSync(join(sandbox, 'outside/en.json'), '{"secret":1}')
  writeFileSync(join(sandbox, 'app/locales/en.json'), '{}')
  symlinkSync(join(sandbox, 'outside'), join(sandbox, 'app/linked'))
  const app = join(sandbox, 'app')

  expect(resolveTranslationFile(app, '../outside', 'en.json')).toBeNull()
  expect(resolveTranslationFile(app, 'linked', 'en.json')).toBeNull()
  expect(resolveTranslationFile(app, 'locales', 'en.json')).toBe(join(app, 'locales/en.json'))
  expect(resolveTranslationFile(app, '.', 'locales/en.json')).toBe(join(app, 'locales/en.json'))
})

test('a rebinding host is refused by the plugin itself: Vite 6 runs its own check after plugin middlewares', async () => {
  const { routes } = project()
  const asHost = (host: string, origin?: string) => {
    let status = 0
    const res = { setHeader: () => {}, end: () => {} } as Record<string, unknown>
    Object.defineProperty(res, 'statusCode', { set: (code: number) => (status = code), get: () => status })
    return Promise.resolve(routes.get('/__i18n_api/translations')!({ method: 'GET', headers: { host, origin } }, res, () => {})).then(() => status)
  }
  expect(await asHost('evil.example:4321', 'http://evil.example:4321')).toBe(403)
  expect(await asHost('evil.example:4321')).toBe(403)
  for (const host of ['localhost:4321', 'app.localhost:4321', '127.0.0.1:4321', '[::1]:4321', '192.168.1.5:4321'])
    expect(await asHost(host)).toBe(200)
})

test('config.server.allowedHosts widens what is served', async () => {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'i18n-devtools-hosts-')))
  const statusOf = async (allowedHosts: unknown, host: string) => {
    const routes = new Map<string, Handler>()
    const server = {
      config: { root, server: { allowedHosts } },
      watcher: {
        add: () => {},
        on() {
          return this
        },
      },
      ws: { send: () => {} },
      middlewares: { use: (route: string, handler: Handler) => routes.set(route, handler) },
    }
    ;(i18nDevToolsPlugin({ translationDir: 'locales' }) as { configureServer: (server: ViteDevServer) => void }).configureServer(
      server as unknown as ViteDevServer,
    )
    let status = 0
    const res = { setHeader: () => {}, end: () => {} } as Record<string, unknown>
    Object.defineProperty(res, 'statusCode', { set: (code: number) => (status = code), get: () => status })
    await routes.get('/__i18n_api/translations')!({ method: 'GET', headers: { host } }, res, () => {})
    return status
  }
  expect(await statusOf(['dev.example'], 'dev.example:80')).toBe(200)
  expect(await statusOf(['.example'], 'a.example')).toBe(200)
  expect(await statusOf(['.example'], 'example')).toBe(200)
  expect(await statusOf(['dev.example'], 'other.example')).toBe(403)
  expect(await statusOf(true, 'anything.example')).toBe(200)
})

test('config reports the locales found in translationDir and the configured default', async () => {
  const { root, routes } = project()
  writeFileSync(join(root, 'locales/de.json'), '{}')
  const server = {
    config: { root },
    watcher: {
      add: () => {},
      on() {
        return this
      },
    },
    ws: { send: () => {} },
    middlewares: { use: (route: string, handler: Handler) => routes.set(route, handler) },
  }
  const plugin = i18nDevToolsPlugin({ translationDir: 'locales', defaultLocale: 'en' }) as { configureServer: (server: ViteDevServer) => void }
  plugin.configureServer(server as unknown as ViteDevServer)

  const config = await new Promise((done) => {
    void routes.get('/__i18n_api/config')!(
      { method: 'GET', headers: { host: 'localhost' } },
      { setHeader: () => {}, end: (body: string) => done(JSON.parse(body)) },
      () => {},
    )
  })

  expect(config).toEqual({ defaultLocale: 'en', fallbackLocale: 'en', locales: [{ code: 'de' }, { code: 'en' }], translationDir: 'locales' })
})

test('translations stay inside translationDir: a symlink out of it is not served', async () => {
  const { root, routes } = project()
  writeFileSync(join(root, 'locales/en.json'), '{"hi":"x"}')
  const body = await new Promise((done) => {
    void routes.get('/__i18n_api/translations')!(
      { method: 'GET', headers: { host: 'localhost' } },
      { setHeader: () => {}, end: (text: string) => done(JSON.parse(text)) },
      () => {},
    )
  })
  expect(body).toEqual({ 'en.json': { hi: 'x' } })
})
