import { join } from 'node:path'
import { createI18n, I18n } from '../src'
import { describe, expect, test, vi } from 'vitest'

describe('I18n (Simple API)', () => {
  const translations = {
    en: {
      greeting: 'Hello, {name}!',
      nested: {
        message: 'This is a nested message.',
      },
      apples: 'no apples|one apple|{count} apples',
      welcome: 'Welcome',
    },
    de: {
      greeting: 'Hallo, {name}!',
      welcome: 'Willkommen',
    },
  }

  describe('loadTranslations', () => {
    test('loads translations from directory structure', async () => {
      // This test would require actual file system setup
      // For now, we test the method exists and doesn't throw
      const i18n = createI18n({
        locale: 'en',
        translationDir: join(__dirname, '../test-locales'),
      })

      // Should not throw even if directory doesn't exist
      await expect(i18n.loadTranslations()).resolves.not.toThrow()
    })
  })

  describe('reload', () => {
    test('does not wipe in-memory messages when translationDir is missing', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const i18n = createI18n({
        locale: 'en',
        messages: { en: { welcome: 'Welcome' } },
      })
      expect(i18n.t('welcome')).toBe('Welcome')
      await i18n.reload()
      expect(i18n.t('welcome')).toBe('Welcome')
      expect(warnSpy).toHaveBeenCalled()
      warnSpy.mockRestore()
    })
  })
})
