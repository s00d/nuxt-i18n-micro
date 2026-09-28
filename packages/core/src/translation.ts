import type { Translations } from '@i18n-micro/types'
import { mergeTranslationChunkInPlace, resolveTranslation, translationCacheKey } from './helpers'

/**
 * Bare Metal: Simple translation storage without Ref, useState, devalue.
 * Map key: `${locale}:${routeName}` (page-specific).
 *
 * Sparse leaf cache: only keys that have been looked up, values of any shape
 * (string / object / number). The chunk Map stays a nested tree — never flattened.
 */
export interface TranslationStorage {
  translations: Map<string, Translations>
}

const LEAF_MISS = Symbol('i18n-leaf-miss')

interface SharedHelperState {
  leafByChunk: Map<string, Map<string, unknown>>
  generation: number
}

/**
 * Leaf cache + write generation keyed by the shared translations Map so two helpers
 * that share `TranslationStorage` invalidate each other's pins on write.
 */
const sharedStateByMap = new WeakMap<Map<string, Translations>, SharedHelperState>()

function getSharedState(translations: Map<string, Translations>): SharedHelperState {
  let state = sharedStateByMap.get(translations)
  if (!state) {
    state = { leafByChunk: new Map(), generation: 0 }
    sharedStateByMap.set(translations, state)
  }
  return state
}

export function useTranslationHelper(storage?: TranslationStorage) {
  const translations = storage?.translations ?? new Map<string, Translations>()
  const state = getSharedState(translations)
  const { leafByChunk } = state

  function bumpGeneration(): void {
    state.generation++
  }

  function invalidateLeaf(chunkKey: string): void {
    leafByChunk.delete(chunkKey)
  }

  function invalidateAllLeaves(): void {
    leafByChunk.clear()
  }

  function getLeafMap(chunkKey: string): Map<string, unknown> {
    let leaf = leafByChunk.get(chunkKey)
    if (!leaf) {
      leaf = new Map()
      leafByChunk.set(chunkKey, leaf)
    }
    return leaf
  }

  /**
   * Resolve `key` against an already-pinned tree, using the sparse leaf map for `chunkKey`.
   */
  function lookupIn(chunkKey: string, tree: Record<string, unknown> | null | undefined, key: string): unknown | null {
    const leaf = leafByChunk.get(chunkKey)
    if (leaf?.has(key)) {
      const cached = leaf.get(key)
      return cached === LEAF_MISS ? null : cached
    }

    if (!tree) {
      getLeafMap(chunkKey).set(key, LEAF_MISS)
      return null
    }

    const value = resolveTranslation(tree, key)
    getLeafMap(chunkKey).set(key, value === null ? LEAF_MISS : value)
    return value
  }

  function writeChunk(chunkKey: string, data: Translations): void {
    translations.set(chunkKey, data)
    invalidateLeaf(chunkKey)
    bumpGeneration()
  }

  function mergeIntoChunk(chunkKey: string, incoming: Translations): void {
    const existing = translations.get(chunkKey)
    if (!existing) {
      writeChunk(chunkKey, { ...incoming })
      return
    }

    // Single-pass in-place merge (leaf assigns ≈ Object.assign; nested only where needed).
    mergeTranslationChunkInPlace(existing as Record<string, unknown>, incoming as Record<string, unknown>)
    invalidateLeaf(chunkKey)
    bumpGeneration()
  }

  return {
    hasCache(locale: string, page: string) {
      return translations.has(translationCacheKey(locale, page))
    },
    getCache(locale: string, routeName: string) {
      return translations.get(translationCacheKey(locale, routeName))
    },
    /**
     * Install or replace the sparse leaf map for a chunk (does not alter the nested tree).
     */
    setCache(locale: string, routeName: string, cache: Map<string, unknown>) {
      leafByChunk.set(translationCacheKey(locale, routeName), cache)
    },
    /** Storage write generation — for pinned-chunk freshness checks. */
    getGeneration(): number {
      return state.generation
    },
    hasTranslation(locale: string, key: string): boolean {
      const prefix = `${locale}:`
      for (const [k, v] of translations) {
        if (k.startsWith(prefix) && resolveTranslation(v as Record<string, unknown>, key) !== null) {
          return true
        }
      }
      return false
    },
    hasPageTranslation(locale: string, routeName: string): boolean {
      return translations.has(translationCacheKey(locale, routeName))
    },
    getTranslation<T = unknown>(locale: string, routeName: string, key: string): T | null {
      const chunkKey = translationCacheKey(locale, routeName)
      return lookupIn(chunkKey, translations.get(chunkKey) as Record<string, unknown> | undefined, key) as T | null
    },
    /**
     * Leaf-aware lookup against a caller-pinned tree (avoids `Map.get` for the chunk).
     */
    lookupIn,
    loadTranslations(locale: string, data: Translations, routeName = 'index'): void {
      mergeIntoChunk(translationCacheKey(locale, routeName), data)
    },
    setTranslations(locale: string, data: Translations, routeName = 'index'): void {
      writeChunk(translationCacheKey(locale, routeName), data)
    },
    loadPageTranslations(locale: string, routeName: string, data: Translations): void {
      const chunkKey = translationCacheKey(locale, routeName)
      const existing = translations.get(chunkKey)
      if (!existing || Object.keys(existing).length === 0) {
        writeChunk(chunkKey, { ...data })
      } else {
        mergeIntoChunk(chunkKey, data)
      }
    },
    mergeTranslation(locale: string, routeName: string, newTranslations: Translations, _force = false): void {
      mergeIntoChunk(translationCacheKey(locale, routeName), newTranslations)
    },
    clearCache(): void {
      translations.clear()
      invalidateAllLeaves()
      bumpGeneration()
    },
  }
}
