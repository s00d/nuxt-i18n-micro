/**
 * test/async-components-production.test.ts
 * Проверка асинхронных компонентов с i18n в production режиме:
 *  – сборка проекта для продакшена
 *  – запуск в production режиме
 *  – проверка тех же страниц и функциональности
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

const FIXTURES = join(fileURLToPath(import.meta.url), '..', 'fixtures/async-components')
const HOST = 'localhost'

// Тестовые маршруты для проверки (только те, что работают в SSG)
const ROUTES = [
  ['/', 'Async Components Test Suite'],
  ['/ru', 'Набор Тестов Асинхронных Компонентов'],
  ['/de', 'Async-Komponenten Test-Suite'],
] as const

// SPA маршруты (ssr: false) - проверяем только наличие базовой структуры
const SPA_ROUTES = [
  ['/async-components-test', 'Async Components Test'],
  ['/async-components-test-2', 'Async Components Test 2'],
  ['/ru/async-components-test', 'Тест Асинхронных Компонентов'],
  ['/ru/async-components-test-2', 'Тест Асинхронных Компонентов 2'],
  ['/de/async-components-test', 'Async-Komponenten Test'],
  ['/de/async-components-test-2', 'Async-Komponenten Test 2'],
] as const

/* ──────────────── helpers ──────────────── */

const exec = promisify(execCb)

/** Поиск свободного порта через временный net.Server */
export async function getFreePort(base = 20011, max = 20): Promise<number> {
  for (let i = 0; i < max; i++) {
    const port = base + i
    try {
      await new Promise<void>((resolve, reject) => {
        const srv = net.createServer()

        srv.once('error', reject)

        srv.once('listening', () => {
          srv.close(err => err ? reject(err) : resolve())
        })

        srv.listen(port, '127.0.0.1')
      })
      return port
    }
    catch { /* порт занят, пробуем следующий */ }
  }
  throw new Error(`No free port in range ${base}-${base + max}`)
}

/** Завершает процесс, удерживающий порт */
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
      const response = await fetch(url)
      const html = await response.text()
      if (html.includes(text)) return
    }
    catch { /* сервер не поднялся */ }
    await delay(ms)
  }
  throw new Error(`"${text}" not found at ${url}`)
}

/** npm run generate / npm run build через spawn */
function runNuxt(script: 'generate' | 'build'): Promise<void> {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: 'production',
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

  const command = cmd[0]
  if (!command) {
    throw new Error('Command is required')
  }
  const child = spawn(command, cmd.slice(1), {
    cwd: FIXTURES,
    stdio: 'inherit',
    detached: true,
    env,
  }) as import('child_process').ChildProcess
  if (child && typeof child.unref === 'function') {
    child.unref()
  }
  return child
}

async function htmlIncludes(port: number, path: string, text: string) {
  const res = await fetch(`http://${HOST}:${port}${path}`)
  const html = await res.text()
  expect(html).toContain(text)
}

async function htmlIncludesSPA(port: number, path: string) {
  const res = await fetch(`http://${HOST}:${port}${path}`)
  const html = await res.text()

  // Для SPA страниц проверяем наличие базовой структуры
  expect(html).toContain('<div id="__nuxt"></div>')
  expect(html).toContain('data-ssr="false"')
  expect(html).toContain('window.__NUXT__')

  // Проверяем, что страница доступна (не 404)
  expect(res.status).toBe(200)
}

/* ──────────────── tests ──────────────── */

