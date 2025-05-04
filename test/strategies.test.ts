/**
 * tests/strategies.spec.ts
 * Проверка всех i18n-стратегий Nuxt без сторонних пакетов:
 *  – поиск свободного порта через net.Server
 *  – освобождение порта через lsof / netstat
 *  – глобальный fetch из Node ≥ 18
 */

import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn, type ChildProcess, exec as execCb } from 'node:child_process'
import { promisify } from 'node:util'
import net from 'node:net'
import { setTimeout as delay } from 'node:timers/promises'
import { rimraf } from 'rimraf'
import {
  describe,
  it,
  beforeAll,
  afterAll,
  expect,
} from 'vitest'

/* ──────────────── settings ──────────────── */

const FIXTURES = join(fileURLToPath(import.meta.url), '..', 'fixtures/strategy')
const HOST = 'localhost'

const ROUTES = {
  no_prefix: [
    ['/', 'en'], ['/contact', 'contact'], ['/kontakt', 'contact'],
  ],
  prefix_except_default: [
    ['/', 'en'], ['/ru', 'ru'], ['/de', 'de'],
    ['/ru/contact', 'contact'], ['/de/kontakt', 'contact'],
  ],
  prefix: [
    ['/en', 'en'], ['/ru', 'ru'], ['/de', 'de'],
    ['/en/contact', 'contact'], ['/ru/contact', 'contact'], ['/de/kontakt', 'contact'],
  ],
  prefix_and_default: [
    ['/', 'en'], ['/en', 'en'], ['/ru', 'ru'], ['/de', 'de'],
    ['/en/contact', 'contact'], ['/ru/contact', 'contact'], ['/de/kontakt', 'contact'],
  ],
} as const

/* ──────────────── helpers ──────────────── */

const exec = promisify(execCb)

/** Поиск свободного порта через временный net.Server */
export async function getFreePort(base = 10011, max = 20): Promise<number> {
  for (let i = 0; i < max; i++) {
    const port = base + i
    try {
      await new Promise<void>((resolve, reject) => {
        const srv = net.createServer()

        srv.once('error', reject)

        srv.once('listening', () => {
          // завершаем сервер и резолвим промис, соблюдая сигнатуру (err?: Error)
          srv.close(err => err ? reject(err) : resolve())
        })

        srv.listen(port, '127.0.0.1')
      })
      return port // ← свободный найден
    }
    catch { /* порт занят, пробуем следующий */ }
  }
  throw new Error(`No free port in range ${base}-${base + max}`)
}

/** Завершает процесс, удерживающий порт (Unix и Windows) */
async function freePort(port: number) {
  if (process.platform === 'win32') {
    try {
      const { stdout } = await exec(`netstat -ano | findstr :${port}`)
      const pids = stdout.trim().split('\n')
        .map(l => l.trim().split(/\s+/).pop())
        .filter(Boolean)
      for (const pid of pids)
        await exec(`taskkill /PID ${pid} /F`)
    }
    catch { /* empty */ }
  }
  else {
    try {
      const { stdout } = await exec(`lsof -ti tcp:${port}`)
      for (const pid of stdout.trim().split('\n').filter(Boolean))
        process.kill(Number(pid), 'SIGKILL')
    }
    catch { /* empty */ }
  }
}

/** Ожидаем появления текста на странице */
async function waitForText(url: string, text: string, tries = 40, ms = 500) {
  for (let i = 0; i < tries; i++) {
    try {
      if ((await (await fetch(url)).text()).includes(text)) return
    }
    catch { /* сервер не поднялся */ }
    await delay(ms)
  }
  throw new Error(`"${text}" not found at ${url}`)
}

/** npm run generate / npm run build через spawn */
function runNuxt(script: 'generate' | 'build', strategy: string): Promise<void> {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: 'production',
    STRATEGY: strategy,
  }
  delete env.VITEST
  delete env.VITE_TEST_BUILD
  delete env.TEST
  delete env.JEST

  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'

  return new Promise((resolve, reject) => {
    const child = spawn(npmCmd, ['run', script], {
      cwd: FIXTURES,
      stdio: 'inherit',
      detached: true,
      env,
    })
    child.unref()
    child.on('exit', code =>
      code === 0
        ? resolve()
        : reject(new Error(`npm run ${script} exited with code ${code}`)),
    )
  })
}

/** Запуск статического или SSR-сервера */
function serve(cmd: string[], port: number): ChildProcess {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    PORT: String(port),
    NODE_ENV: 'production',
  }
  delete env.VITEST
  delete env.VITE_TEST_BUILD
  delete env.TEST
  delete env.JEST

  const child = spawn(cmd[0], cmd.slice(1), {
    cwd: FIXTURES,
    stdio: 'inherit',
    detached: true,
    env,
  })
  child.unref()
  return child
}

async function htmlIncludes(port: number, path: string, text: string) {
  const res = await fetch(`http://${HOST}:${port}${path}`)
  expect(await res.text()).toContain(text)
}

/* ──────────────── tests ──────────────── */

describe.each(Object.entries(ROUTES))(
  '[%s] strategy',
  (strategy, routes) => {
    let port: number
    let server: ChildProcess | null = null

    const stop = async () => {
      if (server && !server.killed) server.kill()
      server = null
      if (port) await freePort(port)
    }

    /* ---------- STATIC ---------- */
    describe('static generate', () => {
      beforeAll(async () => {
        port = await getFreePort()
        await stop()
        await rimraf(join(FIXTURES, '.nuxt'))
        await runNuxt('generate', strategy)

        server = serve(['npx', 'serve', '.output/public', '-p', String(port)], port)
        await waitForText(`http://${HOST}:${port}${routes[0][0]}`, routes[0][1])
      }, 300_000)

      afterAll(stop)

      routes.forEach(([path, text]) => {
        it(`GET ${path} → contains "${text}"`, async () => {
          await htmlIncludes(port, path, text)
        })
      })
    })

    /* ---------- SSR ---------- */
    describe('ssr build', () => {
      beforeAll(async () => {
        port = await getFreePort()
        await stop()
        await rimraf(join(FIXTURES, '.nuxt'))
        await runNuxt('build', strategy)

        server = serve(['node', '.output/server/index.mjs'], port)
        await waitForText(`http://${HOST}:${port}${routes[0][0]}`, routes[0][1])
      }, 300_000)

      afterAll(stop)

      routes.forEach(([path, text]) => {
        it(`GET ${path} → contains "${text}"`, async () => {
          await htmlIncludes(port, path, text)
        })
      })
    })
  },
)
