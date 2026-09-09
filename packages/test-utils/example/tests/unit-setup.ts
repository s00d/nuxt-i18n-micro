import { createFakeI18n, resetI18n, setTranslationsFromJson } from '@i18n-micro/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { beforeEach, vi } from 'vitest'

const i18n = createFakeI18n({ spy: vi.fn })

mockNuxtImport<() => typeof i18n>('useI18n', () => vi.fn(() => i18n))

beforeEach(() => {
  resetI18n()
})

export { i18n, setTranslationsFromJson }
