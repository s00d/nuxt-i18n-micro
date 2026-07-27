import { execFileSync } from 'node:child_process'
import { existsSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { defineCommand } from 'citty'
import { listWorkspacePackages } from '../utils/git-baseline'
import { FILE_FIELDS, type ExportEntry, type PackageManifest, isExportMap, typesTargetOf } from '../utils/manifest'

/** One packaging complaint. Exported: it is the `--json` contract. */
export interface Finding {
  pkg: string
  code: string
  message: string
}

export interface VerifyPackagesReport {
  errors: Finding[]
  warnings: Finding[]
  ok: string[]
}

export interface TypedFinding {
  level: 'errors' | 'warnings'
  code: string
  message: string
}

/**
 * Problems with the `types` conditions of a dual CJS/ESM root export.
 *
 * Only meaningful for `"type": "module"` packages that expose a `require` condition —
 * that is the shape where TypeScript resolves types per condition and a missing or
 * mis-extensioned entry silently gives CommonJS consumers no types at all.
 */
export function dualPackageTypeFindings(pkg: PackageManifest): TypedFinding[] {
  if (pkg.type !== 'module' || !isExportMap(pkg.exports)) return []

  const root = pkg.exports['.']
  if (!isExportMap(root) || !('require' in root)) return []

  const findings: TypedFinding[] = []
  // A top-level `types` inside the "." object is a condition of its own and applies to
  // both `import` and `require`, so it counts as types for either — it is just not the
  // recommended shape.
  const rootTypes = typesTargetOf(root)
  const importTypes = typesTargetOf(root.import) ?? rootTypes
  const requireTypes = typesTargetOf(root.require)

  if (rootTypes && (root.import || root.require)) {
    findings.push({
      level: 'warnings',
      code: 'exports-types-top-level',
      message: 'Root export "." uses top-level "types" with import/require conditions — prefer types under import/require',
    })
  }

  if (requireTypes && !requireTypes.endsWith('.d.cts')) {
    findings.push({
      level: 'warnings',
      code: 'require-types-cts',
      message: `require.types should use .d.cts for "type":"module" (got ${requireTypes})`,
    })
  }

  if (importTypes && requireTypes && importTypes === requireTypes) {
    findings.push({
      level: 'warnings',
      code: 'same-types-import-require',
      message: 'import.types and require.types point to the same file — use .d.cts for require',
    })
  }

  if (!importTypes && !requireTypes) {
    findings.push({
      level: 'errors',
      code: 'exports-no-types',
      message: 'Root export "." has import/require conditions but declares no "types" — consumers resolve no types at all',
    })
  } else if (!requireTypes && !rootTypes) {
    findings.push({
      level: 'warnings',
      code: 'require-no-types',
      message: 'Root export "." has a "require" condition with no "types" — CommonJS consumers resolve no types',
    })
  }

  return findings
}

/**
 * Would `npm pack` include `rel`, given this manifest's "files"?
 *
 * Deliberately coarse: it only answers for the prefixes `files` can express, and treats
 * an absent `files` (everything ships) and npm's always-included entries as published.
 * Being wrong here would mean a false error on a working package, so it errs towards
 * published.
 */
export function isPublished(pkg: PackageManifest, rel: string): boolean {
  const files = pkg.files
  if (!Array.isArray(files)) return true

  const path = rel.replace(/^\.\//, '')
  // npm publishes these regardless of "files".
  if (/^(package\.json|README|LICEN[CS]E|CHANGELOG)/i.test(path)) return true

  let included = false
  for (const entry of files) {
    if (typeof entry !== 'string') continue
    const negated = entry.startsWith('!')
    const pattern = entry.replace(/^!/, '').replace(/^\.\//, '').replace(/\/$/, '')
    if (!pattern) continue
    const star = pattern.indexOf('*')
    const prefix = star === -1 ? pattern : pattern.slice(0, star).replace(/\/$/, '')
    if (negated && !prefix) continue
    const matches = !prefix || path === prefix || path.startsWith(`${prefix}/`)
    if (matches) included = !negated
  }
  return included
}

export const verifyPackagesCommand = defineCommand({
  meta: {
    name: 'verify-packages',
    description: [
      'Check every workspace package for the packaging mistakes that only surface after',
      'publishing: exports pointing at files that were never built, a `types` condition',
      'missing from a dual CJS/ESM export, `files` that omits something the manifest',
      'references.',
      '',
      'Examples:',
      '  pnpm -C scripts cli verify-packages',
      '  pnpm -C scripts cli verify-packages --publint',
      '  pnpm -C scripts cli verify-packages --json',
    ].join('\n'),
  },
  args: {
    publint: {
      type: 'boolean',
      default: false,
      description: 'Also run publint against each package',
    },
    json: {
      type: 'boolean',
      default: false,
      description: 'Print machine-readable output',
    },
  },
  setup({ args }) {
    const report: VerifyPackagesReport = { errors: [], warnings: [], ok: [] }

    const add = (level: 'errors' | 'warnings', pkg: string, code: string, message: string) => {
      report[level].push({ pkg, code, message })
    }

    function collectRelativePaths(value: ExportEntry | undefined, paths: Set<string>): void {
      if (typeof value === 'string') {
        if (value.startsWith('./') || value.startsWith('../')) paths.add(value)
        return
      }
      if (Array.isArray(value)) {
        for (const item of value) collectRelativePaths(item, paths)
        return
      }
      if (isExportMap(value)) {
        for (const item of Object.values(value)) collectRelativePaths(item, paths)
      }
    }

    function resolvePkgPath(pkgDir: string, rel: string): string {
      return resolve(pkgDir, rel.replace(/^\.\//, ''))
    }

    function pathExists(pkgDir: string, rel: string): boolean {
      if (rel.includes('*')) {
        const base = (rel.split('*')[0] ?? '').replace(/\/$/, '')
        const dir = resolvePkgPath(pkgDir, base || '.')
        return existsSync(dir) && statSync(dir).isDirectory()
      }
      return existsSync(resolvePkgPath(pkgDir, rel))
    }

    function checkPublishFields(pkgName: string, pkgDir: string, pkg: PackageManifest): void {
      if (!pkg.license) {
        add('warnings', pkgName, 'missing-license', 'Missing "license" field')
      }
      if (pkg.sideEffects === undefined && pkg.exports) {
        add('warnings', pkgName, 'missing-sideEffects', 'Missing "sideEffects" (recommended false for libraries)')
      }
      if (!pkg.engines?.node) {
        add('warnings', pkgName, 'missing-engines', 'Missing engines.node')
      }
      if (pkg.module && pkg.exports) {
        add('warnings', pkgName, 'redundant-module', 'Redundant "module" field when "exports" is set')
      }
      if (existsSync(join(pkgDir, 'LICENSE')) && Array.isArray(pkg.files) && !pkg.files.includes('LICENSE')) {
        add('warnings', pkgName, 'files-license', '"files" should include LICENSE')
      }
      if (existsSync(join(pkgDir, 'README.md')) && Array.isArray(pkg.files) && !pkg.files.includes('README.md')) {
        add('warnings', pkgName, 'files-readme', '"files" should include README.md')
      }
      for (const finding of dualPackageTypeFindings(pkg)) add(finding.level, pkgName, finding.code, finding.message)
    }

    function checkReferencedFiles(pkgName: string, pkgDir: string, pkg: PackageManifest): void {
      const relPaths = new Set<string>()
      collectRelativePaths(pkg.exports, relPaths)
      for (const field of FILE_FIELDS) {
        const value = pkg[field]
        if (typeof value !== 'string') continue
        relPaths.add(value.startsWith('./') || value.startsWith('../') ? value : `./${value}`)
      }
      if (Array.isArray(pkg.files)) {
        for (const entry of pkg.files) {
          if (typeof entry === 'string' && !entry.includes('*')) relPaths.add(`./${entry}`)
        }
      }

      const unique = [...relPaths]
      for (const rel of unique) {
        if (rel === './package.json') continue
        if (!pathExists(pkgDir, rel)) {
          add('errors', pkgName, 'missing-file', `Referenced path does not exist: ${rel}`)
          continue
        }
        // Existing on disk is not the same as reaching the registry: "files" decides
        // what `npm pack` includes, and an export left out of it resolves locally and
        // 404s for everyone else.
        if (!isPublished(pkg, rel)) {
          add('errors', pkgName, 'unpublished-file', `Referenced path is excluded by "files" and will not be published: ${rel}`)
        }
      }

      if (unique.some((p) => p.startsWith('./dist/')) && !existsSync(join(pkgDir, 'dist'))) {
        add('warnings', pkgName, 'no-dist', 'Package references ./dist/* but dist/ is missing — run pnpm run build in this package')
      }
    }

    function runPublintForPackage(pkgName: string, pkgDir: string): void {
      try {
        execFileSync('pnpm', ['exec', 'publint'], { cwd: pkgDir, encoding: 'utf8', stdio: ['pipe', 'pipe', 'inherit'] })
        report.ok.push(pkgName)
      } catch (error) {
        const err = error as { stdout?: Buffer; stderr?: Buffer; message?: string }
        const stdout = err.stdout?.toString() ?? ''
        const stderr = err.stderr?.toString() ?? ''
        const detail = (stdout + stderr).trim() || err.message || 'publint failed'
        add('errors', pkgName, 'publint', detail.split('\n')[0] || 'publint failed')
      }
    }

    const packages = listWorkspacePackages()

    for (const { name, dir, pkg } of packages) {
      checkPublishFields(name, dir, pkg)
      checkReferencedFiles(name, dir, pkg)
      if (args.publint) runPublintForPackage(name, dir)
      else if (report.errors.every((e) => e.pkg !== name)) report.ok.push(name)
    }

    if (args.json) {
      console.log(JSON.stringify(report, null, 2))
    } else {
      console.log(`Checked ${packages.length} workspace package(s) under packages/\n`)
      if (report.errors.length) {
        console.log('Errors:')
        for (const { pkg, code, message } of report.errors) {
          console.log(`  ✖ ${pkg} [${code}] ${message}`)
        }
        console.log()
      }
      if (report.warnings.length) {
        console.log('Warnings:')
        for (const { pkg, code, message } of report.warnings) {
          console.log(`  ⚠ ${pkg} [${code}] ${message}`)
        }
        console.log()
      }
      const clean = report.ok.filter((n) => !report.errors.some((e) => e.pkg === n))
      console.log(`OK: ${clean.length}/${packages.length}`)
      if (args.publint) console.log('(includes publint)')
    }

    if (report.errors.length > 0) process.exit(1)
  },
})
