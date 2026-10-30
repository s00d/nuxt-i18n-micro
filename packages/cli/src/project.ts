import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { deepMergeTranslationsRecursive } from '@i18n-micro/utils/deep-merge'
import { notFoundError, usageError, validationError } from './errors'
import { matchLineEnding, readJsonIfExists, stringifyJson, stringifyLike, walkFiles, writeFilesAtomic } from './fs'
import {
  type JsonObject,
  type JsonValue,
  deletePath,
  flatten,
  flattenStrings,
  getPath,
  isObject,
  ownValue,
  pathConflict,
  setPath,
  sortKeys,
} from './json'
import { type ProjectConfig, loadProjectConfig } from './nuxt'

/** Not a word: a page may be called `global`. */
export const GLOBAL_SCOPE = ''

export interface LocaleLayer {
  global: JsonObject
  pages: Record<string, JsonObject>
}

const merge = (target: JsonObject, source: JsonObject): JsonObject => deepMergeTranslationsRecursive(target, source) as JsonObject

/** Scopes arrive from imported files and folder names, and become directories and object keys. */
function assertSafeScope(scope: string): void {
  const parts = scope.split(/[/\\]/)
  if (scope.startsWith('/') || parts.includes('..') || parts.includes('__proto__')) throw validationError(`Unsafe page scope: ${scope}`)
}

function readLayer(dir: string, code: string, withPages: boolean): LocaleLayer {
  const pagesDir = join(dir, 'pages')
  const fileName = `${code}.json`
  const pages: LocaleLayer['pages'] = {}
  const files = withPages ? walkFiles(pagesDir, (path) => path.endsWith(`${sep}${fileName}`)) : []
  for (const file of files) {
    const scope = relative(pagesDir, dirname(file)).split(sep).join('/')
    assertSafeScope(scope)
    pages[scope] = readJsonIfExists(file)
  }
  return { global: readJsonIfExists(join(dir, fileName)), pages }
}

function mergeLayers(layers: LocaleLayer[]): LocaleLayer {
  const out: LocaleLayer = { global: {}, pages: {} }
  for (const layer of layers) {
    out.global = merge(out.global, layer.global)
    for (const [scope, tree] of Object.entries(layer.pages)) out.pages[scope] = merge(ownValue(out.pages, scope) ?? {}, tree)
  }
  return out
}

/** The file's own order first: a save must not shuffle a file because a layer lists keys differently. */
const orderedLike = (tree: JsonObject, own: JsonObject): string[] =>
  [...new Set([...Object.keys(own), ...Object.keys(tree)])].filter((key) => Object.hasOwn(tree, key))

/**
 * What the project file has to contain so the merged view stays the same.
 *
 * Commands see every layer merged, the way the app does, but a layer's key does not belong in
 * the app's file: copied there it would silently shadow the layer forever.
 */
function ownPart(tree: JsonObject, inherited: JsonObject, own: JsonObject): JsonObject {
  const out: JsonObject = {}
  for (const key of orderedLike(tree, own)) {
    const value = tree[key]!
    const base = Object.hasOwn(inherited, key) ? inherited[key] : undefined
    const mine = Object.hasOwn(own, key) ? own[key] : undefined
    if (isObject(value) && isObject(base)) {
      const nested = ownPart(value, base, isObject(mine) ? mine : {})
      if (Object.keys(nested).length > 0 || mine !== undefined) out[key] = nested
      continue
    }
    if (mine !== undefined || JSON.stringify(value) !== JSON.stringify(base)) out[key] = value
  }
  return out
}

/** `de.json` or `pages/about/de.json`: the one place a scope turns into a path. */
export const relativeFile = (code: string, scope: string, extension = 'json'): string =>
  scope === GLOBAL_SCOPE ? `${code}.${extension}` : `pages/${scope}/${code}.${extension}`

export class LocaleSet {
  global: JsonObject
  pages: Record<string, JsonObject>
  modified = false

  constructor(
    merged: LocaleLayer,
    readonly inherited: LocaleLayer,
    readonly own: LocaleLayer,
  ) {
    this.global = structuredClone(merged.global)
    this.pages = structuredClone(merged.pages)
  }

  get pageScopes(): string[] {
    return Object.keys(this.pages)
  }

  /** The global scope first, then every page. */
  get scopes(): string[] {
    return [GLOBAL_SCOPE, ...this.pageScopes]
  }

  tree(scope: string): JsonObject {
    return scope === GLOBAL_SCOPE ? this.global : (ownValue(this.pages, scope) ?? {})
  }

  /** The project's file as it was read. */
  ownTree(scope: string): JsonObject {
    return scope === GLOBAL_SCOPE ? this.own.global : (ownValue(this.own.pages, scope) ?? {})
  }

  inheritedTree(scope: string): JsonObject {
    return scope === GLOBAL_SCOPE ? this.inherited.global : (ownValue(this.inherited.pages, scope) ?? {})
  }

  /** The project's file as it stands now: edits in, layers out. */
  fileTree(scope: string): JsonObject {
    return ownPart(this.tree(scope), this.inheritedTree(scope), this.ownTree(scope))
  }

  replaceTree(scope: string, tree: JsonObject): void {
    if (scope === GLOBAL_SCOPE) this.global = tree
    else this.pages[scope] = tree
    this.modified = true
  }

