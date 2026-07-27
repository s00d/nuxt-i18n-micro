/**
 * The exported surface of a package, read from its sources.
 *
 * Source rather than `dist`, so the check runs without a build and cannot be fooled by
 * a stale artifact. The TypeScript program resolves `export * from './x'`, so a symbol
 * re-exported through three files is reported once, at the entry point where consumers
 * actually see it.
 *
 * One line per member, not per symbol: a class with thirty methods on a single line
 * turns "renamed one method" into a diff nobody can read, and `typeToString` truncates
 * long shapes to `... 7 more ...` — which would make the snapshot lossy as well.
 */
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import ts from 'typescript'
import { type ExportEntry, type PackageManifest, isExportMap } from './manifest'

/** One comparable line of the surface. */
export interface SurfaceEntry {
  /** `Foo` for the symbol itself, `Foo.bar` for one of its members. */
  path: string
  kind: string
  signature: string
}

export interface EntryPointSurface {
  /** Subpath as written in `exports`, e.g. `.` or `./deep-merge`. */
  subpath: string
  file: string
  entries: SurfaceEntry[]
}

const FORMAT_FLAGS = ts.TypeFormatFlags.NoTruncation

const KIND_BY_FLAG: [ts.SymbolFlags, string][] = [
  [ts.SymbolFlags.Class, 'class'],
  [ts.SymbolFlags.Enum, 'enum'],
  [ts.SymbolFlags.Function, 'function'],
  [ts.SymbolFlags.Interface, 'interface'],
  [ts.SymbolFlags.TypeAlias, 'type'],
  [ts.SymbolFlags.Variable, 'const'],
  [ts.SymbolFlags.Module, 'namespace'],
]

/** Kinds whose members are part of the contract and get a line each. */
const STRUCTURAL_KINDS = new Set(['class', 'interface', 'enum'])

/**
 * Collapse a type string to something reproducible.
 *
 * TypeScript prints an unexported type as `import("<absolute path>").Name`, which makes
 * the snapshot depend on where the repository is checked out and on the pnpm store
 * layout — a diff on someone else's machine before they change anything.
 */
const flat = (text: string): string =>
  text
    .replace(/import\("[^"]*\/node_modules\/(?:\.pnpm\/[^/]+\/node_modules\/)?([^"]*)"\)/g, 'import("$1")')
    .replace(/import\("[^"]*\/(packages\/[^"]*)"\)/g, 'import("$1")')
    .replace(/\s+/g, ' ')
    .trim()

function kindOf(symbol: ts.Symbol): string {
  for (const [flag, name] of KIND_BY_FLAG) {
    if (symbol.flags & flag) return name
  }
  return 'value'
}

/** `export * from './x'` re-exports arrive as aliases; the real symbol carries the kind. */
function resolveAlias(symbol: ts.Symbol, checker: ts.TypeChecker): ts.Symbol {
  return symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol
}

function typeOf(symbol: ts.Symbol, checker: ts.TypeChecker): string {
  const declaration = symbol.declarations?.[0]
  if (!declaration) return 'unknown'
  return flat(checker.typeToString(checker.getTypeOfSymbolAtLocation(symbol, declaration), declaration, FORMAT_FLAGS))
}

/** The lines one exported symbol contributes: itself, plus one per member if it has any. */
function entriesForSymbol(name: string, symbol: ts.Symbol, checker: ts.TypeChecker): SurfaceEntry[] {
  const kind = kindOf(symbol)

  if (kind === 'type') {
    // The alias body is the contract; the declared type of `type X = …` prints as `X`.
    const declaration = symbol.declarations?.[0]
    const body =
      declaration && ts.isTypeAliasDeclaration(declaration)
        ? flat(declaration.type.getText())
        : flat(checker.typeToString(checker.getDeclaredTypeOfSymbol(symbol), undefined, FORMAT_FLAGS))
    return [{ path: name, kind, signature: body }]
  }

  if (!STRUCTURAL_KINDS.has(kind)) {
    return [{ path: name, kind, signature: typeOf(symbol, checker) }]
  }

  const members = checker
    .getPropertiesOfType(checker.getDeclaredTypeOfSymbol(symbol))
    .map((property) => {
      const optional = property.flags & ts.SymbolFlags.Optional ? '?' : ''
      // Access modifiers are part of the contract: a member going from public to
      // protected breaks a consumer, and the snapshot has to see the difference.
      const declaration = property.declarations?.[0]
      const modifiers = declaration && ts.canHaveModifiers(declaration) ? (ts.getModifiers(declaration) ?? []) : []
      const access = modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.PrivateKeyword)
        ? 'private '
        : modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ProtectedKeyword)
          ? 'protected '
          : ''
      return { path: `${name}.${property.getName()}${optional}`, kind: 'member', signature: `${access}${typeOf(property, checker)}` }
    })
    .sort((a, b) => a.path.localeCompare(b.path))

  return [{ path: name, kind, signature: '' }, ...members]
}

/** The first target a conditional export resolves to. */
function firstTarget(entry: ExportEntry | undefined): string | null {
  if (typeof entry === 'string') return entry
  if (Array.isArray(entry)) {
    for (const item of entry) {
      const found = firstTarget(item)
      if (found) return found
    }
    return null
  }
  if (!isExportMap(entry)) return null
  for (const key of ['types', 'import', 'default', 'require', 'production']) {
    const found = firstTarget(entry[key])
    if (found) return found
  }
  return null
}

