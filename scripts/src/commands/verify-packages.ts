import { execFileSync } from 'node:child_process'
import { existsSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { defineCommand } from 'citty'
import { listWorkspacePackages, type PackageManifest } from '../utils/git-baseline'

type Manifest = PackageManifest & { exports?: unknown; main?: string; module?: string; types?: string; files?: string[]; bin?: unknown }

interface Finding {
  pkg: string
  code: string
  message: string
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
    const report: { errors: Finding[]; warnings: Finding[]; ok: string[] } = { errors: [], warnings: [], ok: [] }

    const add = (level: 'errors' | 'warnings', pkg: string, code: string, message: string) => {
      report[level].push({ pkg, code, message })
    }

    function collectRelativePaths(value: unknown, paths: Set<string>): void {
      if (typeof value === 'string') {
        if (value.startsWith('./') || value.startsWith('../')) paths.add(value)
        return
      }
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        for (const v of Object.values(value)) collectRelativePaths(v, paths)
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

    function checkDualPackageTypes(pkgName: string, pkgDir: string, pkg: Manifest): void {
      const exports = pkg.exports as Record<string, unknown> | undefined
      if (!exports || typeof exports !== 'object' || pkg.type !== 'module') return

      const root = exports['.'] as Record<string, unknown> | undefined
      if (!root || typeof root !== 'object') return

      const hasRequire = typeof root === 'object' && ('require' in root || (typeof root.require === 'object' && root.require !== null))
      if (!hasRequire) return

      const importTypes =
        typeof root.import === 'object' && root.import && 'types' in root.import
          ? root.import.types
          : typeof root.types === 'string'
            ? root.types
            : null
      const requireTypes = typeof root.require === 'object' && root.require && 'types' in root.require ? root.require.types : null

      if (typeof root.types === 'string' && (root.import || root.require)) {
        add(
          'warnings',
          pkgName,
          'exports-types-top-level',
          'Root export "." uses top-level "types" with import/require conditions — prefer types under import/require',
        )
      }

      if (requireTypes && !String(requireTypes).endsWith('.d.cts')) {
        add('warnings', pkgName, 'require-types-cts', `require.types should use .d.cts for "type":"module" (got ${requireTypes})`)
      }

      if (importTypes && requireTypes && importTypes === requireTypes) {
        add('warnings', pkgName, 'same-types-import-require', 'import.types and require.types point to the same file — use .d.cts for require')
      }

      // Everything above only fires when at least one types entry exists. A dual export
      // with none at all is the worse case — TypeScript resolves no types for either
      // condition — and it was passing silently.
      if (!importTypes && !requireTypes) {
        add(
          'errors',
          pkgName,
          'exports-no-types',
          'Root export "." has import/require conditions but declares no "types" — consumers resolve no types at all',
        )
      } else if (!requireTypes) {
        add(
          'warnings',
          pkgName,
          'require-no-types',
          'Root export "." has a "require" condition with no "types" — CommonJS consumers resolve no types',
        )
      }
    }

    function checkPublishFields(pkgName: string, pkgDir: string, pkg: Manifest): void {
      if (!pkg.license) {
        add('warnings', pkgName, 'missing-license', 'Missing "license" field')
      }
      if (pkg.sideEffects === undefined && pkg.exports) {
        add('warnings', pkgName, 'missing-sideEffects', 'Missing "sideEffects" (recommended false for libraries)')
      }
      if (!(pkg.engines as { node?: string } | undefined)?.node) {
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
      checkDualPackageTypes(pkgName, pkgDir, pkg)
    }

    /**
     * Would `npm pack` include `rel`, given this manifest's "files"?
     *
     * Deliberately coarse: it only answers for the prefixes `files` can express, and
     * treats an absent `files` (everything ships) and npm's always-included entries as
     * published. Being wrong here would mean a false error on a working package, so it
     * errs towards published.
     */
    function isPublished(pkg: Manifest, rel: string): boolean {
      const files = pkg.files
      if (!Array.isArray(files)) return true

      const path = rel.replace(/^\.\//, '')
      // npm publishes these regardless of "files".
      if (/^(package\.json|README|LICEN[CS]E|CHANGELOG)/i.test(path)) return true

      return files.some((entry) => {
        if (typeof entry !== 'string') return false
        const pattern = entry.replace(/^\.\//, '').replace(/^!/, '').replace(/\/$/, '')
        if (!pattern) return false
        // A bare directory name in "files" ships the whole subtree.
        const star = pattern.indexOf('*')
        const prefix = star === -1 ? pattern : pattern.slice(0, star).replace(/\/$/, '')
        if (!prefix) return true
        return path === prefix || path.startsWith(`${prefix}/`)
      })
    }

    function checkReferencedFiles(pkgName: string, pkgDir: string, pkg: Manifest): void {
      const relPaths = new Set<string>()
      collectRelativePaths(pkg.exports, relPaths)
      for (const field of ['main', 'module', 'types']) {
        if (typeof pkg[field] !== 'string') continue
        const value = pkg[field] as string
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
