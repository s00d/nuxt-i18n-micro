// src/runtime/server/plugins/watcher.dev.ts

import path from 'node:path'
import { watch, type FSWatcher } from 'chokidar'
import type { ModulePrivateOptionsExtend } from '@i18n-micro/types'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - #imports are available in Nitro
import { useStorage, useRuntimeConfig, defineNitroPlugin } from '#imports'
import type { NitroApp } from 'nitropack'

let watcherInstance: FSWatcher | null = null

export default defineNitroPlugin((nitroApp: NitroApp) => {
  if (watcherInstance) {
    return
  }

  const config = useRuntimeConfig() as { i18nConfig?: ModulePrivateOptionsExtend }
  const i18nConfig = config.i18nConfig

  if (!i18nConfig || process.env.NODE_ENV !== 'development') {
    return
  }

  const log = (...args: unknown[]) => i18nConfig.debug && console.log('[i18n-hmr]', ...args)
  const warn = (...args: unknown[]) => i18nConfig.debug && console.warn('[i18n-hmr]', ...args)

  // rootDir is now correct (path to playground)
  const translationsRoot = path.resolve(i18nConfig.rootDir, i18nConfig.translationDir)
  log(`Watching for translation changes in: ${translationsRoot}`)

  const storage = useStorage('assets:server')

  const invalidateCache = async (filePath: string) => {
    if (!filePath.endsWith('.json')) return

    const relativePath = path.relative(translationsRoot, filePath).replace(/\\/g, '/')
    const isPageTranslation = relativePath.startsWith('pages/')

    try {
      const allKeys = await storage.getKeys('_locales:merged:')

      if (isPageTranslation) {
        // --- CASE 1: Page file changed (e.g., 'pages/contact/ru.json') ---
        const match = relativePath.match(/^pages\/([^/]+)\/(.+)\.json$/)
        if (!match) return

        const pageName = match[1]
        const locale = match[2]
        const keyToRemove = `_locales:merged:${pageName}:${locale}`

        if (allKeys.includes(keyToRemove)) {
          await storage.removeItem(keyToRemove)
          log(`Invalidated page cache: ${keyToRemove}`)
        }
      }
      else {
        // --- CASE 2: Global file changed (e.g., 'ru.json') ---
        const match = relativePath.match(/^([^/]+)\.json$/)
        if (!match) return

        const locale = match[1]

        // Remove ALL merged caches for this locale
        const keysToRemove = allKeys.filter((key: string) => key.endsWith(`:${locale}`))

        if (keysToRemove.length > 0) {
          await Promise.all(keysToRemove.map((key: string) => storage.removeItem(key)))
          log(`Invalidated ALL page caches for locale '${locale}'. Removed ${keysToRemove.length} entries.`)
        }
      }
    }
    catch (e) {
      warn('Failed to invalidate server cache for', filePath, e)
    }
  }

  const watcher = watch(translationsRoot, { persistent: true, ignoreInitial: true, depth: 5 })
  watcher.on('add', invalidateCache)
  watcher.on('change', invalidateCache)
  watcher.on('unlink', invalidateCache)

  watcherInstance = watcher

  nitroApp.hooks.hook('close', async () => {
    if (watcherInstance) {
      await watcherInstance.close()
      watcherInstance = null
    }
  })
})
