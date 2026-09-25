import { spawn, type ChildProcess, execFileSync } from 'node:child_process'
import { createServer, type RequestListener, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { repoRoot } from './workspace'

export type PresetName = 'vercel' | 'cloudflare_pages' | 'netlify'

export interface RunningServer {
  url: string
  close: () => Promise<void>
}

/** Wait until `url` answers with a non-connection-error status (or times out). */
export async function waitForUrl(url: string, timeoutMs = 90_000): Promise<void> {
  const deadline = Date.now() + timeoutMs
  let lastError = ''
  while (Date.now() < deadline) {
    try {
      // oxlint-disable-next-line no-await-in-loop -- poll until ready or timeout
      const res = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(5_000) })
      if (res.status < 500 || res.status === 404) return
      lastError = `HTTP ${res.status}`
    } catch (error) {
      lastError = String((error as Error)?.message ?? error)
    }
    // oxlint-disable-next-line no-await-in-loop -- backoff between polls
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`Timed out waiting for ${url}: ${lastError}`)
}

/** Isolated mini-workspace still needs the root catalog (`nuxt`/`vue` use `catalog:`). */
export function prepareSmokeAppWorkspace(appDir: string): void {
  const root = readFileSync(join(repoRoot, 'pnpm-workspace.yaml'), 'utf8')
  const i = root.indexOf('\ncatalog:')
  if (i < 0) throw new Error('catalog: missing in root pnpm-workspace.yaml')
  writeFileSync(join(appDir, 'pnpm-workspace.yaml'), `packages:\n  - .\n${root.slice(i + 1)}`)
}

export function installSmokeApp(appDir: string): void {
  prepareSmokeAppWorkspace(appDir)
  execFileSync('pnpm', ['install', '--no-frozen-lockfile'], { cwd: appDir, stdio: 'inherit' })
}

export function buildSmokeApp(appDir: string, preset: PresetName, env: Record<string, string> = {}): void {
  execFileSync('pnpm', ['exec', 'nuxt', 'build', '--preset', preset], {
    cwd: appDir,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  })
}

function killProcessTree(child: ChildProcess): Promise<void> {
  return new Promise((resolveClose) => {
    if (child.exitCode !== null || child.signalCode !== null) {
      resolveClose()
      return
    }
    child.once('exit', () => resolveClose())
    child.kill('SIGTERM')
    setTimeout(() => {
      if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL')
    }, 5_000)
  })
}

/**
 * Nitro v2 vercel preset: Node listener at `.vercel/output/functions/__fallback.func/index.mjs`.
 * Same entry Nitro's own `test/presets/vercel.test.ts` imports, then `listen(handle)`.
 */
export async function startVercelNitroStyle(appDir: string): Promise<RunningServer> {
  const handlerPath = resolve(appDir, '.vercel/output/functions/__fallback.func/index.mjs')
  if (!existsSync(handlerPath)) {
    throw new Error(`Vercel function entry missing: ${handlerPath}`)
  }

  const mod = await import(pathToFileURL(handlerPath).href)
  const handle = (mod.default ?? mod) as RequestListener
  if (typeof handle !== 'function') {
    throw new Error(`Vercel entry did not export a Node listener: ${handlerPath}`)
  }

  const server: Server = createServer(handle)
  await new Promise<void>((resolveListen, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => resolveListen())
  })
  const { port } = server.address() as AddressInfo
  const url = `http://127.0.0.1:${port}`

  return {
    url,
    close: () =>
      new Promise((resolveClose, reject) => {
        server.close((err) => (err ? reject(err) : resolveClose()))
      }),
  }
}

/** Nitro `commands.preview` for cloudflare_pages: `wrangler pages dev <output.dir>`. */
export async function startCloudflarePagesPreview(appDir: string): Promise<RunningServer> {
  const outDir = resolve(appDir, 'dist')
  if (!existsSync(outDir)) {
    throw new Error(`Cloudflare Pages output missing: ${outDir}`)
  }

  const port = 8788
  const child = spawn('pnpm', ['dlx', 'wrangler@4', 'pages', 'dev', outDir, '--port', String(port), '--ip', '127.0.0.1'], {
    cwd: appDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, CI: '1', WRANGLER_SEND_METRICS: 'false' },
  })

  let stderr = ''
  child.stderr?.on('data', (chunk: Buffer) => {
    stderr += chunk.toString()
  })
  child.stdout?.on('data', (chunk: Buffer) => {
    stderr += chunk.toString()
  })

  const url = `http://127.0.0.1:${port}`
  try {
    await waitForUrl(url)
  } catch (error) {
    await killProcessTree(child)
    throw new Error(`${String((error as Error)?.message ?? error)}\nwrangler output:\n${stderr.slice(-2_000)}`)
  }

  return {
    url,
    close: () => killProcessTree(child),
  }
}

