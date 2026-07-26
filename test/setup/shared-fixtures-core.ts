/**
 * Runner-agnostic build + serve core for shared fixtures.
 *
 * Extracted from the former Playwright `global-setup.ts` so both the Playwright
 * globalSetup (during migration) and the Vitest globalSetup can prebuild
 * fixtures once and start one production server per fixture, then hand specs a
 * `host` URL instead of each rebuilding the fixture.
 *
 * Build caching, corruption checks and concurrency behaviour are unchanged —
 * only the transport of the resulting `{ fixture -> url }` map differs per
 * runner (env var + return value here; Vitest `provide` on top).
 */
import { type ChildProcess, spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, unlinkSync } from 'node:fs'
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import net from 'node:net'
import { cpus } from 'node:os'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { envKey, fixtureDir, fixtureEnv, SHARED_FIXTURES } from './manifest'

const ROOT = fileURLToPath(new URL('../..', import.meta.url))
const WORKER = fileURLToPath(new URL('./build-fixture-worker.mjs', import.meta.url))

/** Written by globalSetup; read by worker setupFiles before spec modules load. */
export const NUXT_HOSTS_FILE = fileURLToPath(new URL('./.nuxt-hosts.json', import.meta.url))

export function readNuxtHostsFile(): Record<string, string> {
  if (!existsSync(NUXT_HOSTS_FILE)) return {}
  try {
    return JSON.parse(readFileSync(NUXT_HOSTS_FILE, 'utf8')) as Record<string, string>
  } catch {
    return {}
  }
}

export function applyNuxtHostsToEnv(hosts: Record<string, string>): void {
  for (const [name, url] of Object.entries(hosts)) {
    process.env[envKey(name)] = url
  }
}

export function clearNuxtHostsFile(): void {
  try {
    unlinkSync(NUXT_HOSTS_FILE)
  } catch {
    /* already removed */
  }
}

const SKIP_DIRS = new Set(['node_modules', '.nuxt', '.output', '.output-shared', '.nuxt-test', 'test-results', '.data', 'dist'])

/** OS/editor noise that must not influence the fixture hash. */
const SKIP_FILES = new Set(['.DS_Store'])

/**
 * Paths (relative to the scanned root) that a Nuxt build writes back into the
 * fixture *source* directory. Hashing them would make the hash depend on whether
 * a build already ran, so a warm cache could never validate.
 */
const SKIP_RELATIVE = new Set(['server/assets', '~'])

interface RunningServer {
  child: ChildProcess
  url: string
}

const servers: RunningServer[] = []

function sha1(content: Buffer | string): string {
  return createHash('sha1').update(content).digest('hex')
}

/**
 * Content-based manifest hash: repo-relative path + sha1 of the file bytes.
 *
 * Deliberately does NOT use mtime or size. `git checkout` rewrites mtimes on
 * every CI run, so an mtime-based hash never matched the `.build-hash` stored in
 * a restored `actions/cache`, and all shared fixtures were rebuilt from scratch
 * on every run. Paths are relative so the hash does not depend on the checkout
 * directory either.
 */
async function collectFileHashes(dir: string, lines: string[], root: string = dir): Promise<void> {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name) || SKIP_FILES.has(entry.name)) continue
    const path = join(dir, entry.name)
    if (SKIP_RELATIVE.has(relative(root, path))) continue
    if (entry.isDirectory()) {
      await collectFileHashes(path, lines, root)
    } else if (entry.isFile()) {
      lines.push(`${relative(ROOT, path)}|${sha1(await readFile(path))}`)
    }
  }
}

async function fixtureHash(name: string): Promise<string> {
  const lines: string[] = []
  await collectFileHashes(fixtureDir(name), lines)
  await collectFileHashes(join(ROOT, 'src'), lines)
  // Fixtures build against @i18n-micro/* from the workspace packages. Hash their
  // sources, not dist: dist is rebuilt on every CI run, so hashing it could never
  // match a warm cache. CI always rebuilds packages before tests, so src is the
  // authoritative input (and matches the actions/cache key).
  const packagesDir = join(ROOT, 'packages')
  for (const pkg of await readdir(packagesDir)) {
    await collectFileHashes(join(packagesDir, pkg, 'src'), lines)
  }
  // Variants share a source dir; their build-time env is part of the identity.
  for (const [key, value] of Object.entries(fixtureEnv(name)).sort()) {
    lines.push(`env:${key}=${value}`)
  }
  for (const file of ['package.json', 'pnpm-lock.yaml']) {
    try {
      lines.push(`${file}|${sha1(await readFile(join(ROOT, file)))}`)
    } catch {
      /* optional */
    }
  }
  return sha1(lines.sort().join('\n'))
}

