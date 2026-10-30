import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { deepMergeTranslationsRecursive } from '@i18n-micro/utils/deep-merge'
import { notFoundError, validationError } from './errors'
import { readJsonIfExists, stringifyJson, walkFiles, writeFilesAtomic } from './fs'
import { type JsonObject, type JsonValue, flatten, flattenStrings, getPath, isObject, setPath } from './json'
import { type ProjectConfig, loadProjectConfig } from './nuxt'

export const GLOBAL_SCOPE = 'global'

export interface LocaleLayer {
  global: JsonObject
  pages: Record<string, JsonObject>
}

const merge = (target: JsonObject, source: JsonObject): JsonObject => deepMergeTranslationsRecursive(target, source) as JsonObject

function readLayer(dir: string, code: string): LocaleLayer {
  const pagesDir = join(dir, 'pages')
  const fileName = `${code}.json`
  const pages: LocaleLayer['pages'] = {}
  for (const file of walkFiles(pagesDir, (path) => path.endsWith(`${sep}${fileName}`))) {
    pages[relative(pagesDir, dirname(file)).split(sep).join('/')] = readJsonIfExists(file)
  }
  return { global: readJsonIfExists(join(dir, fileName)), pages }
}

function mergeLayers(layers: LocaleLayer[]): LocaleLayer {
  const out: LocaleLayer = { global: {}, pages: {} }
  for (const layer of layers) {
    out.global = merge(out.global, layer.global)
    for (const [scope, tree] of Object.entries(layer.pages)) out.pages[scope] = merge(out.pages[scope] ?? {}, tree)
  }
  return out
}

/**
 * What the project file has to contain so the merged view stays the same.
 *
 * Commands see every layer merged, the way the app does, but a layer's key does not belong in
 * the app's file: copied there it would silently shadow the layer forever.
 */
function ownPart(tree: JsonObject, inherited: JsonObject, own: JsonObject): JsonObject {
  const out: JsonObject = {}
  for (const [key, value] of Object.entries(tree)) {
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

/** Scopes also arrive from imported files, and become directories. */
function assertSafeScope(scope: string): void {
  if (scope.startsWith('/') || scope.split(/[/\\]/).includes('..')) throw validationError(`Unsafe page scope: ${scope}`)
}

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

  /** `global` first, then every page. */
  get scopes(): string[] {
    return [GLOBAL_SCOPE, ...this.pageScopes]
  }

  tree(scope: string): JsonObject {
    return scope === GLOBAL_SCOPE ? this.global : (this.pages[scope] ?? {})
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

  set(key: string, value: JsonValue, scope: string = GLOBAL_SCOPE): void {
    assertSafeScope(scope)
    if (scope !== GLOBAL_SCOPE && !this.pages[scope]) this.pages[scope] = {}
    setPath(this.tree(scope), key, value)
    this.modified = true
  }
}

export interface SaveOptions {
  indent?: number
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
    const resolved: ProjectConfig = { ...config, translationDir: requested, translationDirs: own ? config.translationDirs : [requested] }

    const locales = new Map<string, LocaleSet>()
    for (const { code } of resolved.locales) {
      const layers = resolved.translationDirs.map((dir) => readLayer(dir, code))
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

  locale(code: string): LocaleSet {
    const set = this.locales.get(code)
    if (!set) throw notFoundError(`Locale ${code} not found`, ['Check configured locales in nuxt.config i18n.locales.'], { Locale: code })
    return set
  }

  get reference(): LocaleSet {
    return this.locale(this.config.defaultLocale)
  }

  private filesOf(code: string, set: LocaleSet, indent: number): Array<[string, string]> {
    const dir = this.config.translationDir
    const scopes = [...new Set([...set.scopes, ...Object.keys(set.own.pages)])]
    const files: Array<[string, string]> = []
    for (const scope of scopes) {
      const isGlobal = scope === GLOBAL_SCOPE
      const path = isGlobal ? join(dir, `${code}.json`) : join(dir, 'pages', ...scope.split('/'), `${code}.json`)
      const inherited = isGlobal ? set.inherited.global : (set.inherited.pages[scope] ?? {})
      const own = isGlobal ? set.own.global : (set.own.pages[scope] ?? {})
      const content = ownPart(set.tree(scope), inherited, own)
      if (Object.keys(content).length === 0 && !existsSync(path)) continue
      const text = stringifyJson(content, indent)
      if (!existsSync(path) || readFileSync(path, 'utf8') !== text) files.push([path, text])
    }
    return files
  }

  /** The writes a save would make, for a caller that has other files to change in the same step. */
  pendingFiles(options: SaveOptions = {}): Array<[string, string]> {
    return this.codes.flatMap((code) => {
      const set = this.locale(code)
      return set.modified ? this.filesOf(code, set, options.indent ?? 2) : []
    })
  }

  /** Write modified locales in one step: either every file is replaced or none is. Returns the paths written. */
  save(options: SaveOptions = {}): string[] {
    const files = this.pendingFiles(options)
    writeFilesAtomic(files)
    for (const code of this.codes) this.locale(code).modified = false
    return files.map(([path]) => path)
  }
}
