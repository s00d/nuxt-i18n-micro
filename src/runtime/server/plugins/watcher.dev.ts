// src/runtime/server/plugins/watcher.dev.ts

import { existsSync } from 'node:fs'
import { STORAGE_CC_KEY } from '../../utils/cache-keys'
import {
  handleTranslationWatchChange,
  resolveLiveTranslationDirs,
  TranslationContentTracker,
  translationRelativePath,
} from '../internal/translation-watcher'
import { type FSWatcher, watch } from 'chokidar'
import type { NitroApp } from 'nitropack'
import { defineNitroPlugin } from 'nitropack/runtime'
import { getI18nPrivateConfig } from '#i18n-internal/config'
import { getOrCreateServerTranslationCache } from '../internal/server-translation-cache'

let watcherInstance: FSWatcher | null = null

export default defineNitroPlugin((nitroApp: NitroApp) => {
  if (watcherInstance) {
    return
  }

  const i18nConfig = getI18nPrivateConfig()
  const log = (...args: unknown[]) => i18nConfig.debug && console.log('[i18n-hmr]', ...args)
  const warn = (...args: unknown[]) => i18nConfig.debug && console.warn('[i18n-hmr]', ...args)
  const configuredLocales = new Set((i18nConfig.locales ?? []).map((l) => l.code))

  const { translationRoots, additionalRoots } = resolveLiveTranslationDirs({
    rootDirs: i18nConfig.rootDirs,
    translationDir: i18nConfig.translationDir,
    additionalTranslationDirs: i18nConfig.additionalTranslationDirs,
  })
  log(`Watching for translation changes in: ${translationRoots.join(', ')}`, additionalRoots.length ? `(+${additionalRoots.length} additional)` : '')

  // A write event says nothing about the content having changed.
  const contentTracker = new TranslationContentTracker()

  const invalidateAndRefresh = async (filePath: string, event: 'add' | 'change' | 'unlink') => {
    const relativePath = translationRelativePath(filePath, { translationRoots, additionalRoots })
    if (!relativePath) return

    if (event === 'unlink') {
      contentTracker.forget(filePath)
    } else if (!contentTracker.shouldProcess(filePath)) {
      return
    }

    try {
      const change = await handleTranslationWatchChange({
        relativePath,
        configuredLocales,
        serverCache: getOrCreateServerTranslationCache(),
        storageCache: (globalThis as unknown as Record<symbol, { clear(): void } | undefined>)[STORAGE_CC_KEY],
      })

      if (change.dropped) {
        log(`Dropped cached translations after a change to '${change.type === 'root' ? change.locale : relativePath}'`)
      } else if (change.type === 'root') {
        warn(`Detected ${event} for '${relativePath}', but locale '${change.locale}' is not in i18n.locales. Update config and restart dev server.`)
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
