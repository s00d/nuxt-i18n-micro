#!/usr/bin/env node
/**
 * Node createI18n: root + page-scoped keys + path helpers.
 * Run: pnpm -C playground node-helpers
 */
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createI18n } from '@i18n-micro/vitepress/node'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  translationDir: resolve(rootDir, 'locales'),
  locales: ['en', 'fr', 'de'],
  defaultLocale: 'en',
})
await i18n.loadTranslations()

console.log('--- root ---')
for (const locale of ['en', 'fr', 'de']) {
  i18n.locale = locale
  i18n.setRoute('index')
  console.log(`[${locale}] demo.intro =`, i18n.t('demo.intro'))
  console.log(`[${locale}] greeting =`, i18n.t('greeting', { name: 'Gen' }))
}

console.log('--- page guide-demo ---')
for (const locale of ['en', 'fr', 'de']) {
  i18n.locale = locale
  i18n.setRoute('guide-demo')
  console.log(`[${locale}] pageNote =`, i18n.t('pageNote'))
  console.log(`[${locale}] demo.intro (merged) =`, i18n.t('demo.intro'))
}

console.log('--- paths ---')
console.log('localize /guide → fr =', i18n.localizePath('/guide', 'fr'))
console.log('localize /guide → de =', i18n.localizePath('/guide', 'de'))
console.log('switch /fr/guide → en =', i18n.switchLocalePath('/fr/guide', 'en'))
console.log('routeName /de/guide/demo =', i18n.routeNameFromPath('/de/guide/demo'))
