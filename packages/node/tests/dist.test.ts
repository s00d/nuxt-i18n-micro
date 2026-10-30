import { expect, test } from 'vitest'
// @ts-expect-error the built file, as a user gets it: a bundled `node:*` import fails here, not in the source
import { createI18n } from '../dist/index.mjs'

test('the published build keeps node builtins external: run() works', async () => {
  const i18n = createI18n({ locale: 'en', messages: { en: { hi: 'Hello' }, de: { hi: 'Hallo' } }, missingWarn: false })
  expect(await i18n.run('de', async () => i18n.t('hi'))).toBe('Hallo')
})
