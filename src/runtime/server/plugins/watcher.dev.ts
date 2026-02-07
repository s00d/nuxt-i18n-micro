// src/runtime/server/plugins/watcher.dev.ts

import path from 'node:path'
import { type FSWatcher, watch } from 'chokidar'
import type { NitroApp } from 'nitropack'
import { defineNitroPlugin } from 'nitropack/runtime'
import { getI18nPrivateConfig } from '#i18n-internal/config'

// Используем тот же ключ что и в server-loader.ts
const CACHE_KEY = Symbol.for('__NUXT_I18N_SERVER_CACHE__')
type ServerCache = Map<string, unknown>
type GlobalWithCache = typeof globalThis & { [key: symbol]: ServerCache }

function getCache(): ServerCache {
  const g = globalThis as GlobalWithCache
  if (!g[CACHE_KEY]) {
    g[CACHE_KEY] = new Map()
  }
  return g[CACHE_KEY]
}

let watcherInstance: FSWatcher | null = null

export default defineNitroPlugin((nitroApp: NitroApp) => {
  if (watcherInstance) {
    return
  }

  const i18nConfig = getI18nPrivateConfig()

  if (process.env.NODE_ENV !== 'development') {
    return
  }

  const log = (...args: unknown[]) => i18nConfig.debug && console.log('[i18n-hmr]', ...args)
  const warn = (...args: unknown[]) => i18nConfig.debug && console.warn('[i18n-hmr]', ...args)

  const routesLocaleLinks = i18nConfig.routesLocaleLinks || {}
  const translationsRoot = path.resolve(i18nConfig.rootDir, i18nConfig.translationDir)
  log(`Watching for translation changes in: ${translationsRoot}`)

  const invalidateCache = async (filePath: string) => {
    if (!filePath.endsWith('.json')) return

    const relativePath = path.relative(translationsRoot, filePath).replace(/\\/g, '/')
    const isPageTranslation = relativePath.startsWith('pages/')
    const cache = getCache()

    try {
      if (isPageTranslation) {
        const match = relativePath.match(/^pages\/([^/]+)\/(.+)\.json$/)
        if (!match) return

        const filePageName = match[1]
        const locale = match[2]

        const aliases = Object.keys(routesLocaleLinks).filter((alias) => routesLocaleLinks[alias] === filePageName)
        const targets = [filePageName, ...aliases]

        let removed = 0
        for (const key of cache.keys()) {
          const parts = key.split(':')
          if (parts.length === 2 && targets.includes(parts[1]) && parts[0] === locale) {
            cache.delete(key)
            removed++
          }
          // Также проверяем формат locale:routeName
          if (parts[0] === locale && targets.includes(parts[1] || '')) {
            cache.delete(key)
            removed++
          }
        }

        if (removed > 0) {
          log(
            `Invalidated page cache for '${filePageName}:${locale}' (including aliases: ${aliases.join(', ') || 'none'}). Removed ${removed} entries.`,
          )
        }
      } else {
        const match = relativePath.match(/^([^/]+)\.json$/)
        if (!match) return

        const locale = match[1]

        let removed = 0
        for (const key of cache.keys()) {
          if (key.startsWith(`${locale}:`)) {
            cache.delete(key)
            removed++
          }
        }

        if (removed > 0) {
          log(`Invalidated ALL page caches for locale '${locale}'. Removed ${removed} entries.`)
        }
      }
    } catch (e) {
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
