import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pollUntil } from './sequential'

export const translationWatcherFixtureRoot = fileURLToPath(new URL('../fixtures/translation-watcher', import.meta.url))

export const translationWatcherSourceFixtureRoot = fileURLToPath(new URL('../fixtures/translation-watcher-source', import.meta.url))

/**
 * File mutations bound to one fixture.
 *
 * These suites edit translation files on disk to trigger the dev watcher, so each
 * spec must own its files: the two HMR specs assert different values for the same
 * key and now run in parallel. (Both used to write into the premerged fixture —
 * the source fixture's `locales` was a symlink to it — which only stayed green
 * while the suite ran serially.)
 */
export function createTranslationWatcherFiles(fixtureRoot: string, localesDirName = 'locales') {
  const localesRoot = join(fixtureRoot, localesDirName)
  const backups = new Map<string, string>()

  const resolveLocaleFile = (relativePath: string): string => join(localesRoot, relativePath)
  const resolveFixtureFile = (relativePath: string): string => join(fixtureRoot, relativePath)

  const backupFile = (filePath: string): void => {
    if (!backups.has(filePath)) {
      backups.set(filePath, readFileSync(filePath, 'utf-8'))
    }
  }

  return {
    /** Read → patch → write one locale file under the primary translationDir, keeping a backup for restore. */
    patchFile(relativePath: string, patch: (current: Record<string, unknown>) => Record<string, unknown>): Record<string, unknown> {
      const filePath = resolveLocaleFile(relativePath)
      const current = JSON.parse(readFileSync(filePath, 'utf-8')) as Record<string, unknown>
      const next = patch(current)
      backupFile(filePath)
      writeFileSync(filePath, `${JSON.stringify(next, null, 2)}\n`)
      return next
    },

    /**
     * Patch any JSON file relative to the fixture root (e.g. `common/en.json` for
     * `additionalTranslationDirs`).
     */
    patchFixtureFile(relativePath: string, patch: (current: Record<string, unknown>) => Record<string, unknown>): Record<string, unknown> {
      const filePath = resolveFixtureFile(relativePath)
      const current = JSON.parse(readFileSync(filePath, 'utf-8')) as Record<string, unknown>
      const next = patch(current)
      backupFile(filePath)
      writeFileSync(filePath, `${JSON.stringify(next, null, 2)}\n`)
      return next
    },

    /** Restore every file this instance touched (call from afterAll). */
    restoreAll(): void {
      for (const [filePath, content] of backups) {
        writeFileSync(filePath, content)
      }
      backups.clear()
    },
  }
}

/**
 * Dev-mode HMR is inherently slow to observe: a file write has to reach the
 * watcher, re-merge translations and be served again. On a busy CI runner (specs
 * run in parallel, several Nuxt processes competing for 4 cores) that regularly
 * exceeds 20s. Polling returns as soon as the value appears, so a generous
 * ceiling costs nothing on a healthy run and only prevents load-induced flakes.
 */
const HMR_POLL_TIMEOUT_MS = 60_000

export async function waitForTranslationPayloadValue(
  baseURL: string,
  page: string,
  locale: string,
  key: string,
  expected: string,
  timeoutMs = HMR_POLL_TIMEOUT_MS,
): Promise<void> {
  const normalizedBase = baseURL.endsWith('/') ? baseURL : `${baseURL}/`
  const url = new URL(`_locales/${page}/${locale}/data.json`, normalizedBase)

  await pollUntil(
    async () => {
      const response = await fetch(url)
      if (!response.ok) return false
      const data = (await response.json()) as Record<string, string>
      return data[key] === expected
    },
    { timeoutMs, message: `Timed out waiting for ${url.toString()} key "${key}" to become "${expected}"` },
  )
}

export async function waitForTranslationHtmlValue(
  pageUrl: string,
  selector: string,
  expected: string,
  timeoutMs = HMR_POLL_TIMEOUT_MS,
): Promise<void> {
  const elementId = selector.startsWith('#') ? selector.slice(1) : selector
  const escaped = expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = new RegExp(`id="${elementId}"[^>]*>\\s*${escaped}\\s*<`)

  await pollUntil(
    async () => {
      const html = await fetch(pageUrl).then((response) => response.text())
      return pattern.test(html)
    },
    { timeoutMs, message: `Timed out waiting for SSR ${pageUrl} ${selector}="${expected}"` },
  )
}

type GotoWaitUntil = 'commit' | 'domcontentloaded' | 'load' | 'networkidle' | 'hydration'

/**
 * Re-navigate after locale HMR. Avoid page.reload(networkidle) in dev — HMR keeps
 * sockets open and Nitro may restart, which aborts reload on CI.
 */
export async function refreshTranslationWatcherPage(
  goto: (path: string, options?: { waitUntil?: GotoWaitUntil }) => Promise<unknown>,
  path: string,
): Promise<void> {
  let lastError: unknown

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await goto(path, { waitUntil: 'hydration' })
      return
    } catch (error) {
      lastError = error
      await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)))
    }
  }

  throw lastError
}
