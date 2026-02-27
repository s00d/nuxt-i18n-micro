// src/runtime/server/plugins/watcher.dev.ts

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { type FSWatcher, watch } from 'chokidar'
import type { NitroApp } from 'nitropack'
import { defineNitroPlugin } from 'nitropack/runtime'
import { getI18nPrivateConfig } from '#i18n-internal/config'
import { CacheControl } from '../../utils/cache-control'

// Must match keys used in server-loader.ts and storage.ts
const SERVER_CC_KEY = Symbol.for('__NUXT_I18N_SERVER_CACHE_CC__')
const STORAGE_CC_KEY = Symbol.for('__NUXT_I18N_STORAGE_CC__')
type GlobalWithCC = typeof globalThis & { [key: symbol]: unknown }

interface CacheLike {
  keys(): IterableIterator<string>
  delete(key: string): boolean
  set(key: string, value: unknown): void
  clear(): void
}

function getCacheByKey(key: symbol): CacheLike | null {
  const g = globalThis as GlobalWithCC
  const cc = g[key]
  if (cc && typeof cc === 'object' && 'keys' in (cc as object) && 'set' in (cc as object)) {
    return cc as CacheLike
  }
  return null
}

function getServerCache(): CacheLike | null {
  return getCacheByKey(SERVER_CC_KEY)
}

function getOrCreateServerCache(): CacheLike {
  const existing = getServerCache()
  if (existing) {
    return existing
  }
  const g = globalThis as GlobalWithCC
  const created = new CacheControl<{ data: Record<string, unknown>; json: string }>()
  g[SERVER_CC_KEY] = created
  return created
}

function getStorageCache(): CacheLike | null {
  return getCacheByKey(STORAGE_CC_KEY)
}

function readJsonSafe(filePath: string): Record<string, unknown> {
  try {
    if (existsSync(filePath)) {
      return JSON.parse(readFileSync(filePath, 'utf-8'))
    }
  } catch {
    /* skip */
  }
  return {}
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...target }
  for (const key in source) {
    if (key === '__proto__' || key === 'constructor') continue
    const src = source[key]
    const dst = result[key]
    if (src !== null && typeof src === 'object' && !Array.isArray(src) && dst !== null && typeof dst === 'object' && !Array.isArray(dst)) {
      result[key] = { ...(dst as Record<string, unknown>), ...(src as Record<string, unknown>) }
    } else {
      result[key] = src
    }
  }
  return result
}

function buildCacheEntry(data: Record<string, unknown>): { data: Record<string, unknown>; json: string } {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return { data, json }
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
  const rawLocales = (i18nConfig as { locales?: Array<{ code?: string }> }).locales
  const configuredLocales = new Set(
    (Array.isArray(rawLocales) ? rawLocales : []).map((l) => l.code).filter((code): code is string => typeof code === 'string' && code.length > 0),
  )

  const routesLocaleLinks = i18nConfig.routesLocaleLinks || {}
  const translationsRoot = path.resolve(i18nConfig.rootDir, i18nConfig.translationDir)
  log(`Watching for translation changes in: ${translationsRoot}`)

  function mergeAndSet(serverCache: CacheLike, locale: string, pageName: string): void {
    const rootData = readJsonSafe(path.join(translationsRoot, `${locale}.json`))
    const pageData = readJsonSafe(path.join(translationsRoot, 'pages', pageName, `${locale}.json`))
    const merged = deepMerge(rootData, pageData)
    const cacheKey = `${locale}:${pageName}`

    // Update server-loader cache (used by API route /_locales/...)
    serverCache.set(cacheKey, buildCacheEntry(merged))

    // Clear TranslationStorage cache (used by plugin during SSR)
    // so the next SSR request re-fetches from the API route and gets fresh data
    const storageCache = getStorageCache()
    if (storageCache) {
      storageCache.delete(cacheKey)
    }

    log(`Re-merged and cached '${cacheKey}'`)

    // Also update aliases that point to this page
    const aliases = Object.keys(routesLocaleLinks).filter((alias) => routesLocaleLinks[alias] === pageName)
    for (const alias of aliases) {
      const aliasKey = `${locale}:${alias}`
      serverCache.set(aliasKey, buildCacheEntry(merged))
      if (storageCache) {
        storageCache.delete(aliasKey)
      }
      log(`Re-merged and cached alias '${aliasKey}'`)
    }
  }

  const invalidateAndRefresh = async (filePath: string, event: 'add' | 'change' | 'unlink') => {
    if (!filePath.endsWith('.json')) return

    const relativePath = path.relative(translationsRoot, filePath).replace(/\\/g, '/')
    const isPageTranslation = relativePath.startsWith('pages/')
    const serverCache = getOrCreateServerCache()

    try {
      if (isPageTranslation) {
        const match = relativePath.match(/^pages\/(.+)\/([^/]+)\.json$/)
        if (!match || !match[1] || !match[2]) return

        const pageName = match[1]
        const locale = match[2]

        mergeAndSet(serverCache, locale, pageName)
      } else {
        // Root file changed — re-merge all pages for this locale
        const match = relativePath.match(/^([^/]+)\.json$/)
        if (!match || !match[1]) return

        const locale = match[1]
        if (!configuredLocales.has(locale)) {
          warn(`Detected ${event} for '${relativePath}', but locale '${locale}' is not in i18n.locales. Update config and restart dev server.`)
          return
        }
        const pagesDir = path.join(translationsRoot, 'pages')

        // Re-merge every known page for this locale
        if (existsSync(pagesDir)) {
          const pageDirs = readdirSync(pagesDir, { withFileTypes: true })
            .filter((d) => d.isDirectory())
            .map((d) => d.name)

          for (const pageName of pageDirs) {
            mergeAndSet(serverCache, locale, pageName)
          }
        }

        // Also re-merge 'index' (root-only pages that don't have a pages/ subdir)
        mergeAndSet(serverCache, locale, 'index')

        log(`Re-merged ALL pages for locale '${locale}'`)
      }
    } catch (e) {
      warn('Failed to refresh server cache for', filePath, e)
    }
  }

  const watcher = watch(translationsRoot, { persistent: true, ignoreInitial: true, depth: 5 })
  watcher.on('add', (filePath) => invalidateAndRefresh(filePath, 'add'))
  watcher.on('change', (filePath) => invalidateAndRefresh(filePath, 'change'))
  watcher.on('unlink', (filePath) => invalidateAndRefresh(filePath, 'unlink'))

  watcherInstance = watcher

  nitroApp.hooks.hook('close', async () => {
    if (watcherInstance) {
      await watcherInstance.close()
      watcherInstance = null
    }
  })
})
