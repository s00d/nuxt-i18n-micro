export interface CacheControlOptions {
  maxSize?: number;
  ttl?: number;
}

export class CacheControl<T> {
  private readonly cache = new Map<string, T>();
  private readonly expiry = new Map<string, number>();
  private maxSize = 0;
  private ttlMs = 0;

  constructor(options?: CacheControlOptions) {
    if (options) this.configure(options);
  }

  configure(options: CacheControlOptions): void {
    this.maxSize = options.maxSize ?? 0;
    this.ttlMs = (options.ttl ?? 0) * 1000;
    if (this.ttlMs === 0) this.expiry.clear();
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (entry === undefined) return undefined;

    if (this.ttlMs > 0) {
      const exp = this.expiry.get(key);
      if (exp && Date.now() > exp) {
        this.delete(key);
        return undefined;
      }
      this.expiry.set(key, Date.now() + this.ttlMs);
    }

    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry;
  }

  has(key: string): boolean {
    if (!this.cache.has(key)) return false;
    if (this.ttlMs > 0) {
      const exp = this.expiry.get(key);
      if (exp && Date.now() > exp) {
        this.delete(key);
        return false;
      }
    }
    return true;
  }

  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.maxSize > 0 && this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) this.delete(oldestKey);
    }

    this.cache.set(key, value);
    if (this.ttlMs > 0) this.expiry.set(key, Date.now() + this.ttlMs);
  }

  delete(key: string): boolean {
    this.expiry.delete(key);
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.expiry.clear();
  }

  keys(): IterableIterator<string> {
    return this.cache.keys();
  }

  get size(): number {
    return this.cache.size;
  }
}
