import { spawn, spawnSync } from 'node:child_process'
import { cpSync, mkdtempSync, rmSync } from 'node:fs'
import net from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { defineCommand } from 'citty'
import { repoRoot } from '../utils/workspace'
import { CONSUMER_INSTALL, packWorkspace, writeConsumerProject } from './smoke-pack'

const STRATEGIES = ['prefix', 'prefix_except_default', 'prefix_and_default', 'no_prefix']
const MARK = 'zq7"><img src=x onerror=alert(1)>'
const MARK_ENCODED = encodeURIComponent(MARK)

/** Findings no build may have. A 500 alone is not one: plain Nuxt answers some of these paths that way too. */
export const VIOLATIONS = ['off-origin-location', 'header-injection', 'reflected-raw', 'path-traversal', 'stack-leak', 'bad-cookie', 'crash']

/** A small PRNG of its own: `--seed` must replay the same requests on every Node version. */
export function createRandom(seed: number) {
  let state = seed >>> 0
  const random = () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return { random, pick: <T>(items: readonly T[]): T => items[Math.floor(random() * items.length)]! }
}

const PATH_PIECES = [
  ...[
    '/',
    '//',
    '///',
    '\\',
    '/\\',
    '%2F',
    '%2f',
    '%5C',
    '%5c',
    '%09',
    '%0a',
    '%0d%0a',
    '%0d%0aSet-Cookie:%20x=1',
    '%00',
    '%20',
    '.',
    '..',
    '%2e',
    '%2e%2e',
    '..%2f',
    '%c0%ae',
    '%ff',
    '%',
    '%zz',
  ],
  ...[
    'en',
    'de',
    'fr',
    'DE',
    'En',
    'xx',
    'zh-CN',
    'about',
    'page',
    'api',
    '_locales',
    '_nuxt',
    '__nuxt_error',
    '__proto__',
    'constructor',
    'prototype',
    'toString',
  ],
  ...[
    'evil.example',
    '@evil.example',
    'http:',
    'https:',
    'https://evil.example',
    'javascript:alert(1)',
    MARK_ENCODED,
    MARK.replace(/ /g, '%20'),
    'ключ',
    '%D0%BA',
    '😀',
    '%F0%9F%98%80',
  ],
  ...['?', '#', ';', '&', '=', '+', '*', "'", '"', '<', '>', '{', '}', '|', '^', '`', '~'],
]
const LOCALES = ['en', 'de', 'xx', 'DE', '__proto__', 'constructor', '%00', '..', '%2e%2e', '..%2f', '', 'a'.repeat(300), MARK_ENCODED]
const PAGES = [
  ...[
    'index',
    '__root',
    'about',
    '__proto__',
    'constructor',
    '..',
    '%2e%2e',
    '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
    '..%2f..%2f..%2f..%2f..%2fetc%2fpasswd',
    '..%5c..%5cwindows',
    '%00',
  ],
  ...['a'.repeat(4000), 'x/y', '%2Fetc%2Fpasswd', 'file:%2F%2F%2Fetc%2Fpasswd', MARK_ENCODED, 'index.json', 'en', 'pages%2Fabout'],
]
const QUERY_KEYS = ['locale=', 'lang=', 'redirect=', 'to=', '__proto__[x]=', 'constructor=', 'constructor.prototype.x=', 'x=']
const QUERY_VALUES = ['de', 'xx', '//evil.example', 'https://evil.example', MARK_ENCODED, '%0d%0ax:1', '', 'a'.repeat(2000)]
const ACCEPT_LANGUAGE = [
  'de',
  'de-DE,de;q=0.9',
  'xx',
  '*',
  'q=',
  ';;;',
  'de;q=NaN',
  'de;q=-1',
  'de;q=1e999',
  'de;q=9',
  ',,,,',
  'ZH-hant-TW',
  '__proto__',
  'constructor',
  'en;q=0,de;q=0',
  `${'a,'.repeat(2000)}de`,
  `${'de-'.repeat(1500)}x`,
  MARK,
]
const COOKIE_VALUES = ['de', 'xx', 'DE', '__proto__', MARK_ENCODED, 'a'.repeat(500), '%', '%00', '%ff', ';;', '../x']

export interface FuzzRequest {
  method: string
  path: string
  headers: string[]
}

