import { builtinModules } from 'node:module'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineCommand } from 'citty'
import { catalogRef, isNonRegistrySpec, isWorkspaceProtocol, readCatalog } from '../utils/catalog'
import { walkFiles } from '../utils/fs-walk'
import { SOURCE_EXTENSIONS, fileImports } from '../utils/imports'
import { listWorkspacePackages } from '../utils/git-baseline'
import { INSTALLED_DEPENDENCY_FIELDS, type PackageManifest } from '../utils/manifest'
import { repoRoot } from '../utils/workspace'

const DEPENDENCY_FIELDS = [...INSTALLED_DEPENDENCY_FIELDS, 'devDependencies'] as const
type DependencyField = (typeof DEPENDENCY_FIELDS)[number]

const BUILTINS = new Set([...builtinModules, ...builtinModules.map((name) => `node:${name}`)])

export interface DepsFinding {
  pkg: string
  code: string
  message: string
}

export interface DepsAuditReport {
  errors: DepsFinding[]
  warnings: DepsFinding[]
  checked: string[]
  unusedCatalogEntries: string[]
}

/**
 * The installable package a specifier resolves to: `@scope/name/sub` → `@scope/name`,
 * `pkg/sub` → `pkg`. Relative and absolute paths, and Nuxt/Vite virtual ids, are not
 * packages and return null.
 */
export function packageOfSpecifier(specifier: string): string | null {
  if (!specifier || specifier.startsWith('.') || specifier.startsWith('/') || specifier.startsWith('#')) return null
  if (specifier.startsWith('virtual:') || specifier.startsWith('\0')) return null
  if (BUILTINS.has(specifier)) return null

  const parts = specifier.split('/')
  const name = specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]!
  return BUILTINS.has(name) ? null : name
}

export interface ImportedPackages {
  /** Packages needed at runtime by anyone who installs this one. */
  value: Set<string>
  /** Packages referenced only from `import type` — erased from the JS output. */
  typeOnly: Set<string>
}

/** Every package imported from the sources under `dir`, split by runtime relevance. */
export function importedPackages(dir: string): ImportedPackages {
  const value = new Set<string>()
  const typeOnly = new Set<string>()
  if (!existsSync(dir)) return { value, typeOnly }

  for (const file of walkFiles(dir, { extensions: SOURCE_EXTENSIONS })) {
    const found = fileImports(readFileSync(join(dir, file), 'utf8'))
    for (const specifier of found.value) {
      const name = packageOfSpecifier(specifier)
      if (name) value.add(name)
    }
    for (const specifier of found.typeOnly) {
      const name = packageOfSpecifier(specifier)
      if (name) typeOnly.add(name)
    }
  }

  // A package imported both ways is a runtime dependency.
  for (const name of value) typeOnly.delete(name)
  return { value, typeOnly }
}

