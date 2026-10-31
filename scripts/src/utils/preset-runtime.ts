import { spawn, type ChildProcess, execFileSync } from 'node:child_process'
import { createServer, type RequestListener, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { repoRoot } from './workspace'

/** What each target builds: a Nitro preset, and the smoke app's env for a layout the preset does not have by default. */
export const PRESET_TARGETS = {
  vercel: { preset: 'vercel' },
  cloudflare_pages: { preset: 'cloudflare_pages' },
  netlify: { preset: 'netlify' },
  // the app's compatibility date resolves this name to the legacy Worker
  cloudflare_module: { preset: 'cloudflare_module', env: { SMOKE_COMPATIBILITY_DATE: '2025-09-01' } },
  vercel_edge: { preset: 'vercel_edge' },
  netlify_edge: { preset: 'netlify_edge' },
  aws_lambda: { preset: 'aws_lambda' },
  aws_amplify: { preset: 'aws_amplify' },
  bun: { preset: 'bun' },
  deno_server: { preset: 'deno_server' },
  node_custom_public: { preset: 'node_server', env: { SMOKE_PUBLIC_DIR: '.output/custom-public' } },
  vercel_serve_static: { preset: 'vercel', env: { SMOKE_SERVE_STATIC: '1' } },
} satisfies Record<string, { preset: string; env?: Record<string, string> }>

export type PresetName = keyof typeof PRESET_TARGETS

/** `SMOKE_PORT` pins the runners' port, for machines where a random one is not welcome. */
const smokePort = (fallback = 0) => Number(process.env.SMOKE_PORT) || fallback

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

export function buildSmokeApp(appDir: string, preset: string, env: Record<string, string> = {}): void {
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

  return listen(createServer(handle))
}

async function listen(server: Server): Promise<RunningServer> {
  await new Promise<void>((resolveListen, reject) => {
    server.once('error', reject)
    server.listen(smokePort(), '127.0.0.1', () => resolveListen())
  })
  const { port } = server.address() as AddressInfo
  return {
    url: `http://127.0.0.1:${port}`,
    close: () =>
      new Promise((resolveClose, reject) => {
        server.closeAllConnections()
        server.close((err) => (err ? reject(err) : resolveClose()))
      }),
  }
}

/** A command that serves the app by itself: wait for it, keep its output for the error. */
async function spawnRunner(command: string, args: string[], cwd: string, port: number, env: Record<string, string> = {}): Promise<RunningServer> {
  const child = spawn(command, args, {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      CI: '1',
      WRANGLER_SEND_METRICS: 'false',
      PORT: String(port),
      NITRO_PORT: String(port),
      HOST: '127.0.0.1',
      NITRO_HOST: '127.0.0.1',
      ...env,
    },
  })
  let output = ''
  child.stderr?.on('data', (chunk: Buffer) => {
    output += chunk.toString()
  })
  child.stdout?.on('data', (chunk: Buffer) => {
    output += chunk.toString()
  })
  const url = `http://127.0.0.1:${port}`
  try {
    await waitForUrl(url)
  } catch (error) {
    await killProcessTree(child)
    throw new Error(`${String((error as Error)?.message ?? error)}\n${command} output:\n${output.slice(-2_000)}`)
  }
  return { url, close: () => killProcessTree(child) }
}

const wrangler = (): [string, string[]] => (process.env.SMOKE_WRANGLER ? [process.env.SMOKE_WRANGLER, []] : ['pnpm', ['dlx', 'wrangler@4']])

async function importEntry<T>(path: string): Promise<T> {
  if (!existsSync(path)) throw new Error(`Preset entry missing: ${path}`)
  return (await import(pathToFileURL(path).href)) as T
}

/** Nitro `commands.preview` for cloudflare_pages: `wrangler pages dev <output.dir>`. */
export async function startCloudflarePagesPreview(appDir: string): Promise<RunningServer> {
  const outDir = resolve(appDir, 'dist')
  if (!existsSync(outDir)) {
    throw new Error(`Cloudflare Pages output missing: ${outDir}`)
  }

  const port = smokePort(8788)
  const [command, prefix] = wrangler()
  return spawnRunner(command, [...prefix, 'pages', 'dev', outDir, '--port', String(port), '--ip', '127.0.0.1'], appDir, port)
}

/** `wrangler dev` on the module Worker, with a config of its own beside the build (the preset writes none). */
export async function startCloudflareModule(appDir: string): Promise<RunningServer> {
  const config = resolve(appDir, '.output/wrangler.smoke.toml')
  writeFileSync(
    config,
    'name = "smoke"\ncompatibility_date = "2025-09-01"\nmain = "server/index.mjs"\n[assets]\ndirectory = "public"\nbinding = "ASSETS"\n',
  )
  const port = smokePort(8787)
  const [command, prefix] = wrangler()
  return spawnRunner(
    command,
    [...prefix, 'dev', '--config', config, '--port', String(port), '--ip', '127.0.0.1', '--local', '--inspector-port', String(port + 1)],
    appDir,
    port,
  )
}

