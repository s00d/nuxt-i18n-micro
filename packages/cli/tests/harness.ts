import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { type IncomingMessage, type Server, type ServerResponse, createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageDir = fileURLToPath(new URL('..', import.meta.url))

/** The binary under test. `CLI_BIN` points at the old CLI when goldens are regenerated from it. */
export const cliBin = process.env.CLI_BIN || join(packageDir, 'dist/cli.mjs')
export const fixtureDir = join(packageDir, 'tests/fixtures/app')

/** Inside the package, so the temp project resolves `nuxt` from `packages/cli/node_modules`. */
const tempRoot = join(packageDir, '.tmp')

export function createProject(fixture = fixtureDir): string {
  mkdirSync(tempRoot, { recursive: true })
  const dir = mkdtempSync(join(tempRoot, 'app-'))
  cpSync(fixture, dir, { recursive: true })
  return dir
}

export function removeProject(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

export interface RunResult {
  code: number | null
  stdout: string
  stderr: string
}

export function runCli(
  args: string[],
  options: { cwd: string; env?: Record<string, string>; stdin?: string; timeoutMs?: number },
): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cliBin, ...args], {
      cwd: options.cwd,
      env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0', CI: '', ...options.env },
      stdio: 'pipe',
    })
    let stdout = ''
    let stderr = ''
    const timer = setTimeout(() => child.kill('SIGKILL'), options.timeoutMs ?? 60_000)
    child.stdout.on('data', (chunk) => (stdout += String(chunk)))
    child.stderr.on('data', (chunk) => (stderr += String(chunk)))
    child.on('error', reject)
    child.on('close', (code) => {
      clearTimeout(timer)
      resolve({ code, stdout, stderr })
    })
    child.stdin.end(options.stdin ?? '')
  })
}

const IGNORED = new Set(['node_modules', '.nuxt', '.output', '.data'])

function walk(dir: string, base = dir, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED.has(entry.name)) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full, base, out)
    else out.push(relative(base, full).split(sep).join('/'))
  }
  return out.sort()
}

export type Snapshot = Map<string, string>

export function snapshotFiles(dir: string): Snapshot {
  return new Map(walk(dir).map((file) => [file, readFileSync(join(dir, file), 'latin1')]))
}

const isBinary = (name: string) => /\.(zip|enc)$/.test(name)

const fileBody = (name: string, content: string): string => {
  if (isBinary(name)) return `<binary ${createHash('sha1').update(name).digest('hex').length} chars hash>`
  return Buffer.from(content, 'latin1').toString('utf8')
}

/** Files added, removed or changed by a run: the half of a command's behaviour stdout does not show. */
export function diffFiles(before: Snapshot, after: Snapshot): string {
  const lines: string[] = []
  for (const name of [...new Set([...before.keys(), ...after.keys()])].sort()) {
    if (!after.has(name)) lines.push(`deleted ${name}`)
    else if (!before.has(name)) lines.push(`added ${name}`, '', fence(fileBody(name, after.get(name)!)), '')
    else if (before.get(name) !== after.get(name)) lines.push(`changed ${name}`, '', fence(fileBody(name, after.get(name)!)), '')
  }
  return lines.length === 0 ? '(no files changed)' : lines.join('\n').trim()
}

const fence = (body: string): string => `\`\`\`\n${body.trimEnd()}\n\`\`\``

const ISO_STAMP = /\d{4}-\d{2}-\d{2}T\d{2}[-:]\d{2}[-:]\d{2}[-.]\d{3}Z/g

export function normalize(text: string, projectDir: string, port = 0): string {
  return text
    .replaceAll(projectDir, '<project>')
    .replaceAll(`127.0.0.1:${port}`, '<mock>')
    .replace(ISO_STAMP, '<timestamp>')
    // oxlint-disable-next-line no-control-regex -- ANSI colors are what this strips
    .replace(/\u001B\[[0-9;]*m/g, '')
    .replace(/[ \t]+$/gm, '')
}

export interface MockRequest {
  method: string
  url: string
  headers: IncomingMessage['headers']
  body: Buffer
  text: string
}

export type MockHandler = (request: MockRequest, response: ServerResponse) => unknown

export interface MockServer {
  url: string
  port: number
  requests: MockRequest[]
  close(): Promise<void>
}

/** A local vendor stand-in: records every request exactly as it arrived. */
export function startMock(handler: MockHandler): Promise<MockServer> {
  const requests: MockRequest[] = []
  const server: Server = createServer((req, res) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', async () => {
      const body = Buffer.concat(chunks)
      const request = { method: req.method ?? '', url: req.url ?? '', headers: req.headers, body, text: body.toString('utf8') }
      requests.push(request)
      try {
        await handler(request, res)
      } catch (error) {
        res.statusCode = 500
        res.end(String(error))
      }
    })
  })
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as AddressInfo
      resolve({
        url: `http://127.0.0.1:${port}`,
        port,
        requests,
        close: () =>
          new Promise((done) => {
            server.closeAllConnections()
            server.close(() => done())
          }),
      })
    })
  })
}

export function json(response: ServerResponse, value: unknown, status = 200): void {
  response.statusCode = status
  response.setHeader('content-type', 'application/json')
  response.end(JSON.stringify(value))
}

export const hasBin = (): boolean => existsSync(cliBin)
