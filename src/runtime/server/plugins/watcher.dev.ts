// src/runtime/server/plugins/watcher.dev.ts

import { existsSync } from 'node:fs'
import path from 'node:path'
import { STORAGE_CC_KEY } from '@i18n-micro/hmr/cache-keys'
import { handleTranslationWatchChange, resolveLiveTranslationDirs, TranslationContentTracker } from '@i18n-micro/hmr/watcher'
import { parseTranslationRelativePath } from '@i18n-micro/utils/parse-path'
import { type FSWatcher, watch } from 'chokidar'
import type { NitroApp } from 'nitropack'
import { defineNitroPlugin } from 'nitropack/runtime'
import { getI18nPrivateConfig } from '#i18n-internal/config'
import { getOrCreateServerTranslationCache } from '../utils/server-translation-cache'

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

  const { translationRoots, additionalRoots } = resolveLiveTranslationDirs({
    rootDirs: i18nConfig.rootDirs?.length ? i18nConfig.rootDirs : [i18nConfig.rootDir],
    translationDir: i18nConfig.translationDir,
    additionalTranslationDirs: i18nConfig.additionalTranslationDirs,
  })
  log(`Watching for translation changes in: ${translationRoots.join(', ')}`, additionalRoots.length ? `(+${additionalRoots.length} additional)` : '')

  // A write event says nothing about the content having changed.
  const contentTracker = new TranslationContentTracker()

  const toWatchRelativePath = (filePath: string): string | null => {
    for (const translationsRoot of translationRoots) {
      const fromPrimary = path.relative(translationsRoot, filePath)
      if (!fromPrimary.startsWith('..') && !path.isAbsolute(fromPrimary)) {
        return fromPrimary.replace(/\\/g, '/')
      }
    }
    // Additional dir: only top-level `{locale}.json` participates in the global merge.
    for (const extraRoot of additionalRoots) {
      const fromExtra = path.relative(extraRoot, filePath)
      if (fromExtra.startsWith('..') || path.isAbsolute(fromExtra)) continue
      const normalized = fromExtra.replace(/\\/g, '/')
      if (!normalized.includes('/') && normalized.endsWith('.json')) return normalized
    }
    return null
  }

  const invalidateAndRefresh = async (filePath: string, event: 'add' | 'change' | 'unlink') => {
    const relativePath = toWatchRelativePath(filePath)
    if (!relativePath) return

    if (event === 'unlink') {
      contentTracker.forget(filePath)
    } else if (!contentTracker.shouldProcess(filePath)) {
      return
    }

    try {
      const result = await handleTranslationWatchChange({
        relativePath,
        configuredLocales,
        serverCache: getOrCreateServerTranslationCache(),
        storageCache: getStorageCache(),
      })

      if (result === 'root') {
        const parsed = parseTranslationRelativePath(relativePath)
        if (parsed.type === 'root') {
          log(`Dropped cached translations after a change to '${parsed.locale}'`)
        }
      } else if (result === 'page') {
        log(`Dropped cached translations after a change to '${relativePath}'`)
      } else if (result === 'ignored') {
        const parsed = parseTranslationRelativePath(relativePath)
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
  // Keep primary/layer translation roots even if missing so Chokidar can pick up a
  // directory created after startup. Optional additional dirs stay filtered.
  const watchRoots = [...translationRoots, ...additionalRoots.filter((dir) => existsSync(dir))]
  const watcher = watch(watchRoots, {
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
