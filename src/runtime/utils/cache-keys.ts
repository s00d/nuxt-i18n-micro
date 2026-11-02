export const STORAGE_CC_KEY = Symbol.for('__NUXT_I18N_STORAGE_CC__')

/**
 * Entries the server keeps when `cacheMaxSize` is not set. Never unbounded: every distinct
 * `locale:page` a request names would otherwise stay in memory for the life of the process.
 */
export const DEFAULT_SERVER_CACHE_SIZE = 1000