export const depsAuditCommand = defineCommand({
  meta: {
    name: 'deps-audit',
    description: [
      'Check that every workspace package declares its dependencies, and declares them',
      'through the catalog.',
      '',
      'Two failures this catches, both of which otherwise surface late and confusingly:',
      'a version pinned in a package.json while the catalog moved on, and a package',
      'imported at runtime but never declared — which unbuild only reports as',
      '"Implicitly bundling X" at pack time, long after the change that caused it.',
      '',
      'Examples:',
      '  pnpm -C scripts cli deps-audit',
      '  pnpm -C scripts cli deps-audit --json',
    ].join('\n'),
  },
  args: {
    json: { type: 'boolean', default: false, description: 'Print machine-readable output' },
    warningsAsErrors: { type: 'boolean', default: false, description: 'Exit non-zero on warnings too' },
  },
  setup({ args }) {
    const catalog = readCatalog()
    const report: DepsAuditReport = { errors: [], warnings: [], checked: [], unusedCatalogEntries: [] }

    const add = (level: 'errors' | 'warnings', pkg: string, code: string, message: string) => {
      report[level].push({ pkg, code, message })
    }

    const packages = listWorkspacePackages()
    const workspaceNames = new Set(packages.map((p) => p.name))

    // Catalog usage is counted across the whole workspace, not just the publishable
    // packages: the root manifest, the playground and the tooling packages consume most
    // of it, and leaving them out reports half the catalog as dead.
    const catalogUsed = new Set<string>()
    for (const manifestPath of walkFiles(repoRoot, { extensions: ['package.json'] })) {
      let manifest: PackageManifest
      try {
        manifest = JSON.parse(readFileSync(join(repoRoot, manifestPath), 'utf8')) as PackageManifest
      } catch {
        continue
      }
      for (const field of DEPENDENCY_FIELDS) {
        for (const [dep, spec] of Object.entries(manifest[field] ?? {})) {
          if (catalogRef(spec).isCatalog) catalogUsed.add(dep)
        }
      }
    }

    /** A dependency that names a registry version the catalog also pins will drift. */
    function checkSpec(pkgName: string, field: DependencyField, dep: string, spec: string): void {
      const { isCatalog, name: catalogName } = catalogRef(spec)

      if (isCatalog) {
        const entries = catalogName === null ? catalog.entries : (catalog.named.get(catalogName) ?? new Map())
        if (!entries.has(dep)) {
          add(
            'errors',
            pkgName,
            'catalog-missing',
            `${field}.${dep} uses "${spec}" but ${catalogName ? `catalog "${catalogName}"` : 'the catalog'} has no entry for it`,
          )
        }
        return
      }

      if (workspaceNames.has(dep) && !isWorkspaceProtocol(spec)) {
        add('errors', pkgName, 'workspace-protocol', `${field}.${dep} is a workspace package but is pinned to "${spec}" — use workspace:*`)
        return
      }

      if (isNonRegistrySpec(spec)) return

      // peerDependencies express a compatibility range for the consumer's own copy, so a
      // literal there is the correct shape, not a catalog miss.
      if (field === 'peerDependencies') return

      if (catalog.entries.has(dep)) {
        add(
          'errors',
          pkgName,
          'not-catalogued',
          `${field}.${dep} is pinned to "${spec}" while the catalog has ${catalog.entries.get(dep)} — use catalog:`,
        )
      } else {
        add('warnings', pkgName, 'outside-catalog', `${field}.${dep} is pinned to "${spec}" and is not in the catalog`)
      }
    }

    for (const { name, dir, pkg } of packages) {
      report.checked.push(name)

      for (const field of DEPENDENCY_FIELDS) {
        for (const [dep, spec] of Object.entries(pkg[field] ?? {})) checkSpec(name, field, dep, spec)
      }

      // Anything imported from src has to be installed alongside the published package.
      const declared = new Set(INSTALLED_DEPENDENCY_FIELDS.flatMap((field) => Object.keys(pkg[field] ?? {})))
      const imported = importedPackages(join(dir, 'src'))

      for (const dep of imported.value) {
        if (dep === name || declared.has(dep)) continue
        if (pkg.devDependencies?.[dep]) {
          // Legitimate when the bundler inlines it (devtools-ui bundles Vue on purpose),
          // wrong when it does not — which the build cannot tell us here.
          add(
            'warnings',
            name,
            'dev-only-import',
            `src imports "${dep}" at runtime but it is only a devDependency — correct only if the build inlines it`,
          )
          continue
        }
        add('errors', name, 'undeclared-import', `src imports "${dep}" but nothing declares it — the published package would be installed without it`)
      }

      for (const dep of imported.typeOnly) {
        if (dep === name || declared.has(dep) || pkg.devDependencies?.[dep]) continue
        add(
          'warnings',
          name,
          'undeclared-type-import',
          `src has \`import type\` from "${dep}" with no declaration — the emitted .d.ts will reference a package consumers may not have`,
        )
      }

      for (const dep of Object.keys(pkg.dependencies ?? {})) {
        if (!imported.value.has(dep) && !imported.typeOnly.has(dep)) {
          add('warnings', name, 'unused-dependency', `dependencies.${dep} is never imported from src`)
        }
      }

      // A peer the package cannot resolve locally cannot be typechecked or tested here.
      for (const dep of Object.keys(pkg.peerDependencies ?? {})) {
        if (!pkg.devDependencies?.[dep] && !pkg.dependencies?.[dep]) {
          add(
            'warnings',
            name,
            'peer-without-dev',
            `peerDependencies.${dep} has no devDependency — it cannot be resolved when building or testing this package`,
          )
        }
      }
    }

    report.unusedCatalogEntries = [...catalog.entries.keys()].filter((dep) => !catalogUsed.has(dep)).sort()

    if (args.json) {
      console.log(JSON.stringify(report, null, 2))
    } else {
      console.log(`Checked ${report.checked.length} workspace package(s) against ${catalog.entries.size} catalog entries\n`)
      for (const finding of report.errors) console.log(`  ✖ ${finding.pkg} [${finding.code}] ${finding.message}`)
      for (const finding of report.warnings) console.log(`  ⚠ ${finding.pkg} [${finding.code}] ${finding.message}`)
      if (report.unusedCatalogEntries.length > 0) {
        console.log(`\nCatalog entries no workspace package uses (${report.unusedCatalogEntries.length}): ${report.unusedCatalogEntries.join(', ')}`)
      }
      console.log(`\nerrors: ${report.errors.length}, warnings: ${report.warnings.length}`)
    }

    if (report.errors.length > 0 || (args.warningsAsErrors && report.warnings.length > 0)) process.exit(1)
  },
})
