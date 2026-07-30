/**
 * The parts of `package.json` these commands actually read, typed properly.
 *
 * Everything here used to be `unknown` behind a cast, which meant the checks that
 * inspect exports were written against a guess rather than a shape — and one of them
 * (`collectExportTypePaths`) really did have a dead branch that skipped a plain string
 * export. Narrowing through the guards below instead of asserting keeps the compiler
 * able to say when a branch cannot happen.
 */

/** A value in the `exports` field: a target path, a conditions/subpath object, or a fallback array. */
export type ExportEntry = string | null | ExportMap | ExportEntry[]

/**
 * One level of `exports`. Keys are either conditions (`import`, `require`, `types`,
 * `node`, `default`, …) or subpaths (`.`, `./helpers`) — the format does not distinguish
 * them structurally, and neither does anything here.
 */
export interface ExportMap {
  [key: string]: ExportEntry | undefined
}

export interface PackageManifest {
  name?: string
  version?: string
  private?: boolean
  type?: 'module' | 'commonjs'
  license?: string
  sideEffects?: boolean | string[]
  engines?: { node?: string; [engine: string]: string | undefined }
  /**
   * `unknown[]` rather than `string[]`: nothing validates a hand-written manifest, and
   * the checks that read this field have to survive a malformed entry rather than throw.
   */
  files?: unknown[]
  main?: string
  module?: string
  types?: string
  bin?: string | Record<string, string>
  exports?: ExportEntry
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
  pnpm?: { overrides?: Record<string, string> }
}

/** Dependency fields that decide what an install of the published tarball pulls in. */
export const INSTALLED_DEPENDENCY_FIELDS = ['dependencies', 'peerDependencies', 'optionalDependencies'] as const
export type InstalledDependencyField = (typeof INSTALLED_DEPENDENCY_FIELDS)[number]

/** Manifest fields naming a single file, checked the same way `exports` targets are. */
export const FILE_FIELDS = ['main', 'module', 'types'] as const
export type FileField = (typeof FILE_FIELDS)[number]

export function isExportMap(value: ExportEntry | undefined): value is ExportMap {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** The `types` target of a condition, whether it is written inline or nested. */
export function typesTargetOf(entry: ExportEntry | undefined): string | null {
  if (!isExportMap(entry)) return null
  return typeof entry.types === 'string' ? entry.types : null
}

/** Parse a manifest without pretending the result was validated. */
export function parseManifest(json: string): PackageManifest {
  return JSON.parse(json) as PackageManifest
}
