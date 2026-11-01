import { type ChildProcess, spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { connect } from 'node:net'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const server = resolve(import.meta.dirname, '../../benchmark/integrations/ssr-server.mjs')
const port = 8511

/** A raw request: `fetch` would normalize the `..` away. */
const get = (path: string): Promise<string> =>
  new Promise((done, fail) => {
    let text = ''
    const socket = connect(port, '127.0.0.1', () => socket.write(`GET ${path} HTTP/1.1\r\nHost: x\r\nConnection: close\r\n\r\n`))
    socket.on('data', (chunk) => (text += chunk))
    socket.on('end', () => done(text))
    socket.on('error', fail)
  })

describe('benchmark/integrations/ssr-server.mjs', () => {
  const cwd = mkdtempSync(join(tmpdir(), 'ssr-bench-'))
  let child: ChildProcess

  beforeAll(async () => {
    mkdirSync(join(cwd, 'src'))
    for (const dir of ['dist/client', 'dist/client-secret', 'dist/server']) mkdirSync(join(cwd, dir), { recursive: true })
    writeFileSync(join(cwd, 'dist/client/index.html'), '<html lang="en"><body><div id="app"></div></body></html>')
    writeFileSync(join(cwd, 'dist/client/asset.js'), 'asset text')
    writeFileSync(join(cwd, 'dist/client-secret/key.txt'), 'secret text')
    writeFileSync(
      join(cwd, 'dist/server/entry-server.js'),
      'export const render = (url) => ({ html: "page", state: { locale: "en", dir: "ltr", route: url } })',
    )
    child = spawn(process.execPath, [server], {
      cwd,
      env: { ...process.env, NODE_ENV: 'production', PORT: String(port) },
      stdio: ['ignore', 'pipe', 'inherit'],
    })
    await new Promise((done) => child.stdout!.once('data', done))
  })

  afterAll(async () => {
    // Windows keeps the working directory of a process until it is gone
    const exited = new Promise((done) => child.once('exit', done))
    child.kill()
    await exited
    rmSync(cwd, { recursive: true, force: true })
  })

  it('serves a file of dist/client', async () => {
    expect(await get('/asset.js')).toContain('asset text')
  })

  it('a sibling folder with the same prefix is out of reach', async () => {
    expect(await get('/../client-secret/key.txt')).not.toContain('secret text')
    expect(await get('/%2e%2e/client-secret/key.txt')).not.toContain('secret text')
  })

  it('a malformed escape falls through to the page, and the server lives', async () => {
    expect(await get('/%E0%A4%A')).toContain('page')
    expect(await get('/asset.js')).toContain('asset text')
  })

  it('a URL cannot close the bootstrap script', async () => {
    const body = await get('/x?a=</script><script>alert(1)</script>')
    expect(body).not.toContain('<script>alert(1)')
    expect(body).toContain('\\u003c/script>')
  })
})