/**
 * Source file behind a published target: `./dist/deep-merge.mjs` -> `src/deep-merge.ts`.
 * Returns null when no such source exists, which is how non-code exports
 * (`./package.json`) drop out.
 */
export function sourceForTarget(pkgDir: string, target: string): string | null {
  const relative = target.replace(/^\.\//, '')
  // A subpath may point straight at `src/` — `test-utils/publish-smoke` does — so both
  // forms are accepted; requiring `dist/` silently dropped those entry points from the
  // snapshot, and with them any breaking change to what they export.
  if (!relative.startsWith('dist/') && !relative.startsWith('src/')) return null

  const stem = relative.replace(/^(?:dist|src)\//, '').replace(/\.(?:d\.[cm]?ts|[cm]?js|[cm]?ts|tsx)$/, '')
  // `src/` first, then the package root: the devtools Vite plugin is built from
  // `vite/plugin.ts`, and looking only under `src/` dropped that entry point.
  for (const candidate of [`src/${stem}.ts`, `src/${stem}/index.ts`, `src/${stem}.tsx`, `${stem}.ts`, `${stem}/index.ts`]) {
    if (existsSync(join(pkgDir, candidate))) return candidate
  }
  return null
}

/** Entry points of `pkg`, as `subpath -> source file`. */
export function entryPoints(pkgDir: string, pkg: PackageManifest): Map<string, string> {
  const found = new Map<string, string>()
  const exports = pkg.exports

  if (isExportMap(exports) && Object.keys(exports).some((key) => key.startsWith('.'))) {
    for (const [subpath, entry] of Object.entries(exports)) {
      const target = firstTarget(entry)
      const source = target ? sourceForTarget(pkgDir, target) : null
      if (source) found.set(subpath, source)
    }
  } else {
    const target = firstTarget(exports) ?? pkg.types ?? pkg.main ?? null
    const source = target ? sourceForTarget(pkgDir, target) : null
    if (source) found.set('.', source)
  }

  // Only fall back when nothing was declared at all: inventing a `.` for a manifest whose
  // exports map deliberately has no root entry would snapshot an API it does not publish.
  const declaresSubpaths = isExportMap(exports) && Object.keys(exports).some((key) => key.startsWith('.'))
  if (found.size === 0 && !declaresSubpaths && existsSync(join(pkgDir, 'src/index.ts'))) found.set('.', 'src/index.ts')
  return found
}

/** Exported symbols of every entry point, sorted for a stable snapshot. */
export function readSurface(pkgDir: string, pkg: PackageManifest): EntryPointSurface[] {
  const entryFiles = [...entryPoints(pkgDir, pkg)].sort(([a], [b]) => a.localeCompare(b))
  if (entryFiles.length === 0) return []

  const program = ts.createProgram(
    entryFiles.map(([, file]) => join(pkgDir, file)),
    {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      skipLibCheck: true,
      noEmit: true,
      strict: true,
    },
  )
  const checker = program.getTypeChecker()

  return entryFiles.map(([subpath, file]) => {
    const source = program.getSourceFile(join(pkgDir, file))
    const moduleSymbol = source ? checker.getSymbolAtLocation(source) : undefined
    const exported = moduleSymbol ? checker.getExportsOfModule(moduleSymbol) : []

    const entries = exported
      .map((exportedSymbol) => ({ name: exportedSymbol.getName(), symbol: resolveAlias(exportedSymbol, checker) }))
      .sort((a, b) => a.name.localeCompare(b.name))
      .flatMap(({ name, symbol }) => entriesForSymbol(name, symbol, checker))

    return { subpath, file, entries }
  })
}

/** The snapshot text for one package: one line per export or member, stable order. */
export function renderSurface(surface: EntryPointSurface[]): string {
  const lines: string[] = []
  for (const entry of surface) {
    lines.push(`# ${entry.subpath} (${entry.file})`)
    for (const item of entry.entries) lines.push(item.signature ? `${item.kind} ${item.path}: ${item.signature}` : `${item.kind} ${item.path}`)
    lines.push('')
  }
  return lines.join('\n')
}

/** Parse a snapshot back into `subpath path -> kind + signature`. */
export function indexSnapshot(text: string): Map<string, string> {
  const index = new Map<string, string>()
  let subpath = '.'

  for (const line of text.split('\n')) {
    if (line.startsWith('# ')) {
      subpath = line.slice(2).split(' ')[0]!
      continue
    }
    if (!line.trim()) continue

    const withSignature = /^(\w+) ([^:\s]+): (.*)$/.exec(line)
    if (withSignature) {
      index.set(`${subpath} ${withSignature[2]!}`, `${withSignature[1]!} ${withSignature[3]!}`)
      continue
    }
    const bare = /^(\w+) (\S+)$/.exec(line)
    if (bare) index.set(`${subpath} ${bare[2]!}`, `${bare[1]!} `)
  }
  return index
}

/** The same index, built from a freshly read surface. */
export function indexSurface(surface: EntryPointSurface[]): Map<string, string> {
  const index = new Map<string, string>()
  for (const entry of surface) {
    for (const item of entry.entries) index.set(`${entry.subpath} ${item.path}`, `${item.kind} ${item.signature}`)
  }
  return index
}