export function createGenerator(seed: number, port: number) {
  const { random, pick } = createRandom(seed)
  const pagePath = () => {
    const count = 1 + Math.floor(random() * 6)
    let path = ''
    for (let i = 0; i < count; i++) path += pick(PATH_PIECES) + (random() < 0.5 ? '/' : '')
    return !path.startsWith('/') || random() < 0.7 ? `/${path}` : path
  }
  const payloadPath = () =>
    pick([
      () => `/_locales/${pick(PAGES)}/${pick(LOCALES)}/data.json`,
      () => `/_locales/${pick(PAGES)}/${pick(LOCALES)}/data.json?v=${pick(['0', '1', 'x', 'a'.repeat(1000), MARK_ENCODED])}`,
      () => '/_locales/../../../../etc/passwd',
      () =>
        `/_locales/${pick(PAGES)}/${pick(LOCALES)}/${pick(['data.json', 'data', '', '../data.json', 'data.json/', 'DATA.JSON', '%2e%2e/data.json'])}`,
      () => `/_locales//${pick(LOCALES)}/data.json`,
      () => `/_locales/${pick(PAGES)}//data.json`,
      () => '/_locales/',
    ])()
  const search = () => (random() < 0.5 ? '' : `?${pick(QUERY_KEYS)}${pick(QUERY_VALUES)}`)
  const headers = () => {
    const out: string[] = []
    const own = `Host: 127.0.0.1:${port}`
    const host = random()
    if (host < 0.6) out.push(own)
    else if (host < 0.8)
      out.push(`Host: ${pick(['evil.example', 'evil.example:443', `127.0.0.1:${port}@evil.example`, 'a'.repeat(300), '[::1]', '', 'localhost'])}`)
    else if (host < 0.9) out.push(own, 'Host: evil.example')
    if (random() < 0.3) out.push(`Cookie: ${pick(['i18n-locale', 'user-locale'])}=${pick(COOKIE_VALUES)}`)
    if (random() < 0.4) out.push(`Accept-Language: ${pick(ACCEPT_LANGUAGE)}`)
    if (random() < 0.3) out.push(`X-Forwarded-Host: ${pick(['evil.example', 'evil.example, other', 'a b', MARK, ''])}`)
    if (random() < 0.3) out.push(`X-Forwarded-Proto: ${pick(['https', 'http', 'javascript', MARK])}`)
    if (random() < 0.2) out.push(`X-Forwarded-For: ${pick(['1.1.1.1', 'evil', MARK])}`)
    if (random() < 0.1) out.push(`X-Forwarded-Prefix: ${pick(['/evil', '//evil.example', MARK])}`)
    if (random() < 0.1) out.push('X-Original-URL: /evil', 'X-Rewrite-URL: //evil.example')
    if (random() < 0.1) out.push(`Accept: ${pick(['application/json', 'text/html', '*/*', '', MARK])}`)
    return out
  }
  return (): FuzzRequest => ({
    method: random() < 0.05 ? pick(['HEAD', 'POST', 'OPTIONS', 'PUT', 'TRACE', 'CONNECT']) : 'GET',
    path: (random() < 0.35 ? payloadPath() : pagePath()) + search(),
    headers: headers(),
  })
}

function offOrigin(location: string, origin: string): boolean {
  try {
    return new URL(location, `${origin}/`).origin !== origin
  } catch {
    return true
  }
}

/** Everything a raw response gives away, as finding names. Exported for its test. */
export function judge(raw: string, request: FuzzRequest, port: number): string[] {
  const end = raw.indexOf('\r\n\r\n')
  const head = raw.slice(0, end)
  const body = raw.slice(end + 4)
  const status = Number(head.slice(9, 12))
  const lines = head.split('\r\n')
  const findings: string[] = status >= 500 ? [`status-${status}`] : []
  const location = lines
    .find((line) => /^location:/i.test(line))
    ?.slice(9)
    .trim()
  if (location !== undefined && offOrigin(location, `http://127.0.0.1:${port}`)) findings.push('off-origin-location')
  if (lines.some((line) => /^(x:|set-cookie: *x=)/i.test(line))) findings.push('header-injection')
  if (raw.includes('<img src=x') && !request.path.includes('__nuxt_error')) findings.push('reflected-raw')
  if (/root:.*:0:0:/.test(body)) findings.push('path-traversal')
  if (status >= 400 && /\/Users\/|node_modules|at async |at Object\./.test(body)) findings.push('stack-leak')
  if (lines.some((line) => /^set-cookie:/i.test(line) && /zq7|<img|__proto__/.test(line))) findings.push('bad-cookie')
  return findings
}

/** A raw socket: `fetch` would normalise the path and the headers on the way. */
function send({ method, path, headers }: FuzzRequest, port: number): Promise<string | null> {
  return new Promise((resolve) => {
    const socket = net.connect(port, '127.0.0.1')
    const chunks: Buffer[] = []
    let size = 0
    const done = (answer: string | null) => {
      socket.destroy()
      resolve(answer)
    }
    socket.setTimeout(10_000, () => done(null))
    socket.on('error', () => done(null))
    socket.on('data', (chunk) => {
      if (size < 400_000) chunks.push(chunk)
      size += chunk.length
    })
    socket.on('end', () => done(Buffer.concat(chunks).toString('latin1')))
    socket.write(`${method} ${path} HTTP/1.1\r\n${headers.map((line) => `${line}\r\n`).join('')}Connection: close\r\n\r\n`, 'latin1')
  })
}

