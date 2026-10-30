// The plugin in a real Vite dev server: what a browser on another site can do, and what the page hears.
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer, type ViteDevServer } from 'vite'
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest'
import { i18nDevToolsIntegration, i18nDevToolsPlugin } from '../vite/plugin'

const PORT = 5197
const url = `http://localhost:${PORT}/__i18n_api`
let root: string
let server: ViteDevServer
const disk = () => readFileSync(join(root, 'src/locales/en.json'), 'utf8')
const save = (headers: Record<string, string>) =>
  fetch(`${url}/save`, { method: 'POST', headers, body: JSON.stringify({ file: 'en.json', content: { hello: 'written' } }) })

beforeAll(async () => {
  root = realpathSync(mkdtempSync(join(tmpdir(), 'i18n-devtools-dev-')))
  mkdirSync(join(root, 'src/locales'), { recursive: true })
  writeFileSync(join(root, 'src/locales/en.json'), '{"hello":"Hello"}')
  server = await createServer({
    root,
    configFile: false,
    logLevel: 'silent',
    server: { port: PORT, strictPort: true, watch: { usePolling: true, interval: 20 } },
    plugins: [i18nDevToolsPlugin()],
  })
  await server.listen()
})

afterAll(async () => {
  await server.close()
  rmSync(root, { recursive: true, force: true })
})

describe('a request from another site', () => {
  test.each([
    ['text/plain, cross-site', { 'content-type': 'text/plain', origin: 'https://evil.example', 'sec-fetch-site': 'cross-site' }],
    ['json, cross-site', { 'content-type': 'application/json', origin: 'https://evil.example', 'sec-fetch-site': 'cross-site' }],
    ['no fetch metadata, foreign Origin', { 'content-type': 'application/json', origin: 'https://evil.example' }],
    ['same-site subdomain', { 'content-type': 'application/json', origin: 'http://app.localhost:5197', 'sec-fetch-site': 'same-site' }],
  ])('cannot write: %s', async (_name, headers) => {
    expect((await save(headers)).status).toBe(403)
    expect(disk()).toBe('{"hello":"Hello"}')
  })

  test('a DNS rebinding host cannot write or read, even as its own origin', async () => {
    const { request } = await import('node:http')
    const status = await new Promise((done) => {
      const req = request(
        { port: PORT, path: '/__i18n_api/translations', headers: { host: 'evil.example:5197', origin: 'http://evil.example:5197' } },
        (res) => {
          res.resume()
          done(res.statusCode)
        },
      )
      req.end()
    })
    expect(status).toBe(403)
  })

  test('cannot read', async () => {
    const response = await fetch(`${url}/translations`, { headers: { origin: 'https://evil.example', 'sec-fetch-site': 'cross-site' } })
    expect(response.status).toBe(403)
  })

  test('cannot read by a tag either, which sends no Origin', async () => {
    expect((await fetch(`${url}/translations`, { headers: { 'sec-fetch-site': 'cross-site' } })).status).toBe(403)
  })
})

describe('the devtools page', () => {
  test('a form post without the JSON type is refused', async () => {
    const response = await save({ 'content-type': 'text/plain', origin: `http://localhost:${PORT}`, 'sec-fetch-site': 'same-origin' })
    expect(response.status).toBe(415)
  })

  test('reads every dictionary in one request', async () => {
    expect(await (await fetch(`${url}/translations`)).json()).toEqual({ 'en.json': { hello: 'Hello' } })
  })

  test('saves, and hears about changes from the server instead of polling', async () => {
    const send = vi.spyOn(server.ws, 'send')
    const response = await save({ 'content-type': 'application/json', origin: `http://localhost:${PORT}`, 'sec-fetch-site': 'same-origin' })
    expect(response.status).toBe(200)
    expect(JSON.parse(disk())).toEqual({ hello: 'written' })
    await vi.waitFor(() => expect(send).toHaveBeenCalledWith({ type: 'custom', event: 'i18n-micro:locales-updated' }), { timeout: 4000 })
  })

  test('the page loads its app through Vite, which gives it import.meta.hot', async () => {
    const html = await (await fetch(`http://localhost:${PORT}/__i18n_devtools.html`)).text()
    expect(html).toContain('src="/@vite-plugin-i18n-devtools/app.js"')
    const app = await (await fetch(`http://localhost:${PORT}/@vite-plugin-i18n-devtools/app.js`)).text()
    expect(app).toContain('import.meta.hot')
    expect(app).not.toContain('setInterval')
  })
})

test('the Astro integration adds a toolbar app in dev, and nothing to a build', () => {
  const setup = i18nDevToolsIntegration({ translationDir: 'locales' }).hooks['astro:config:setup']
  const updateConfig = vi.fn()
  const addDevToolbarApp = vi.fn()
  setup({ command: 'build', updateConfig, addDevToolbarApp })
  expect(addDevToolbarApp).not.toHaveBeenCalled()
  setup({ command: 'dev', updateConfig, addDevToolbarApp })
  expect(addDevToolbarApp.mock.calls[0]![0]).toMatchObject({ id: 'i18n-micro', entrypoint: '/@vite-plugin-i18n-devtools/toolbar.js' })
  expect(updateConfig.mock.calls[0]![0].vite.plugins[0].name).toBe('i18n-micro-devtools-plugin')
})