/**
 * Nitro netlify preset exports a Fetch API handler (Request → Response), not a Node listener.
 * Wrap it the same way we exercise the vercel artifact: import the built entry, serve over HTTP.
 * (`netlify serve` is flaky for unlinked apps and `--dir` forces a static-only server.)
 */
export async function startNetlifyNitroStyle(appDir: string): Promise<RunningServer> {
  const handlerPath = resolve(appDir, '.netlify/functions-internal/server/main.mjs')
  if (!existsSync(handlerPath)) {
    throw new Error(`Netlify function entry missing: ${handlerPath}`)
  }

  const mod = await import(pathToFileURL(handlerPath).href)
  const fetchHandler = (mod.default ?? mod) as (request: Request) => Promise<Response> | Response
  if (typeof fetchHandler !== 'function') {
    throw new Error(`Netlify entry did not export a fetch handler: ${handlerPath}`)
  }

  const server: Server = createServer((req, res) => {
    void (async () => {
      try {
        const host = req.headers.host ?? '127.0.0.1'
        const url = new URL(req.url ?? '/', `http://${host}`)
        const headers = new Headers()
        for (const [key, value] of Object.entries(req.headers)) {
          if (value === undefined) continue
          if (Array.isArray(value)) {
            for (const item of value) headers.append(key, item)
          } else {
            headers.set(key, value)
          }
        }
        const method = req.method ?? 'GET'
        const body =
          method === 'GET' || method === 'HEAD'
            ? undefined
            : await new Promise<Buffer>((resolveBody, rejectBody) => {
                const chunks: Buffer[] = []
                req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)))
                req.on('end', () => resolveBody(Buffer.concat(chunks)))
                req.on('error', rejectBody)
              })
        const request = new Request(url, {
          method,
          headers,
          body: body && body.length > 0 ? new Uint8Array(body) : undefined,
        })
        const response = await fetchHandler(request)
        const outHeaders: Record<string, string | string[]> = {}
        response.headers.forEach((value, key) => {
          const existing = outHeaders[key]
          if (existing === undefined) outHeaders[key] = value
          else if (Array.isArray(existing)) existing.push(value)
          else outHeaders[key] = [existing, value]
        })
        res.writeHead(response.status, outHeaders)
        const buf = Buffer.from(await response.arrayBuffer())
        res.end(buf)
      } catch (error) {
        if (!res.headersSent) res.writeHead(500)
        res.end(String((error as Error)?.message ?? error))
      }
    })()
  })

  await new Promise<void>((resolveListen, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => resolveListen())
  })
  const { port } = server.address() as AddressInfo
  const url = `http://127.0.0.1:${port}`

  return {
    url,
    close: () =>
      new Promise((resolveClose, reject) => {
        server.close((err) => (err ? reject(err) : resolveClose()))
      }),
  }
}

export async function startPresetRuntime(appDir: string, preset: PresetName): Promise<RunningServer> {
  switch (preset) {
    case 'vercel':
      return startVercelNitroStyle(appDir)
    case 'cloudflare_pages':
      return startCloudflarePagesPreview(appDir)
    case 'netlify':
      return startNetlifyNitroStyle(appDir)
    default: {
      const _exhaustive: never = preset
      throw new Error(`Unsupported preset: ${_exhaustive}`)
    }
  }
}

/**
 * Run smoke-verify (and optional smoke-browser) as a child process.
 * Must NOT use execFileSync: the preset HTTP server lives in this same Node process,
 * and a sync wait would block the event loop → deadlock (verify waits on HTTP, server
 * cannot answer).
 */
export async function runSmokeVerify(url: string, opts: { browser?: boolean } = {}): Promise<void> {
  const run = (args: string[]) =>
    new Promise<void>((resolve, reject) => {
      const child = spawn('pnpm', args, { cwd: repoRoot, stdio: 'inherit' })
      child.once('error', reject)
      child.once('exit', (code, signal) => {
        if (code === 0) resolve()
        else reject(new Error(`pnpm ${args.join(' ')} failed (code=${code}, signal=${signal})`))
      })
    })

  await run(['-C', 'scripts', 'cli', 'smoke-verify', '--url', url])
  if (opts.browser) {
    await run(['-C', 'scripts', 'cli', 'smoke-browser', '--url', url])
  }
}