async function fuzzServer(app: string, strategy: string, requests: number, seed: number, port: number): Promise<Record<string, number>> {
  const counts: Record<string, number> = {}
  const count = (finding: string) => {
    counts[finding] = (counts[finding] ?? 0) + 1
  }
  const server = spawn('node', ['.output/server/index.mjs'], {
    cwd: app,
    stdio: 'ignore',
    env: { ...process.env, PORT: String(port), NITRO_HOST: '127.0.0.1', NODE_ENV: 'production' },
  })
  server.on('exit', (code, signal) => {
    if (!server.killed) count(`crash(${code ?? signal})`)
  })
  for (let tries = 0; tries < 100; tries++) {
    if (await fetch(`http://127.0.0.1:${port}/`, { redirect: 'manual' }).catch(() => null)) break
    await new Promise((done) => setTimeout(done, 100))
  }

  const next = createGenerator(seed, port)
  let sent = 0
  const worker = async () => {
    while (sent++ < requests && server.exitCode === null) {
      const request = next()
      const raw = await send(request, port)
      if (raw === null) count('no-answer')
      else judge(raw, request, port).forEach(count)
    }
  }
  await Promise.all(Array.from({ length: 16 }, worker))
  server.kill('SIGKILL')
  console.log(`${strategy}: ${Math.min(sent, requests)} requests, ${JSON.stringify(counts)}`)
  return counts
}

export const httpFuzzCommand = defineCommand({
  meta: {
    name: 'http-fuzz',
    description: [
      'Hostile HTTP against a production build of the smoke app, one build per strategy, over raw sockets.',
      '',
      'Fails on an off-origin redirect, header injection, reflected HTML, path traversal, a stack in a body,',
      'a bad cookie or a crash. 5xx counts are printed only: plain Nuxt gives some on `//…` paths too.',
      '',
      'A release check, not CI: about 10 minutes, and macOS loopback stalls under close-per-request traffic.',
      'Needs `dist` built everywhere (`pnpm run prepack`) and the network.',
      '',
      'Examples:',
      '  pnpm run test:fuzz',
      '  pnpm run test:fuzz --requests 20000 --seed 2 --strategy prefix',
    ].join('\n'),
  },
  args: {
    requests: { type: 'string', default: '6000', description: 'Requests per strategy' },
    seed: { type: 'string', default: '1', description: 'Same seed, same requests' },
    strategy: { type: 'string', description: `One of ${STRATEGIES.join(', ')} (default: all)` },
    dir: { type: 'string', description: 'Working directory (default: a new temp folder)' },
  },
  async setup({ args }) {
    const root = args.dir ?? mkdtempSync(join(tmpdir(), 'i18n-fuzz-'))
    const app = join(root, 'app')
    const ours = Object.fromEntries(
      packWorkspace(join(root, 'tarballs'), { ignoreScripts: true }).map(({ name, tarball }) => [name, `file:${tarball}`]),
    )
    cpSync(join(repoRoot, 'test/deploy-smoke'), app, { recursive: true, filter: (from) => !/node_modules|\.nuxt|\.output/.test(from) })
    writeConsumerProject(app, { nuxt: '^4.6.4', vue: '^3.5.43', 'vue-router': '^5.0.0', 'nuxt-i18n-micro': ours['nuxt-i18n-micro']! }, ours)

    const step = (command: string, stepArgs: string[], env: NodeJS.ProcessEnv = {}) => {
      const result = spawnSync(command, stepArgs, { cwd: app, stdio: 'inherit', timeout: 280_000, env: { ...process.env, CI: '1', ...env } })
      if (result.status !== 0) throw new Error(`${command} ${stepArgs.join(' ')} failed`)
    }
    step('pnpm', CONSUMER_INSTALL)

    const failures: string[] = []
    for (const [index, strategy] of (args.strategy ? [args.strategy] : STRATEGIES).entries()) {
      // no metaBaseUrl: the request's own headers then reach the SEO tags, the code worth attacking
      step(join(app, 'node_modules/.bin/nuxt'), ['build'], { SMOKE_STRATEGY: strategy, SMOKE_NO_META_BASE_URL: '1' })
      const counts = await fuzzServer(app, strategy, Number(args.requests), Number(args.seed), 8860 + index)
      failures.push(
        ...Object.keys(counts)
          .filter((finding) => VIOLATIONS.some((name) => finding.startsWith(name)))
          .map((finding) => `${strategy}: ${finding} x${counts[finding]}`),
      )
    }
    if (!args.dir) rmSync(root, { recursive: true, force: true })
    if (failures.length === 0) return
    console.error(`\n${failures.length} violation(s):\n${failures.join('\n')}`)
    process.exit(1)
  },
})
