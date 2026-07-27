import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineCommand } from 'citty'
import { assertBaseResolvable, changedPackageNames, listWorkspacePackages, resolveBase, run, type PackageManifest } from '../utils/git-baseline'
import { repoRoot } from '../utils/workspace'

type Manifest = PackageManifest & { exports?: unknown; files?: string[] }

interface Entry {
  name: string
  localVersion: string
  npmVersion: string | null
  errors: string[]
  warnings: string[]
  info: string[]
}

export const comparePublishedCommand = defineCommand({
  meta: {
    name: 'compare-published',
    description: [
      'Compare locally packed tarballs with the latest published version on npm.',
      '',
      'Only local-pack problems fail the run (hashed chunks in dist, astro client CJS);',
      'differences against the published version are reported as warnings. Hence',
      '`--local-only`, which keeps the gates but needs no network — that is what PRs use.',
      '',
      'Examples:',
      '  pnpm -C scripts cli compare-published',
      '  pnpm -C scripts cli compare-published --json',
      '  pnpm -C scripts cli compare-published --package path-strategy',
      '  pnpm -C scripts cli compare-published --local-only --changed-only',
    ].join('\n'),
  },
  args: {
    json: { type: 'boolean', default: false, description: 'Print machine-readable output' },
    localOnly: { type: 'boolean', default: false, description: 'Skip the npm comparison; keep the local packaging gates' },
    skipDownload: { type: 'boolean', default: false, description: 'Reuse previously downloaded npm tarballs' },
    changedOnly: { type: 'boolean', default: false, description: 'Only inspect packages changed since the baseline' },
    base: { type: 'string', description: 'Baseline ref for --changed-only' },
    package: { type: 'string', description: 'Inspect a single package by directory name' },
  },
  setup({ args }) {
    const packagesRoot = join(repoRoot, 'packages')
    const cacheRoot = join(repoRoot, '.compare-published')
    const packageFilter = args.package ?? null

    function npmVersion(name: string): string | null {
      try {
        return run('npm', ['view', name, 'version'])
      } catch {
        return null
      }
    }

    function npmPack(cwd: string, dest: string, spec?: string): { tarball: string; files: string[] } {
      mkdirSync(dest, { recursive: true })
      const packArgs = ['pack', '--json', '--pack-destination', dest]
      if (spec) packArgs.push(spec)
      const output = run('npm', packArgs, { cwd: spec ? repoRoot : cwd })
      const parsed = JSON.parse(output)
      const first = parsed[0]
      if (!first?.filename) throw new Error(`npm pack returned no tarball (${spec ?? cwd})`)
      return {
        tarball: join(dest, first.filename),
        files: ((first.files ?? []) as { path: string }[]).map((f) => f.path.replace(/\\/g, '/')),
      }
    }

    function listTarballPaths(tarball: string): string[] {
      const listing = run('tar', ['-tzf', tarball])
      return listing
        .split('\n')
        .filter(Boolean)
        .map((p) => p.replace(/\\/g, '/'))
        .map((p) => (p.startsWith('package/') ? p.slice('package/'.length) : p))
        .filter((p) => p && p !== 'package')
    }

    function readPackedManifest(tarball: string): Manifest {
      const extractDir = join(cacheRoot, '_manifest-extract')
      rmSync(extractDir, { recursive: true, force: true })
      mkdirSync(extractDir, { recursive: true })
      run('tar', ['-xzf', tarball, '-C', extractDir, 'package/package.json'])
      return JSON.parse(readFileSync(join(extractDir, 'package/package.json'), 'utf8'))
    }

    function collectExportTypePaths(value: unknown, out: string[] = []): string[] {
      // The string branch used to sit after the object guard, so it never ran and a
      // plain `"./x.d.ts"` export was silently skipped. TypeScript surfaced it as an
      // unreachable `never`; checking strings first is what was meant all along.
      if (typeof value === 'string') {
        if (/\.d\.(?:ts|cts|mts)$/.test(value)) out.push(value.replace(/^\.\//, ''))
        return out
      }
      if (!value || typeof value !== 'object') return out
      if ('types' in value && typeof value.types === 'string') {
        out.push(value.types.replace(/^\.\//, ''))
      }
      for (const child of Object.values(value)) collectExportTypePaths(child, out)
      return out
    }

    const HASHED_CHUNK_RE = /^(?:base-strategy|common)-[A-Za-z0-9_-]{6,}\.(?:js|cjs|mjs)$/
    const DIST_RUNTIME_RE = /^dist\/[^/]+\.(?:mjs|cjs|js)$/

    const results = []
    let errorCount = 0

    function checkLocalPackaging(entry: Entry, name: string, localPaths: string[]): number {
      let added = 0
      const errors = entry.errors

      const hashedInLocal = localPaths
        .filter((p) => p.startsWith('dist/'))
        .map((p) => p.replace(/^dist\//, ''))
        .filter((n) => HASHED_CHUNK_RE.test(n))
      if (hashedInLocal.length) {
        errors.push(`hashed chunks in local dist: ${hashedInLocal.join(', ')}`)
        added++
      }

      if (name === '@i18n-micro/astro') {
        const clientCjs = localPaths.filter((p) => /^dist\/client\/.*\.cjs$/.test(p))
        if (clientCjs.length) {
          errors.push(`astro client CJS artifacts in pack: ${clientCjs.join(', ')}`)
          added++
        }
      }

      return added
    }

    let changedNames = null
    if (args.changedOnly) {
      const base = resolveBase(args.base)
      assertBaseResolvable(base)
      changedNames = changedPackageNames(base)
      // Not under --json: it would sit in front of the document and make stdout unparseable.
      if (!args.json) console.log(`Only checking packages changed since ${base}: ${changedNames.size ? [...changedNames].join(', ') : '(none)'}\n`)
    }

    for (const { name, dir, localVersion } of listWorkspacePackages(packageFilter)) {
      if (changedNames && !changedNames.has(name)) continue
      const npmVer = args.localOnly ? null : npmVersion(name)

      const entry: Entry = {
        name,
        localVersion,
        npmVersion: npmVer,
        warnings: [],
        info: [],
        errors: [],
      }

      // No reference to compare against (either --local-only, or not published yet):
      // still pack locally so the gating checks run.
      if (!npmVer) {
        entry.info.push(args.localOnly ? 'local-only mode — skipped npm reference comparison' : 'not published on npm yet — skipping ref download')
        const localDir = join(cacheRoot, name.replace('@', '').replace('/', '__'), `local-${localVersion}`)
        try {
          mkdirSync(cacheRoot, { recursive: true })
          rmSync(localDir, { recursive: true, force: true })
          mkdirSync(localDir, { recursive: true })
          const local = npmPack(dir, localDir)
          errorCount += checkLocalPackaging(entry, name, listTarballPaths(local.tarball))
        } catch (error) {
          entry.errors.push(error instanceof Error ? error.message : String(error))
          errorCount++
        }
        results.push(entry)
        continue
      }

      const cacheKey = name.replace('@', '').replace('/', '__')
      const refDir = join(cacheRoot, cacheKey, `npm-${npmVer}`)
      const localDir = join(cacheRoot, cacheKey, `local-${localVersion}`)
      mkdirSync(cacheRoot, { recursive: true })

      try {
        let refTarball: string
        if (args.skipDownload && existsSync(join(refDir, '.done'))) {
          const cached = readdirSync(refDir).filter((f: string) => f.endsWith('.tgz'))
          refTarball = join(refDir, cached[0]!)
        } else {
          rmSync(refDir, { recursive: true, force: true })
          mkdirSync(refDir, { recursive: true })
          const ref = npmPack(dir, refDir, `${name}@${npmVer}`)
          refTarball = ref.tarball
          writeFileSync(join(refDir, '.done'), refTarball)
        }

        rmSync(localDir, { recursive: true, force: true })
        mkdirSync(localDir, { recursive: true })
        const local = npmPack(dir, localDir)
        const refPaths = listTarballPaths(refTarball)
        const localPaths = listTarballPaths(local.tarball)
        const refPkg = readPackedManifest(refTarball)
        const localPkg = readPackedManifest(local.tarball)

        const refSet = new Set(refPaths)
        const localSet = new Set(localPaths)
        const onlyRef = [...refSet].filter((p) => !localSet.has(p))
        const onlyLocal = [...localSet].filter((p) => !refSet.has(p))

        for (const f of onlyRef.filter((p) => DIST_RUNTIME_RE.test(p))) {
          entry.warnings.push(`removed dist runtime: ${f}`)
        }
        for (const f of onlyLocal.filter((p) => DIST_RUNTIME_RE.test(p))) {
          entry.warnings.push(`added dist runtime: ${f}`)
        }

        const refTypes = new Set(collectExportTypePaths(refPkg.exports))
        const localTypes = new Set(collectExportTypePaths(localPkg.exports))
        for (const t of localTypes) {
          const base = t.split('/').pop() ?? t
          const refMatch = [...refTypes].find((r) => r === t || r.endsWith(`/${base}`) || r.endsWith(base))
          if (!refMatch && refTypes.size > 0) {
            entry.info.push(`new types export path: ${t}`)
          } else if (refMatch && refMatch !== t) {
            entry.warnings.push(`types path changed: ${refMatch} → ${t}`)
          }
        }
        for (const t of refTypes) {
          if (!localTypes.has(t) && !localPaths.includes(t)) {
            entry.warnings.push(`types path removed from exports: ${t}`)
          }
        }

        errorCount += checkLocalPackaging(entry, name, localPaths)

        if (localVersion !== npmVer) {
          entry.info.push(`version bump ${npmVer} → ${localVersion}`)
        }

        if (localPkg.exports && !refPkg.exports) {
          entry.info.push('local package.json adds exports field')
        }

        const refDcts = refPaths.filter((p) => p.endsWith('.d.cts'))
        const localDcts = localPaths.filter((p) => p.endsWith('.d.cts'))
        if (localDcts.length > refDcts.length) {
          entry.info.push(`added ${localDcts.length - refDcts.length} .d.cts file(s) for require types`)
        }

        if (onlyRef.length > 0 || onlyLocal.length > 0) {
          entry.info.push(`tarball diff: +${onlyLocal.length} / -${onlyRef.length} paths`)
        }
      } catch (error) {
        entry.errors.push(error instanceof Error ? error.message : String(error))
        errorCount++
      }

      results.push(entry)
    }

    if (args.json) {
      console.log(JSON.stringify({ results, errorCount }, null, 2))
    } else {
      console.log(`Compared ${results.length} package(s) (local npm pack vs npm latest)\n`)
      for (const entry of results) {
        const label = entry.name
        const errs = entry.errors
        const warns = entry.warnings
        const info = entry.info
        const status = errs.length ? '✖' : warns.length ? '⚠' : '✓'
        console.log(`${status} ${label} (npm ${entry.npmVersion ?? '—'} → local ${entry.localVersion})`)
        for (const m of errs) console.log(`    error: ${m}`)
        for (const m of warns) console.log(`    warn: ${m}`)
        for (const m of info) console.log(`    info: ${m}`)
        console.log()
      }
      const ok = results.filter((r) => r.errors.length === 0).length
      console.log(`OK: ${ok}/${results.length} (errors: ${errorCount})`)
    }

    if (errorCount > 0) process.exit(1)
  },
})
