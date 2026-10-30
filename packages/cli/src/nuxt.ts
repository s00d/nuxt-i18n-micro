import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { CliError } from './errors'

export interface LocaleEntry {
  code: string
}

export interface ProjectConfig {
  rootDir: string
  /** Where `pages/`, `components/` and friends live: `app/` on Nuxt 4. */
  srcDir: string
  /** The project's own translation directory: the only one the CLI writes to. */
  translationDir: string
  /** Lowest priority first, the project's own directory last. */
  translationDirs: string[]
  /** The ones the module reads top-level `{locale}.json` from, never `pages/`. */
  additionalDirs: string[]
  /** Every layer's root, the project's included. */
  layerRoots: string[]
  /** `dir.pages` of every layer. */
  pagesDirs: string[]
  /** Source folders outside the root that aliases and auto-imports reach into. */
  extraSourceDirs: string[]
  defaultLocale: string
  /** `DEFAULT_LOCALE` in the shell chose another locale than nuxt.config. */
  defaultLocaleOverridden: boolean
  locales: LocaleEntry[]
  disablePageLocales: boolean
}

interface I18nOptions {
  locales?: Array<string | (LocaleEntry & { disabled?: boolean })>
  defaultLocale?: string
  translationDir?: string
  disablePageLocales?: boolean
  additionalTranslationDirs?: Array<string | { path?: string }>
}

interface LayerConfig {
  rootDir?: string
  srcDir?: string
  dir?: { pages?: string }
}

interface ResolvedNuxtConfig extends LayerConfig {
  i18n?: I18nOptions
  modules?: unknown[]
  alias?: Record<string, string>
  components?: unknown
  imports?: { dirs?: unknown }
  _layers?: ReadonlyArray<{ config?: LayerConfig }>
}

type LoadNuxtConfig = (options: { cwd: string; dotenv?: { cwd: string } }) => Promise<ResolvedNuxtConfig>

const NUXT_CONFIG_FILES = ['ts', 'js', 'mjs', 'cjs', 'mts', 'cts'].map((extension) => `nuxt.config.${extension}`)

export function findNuxtRoot(startDir: string): string | null {
  const start = resolve(startDir)
  if (NUXT_CONFIG_FILES.some((file) => existsSync(join(start, file)))) return start
  const parent = dirname(start)
  return parent === start ? null : findNuxtRoot(parent)
}

function findPackageDir(name: string, fromDir: string): string | null {
  const candidate = join(fromDir, 'node_modules', name)
  if (existsSync(join(candidate, 'package.json'))) return realpathSync(candidate)
  const parent = dirname(fromDir)
  return parent === fromDir ? null : findPackageDir(name, parent)
}

function exportEntry(target: unknown): string | null {
  if (typeof target === 'string') return target
  if (typeof target !== 'object' || target === null) return null
  const conditions = target as Record<string, unknown>
  return exportEntry(conditions['.']) ?? exportEntry(conditions.import) ?? exportEntry(conditions.default)
}

/**
 * The Nuxt Kit of the project, never one of our own.
 *
 * The config has to be read by the Nuxt version that will run it. pnpm does not hoist `@nuxt/kit`
 * to the app, so when it is not next to the project it is taken from next to `nuxt`.
 */
async function importProjectKit(rootDir: string): Promise<{ loadNuxtConfig: LoadNuxtConfig }> {
  const nuxtDir = findPackageDir('nuxt', rootDir)
  const kitDir = findPackageDir('@nuxt/kit', rootDir) ?? (nuxtDir && findPackageDir('@nuxt/kit', nuxtDir))
  if (!kitDir) {
    throw new CliError('Cannot find Nuxt in this project.', {
      code: 'NUXT_LOAD_FAILED',
      hints: ['Install the project dependencies first (npm install, pnpm install).', 'Run from the app root, or pass --cwd.'],
      details: { 'Project root': rootDir },
    })
  }
  const manifest = JSON.parse(readFileSync(join(kitDir, 'package.json'), 'utf8')) as { exports?: unknown; module?: string; main?: string }
  const entry = exportEntry(manifest.exports) ?? manifest.module ?? manifest.main ?? 'index.js'
  return (await import(pathToFileURL(join(kitDir, entry)).href)) as { loadNuxtConfig: LoadNuxtConfig }
}

