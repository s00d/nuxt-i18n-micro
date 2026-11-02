import { joinURL, withQuery } from 'ufo'
import { translationCacheKey } from '@i18n-micro/core/helpers'
import { STORAGE_CC_KEY } from './cache-keys'
import { takeRootMark } from './translation-entry'
import { CacheControl, type CacheControlOptions } from '@i18n-micro/utils/cache-control'
import { mergeOverRoot, PREMERGED_ROOT_PAGE } from '@i18n-micro/utils/merge-source'
import type { TranslationPayloadFetcher } from '@i18n-micro/utils/payload-fetch'
import { buildTranslationPayloadFetchRequest } from '@i18n-micro/utils/payload-url'

/** What a root file the host has not got loads as. By identity: a host's own empty root is a dictionary. */
const NO_ROOT: Record<string, unknown> = Object.freeze({})
/** A 404, told from a `null` body by identity. */
const NO_FILE: Record<string, unknown> = Object.freeze({})

export interface LoadOptions {
  apiBaseUrl: string
  baseURL: string
  apiBaseClientHost?: string
  dateBuild?: string | number
  routesLocaleLinks?: Record<string, string>
  /** A page's file needs its root, so the two start together. A delta from a host still finds its root without it. */
  rootDelta?: boolean
  /**
   * Server only: the Nitro loader of this request (`event.context.i18n.load`), called directly. It reads a host too, named at
   * build time or in the environment, so a render has one source. `null` is a host's "no such file", as a 404 is for a browser.
   */
  serverLoad?: (locale: string, routeName: string) => Promise<Record<string, unknown> | null>
}

type GlobalWithCC = typeof globalThis & { [key: symbol]: unknown }

/** The process-wide chunk cache. `clears` lives with it: the HMR watcher empties it without this module. */
class ChunkCache extends CacheControl<Record<string, unknown>> {
  /** A response requested before a clear may predate the edit the clear is for. */
  clears = 0

  override clear(): void {
    this.clears++
    super.clear()
  }
}

function getStorageCacheControl(): ChunkCache {
  const g = globalThis as GlobalWithCC
  if (!g[STORAGE_CC_KEY]) {
    g[STORAGE_CC_KEY] = new ChunkCache()
  }
  return g[STORAGE_CC_KEY] as ChunkCache
}

class TranslationStorage {
  private cc: ChunkCache
  /** Roots on their way: every page of a first burst waits for one request. */
  private readonly rootLoads = new Map<string, Promise<Record<string, unknown>>>()
  /** The mark of each root held, to tell a delta made against another one. */
  private readonly rootMarks = new Map<string, string | undefined>()

  constructor() {
    this.cc = getStorageCacheControl()
  }

  /**
   * Configure cache limits: the plugin's config values, on every request on the server, where this copy is process-wide.
   */
  configure(options: CacheControlOptions): void {
    this.cc.configure(options)
  }

  /**
   * On the server the cache is shared by every request, so its root is frozen, once, in place: nested values are shared
   * on purpose, and no caller mutates a chunk. A browser fetched this object for itself and has one reader: nothing to guard.
   */
  private shared(data: Record<string, unknown>): Record<string, unknown> {
    return import.meta.server ? Object.freeze(data) : data
  }

  private async fetchTranslations(locale: string, routeName: string | undefined, options: LoadOptions): Promise<Record<string, unknown> | null> {
    // SSR: ask the server loader directly (its cached, shared chunk) instead of a local HTTP
    // round trip that re-parses the JSON into a new copy on every request
    if (import.meta.server && options.serverLoad) return await options.serverLoad(locale, routeName ?? '')
    const request = this.request(locale, routeName, options, import.meta.server)

    // Call-site cast keeps Nuxt `$fetch` (Nitro localFetch when relative); avoids MatchedRoutes TS2321.
    return await ($fetch as TranslationPayloadFetcher)(request.path, {
      baseURL: request.baseURL,
      params: request.params,
      // after a clear a browser's copy may be what the clear is for: `max-age` would answer with it
      cache: import.meta.client && this.cc.clears ? 'no-cache' : undefined,
    })
  }

  /**
   * A chunk, or `null` when the host has no file for it: a 404, a server loader's `null`, or a static host's SPA shell
   * in a page's place. Anything else is a failed load, and the next try can work. A `null` body is one of those: a
   * dictionary it is not, and read as "no file" on the root it would be kept as an empty one until a reload.
   */
  private async fetchChunk(locale: string, routeName: string | undefined, options: LoadOptions): Promise<Record<string, unknown> | null> {
    const data = await this.fetchTranslations(locale, routeName, options).catch((error) => {
      if ((error as { status?: number }).status === 404) return NO_FILE
      throw error
    })
    if (data === NO_FILE || (data === null && import.meta.server && options.serverLoad)) return null
    if (data !== null && typeof data === 'object' && !Array.isArray(data)) return data
    if (routeName !== PREMERGED_ROOT_PAGE) return null
    // a 200 with another body on the root file too: a portal or a proxy, not this site's files
    throw new TypeError(`[i18n] Invalid translation payload: ${translationCacheKey(locale, routeName)}`)
  }

