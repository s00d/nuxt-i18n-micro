/**
 * Playwright global setup: prebuilds "shared" fixtures once and starts one
 * production server per fixture. Specs in the `shared` project connect to
 * these servers via the @nuxt/test-utils `host` option instead of each
 * building the fixture from scratch (which used to mean ~45 full Nuxt
 * builds per run).
 *
 * - Builds are cached: a stat-based hash of the fixture sources, the module
 *   sources (src/ and package dist dirs) and the lockfile is stored next to
 *   the build output; unchanged fixtures are not rebuilt. Cached builds are
 *   also checked against Nitro public-asset sizes so a truncated/corrupt
 *   `_nuxt` chunk forces a rebuild (avoids SPA hydration hanging on SyntaxError).
 * - When specific spec files are passed on the CLI, only the fixtures those
 *   specs need are built.
 * - Set SHARED_FIXTURES=0 to disable prebuilds entirely (specs then fall
 *   back to the old per-worker builds via useSharedFixture()).
 */
import type { FullConfig } from '@playwright/test'
import { type ChildProcess, spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import net from 'node:net'
import { cpus } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { envKey, fixtureDir, SHARED_FIXTURES } from './manifest'

const ROOT = fileURLToPath(new URL('../..', import.meta.url))
const WORKER = fileURLToPath(new URL('./build-fixture-worker.mjs', import.meta.url))

const SKIP_DIRS = new Set(['node_modules', '.nuxt', '.output', '.output-shared', '.nuxt-test', 'test-results', '.data', 'dist'])

interface RunningServer {
  child: ChildProcess
  url: string
}

const servers: RunningServer[] = []

/** Stat-based manifest hash: fast (no file reads) and good enough — a false
 *  mismatch only costs one extra rebuild. */
async function collectStats(dir: string, lines: string[]): Promise<void> {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      await collectStats(path, lines)
    } else if (entry.isFile()) {
      const s = await stat(path)
      lines.push(`${path}|${s.size}|${s.mtimeMs}`)
    }
  }
}

async function fixtureHash(name: string): Promise<string> {
  const lines: string[] = []
  await collectStats(fixtureDir(name), lines)
  await collectStats(join(ROOT, 'src'), lines)
  // Module source imports @i18n-micro/* from workspace packages' dist
  const packagesDir = join(ROOT, 'packages')
  for (const pkg of await readdir(packagesDir)) {
    await collectStats(join(packagesDir, pkg, 'dist'), lines)
  }
  for (const file of ['package.json', 'pnpm-lock.yaml']) {
    try {
      const s = await stat(join(ROOT, file))
      lines.push(`${file}|${s.size}|${s.mtimeMs}`)
    } catch {
      /* optional */
    }
  }
  return createHash('sha1').update(lines.sort().join('\n')).digest('hex')
}

function buildDirFor(name: string): string {
  return join(fixtureDir(name), '.output-shared')
}

/**
 * Nitro serves public assets by reading exactly `meta.size` bytes from `meta.path`.
 * If a file on disk was truncated/extended after the build (or a partial write left a
 * short entry chunk), the input hash still matches and we would serve broken JS:
 * `SyntaxError: Unexpected end of input` → SPA never hydrates.
 */
async function isPublicAssetCacheIntact(buildDir: string): Promise<boolean> {
  const nitroCandidates = [
    join(buildDir, 'output', 'server', 'chunks', 'nitro', 'nitro.mjs'),
    join(buildDir, 'output', 'server', 'chunks', '_', 'nitro.mjs'),
  ]
  const nitroPath = nitroCandidates.find((path) => existsSync(path))
  if (!nitroPath) return false

  let nitroSource: string
  try {
    nitroSource = await readFile(nitroPath, 'utf8')
  } catch {
    return false
  }

  const assetRe = /"size":\s*(\d+),\s*"path":\s*"(\.\.\/public\/_nuxt\/[^"]+)"/g
  let match: RegExpExecArray | null
  let checked = 0
  const serverDir = join(buildDir, 'output', 'server')
  while ((match = assetRe.exec(nitroSource)) !== null) {
    const expectedSize = Number(match[1])
    const relativePath = match[2]!
    // Nitro resolves asset paths from output/server (see readAsset in nitro.mjs)
    const absolutePath = resolve(serverDir, relativePath)
    try {
      const actualSize = (await stat(absolutePath)).size
      if (actualSize !== expectedSize) return false
      checked++
    } catch {
      return false
    }
  }

  // A healthy Nuxt build always emits at least one hashed entry under /_nuxt/
  return checked > 0
}

