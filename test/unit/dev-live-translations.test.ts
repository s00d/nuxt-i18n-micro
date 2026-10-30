import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { afterAll, describe, expect, test, vi } from 'vitest'

const root = mkdtempSync(join(tmpdir(), 'i18n-dev-live-'))
mkdirSync(join(root, 'locales'))
writeFileSync(join(root, 'locales/en.json'), '{"only":"en"}')
writeFileSync(join(root, 'locales/de.json'), '{"own":"de"}')

vi.mock('#i18n-internal/config', () => ({
  getI18nPrivateConfig: () => ({ rootDir: root, rootDirs: [root], translationDir: 'locales' }),
}))

describe('loadLiveDevTranslations', () => {
  afterAll(() => rmSync(root, { recursive: true, force: true }))

  test('a fallback on another domain still merges, as in production', async () => {
    const { loadLiveDevTranslations } = await import('../../src/runtime/server/utils/dev-live-translations')
    const linkLocales = [{ code: 'en' }, { code: 'de', fallbackLocale: 'en' }]
    const config = { locales: [linkLocales[1]], linkLocales, disablePageLocales: true } as ModuleOptionsExtend
    expect(await loadLiveDevTranslations('de', 'index', config)).toEqual({ only: 'en', own: 'de' })
  })
})