  private request(locale: string, routeName: string | undefined, options: LoadOptions, isServer: boolean) {
    return buildTranslationPayloadFetchRequest({
      apiBaseUrl: options.apiBaseUrl,
      routeName,
      locale,
      isServer,
      baseURL: options.baseURL,
      apiBaseClientHost: options.apiBaseClientHost,
      dateBuild: options.dateBuild,
      routesLocaleLinks: options.routesLocaleLinks,
    })
  }

  /** The URL the browser fetches a chunk from: what SSR preloads for the first page. */
  clientUrl(locale: string, routeName: string | undefined, options: LoadOptions): string {
    const request = this.request(locale, routeName, options, false)
    return withQuery(joinURL(request.baseURL, request.path), request.params ?? {})
  }

  /** The cached chunk (not expired), or null. */
  getFromCache(locale: string, routeName?: string): Record<string, unknown> | null {
    return this.cc.get(translationCacheKey(locale, routeName)) ?? null
  }

  /** Load a chunk, with caching. */
  async load(locale: string, routeName: string | undefined, options: LoadOptions): Promise<Record<string, unknown>> {
    // the render reads the server's own cache, which counts `cacheTtl`: a copy here would count it a second time
    const direct = import.meta.server && Boolean(options.serverLoad)
    const cached = direct ? null : this.getFromCache(locale, routeName)
    if (cached) return cached

    const clears = this.cc.clears
    const page = routeName !== PREMERGED_ROOT_PAGE
    // started with the page, so a hint for both pays one round trip. Waited for below, whatever the page's answer
    const root = page && options.rootDelta && !direct ? this.loadRoot(locale, options) : undefined
    root?.catch(() => {})
    const file = await this.fetchChunk(locale, routeName, options)
    const mark = file ? takeRootMark(file) : undefined
    const layers = file && mark && page ? await this.layered(locale, mark, file, root, options) : null
    const data = layers ? layers.data : file
    if (clears !== this.cc.clears) return this.load(locale, routeName, options)
    if (!page) this.rootMarks.set(locale, mark)
    // No file: the page shows the root dictionary, as the server route does for a build's own pages, and no root file either
    // (`source` mode on a file host, which the build warns about) is an empty one, as a missing file must not stop a switch.
    // Neither is kept under this key: during a deploy the file can appear, and the next page load gets it.
    // ponytail: an open tab keeps the stand-in in the i18n instance until a reload, a chunk added under it is that rare
    if (data === null && routeName === PREMERGED_ROOT_PAGE) {
      // a request can show raw keys and retry; a written file keeps them, so this counts as a failed load
      if (import.meta.server && import.meta.prerender) throw new Error('[i18n] The host has no dictionary for this page')
      return NO_ROOT
    }
    if (data === null) return this.load(locale, PREMERGED_ROOT_PAGE, options)

    // a delta with no root under it is not a dictionary: a deploy in progress, the next load reads again
    if (!direct && !layers?.partial) this.cc.set(translationCacheKey(locale, routeName), this.shared(data))

    return data
  }

  private loadRoot(locale: string, options: LoadOptions): Promise<Record<string, unknown>> {
    const pending = this.rootLoads.get(locale)
    if (pending) return pending
    const load = this.load(locale, PREMERGED_ROOT_PAGE, options).finally(() => this.rootLoads.delete(locale))
    this.rootLoads.set(locale, load)
    return load
  }

  /**
   * A delta on the root it was made against. A root held since an older deploy lacks what moved into it, so a stale tab
   * asks for the delta's: `?v=` of the mark, a URL no cache holds. One try, whatever comes: a CDN mid-deploy may have
   * neither side new yet, and the root it gives is still the best text there is. Both arrive before anything is shown.
   */
  private async layered(
    locale: string,
    mark: string,
    delta: Record<string, unknown>,
    started: Promise<Record<string, unknown>> | undefined,
    options: LoadOptions,
  ): Promise<{ data: Record<string, unknown>; partial: boolean }> {
    let root = await (started ?? this.loadRoot(locale, options))
    const held = this.rootMarks.get(locale)
    if (held && held !== mark) {
      this.cc.delete(translationCacheKey(locale, PREMERGED_ROOT_PAGE))
      root = await this.load(locale, PREMERGED_ROOT_PAGE, { ...options, dateBuild: mark })
    }
    return { data: mergeOverRoot(root, delta), partial: root === NO_ROOT }
  }

  /**
   * Clear cache and metadata.
   */
  clear(): void {
    this.rootLoads.clear()
    this.rootMarks.clear()
    this.cc.clear()
  }
}

export const translationStorage = new TranslationStorage()
