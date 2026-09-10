import { setupNuxtI18nMock } from '@i18n-micro/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, vi } from 'vitest'

const { i18n, useI18n, setTranslationsFromJson } = setupNuxtI18nMock({
  spy: vi.fn,
  beforeEach,
})

// Keep this call in the setup file so `@nuxt/test-utils` can transform it.
mockNuxtImport('useI18n', () => useI18n)

export { i18n, setTranslationsFromJson }