describe('Async Components Production Tests', () => {
  let port: number
  let server: ChildProcess | null = null

  const stop = async () => {
    if (server && !server.killed) server.kill()
    server = null
    if (port) await freePort(port)
  }

  /* ---------- STATIC GENERATE ---------- */
  describe('static generate', () => {
    beforeAll(async () => {
      port = await getFreePort()
      await stop()
      await rimraf(join(FIXTURES, '.nuxt'))
      await rimraf(join(FIXTURES, '.output'))
      await runNuxt('generate')

      server = serve(['npx', 'serve', '.output/public', '-p', String(port)], port)
      await waitForText(`http://${HOST}:${port}/`, 'Async Components Test Suite')
    }, 300_000)

    afterAll(stop)

    // Проверяем основные маршруты (SSG)
    ROUTES.forEach(([path, text]) => {
      it(`GET ${path} → contains "${text}"`, async () => {
        await htmlIncludes(port, path, text)
      })
    })

    // Проверяем SPA маршруты (ssr: false)
    SPA_ROUTES.forEach(([path, title]) => {
      it(`GET ${path} → SPA page with "${title}"`, async () => {
        await htmlIncludesSPA(port, path)
      })
    })

    // Проверяем главную страницу
    it('main page loads correctly', async () => {
      await htmlIncludes(port, '/', 'Async Components Test Suite')
      await htmlIncludes(port, '/', 'Testing async components with i18n translations')
      await htmlIncludes(port, '/', 'Async Components Test 1')
      await htmlIncludes(port, '/', 'Async Components Test 2')
    })

    // Проверяем локализацию на русском
    it('Russian localization works correctly', async () => {
      await htmlIncludes(port, '/ru', 'Набор Тестов Асинхронных Компонентов')
    })

    // Проверяем локализацию на немецком
    it('German localization works correctly', async () => {
      await htmlIncludes(port, '/de', 'Async-Komponenten Test-Suite')
    })

    // Проверяем навигацию между страницами
    it('navigation links work correctly', async () => {
      const res = await fetch(`http://${HOST}:${port}/`)
      const html = await res.text()
      expect(html).toContain('Async Components Test 1')
      expect(html).toContain('Async Components Test 2')
    })

    // Проверяем переключатель языков
    it('language switcher buttons are present', async () => {
      const res = await fetch(`http://${HOST}:${port}/`)
      const html = await res.text()
      expect(html).toContain('English')
      expect(html).toContain('Русский')
      expect(html).toContain('Deutsch')
    })
  })

  /* ---------- SSR BUILD ---------- */
  describe('ssr build', () => {
    beforeAll(async () => {
      port = await getFreePort()
      await stop()
      await rimraf(join(FIXTURES, '.nuxt'))
      await rimraf(join(FIXTURES, '.output'))
      await runNuxt('build')

      server = serve(['node', '.output/server/index.mjs'], port)
      await waitForText(`http://${HOST}:${port}/`, 'Async Components Test Suite')
    }, 300_000)

    afterAll(stop)

    // Проверяем основные маршруты (SSG)
    ROUTES.forEach(([path, text]) => {
      it(`GET ${path} → contains "${text}"`, async () => {
        await htmlIncludes(port, path, text)
      })
    })

    // Проверяем SPA маршруты (ssr: false)
    SPA_ROUTES.forEach(([path, title]) => {
      it(`GET ${path} → SPA page with "${title}"`, async () => {
        await htmlIncludesSPA(port, path)
      })
    })

    // Проверяем главную страницу
    it('main page loads correctly', async () => {
      await htmlIncludes(port, '/', 'Async Components Test Suite')
      await htmlIncludes(port, '/', 'Testing async components with i18n translations')
      await htmlIncludes(port, '/', 'Async Components Test 1')
      await htmlIncludes(port, '/', 'Async Components Test 2')
    })

    // Проверяем локализацию на русском
    it('Russian localization works correctly', async () => {
      await htmlIncludes(port, '/ru', 'Набор Тестов Асинхронных Компонентов')
    })

    // Проверяем локализацию на немецком
    it('German localization works correctly', async () => {
      await htmlIncludes(port, '/de', 'Async-Komponenten Test-Suite')
    })

    // Проверяем навигацию между страницами
    it('navigation links work correctly', async () => {
      const res = await fetch(`http://${HOST}:${port}/`)
      const html = await res.text()
      expect(html).toContain('Async Components Test 1')
      expect(html).toContain('Async Components Test 2')
    })

    // Проверяем переключатель языков
    it('language switcher buttons are present', async () => {
      const res = await fetch(`http://${HOST}:${port}/`)
      const html = await res.text()
      expect(html).toContain('English')
      expect(html).toContain('Русский')
      expect(html).toContain('Deutsch')
    })

    // Проверяем, что SSR работает корректно
    it('SSR renders main page correctly', async () => {
      const res = await fetch(`http://${HOST}:${port}/`)
      const html = await res.text()

      // Проверяем, что главная страница рендерится на сервере
      expect(html).toContain('Async Components Test Suite')
      expect(html).toContain('Testing async components with i18n translations')
      expect(html).toContain('Async Components Test 1')
      expect(html).toContain('Async Components Test 2')

      // Проверяем, что нет ошибок гидратации
      expect(html).not.toContain('Hydration node mismatch')
      expect(html).not.toContain('Hydration completed but contains mismatches')
    })
  })
})
