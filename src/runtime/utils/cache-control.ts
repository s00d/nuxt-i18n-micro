/**
 * CacheControl — O(1) LRU cache with optional sliding TTL.
 *
 * Map is created internally — no external references, no desync risk.
 *
 * Performance:
 *   get  — O(1) (lazy TTL check + LRU reorder via Map delete/set)
 *   set  — O(1) (LRU eviction via Map.keys().next())
 *   has  — O(1) (lazy TTL eviction)
 *
 * Eviction: LRU (Least Recently Used) based on native Map insertion order.
 */

export interface CacheControlOptions {
  maxSize?: number
  /** TTL in seconds (0 = no expiration) */
  ttl?: number
}

export class CacheControl<T> {
  private readonly cache = new Map<string, T>()
  private readonly expiry = new Map<string, number>()
  private maxSize = 0
  private ttlMs = 0

  constructor(options?: CacheControlOptions) {
    if (options) this.configure(options)
  }

  /** Update limits at runtime. Last call wins. */
  configure(options: CacheControlOptions): void {
    this.maxSize = options.maxSize ?? 0
    this.ttlMs = (options.ttl ?? 0) * 1000
    // TTL disabled — drop stale expiry metadata to prevent memory leak
    if (this.ttlMs === 0) {
      this.expiry.clear()
    }
  }

  /**
   * Get entry. Returns undefined if missing or expired.
   * Refreshes TTL on hit (sliding expiration).
   * Promotes key to most-recently-used position.
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key)
    if (entry === undefined) return undefined

    // Lazy TTL check
    if (this.ttlMs > 0) {
      const exp = this.expiry.get(key)
      if (exp && Date.now() > exp) {
        this.delete(key)
        return undefined
      }
      this.expiry.set(key, Date.now() + this.ttlMs)
    }

    // LRU: move to end (most-recently-used)
    this.cache.delete(key)
    this.cache.set(key, entry)

    return entry
  }

  /**
   * Check existence. Lazily evicts expired entries (side-effect by design).
   */
  has(key: string): boolean {
    if (!this.cache.has(key)) return false

    if (this.ttlMs > 0) {
      const exp = this.expiry.get(key)
      if (exp && Date.now() > exp) {
        this.delete(key)
        return false
      }
    }
    return true
  }

  /**
   * Store entry with O(1) LRU eviction.
   * Existing key — refreshes LRU position.
   * New key at capacity — evicts least-recently-used (first Map key).
   */
  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.maxSize > 0 && this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey !== undefined) {
        this.delete(oldestKey)
      }
    }

    this.cache.set(key, value)

    if (this.ttlMs > 0) {
      this.expiry.set(key, Date.now() + this.ttlMs)
    }
  }

  /** Delete entry and its expiry metadata. */
  delete(key: string): boolean {
    this.expiry.delete(key)
    return this.cache.delete(key)
  }

  /** Clear all entries and metadata. */
  clear(): void {
    this.cache.clear()
    this.expiry.clear()
  }

  /** Iterate over all cache keys. */
  keys(): IterableIterator<string> {
    return this.cache.keys()
  }

  /** Current number of entries. */
  get size(): number {
    return this.cache.size
  }
}