/**
 * The Vercel Edge bundle exports a Fetch handler. In Node, not in Edge Runtime: this checks the bundle
 * and its embedded dictionaries, not the sandbox.
 */
export async function startVercelEdge(appDir: string): Promise<RunningServer> {
  const mod = await importEntry<{ default: FetchHandler }>(resolve(appDir, '.vercel/output/functions/__fallback.func/index.mjs'))
  return serveFetchHandler(mod.default)
}

/** The Netlify Edge bundle on Deno, as Netlify's runtime does. It leaves static paths to the CDN by returning nothing: the runner plays that part. */
export async function startNetlifyEdge(appDir: string): Promise<RunningServer> {
  const entry = resolve(appDir, '.netlify/edge-functions/server/server.js')
  if (!existsSync(entry)) throw new Error(`Netlify Edge entry missing: ${entry}`)
  const port = smokePort(8789)
  const runner = resolve(appDir, '.netlify/edge-smoke.mjs')
  const dist = resolve(appDir, 'dist')
  writeFileSync(
    runner,
    `import handler from ${JSON.stringify(pathToFileURL(entry).href)}
const notFound = () => new Response('not found', { status: 404 })
Deno.serve({ port: ${port}, hostname: '127.0.0.1' }, async (request) => {
  const answer = await handler(request, { next: notFound })
  if (answer) return answer
  const file = ${JSON.stringify(dist)} + decodeURIComponent(new URL(request.url).pathname)
  return Deno.readFile(file).then((body) => new Response(body), notFound)
})
`,
  )
  return spawnRunner('deno', ['run', '--allow-all', '--no-lock', runner], appDir, port)
}

interface LambdaResult {
  statusCode: number
  headers?: Record<string, string>
  cookies?: string[]
  body?: string
  isBase64Encoded?: boolean
}

/** aws-lambda: the handler behind an API Gateway v2 event. */
export async function startAwsLambda(appDir: string): Promise<RunningServer> {
  const { handler } = await importEntry<{ handler: (event: unknown, context: unknown) => Promise<LambdaResult> }>(
    resolve(appDir, '.output/server/index.mjs'),
  )
  return serveFetchHandler(async (request) => {
    const url = new URL(request.url)
    const result = await handler(
      {
        version: '2.0',
        rawPath: url.pathname,
        rawQueryString: url.search.slice(1),
        headers: Object.fromEntries(request.headers),
        cookies: request.headers.get('cookie')?.split(/;\s*/),
        requestContext: { http: { method: request.method, path: url.pathname } },
        isBase64Encoded: false,
      },
      {},
    )
    const headers = new Headers(result.headers)
    for (const cookie of result.cookies ?? []) headers.append('set-cookie', cookie)
    return new Response(result.isBase64Encoded ? Buffer.from(result.body ?? '', 'base64') : result.body, { status: result.statusCode, headers })
  })
}

/** aws-amplify hardcodes its port in the compute entry: the runner gives it ours. */
export async function startAwsAmplify(appDir: string): Promise<RunningServer> {
  const dir = resolve(appDir, '.amplify-hosting/compute/default')
  const entry = join(dir, 'index.mjs')
  if (!existsSync(entry)) throw new Error(`Amplify entry missing: ${entry}`)
  const port = smokePort(3000)
  writeFileSync(entry, readFileSync(entry, 'utf8').replace(/\.listen\(\d+(?:e\d)?/, `.listen(${port}`))
  return spawnRunner('node', [join(dir, 'server.js')], dir, port)
}

const startNodeOutput = (appDir: string, command: string, args: string[]) =>
  spawnRunner(command, [...args, resolve(appDir, '.output/server/index.mjs')], '/', smokePort(3000), { NODE_ENV: 'production' })

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
  const fetchHandler = (mod.default ?? mod) as FetchHandler
  if (typeof fetchHandler !== 'function') {
    throw new Error(`Netlify entry did not export a fetch handler: ${handlerPath}`)
  }
  return serveFetchHandler(fetchHandler)
}

type FetchHandler = (request: Request) => Promise<Response> | Response

function serveFetchHandler(fetchHandler: FetchHandler): Promise<RunningServer> {
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

  return listen(server)
}

const RUNNERS: Record<PresetName, (appDir: string) => Promise<RunningServer>> = {
  vercel: startVercelNitroStyle,
  vercel_serve_static: startVercelNitroStyle,
  cloudflare_pages: startCloudflarePagesPreview,
  cloudflare_module: startCloudflareModule,
  netlify: startNetlifyNitroStyle,
  vercel_edge: startVercelEdge,
  netlify_edge: startNetlifyEdge,
  aws_lambda: startAwsLambda,
  aws_amplify: startAwsAmplify,
  bun: (appDir) => startNodeOutput(appDir, 'bun', ['run']),
  deno_server: (appDir) => startNodeOutput(appDir, 'deno', ['run', '--allow-all']),
  node_custom_public: (appDir) => startNodeOutput(appDir, 'node', []),
}

export function startPresetRuntime(appDir: string, preset: PresetName): Promise<RunningServer> {
  return RUNNERS[preset](appDir)
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
