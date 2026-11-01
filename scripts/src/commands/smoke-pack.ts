import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { defineCommand } from 'citty'
import { walkFiles } from '../utils/fs-walk'
import { INSTALLED_DEPENDENCY_FIELDS, parseManifest, type PackageManifest } from '../utils/manifest'
import { repoRoot } from '../utils/workspace'

interface Packed {
  name: string
  tarball: string
}

/** `pnpm pack` prints the tarball path on the last line of stdout. */
function pack(cwd: string, outDir: string, ignoreScripts: boolean): Packed {
  const flags = ignoreScripts ? ['--config.ignore-scripts=true'] : []
  const stdout = execFileSync('pnpm', [...flags, 'pack', '--pack-destination', outDir], {
    shell: process.platform === 'win32',
    cwd,
    encoding: 'utf8',
  })
  const tarball = stdout.trim().split('\n').pop()!.trim()
  const name = (JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8')) as { name: string }).name
  return { name, tarball }
}

/**
 * Point a tarball's own `@i18n-micro/*` dependencies at the sibling tarballs.
 *
 * `pnpm pack` turns `workspace:*` into the local version numbers, and those are exactly
 * the ones not published yet — pnpm would resolve them from the registry and fail.
 * Overrides and root-level installs do not help: a tarball's dependencies are resolved
 * on their own. Rewriting them is what keeps the install off the registry while still
 * installing the real artifact.
 */
export function relinkWorkspaceDeps(tarball: string, byName: Map<string, string>): void {
  const work = mkdtempSync(join(tmpdir(), 'i18n-relink-'))
  try {
    execFileSync('tar', ['-xzf', basename(tarball), '-C', work], { cwd: dirname(tarball) })
    const pkgPath = join(work, 'package', 'package.json')
    const pkg = parseManifest(readFileSync(pkgPath, 'utf8'))

    let changed = false
    for (const field of INSTALLED_DEPENDENCY_FIELDS) {
      const deps = pkg[field]
      if (!deps) continue
      for (const [name, tarballPath] of byName) {
        if (name in deps) {
          deps[name] = `file:${tarballPath}`
          changed = true
        }
      }
    }
    if (!changed) return

    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
    // files only, as `pnpm pack` writes it: Are The Types Wrong cannot read a directory entry
    const list = join(work, '.files')
    const files = walkFiles(work, { skipDirs: new Set() })
    writeFileSync(list, files.join('\n'))
    execFileSync('tar', ['-czf', basename(tarball), '-C', work, '-T', list], { cwd: dirname(tarball) })
  } finally {
    rmSync(work, { recursive: true, force: true })
  }
}

/**
 * Packs the root and every workspace package into `outDir`, each tarball pointing at its siblings.
 * `ignoreScripts` skips the root's `prepack`, for a caller whose `dist` is already built.
 */
export function packWorkspace(outDir: string, { ignoreScripts = false } = {}): Packed[] {
  mkdirSync(outDir, { recursive: true })
  const packageDirs = readdirSync(join(repoRoot, 'packages'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(repoRoot, 'packages', entry.name))
    .filter((dir) => {
      try {
        return Boolean(parseManifest(readFileSync(join(dir, 'package.json'), 'utf8')).name)
      } catch {
        return false
      }
    })

  const packed = [repoRoot, ...packageDirs].map((dir) => pack(dir, outDir, ignoreScripts))
  const byName = new Map(packed.map((p) => [p.name, p.tarball]))
  for (const { tarball } of packed) relinkWorkspaceDeps(tarball, byName)
  return packed
}

/**
 * A project outside the workspace that installs the tarballs. Overrides go in both homes: pnpm 9 reads
 * `package.json`, later majors read `pnpm-workspace.yaml`, and whichever pnpm is on the PATH runs here.
 */
export function writeConsumerProject(dir: string, dependencies: Record<string, string>, overrides: Record<string, string>): void {
  mkdirSync(dir, { recursive: true })
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({ name: 'consumer', private: true, type: 'module', dependencies, pnpm: { overrides } }, null, 2),
  )
  const lines = Object.entries(overrides).map(([name, version]) => `  '${name}': '${version}'`)
  writeFileSync(join(dir, 'pnpm-workspace.yaml'), `packages:\n  - .\noverrides:\n${lines.join('\n')}\n`)
}

/** Install flags for that project: no build scripts, which later pnpm majors refuse by default and nothing here needs. */
export const CONSUMER_INSTALL = ['install', '--no-frozen-lockfile', '--ignore-scripts']

export const smokePackCommand = defineCommand({
  meta: {
    name: 'smoke-pack',
    description: [
      'Prepare the smoke app to install the module straight from this checkout.',
      '',
      'Packing only the root package is not enough: `pnpm pack` resolves `workspace:*` to',
      'the local versions of `@i18n-micro/*`, and those are usually not on npm yet — the',
      'whole point of a pre-release check is that they are not. So every workspace package',
      'is packed too and each tarball is rewritten to point at its siblings.',
      '',
      'Always `pnpm pack`, never `npm pack`: only pnpm substitutes the `workspace:` and',
      '`catalog:` protocols, and a tarball still carrying them cannot be installed at all.',
      '',
      'Examples:',
      '  pnpm -C scripts cli smoke-pack',
      '  pnpm -C scripts cli smoke-pack --app test/deploy-smoke --out /tmp/tarballs',
    ].join('\n'),
  },
  args: {
    app: {
      type: 'string',
      default: 'test/deploy-smoke',
      description: 'App directory to point at the local build',
    },
    out: {
      type: 'string',
      default: '.smoke-tarballs',
      description: 'Where to write the tarballs',
    },
  },
  setup({ args }) {
    const appDir = resolve(repoRoot, args.app)
    const outDir = resolve(repoRoot, args.out)
    const packed = packWorkspace(outDir)

    const manifestPath = join(appDir, 'package.json')
    const manifest = parseManifest(readFileSync(manifestPath, 'utf8'))
    manifest.dependencies ??= {}

    const root = packed.find((p) => p.name === 'nuxt-i18n-micro')
    if (!root) throw new Error('nuxt-i18n-micro was not packed')

    manifest.dependencies['nuxt-i18n-micro'] = `file:${root.tarball}`
    manifest.pnpm ??= {}
    manifest.pnpm.overrides = Object.fromEntries(packed.filter((p) => p.name.startsWith('@i18n-micro/')).map((p) => [p.name, `file:${p.tarball}`]))

    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

    console.log(`Packed ${packed.length} package(s) into ${outDir}`)
    for (const { name, tarball } of packed) console.log(`  ${name} -> ${tarball}`)
    console.log(`\nPointed ${appDir} at the local build.`)
  },
})
