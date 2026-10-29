import type { Translations } from '@i18n-micro/types'
import { translationCacheKey } from './strategy'
import { mergeTranslationChunk, resolveTranslation, type Tree } from './tree'

/** Chunks keyed `locale:route`, each a nested tree. Adapters may share one between instances. */
export interface TranslationStorage {
  translations: Map<string, Translations>
}

const LEAF_LIMIT = 2000

/**
 * Resolved keys per stored tree (hits only: a miss is cheap to re-walk, and dynamic missing
 * keys would only churn the cache). Keyed by the tree object itself: a write stores a new tree,
 * so a cache can never outlive what it describes. Bounded per tree, cleared wholesale.
 */
const LEAVES = new WeakMap<object, Map<string, unknown>>()

/**
 * Reads and writes chunks of a {@link TranslationStorage}.
 *
 * Every lookup starts from the Map as it is now, so writes made straight to
 * `storage.translations` (or by another helper on the same storage) are seen at once.
 *
 * Stored trees are treated as immutable: a merge copies the nodes on the patch's paths and
 * stores a new root. Trees handed in by callers, returned by `t()` / `getCache`, shared between
 * route chunks or cloned storages stay as they were. Replace a chunk instead of editing one in place.
 */
export class TranslationHelper {
  readonly translations: Map<string, Translations>
  private lastTree: Translations | undefined
  private lastLeaves = new Map<string, unknown>()

  constructor(storage?: TranslationStorage) {
    this.translations = storage?.translations ?? new Map()
  }

  getCache(locale: string, routeName: string): Translations | undefined {
    return this.translations.get(translationCacheKey(locale, routeName))
  }

  hasCache(locale: string, routeName: string): boolean {
    return this.translations.has(translationCacheKey(locale, routeName))
  }

  hasPageTranslation(locale: string, routeName: string): boolean {
    return this.hasCache(locale, routeName)
  }

  getTranslation<T = unknown>(locale: string, routeName: string, key: string): T | null {
    return this.lookup(translationCacheKey(locale, routeName), key) as T | null
  }

  /** Lookup by a ready chunk key (hot path: callers reuse the key string). */
  lookup(chunkKey: string, key: string): unknown | null {
    const tree = this.translations.get(chunkKey)
    if (tree === undefined) return null
    const leaves = this.leavesOf(tree)
    const cached = leaves.get(key)
    if (cached !== undefined) return cached
    const value = resolveTranslation(tree as Tree, key)
    if (value === null) return null
    if (leaves.size >= LEAF_LIMIT) leaves.clear()
    leaves.set(key, value)
    return value
  }

  private leavesOf(tree: Translations): Map<string, unknown> {
    if (tree === this.lastTree) return this.lastLeaves
    let leaves = LEAVES.get(tree)
    if (leaves === undefined) {
      leaves = new Map()
      LEAVES.set(tree, leaves)
    }
    this.lastTree = tree
    this.lastLeaves = leaves
    return leaves
  }

  /** Whether any chunk of `locale` (any route) holds `key`. */
  hasTranslation(locale: string, key: string): boolean {
    const prefix = `${locale}:`
    for (const [chunkKey, tree] of this.translations) {
      if (chunkKey.startsWith(prefix) && resolveTranslation(tree as Tree, key) !== null) return true
    }
    return false
  }

  /** Replaces the chunk (stored as given, not copied). */
  setTranslations(locale: string, data: Translations, routeName = 'index'): void {
    this.translations.set(translationCacheKey(locale, routeName), data)
  }

  /** Deep-merges into the chunk; incoming wins. */
  mergeTranslation(locale: string, routeName: string, incoming: Translations, _force = false): void {
    const chunkKey = translationCacheKey(locale, routeName)
    // ponytail: a merge copies the chunk's top level (O(top-level keys)); fine for loads and patches, not for per-key loops.
    const existing = this.translations.get(chunkKey) as Tree | undefined
    // A fresh chunk is a top-level copy, so a caller editing its `messages` object afterwards does not reach storage.
    const next = existing && Object.keys(existing).length ? mergeTranslationChunk(existing, incoming as Tree) : { ...(incoming as Tree) }
    this.translations.set(chunkKey, next as Translations)
  }

  loadTranslations(locale: string, data: Translations, routeName = 'index'): void {
    this.mergeTranslation(locale, routeName, data)
  }

  loadPageTranslations(locale: string, routeName: string, data: Translations): void {
    this.mergeTranslation(locale, routeName, data)
  }

  clearCache(): void {
    this.translations.clear()
    this.lastTree = undefined
    this.lastLeaves = new Map()
  }
}

export function useTranslationHelper(storage?: TranslationStorage): TranslationHelper {
  return new TranslationHelper(storage)
}