function moduleEnabled(modules: unknown[] = []): boolean {
  return modules.some((entry) => String(Array.isArray(entry) ? entry[0] : entry).includes('nuxt-i18n-micro'))
}

/** `modules: [['nuxt-i18n-micro', { ... }]]`. */
function inlineOptions(modules: unknown[] = []): I18nOptions | undefined {
  const entry = modules.find((item): item is [string, I18nOptions] => Array.isArray(item) && String(item[0]).includes('nuxt-i18n-micro'))
  return entry?.[1]
}

/** Layers concatenate `locales`, project first, so the first entry of a code wins, as in the module. */
function normalizeLocales(locales: I18nOptions['locales'] = []): LocaleEntry[] {
  const byCode = new Map<string, LocaleEntry & { disabled?: boolean }>()
  for (const locale of locales) {
    const entry = typeof locale === 'string' ? { code: locale } : locale
    if (!byCode.has(entry.code)) byCode.set(entry.code, entry)
  }
  return [...byCode.values()].filter((entry) => !entry.disabled).map(({ code }) => ({ code }))
}

const layersOf = (config: ResolvedNuxtConfig, rootDir: string): LayerConfig[] => {
  const layers = (config._layers ?? []).flatMap((layer) => (layer.config?.rootDir ? [layer.config] : []))
  return layers.some((layer) => layer.rootDir === rootDir) ? layers : [{ rootDir, srcDir: config.srcDir, dir: config.dir }, ...layers]
}

/** Like the module: each additional directory is relative to every layer, and sits under the layers' own files. */
function additionalDirsOf(roots: string[], i18n: I18nOptions): string[] {
  const names = (i18n.additionalTranslationDirs ?? []).map((entry) => (typeof entry === 'string' ? entry : entry.path)).filter(Boolean) as string[]
  return [...new Set(names.flatMap((name) => roots.map((root) => resolve(root, name))))]
}

const ALIAS_PREFIX = /^(~~|@@|~|@)(?=\/)/

