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

  // Get routesLocaleLinks for alias resolution
  const routesLocaleLinks = i18nConfig.routesLocaleLinks || {}

  // rootDir is correct (path to playground)
  const translationsRoot = path.resolve(i18nConfig.rootDir, i18nConfig.translationDir)
  log(`Watching for translation changes in: ${translationsRoot}`)

  // Use cache storage (read-write) instead of assets:server (read-only)
  const cacheStorage = useStorage('cache')

  const invalidateCache = async (filePath: string) => {
    if (!filePath.endsWith('.json')) return

    const relativePath = path.relative(translationsRoot, filePath).replace(/\\/g, '/')
    const isPageTranslation = relativePath.startsWith('pages/')

    try {
      // New key format: i18n:{dateBuild}:{page}:{locale}
      // In dev mode invalidate all versions for the changed file
      const allKeys = await cacheStorage.getKeys('i18n:')

      if (isPageTranslation) {
        // --- CASE 1: Page translation file changed (e.g., 'pages/contact/ru.json') ---
        const match = relativePath.match(/^pages\/([^/]+)\/(.+)\.json$/)
        if (!match) return

        const filePageName = match[1] // Real file name (e.g., 'about')
        const locale = match[2]

        // Find all aliases that point to this file page name
        // For example, if routesLocaleLinks has 'about-us': 'about', we need to find 'about-us'
        const aliases = Object.keys(routesLocaleLinks).filter(
          alias => routesLocaleLinks[alias] === filePageName,
        )

        // Add the file page name itself to the list of targets
        const targets = [filePageName, ...aliases]

        // Filter keys where pageName matches ANY of the targets
        // Cache keys use the alias (from URL), so we need to check both the file name and all aliases
        const keysToRemove = allKeys.filter((key: string) => {
          const parts = key.split(':')
          // parts[2] is the page from URL (can be an alias)
          return parts.length === 4 && parts[0] === 'i18n' && targets.includes(parts[2]) && parts[3] === locale
        })

        if (keysToRemove.length > 0) {
          await Promise.all(keysToRemove.map((key: string) => cacheStorage.removeItem(key)))
          log(`Invalidated page cache for '${filePageName}:${locale}' (including aliases: ${aliases.join(', ') || 'none'}). Removed ${keysToRemove.length} entries.`)
        }
      }
      else {
        // --- CASE 2: Global translation file changed (e.g., 'ru.json') ---
        const match = relativePath.match(/^([^/]+)\.json$/)
        if (!match) return

        const locale = match[1]

        // Delete ALL caches for this locale (all pages, all versions)
        // Format: i18n:{dateBuild}:{page}:{locale}
        const keysToRemove = allKeys.filter((key: string) => {
          const parts = key.split(':')
          return parts.length === 4 && parts[0] === 'i18n' && parts[3] === locale
        })

        if (keysToRemove.length > 0) {
          await Promise.all(keysToRemove.map((key: string) => cacheStorage.removeItem(key)))
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
