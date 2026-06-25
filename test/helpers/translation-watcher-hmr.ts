import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pollUntil } from './sequential'

export const translationWatcherFixtureRoot = fileURLToPath(new URL('../fixtures/translation-watcher', import.meta.url))

export const translationWatcherSourceFixtureRoot = fileURLToPath(new URL('../fixtures/translation-watcher-source', import.meta.url))

const localesRoot = join(translationWatcherFixtureRoot, 'locales')
const backups = new Map<string, string>()

function resolveLocaleFile(relativePath: string): string {
  return join(localesRoot, relativePath)
}

function readLocaleJson(relativePath: string): Record<string, unknown> {
  return JSON.parse(readFileSync(resolveLocaleFile(relativePath), 'utf-8')) as Record<string, unknown>
}

function backupLocaleFile(relativePath: string): void {
  const filePath = resolveLocaleFile(relativePath)
  if (!backups.has(filePath)) {
    backups.set(filePath, readFileSync(filePath, 'utf-8'))
  }
}

function writeLocaleFile(relativePath: string, content: Record<string, unknown>): void {
  backupLocaleFile(relativePath)
  writeFileSync(resolveLocaleFile(relativePath), `${JSON.stringify(content, null, 2)}\n`)
}

export function patchTranslationWatcherFile(
  relativePath: string,
  patch: (current: Record<string, unknown>) => Record<string, unknown>,
): Record<string, unknown> {
  const next = patch(readLocaleJson(relativePath))
  writeLocaleFile(relativePath, next)
  return next
}

export function restoreTranslationWatcherFiles(): void {
  for (const [filePath, content] of backups) {
    writeFileSync(filePath, content)
  }
  backups.clear()
}

export async function waitForTranslationPayloadValue(
  baseURL: string,
  page: string,
  locale: string,
  key: string,
  expected: string,
  timeoutMs = 20_000,
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

export async function waitForTranslationHtmlValue(pageUrl: string, selector: string, expected: string, timeoutMs = 20_000): Promise<void> {
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