/** `../shared/*`: the folder a glob starts from. Reading all of it only finds more evidence. */
const globBase = (path: string): string => path.replace(/[/\\][^/\\]*[*?[{(!].*$/, '')

/** Strings out of `components` and `imports.dirs`, in every shape Nuxt accepts them. */
function dirNames(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(dirNames)
  if (typeof value !== 'object' || value === null) return []
  const { path, dirs } = value as { path?: unknown; dirs?: unknown }
  return [...dirNames(path), ...dirNames(dirs)]
}

/** A folder outside the root is still this app's code when an alias or auto-import points at it. */
function extraSourceDirsOf(config: ResolvedNuxtConfig, rootDir: string): string[] {
  const srcDir = config.srcDir ?? rootDir
  const expand = (dir: string): string =>
    resolve(
      rootDir,
      dir.replace(ALIAS_PREFIX, (prefix) => (prefix.length === 2 ? rootDir : srcDir)),
    )
  // An alias is a path, whatever its characters; only the folder lists take globs.
  const aliases = Object.values(config.alias ?? {}).filter((name) => typeof name === 'string')
  const dirs = [...aliases, ...[...dirNames(config.components), ...dirNames(config.imports?.dirs)].map(globBase)].map(expand)
  const outside = dirs.filter((dir) => relative(rootDir, dir).startsWith('..') && !dir.includes('/node_modules/') && existsSync(dir))
  return [...new Set(outside.filter((dir) => statSync(dir).isDirectory()))]
}

async function readNuxtConfig(rootDir: string): Promise<ResolvedNuxtConfig> {
  const kit = await importProjectKit(rootDir)
  try {
    return await kit.loadNuxtConfig({ cwd: rootDir, dotenv: { cwd: rootDir } })
  } catch (error) {
    throw new CliError('Failed to load Nuxt configuration.', {
      code: 'NUXT_LOAD_FAILED',
      hints: ['Verify that nuxt.config.* is valid and dependencies are installed.', 'Run with --debug to see the full stack trace.'],
      details: { 'Project root': rootDir, Reason: String((error as Error).message) },
      cause: error,
    })
  }
}

/**
 * Resolved i18n configuration of the project at or above `cwd`.
 *
 * `loadNuxtConfig`, not `loadNuxt`: the CLI needs options and layers, and booting Nuxt runs
 * every module of the app just to read them.
 */
export async function loadProjectConfig(cwd: string): Promise<ProjectConfig> {
  const requested = resolve(cwd)
  const rootDir = findNuxtRoot(requested)
  if (!rootDir) {
    throw new CliError('No Nuxt project found.', {
      code: 'NOT_NUXT_PROJECT',
      hints: ['Run inside a Nuxt app (where nuxt.config.ts exists), or pass --cwd /path/to/app.'],
      details: { 'Working directory': requested },
    })
  }

  const config = await readNuxtConfig(rootDir)
  const inline = inlineOptions(config.modules)
  const i18n = config.i18n || inline ? { ...config.i18n, ...inline } : undefined
  if (!i18n) {
    const enabled = moduleEnabled(config.modules)
    throw new CliError(enabled ? 'nuxt-i18n-micro is enabled, but has no i18n options.' : 'nuxt-i18n-micro is not enabled in this project.', {
      code: enabled ? 'I18N_NOT_CONFIGURED' : 'I18N_MODULE_MISSING',
      hints: [`Example: modules: ['nuxt-i18n-micro'], i18n: { locales: [{ code: 'en' }], defaultLocale: 'en' }`],
      details: { 'Project root': rootDir },
    })
  }

  const locales = normalizeLocales(i18n.locales)
  if (locales.length === 0) {
    throw new CliError('i18n configuration has no locales.', {
      code: 'NO_LOCALES',
      hints: [`Add at least one locale, e.g. i18n: { locales: [{ code: 'en' }], defaultLocale: 'en' }`],
      details: { 'Project root': rootDir },
    })
  }

  // The same fallbacks as the module: a project without `defaultLocale` runs on `en`, not on its first locale.
  const defaultLocale = process.env.DEFAULT_LOCALE ?? i18n.defaultLocale ?? 'en'
  if (!locales.some((locale) => locale.code === defaultLocale)) {
    throw new CliError(`The default locale "${defaultLocale}" is not among the enabled locales.`, {
      code: 'NO_LOCALES',
      hints: ['Set i18n.defaultLocale in nuxt.config.'],
      details: { 'Project root': rootDir, Locales: locales.map((locale) => locale.code).join(', ') },
    })
  }

  const dirName = i18n.translationDir || 'locales'
  const layers = layersOf(config, rootDir)
  const roots = layers.map((layer) => layer.rootDir!).reverse()
  const translationDir = resolve(rootDir, dirName)
  const primaryDirs = [...roots.map((root) => resolve(root, dirName)), translationDir]
  // Listed there too, a primary directory is still one: its `pages/` count.
  const additionalDirs = additionalDirsOf(roots, i18n).filter((dir) => !primaryDirs.includes(dir))
  return {
    rootDir,
    srcDir: config.srcDir ?? rootDir,
    translationDir,
    translationDirs: [...new Set([...additionalDirs, ...primaryDirs])].sort((a, b) => Number(a === translationDir) - Number(b === translationDir)),
    additionalDirs,
    layerRoots: roots,
    pagesDirs: [...new Set(layers.map((layer) => resolve(layer.srcDir ?? layer.rootDir!, layer.dir?.pages ?? 'pages')))],
    extraSourceDirs: extraSourceDirsOf(config, rootDir),
    defaultLocale,
    defaultLocaleOverridden: defaultLocale !== (i18n.defaultLocale ?? 'en'),
    locales,
    disablePageLocales: Boolean(i18n.disablePageLocales),
  }
}
