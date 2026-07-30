// src/runtime/server/plugins/watcher.dev.ts

import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { SERVER_CC_KEY, STORAGE_CC_KEY } from '@i18n-micro/hmr/cache-keys'
import {
  handleTranslationWatchChange,
  parseTranslationWatchRelativePath,
  readTranslationFile,
  TranslationContentTracker,
} from '@i18n-micro/hmr/watcher'
import type { ModuleOptionsExtend } from '@i18n-micro/types'
import { CacheControl } from '@i18n-micro/utils/cache-control'
import { type FSWatcher, watch } from 'chokidar'
import type { NitroApp } from 'nitropack'
import { defineNitroPlugin } from 'nitropack/runtime'
import { getI18nPrivateConfig } from '#i18n-internal/config'
import { getI18nConfig } from '#i18n-internal/strategy'

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

  // A write event says nothing about the content having changed.
  const contentTracker = new TranslationContentTracker()

  const invalidateAndRefresh = async (filePath: string, event: 'add' | 'change' | 'unlink') => {
    const relativePath = path.relative(translationsRoot, filePath).replace(/\\/g, '/')

    if (event === 'unlink') {
      contentTracker.forget(filePath)
    } else if (!contentTracker.shouldProcess(filePath)) {
      return
    }

    const runtimeConfig: ModuleOptionsExtend = getI18nConfig() as ModuleOptionsExtend

    try {
      const result = await handleTranslationWatchChange({
        relativePath,
        configuredLocales,
        listPageNames: () => {
          const pagesDir = path.join(translationsRoot, 'pages')
          if (!existsSync(pagesDir)) {
            return []
          }

          return readdirSync(pagesDir, { withFileTypes: true })
            .filter((entry) => entry.isDirectory())
            .map((entry) => entry.name)
        },
        serverCache: getOrCreateServerCache(),
        storageCache: getStorageCache(),
        routesLocaleLinks,
        mergeInput: {
          translationPayloadMode: runtimeConfig.translationPayloadMode,
          locales: runtimeConfig.locales,
          fallbackLocale: runtimeConfig.fallbackLocale,
          disablePageLocales: runtimeConfig.disablePageLocales,
          readLocaleFile: (relativeFilePath) => readTranslationFile(path.join(translationsRoot, relativeFilePath)),
        },
      })

      if (result === 'root') {
        const parsed = parseTranslationWatchRelativePath(relativePath)
        if (parsed.type === 'root') {
          log(`Re-merged ALL pages for locale '${parsed.locale}'`)
        }
      } else if (result === 'page') {
        log(`Re-merged page cache for '${relativePath}'`)
      } else if (result === 'ignored') {
        const parsed = parseTranslationWatchRelativePath(relativePath)
        if (parsed.type === 'root' && !configuredLocales.has(parsed.locale)) {
          warn(`Detected ${event} for '${relativePath}', but locale '${parsed.locale}' is not in i18n.locales. Update config and restart dev server.`)
        }
      }
    } catch (e) {
      // The cache still holds the last good merge, and the hash is dropped so the next
      // event for this file is processed even if its contents are unchanged by then —
      // otherwise a single failed read would freeze the page on its stale chunk.
      contentTracker.forget(filePath)
      warn('Failed to refresh server cache for', filePath, e)
    }
  }

  // `awaitWriteFinish`: a bare `change` event fires as soon as the first bytes land, and
  // reading a half-written locale file is how a chunk loses keys. Waiting for the size to
  // settle costs a few milliseconds of HMR latency and removes the race for both the
  // content hash and the merge.
  const watcher = watch(translationsRoot, {
    persistent: true,
    ignoreInitial: true,
    depth: 5,
    awaitWriteFinish: { stabilityThreshold: 50, pollInterval: 10 },
  })
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
