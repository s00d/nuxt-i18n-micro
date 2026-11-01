import { mergeTranslationChunk } from '@i18n-micro/core'
import type { TranslationKey, Translations } from '@i18n-micro/types'
import { NuxtI18n } from './nuxt-i18n'

type Tree = Record<string, unknown>

const hasOwn = (obj: object, key: string): boolean => Object.prototype.hasOwnProperty.call(obj, key)

const isTree = (value: unknown): value is Tree => value !== null && typeof value === 'object' && !Array.isArray(value)

/**
 * What a merge of `layers` (later ones win) holds at `key`: a value, or the trees that would merge there, lowest first.
 * Anything but a tree replaces what is below it, and a tree on top of that starts anew.
 */
function nodesAt(layers: readonly unknown[], key: string): unknown[] {
  const trees: unknown[] = []
  for (let index = layers.length - 1; index >= 0; index--) {
    const layer = layers[index] as Tree
    if (!hasOwn(layer, key)) continue
    const value = layer[key]
    if (!isTree(value)) return trees.length ? trees : [value]
    trees.unshift(value)
  }
  return trees
}

const valueOf = (nodes: readonly unknown[]): unknown =>
  nodes.length < 2 ? nodes[0] : (nodes as Tree[]).reduce((merged, node) => mergeTranslationChunk(merged, node))

/** `getByPath` of the tree a merge of `layers` would make, with none made. Only what is on the key's path is read. */
function resolveLayered(layers: readonly unknown[], key: string): unknown | null {
  const flat = valueOf(nodesAt(layers, key))
  if ((flat !== undefined && flat !== null) || key.indexOf('.') === -1) return flat ?? null
  let nodes = layers
  for (const part of key.split('.')) {
    const node = nodes[0]
    if (node === null || typeof node !== 'object' || part === '__proto__' || (part === 'length' && Array.isArray(node))) return null
    nodes = nodesAt(nodes, part)
  }
  return valueOf(nodes) ?? null
}

/** Can a fragment change what `key` reads? Its first segment and the flat key are all a merge could touch on the way. */
function touches(fragments: readonly Tree[], key: string): boolean {
  const dot = key.indexOf('.')
  const head = dot === -1 ? key : key.slice(0, dot)
  return fragments.some((fragment) => hasOwn(fragment, key) || hasOwn(fragment, head))
}

/**
 * The instance of a server request. Its chunks are the process's shared trees, and a patch (`i18n:register`,
 * `$mergeTranslations`) is this request's alone: merging would copy the root of a shared tree on every request, and a new
 * tree starts with a cold leaf cache. So a patch stays beside its chunk, and a lookup reads through it. A subscriber may
 * register other keys per request: nothing is shared or cached between requests but the chunk, which no one writes to.
 * ponytail: what needs the whole tree (`$resolveTranslations`, `$setTranslation`) merges once, at O(chunk) for that request.
 */
export class ServerNuxtI18n extends NuxtI18n {
  /** Patches not merged yet, in order, per chunk. */
  private readonly overlays = new Map<string, Tree[]>()
  /** Those of the dictionary on screen. Held apart: eviction can drop its chunk while the dictionary stays. */
  private activeOverlay: Tree[] | undefined

  /** The merge the patches stood in for, once a caller needs the tree. */
  private settle(key: string): void {
    const fragments = this.overlays.get(key)
    if (!fragments) return
    this.overlays.delete(key)
    const active = fragments === this.activeOverlay
    const merged = fragments.reduce<Tree>((tree, fragment) => mergeTranslationChunk(tree, fragment), this.chunkAt(key, active))
    this.storePatched(key, merged)
    if (!active) return
    this.cachedTranslations = merged
    this.activeOverlay = undefined
  }

  private chunkAt(key: string, active: boolean): Tree {
    return active ? this.cachedTranslations : ((this.storage.translations.get(key) ?? {}) as Tree)
  }

  private settleActive(): void {
    if (this.activeOverlay) this.settle(this.getCacheKey(this.getLocale(), this.getCurrentRouteName()))
  }

  override getChunk(locale: string, routeName?: string): Tree {
    this.settle(this.getCacheKey(locale, routeName))
    return super.getChunk(locale, routeName)
  }

  protected override patch(locale: string, routeName: string, translations: Translations): void {
    const key = this.getCacheKey(locale, routeName)
    const chunk = this.storage.translations.get(key)
    const active = locale === this.getLocale() && (routeName || 'index') === this.getRoute()
    // nothing to lay it over: a first write, or a dictionary its chunk does not hold (a stand-in)
    if (!chunk || (active && chunk !== this.cachedTranslations)) return super.patch(locale, routeName, translations)
    // a copy, as a merge makes: the object stays the caller's
    const fragment = mergeTranslationChunk({}, translations as Tree)
    const fragments = this.overlays.get(key)
    if (fragments) fragments.push(fragment)
    else this.overlays.set(key, [fragment])
    if (!active) return
    this.activeOverlay = this.overlays.get(key)
    this.notifyLoaded()
  }

  protected override resolveLookup(key: TranslationKey, routeContext?: unknown): unknown | null {
    if (!this.overlays.size && !this.activeOverlay) return super.resolveLookup(key, routeContext)
    const text = String(key)
    const chunkKey = routeContext ? this.chunkKeyOf(routeContext) : undefined
    const fragments = chunkKey ? this.overlays.get(chunkKey) : this.activeOverlay
    if (!fragments || !touches(fragments, text)) return super.resolveLookup(key, routeContext)
    const chunk = chunkKey ? this.storage.translations.get(chunkKey) : this.cachedTranslations
    return resolveLayered([chunk ?? {}, ...fragments], text)
  }

  override applySwitchContext(locale: string, routeName: string | undefined, data: Tree | null): void {
    this.settleActive()
    super.applySwitchContext(locale, routeName, data)
  }

  override resolveTranslations(routeContext?: unknown): Translations {
    this.settleActive()
    return super.resolveTranslations(routeContext)
  }

  override setTranslation(key: TranslationKey, value: unknown): void {
    this.settleActive()
    super.setTranslation(key, value)
  }

  override dropChunks(): void {
    this.settleActive()
    this.overlays.clear()
    super.dropChunks()
  }

  override clearCache(): void {
    this.overlays.clear()
    this.activeOverlay = undefined
    super.clearCache()
  }
}