  strings(scope: string = GLOBAL_SCOPE): Record<string, string> {
    return flattenStrings(this.tree(scope))
  }

  leaves(scope: string = GLOBAL_SCOPE): Record<string, JsonValue> {
    return flatten(this.tree(scope))
  }

  get(key: string, scope: string = GLOBAL_SCOPE): JsonValue | undefined {
    return getPath(this.tree(scope), key)
  }

  /** What the app reads on `scope`: the page's value, then the global one. */
  resolve(key: string, scope: string): JsonValue | undefined {
    return this.get(key, scope) ?? this.get(key)
  }

  /** Writes `value`, or returns the key that blocks it: a write never destroys another value. */
  set(key: string, value: JsonValue, scope: string = GLOBAL_SCOPE): string | null {
    assertSafeScope(scope)
    if (key.split('.').includes('__proto__')) return key
    const conflict = pathConflict(this.tree(scope), key)
    if (conflict) return conflict
    if (scope !== GLOBAL_SCOPE && !Object.hasOwn(this.pages, scope)) this.pages[scope] = {}
    setPath(this.tree(scope), key, value)
    this.modified = true
    return null
  }

  delete(key: string, scope: string = GLOBAL_SCOPE): void {
    if (deletePath(this.tree(scope), key)) this.modified = true
  }
}

export interface SaveOptions {
  /** Force an indentation; by default each file keeps its own. */
  indent?: number
  /** Rewrite files whose content did not change: `format`. */
  rewrite?: boolean
  sort?: boolean
}

export class Project {
  private constructor(
    readonly config: ProjectConfig,
    private readonly locales: Map<string, LocaleSet>,
  ) {}

  static async load(options: { cwd?: string; translationDir?: string }): Promise<Project> {
    const config = await loadProjectConfig(resolve(options.cwd ?? '.'))
    const requested = options.translationDir ? resolve(config.rootDir, options.translationDir) : config.translationDir
    const own = requested === config.translationDir
    const resolved: ProjectConfig = {
      ...config,
      translationDir: requested,
      translationDirs: own ? config.translationDirs : [requested],
      additionalDirs: own ? config.additionalDirs : [],
    }

    const locales = new Map<string, LocaleSet>()
    for (const { code } of resolved.locales) {
      const layers = resolved.translationDirs.map((dir) =>
        readLayer(dir, code, !resolved.disablePageLocales && !resolved.additionalDirs.includes(dir)),
      )
      locales.set(code, new LocaleSet(mergeLayers(layers), mergeLayers(layers.slice(0, -1)), layers.at(-1)!))
    }
    return new Project(resolved, locales)
  }

  get codes(): string[] {
    return this.config.locales.map((locale) => locale.code)
  }

  /** Locales to fill in from the default one. */
  get targetCodes(): string[] {
    return this.codes.filter((code) => code !== this.config.defaultLocale)
  }

  /** The comma list of a `--locale` flag, or every target locale. */
  selectLocales(list: string[]): string[] {
    if (list.length === 0) return this.targetCodes
    const unknown = list.filter((code) => !this.targetCodes.includes(code))
    if (unknown.length > 0) throw usageError(`Not a target locale: ${unknown.join(', ')}`, [`Target locales: ${this.targetCodes.join(', ')}`])
    return list
  }

  locale(code: string): LocaleSet {
    const set = this.locales.get(code)
    if (!set) throw notFoundError(`Locale ${code} not found`, ['Check configured locales in nuxt.config i18n.locales.'], { Locale: code })
    return set
  }

  get reference(): LocaleSet {
    return this.locale(this.config.defaultLocale)
  }

  private filesOf(code: string, set: LocaleSet, options: SaveOptions): Array<[string, string]> {
    const scopes = [...new Set([...set.scopes, ...Object.keys(set.own.pages)])]
    const files: Array<[string, string]> = []
    for (const scope of scopes) {
      const path = join(this.config.translationDir, ...relativeFile(code, scope).split('/'))
      const own = set.ownTree(scope)
      const part = set.fileTree(scope)
      const content = options.sort ? (sortKeys(part) as JsonObject) : part
      const previous = existsSync(path) ? readFileSync(path, 'utf8') : undefined
      if (previous === undefined && Object.keys(content).length === 0) continue
      // A scope nothing touched keeps its bytes, whatever its formatting.
      if (!options.rewrite && previous !== undefined && JSON.stringify(content) === JSON.stringify(own)) continue
      const text = options.indent ? matchLineEnding(previous, stringifyJson(content, options.indent)) : stringifyLike(previous, content)
      if (text !== previous) files.push([path, text])
    }
    return files
  }

  /** The writes a save would make, for a caller that has other files to change in the same step. */
  pendingFiles(options: SaveOptions = {}): Array<[string, string]> {
    return this.codes.flatMap((code) => {
      const set = this.locale(code)
      return set.modified ? this.filesOf(code, set, options) : []
    })
  }

  /** Write modified locales in one step, see `writeFilesAtomic`. Returns the paths written. */
  save(options: SaveOptions = {}): string[] {
    const files = this.pendingFiles(options)
    writeFilesAtomic(files)
    for (const code of this.codes) this.locale(code).modified = false
    return files.map(([path]) => path)
  }
}