/**
 * Build outputs live outside test/fixtures on purpose: they are workspace members
 * (`test/fixtures/**` in pnpm-workspace.yaml) and Nitro's bundled
 * `output/server/node_modules/.nitro` contains symlink loops that make
 * `pnpm install` die with ENAMETOOLONG once a build exists. Keeping them here
 * also gives one flat directory to cache and one to clean.
 */
const BUILDS_ROOT = join(ROOT, 'test', '.fixture-builds')

function buildDirFor(name: string): string {
  return join(BUILDS_ROOT, name)
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
      env: { ...process.env, ...fixtureEnv(name) },
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

async function startFixtureServer(name: string): Promise<[string, string]> {
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
  // Keep the env contract too, so any code path still reading it works.
  process.env[envKey(name)] = url
  return [name, url]
}

async function runPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const queue = items.map((item, index) => [index, item] as const)
  const results: R[] = new Array(items.length)
  const errors: unknown[] = []
  const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length > 0) {
      const [index, item] = queue.shift()!
      try {
        results[index] = await fn(item)
      } catch (error) {
        errors.push(error)
      }
    }
  })
  await Promise.all(workers)
  if (errors.length > 0) throw errors[0]
  return results
}

/** True for Vitest CLI test-file args — not config files like `vitest.e2e.config.ts`. */
function isTestFileArg(arg: string): boolean {
  return /(?:^|[/\\])[^/\\]+\.(?:spec|e2e\.test)\.[cm]?[jt]sx?$/.test(arg)
}

/** Match a manifest spec name as a path basename (`seo.spec.ts` ≠ `nuxt-seo.spec.ts`). */
function argMatchesSpec(arg: string, spec: string): boolean {
  return arg === spec || arg.endsWith(`/${spec}`) || arg.endsWith(`\\${spec}`)
}

/**
 * When spec files are passed on the CLI, only build the fixtures they need.
 * Full runs (no test-file argv) return every shared fixture.
 */
export function requestedFixtures(): string[] {
  const all = Object.keys(SHARED_FIXTURES)
  const fileArgs = process.argv.slice(2).filter((arg) => !arg.startsWith('-') && isTestFileArg(arg))
  if (fileArgs.length === 0) return all
  const matched = all.filter((name) => SHARED_FIXTURES[name]!.some((spec) => fileArgs.some((arg) => argMatchesSpec(arg, spec))))
  // Unmatched CLI filters (e.g. only isolated specs) → skip shared prebuild.
  return matched
}

/** Tear down all running fixture servers. */
export async function stopServers(): Promise<void> {
  clearNuxtHostsFile()
  await Promise.all(
    servers.splice(0).map(
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

/**
 * Build (if needed) and start one server per requested fixture.
 * Returns a `{ fixtureName -> baseURL }` map. No-op map when SHARED_FIXTURES=0.
 */
export async function buildAndServe(names: string[] = requestedFixtures()): Promise<Record<string, string>> {
  if (process.env.SHARED_FIXTURES === '0') {
    console.log('[shared-fixtures] disabled via SHARED_FIXTURES=0, specs will build their own fixtures')
    // Clear any stale host map from a previous run so workers do not reuse dead URLs.
    clearNuxtHostsFile()
    return {}
  }
  if (names.length === 0) {
    clearNuxtHostsFile()
    return {}
  }

  const started = Date.now()
  const concurrency = Number(process.env.FIXTURE_BUILD_CONCURRENCY) || Math.max(2, Math.floor(cpus().length / 2))

  try {
    await runPool(names, concurrency, ensureBuilt)
    const entries = await runPool(names, 8, startFixtureServer)
    const hosts = Object.fromEntries(entries)
    applyNuxtHostsToEnv(hosts)
    await writeFile(NUXT_HOSTS_FILE, JSON.stringify(hosts), 'utf8')
    console.log(`[shared-fixtures] ${names.length} fixture server(s) ready in ${((Date.now() - started) / 1000).toFixed(1)}s`)
    return hosts
  } catch (error) {
    await stopServers()
    throw error
  }
}