async function ensureBuilt(name: string): Promise<void> {
  const buildDir = buildDirFor(name)
  const hashFile = join(buildDir, '.build-hash')
  const serverEntry = join(buildDir, 'output', 'server', 'index.mjs')
  const hash = await fixtureHash(name)

  if (existsSync(serverEntry) && existsSync(hashFile)) {
    const stored = await readFile(hashFile, 'utf8').catch(() => '')
    if (stored.trim() === hash && (await isPublicAssetCacheIntact(buildDir))) {
      console.log(`[shared-fixtures] ${name}: up to date`)
      return
    }
    if (stored.trim() === hash) {
      console.log(`[shared-fixtures] ${name}: cache corrupt (public asset size mismatch), rebuilding...`)
    }
  }

  console.log(`[shared-fixtures] ${name}: building...`)
  const started = Date.now()
  await rm(buildDir, { recursive: true, force: true })
  await mkdir(buildDir, { recursive: true })

  await new Promise<void>((resolvePromise, rejectPromise) => {
    const child = spawn(process.execPath, [WORKER, fixtureDir(name), buildDir], {
      cwd: fixtureDir(name),
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env },
    })
    let output = ''
    child.stdout!.on('data', (chunk: Buffer) => {
      output += chunk.toString()
    })
    child.stderr!.on('data', (chunk: Buffer) => {
      output += chunk.toString()
    })
    child.on('error', rejectPromise)
    child.on('exit', (code) => {
      if (code === 0) resolvePromise()
      else rejectPromise(new Error(`[shared-fixtures] build of ${name} failed (exit ${code}):\n${output.slice(-4000)}`))
    })
  })

  await writeFile(hashFile, hash)
  console.log(`[shared-fixtures] ${name}: built in ${((Date.now() - started) / 1000).toFixed(1)}s`)
}

function getFreePort(): Promise<number> {
  return new Promise((resolvePromise, rejectPromise) => {
    const srv = net.createServer()
    srv.once('error', rejectPromise)
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address() as net.AddressInfo
      srv.close(() => resolvePromise(port))
    })
  })
}

function waitForPort(port: number, timeoutMs = 30_000): Promise<void> {
  const deadline = Date.now() + timeoutMs
  return new Promise((resolvePromise, rejectPromise) => {
    const attempt = () => {
      const socket = net.connect(port, '127.0.0.1')
      socket.once('connect', () => {
        socket.destroy()
        resolvePromise()
      })
      socket.once('error', () => {
        socket.destroy()
        if (Date.now() > deadline) rejectPromise(new Error(`port ${port} not ready after ${timeoutMs}ms`))
        else setTimeout(attempt, 200)
      })
    }
    attempt()
  })
}

async function startFixtureServer(name: string): Promise<void> {
  const port = await getFreePort()
  const serverEntry = join(buildDirFor(name), 'output', 'server', 'index.mjs')
  // Same env contract as @nuxt/test-utils' startServer
  const child = spawn(process.execPath, [serverEntry], {
    stdio: 'ignore',
    env: {
      ...process.env,
      PORT: String(port),
      HOST: '127.0.0.1',
      NODE_ENV: 'test',
    },
  })
  const url = `http://127.0.0.1:${port}/`
  servers.push({ child, url })
  await waitForPort(port)
  process.env[envKey(name)] = url
}

async function runPool<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  const queue = [...items]
  const errors: unknown[] = []
  const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length > 0) {
      const item = queue.shift()!
      try {
        await fn(item)
      } catch (error) {
        errors.push(error)
      }
    }
  })
  await Promise.all(workers)
  if (errors.length > 0) throw errors[0]
}

/** When spec files are passed on the CLI, only build the fixtures they need. */
function requestedFixtures(): string[] {
  const all = Object.keys(SHARED_FIXTURES)
  const fileArgs = process.argv.slice(2).filter((arg) => !arg.startsWith('-') && arg.includes('.spec.'))
  if (fileArgs.length === 0) return all
  return all.filter((name) => SHARED_FIXTURES[name]!.some((spec) => fileArgs.some((arg) => arg.endsWith(spec) || arg.includes(spec))))
}

export default async function globalSetup(_config: FullConfig): Promise<() => Promise<void>> {
  const teardown = async () => {
    await Promise.all(
      servers.map(
        ({ child }) =>
          new Promise<void>((resolvePromise) => {
            child.once('exit', () => resolvePromise())
            child.kill('SIGTERM')
            setTimeout(() => {
              child.kill('SIGKILL')
              resolvePromise()
            }, 5000).unref()
          }),
      ),
    )
  }

  if (process.env.SHARED_FIXTURES === '0') {
    console.log('[shared-fixtures] disabled via SHARED_FIXTURES=0, specs will build their own fixtures')
    return teardown
  }

  const names = requestedFixtures()
  if (names.length === 0) return teardown

  const started = Date.now()
  const concurrency = Number(process.env.FIXTURE_BUILD_CONCURRENCY) || Math.max(2, Math.floor(cpus().length / 2))

  try {
    await runPool(names, concurrency, ensureBuilt)
    await runPool(names, 8, startFixtureServer)
  } catch (error) {
    await teardown()
    throw error
  }

  console.log(`[shared-fixtures] ${names.length} fixture server(s) ready in ${((Date.now() - started) / 1000).toFixed(1)}s`)
  return teardown
}
