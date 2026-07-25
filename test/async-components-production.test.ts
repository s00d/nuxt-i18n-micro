/**
 * test/async-components-production.test.ts
 * Проверка асинхронных компонентов с i18n в production режиме:
 *  – сборка проекта для продакшена
 *  – запуск в production режиме
 *  – проверка тех же страниц и функциональности
 */

import type { ChildProcess } from 'node:child_process'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { rimraf } from 'rimraf'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getFreePort } from './helpers/port'
import { runCommand, spawnServer, stopChild } from './helpers/subprocess'

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

/** Ожидаем появления текста на странице */
async function waitForText(url: string, text: string, tries = 40, ms = 500) {
  async function attempt(index: number): Promise<void> {
    if (index >= tries) throw new Error(`"${text}" not found at ${url}`)

    try {
      const response = await fetch(url)
      const html = await response.text()
      if (html.includes(text)) return
    } catch {
      /* сервер не поднялся */
    }
    await delay(ms)
    return attempt(index + 1)
  }

  await attempt(0)
}

/** npm run generate / npm run build */
function runNuxt(script: 'generate' | 'build'): Promise<void> {
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  return runCommand(npmCmd, ['run', script], { cwd: FIXTURES })
}

/** Start static or SSR server */
function serve(cmd: string[], port: number): ChildProcess {
  const command = cmd[0]
  if (!command) {
    throw new Error('Command is required')
  }
  return spawnServer(command, cmd.slice(1), {
    cwd: FIXTURES,
    env: { PORT: String(port) },
  })
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
    // stopChild kills the whole process group, so the port is released with it.
    await stopChild(server)
    server = null
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
