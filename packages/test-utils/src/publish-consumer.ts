/**
 * Compiles a small app against the packed tarballs of a package and a peer version, the way a user
 * installs them: nothing in the workspace tells whether the declarations hold on the whole peer range.
 */
import { type SpawnSyncReturns, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/** Packages a framework binding pulls in, packed from the workspace because they are unreleased here. */
const WORKSPACE_DEPENDENCIES = ['core', 'runtime', 'types', 'utils']

function run(cwd: string, command: string, args: string[]): string {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' })
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed in ${cwd}\n${result.stdout}${result.stderr}`)
  return result.stdout
}

export interface ConsumerOptions {
  /** `packages/` of the repository. */
  packagesDir: string
  /** The package under test: `react`, `preact`. */
  name: string
  /** Peer and type versions to install. */
  dependencies: Record<string, string>
  /** `compilerOptions` on top of the strict defaults. */
  compilerOptions: Record<string, unknown>
  /** File name → source. */
  files: Record<string, string>
}

/** What `tsc` printed. A failure with no diagnostics, a crash or a spawn error, must not read as a clean compile. */
export function compilerOutput(result: Pick<SpawnSyncReturns<string>, 'status' | 'stdout' | 'stderr' | 'signal' | 'error'>): string {
  const output = `${result.stdout}${result.stderr}`.trim()
  if (result.status === 0 || output) return output
  return `tsc failed: ${result.error?.message ?? `status ${result.status}, signal ${result.signal}`}`
}

/** Answers what `tsc` printed; an empty string is a clean compile. Throws when install itself fails. */
export function compileConsumer({ packagesDir, name, dependencies, compilerOptions, files }: ConsumerOptions): string {
  const root = mkdtempSync(join(tmpdir(), `i18n-consumer-${name}-`))
  try {
    const tarballs = join(root, 'tarballs')
    mkdirSync(tarballs)
    const tarball = (pkg: string) => {
      run(join(packagesDir, pkg), 'pnpm', ['pack', '--pack-destination', tarballs])
      return `file:${join(
        tarballs,
        readdirSync(tarballs).find((file) => file.startsWith(`i18n-micro-${pkg}-`))!,
      )}`
    }
    const local = Object.fromEntries(WORKSPACE_DEPENDENCIES.map((pkg) => [`@i18n-micro/${pkg}`, tarball(pkg)]))
    const manifest = {
      name: 'consumer',
      private: true,
      type: 'module',
      dependencies: { ...local, [`@i18n-micro/${name}`]: tarball(name), typescript: '5.9.3', ...dependencies },
      overrides: local,
    }
    writeFileSync(join(root, 'package.json'), JSON.stringify(manifest))
    run(root, 'npm', ['install', '--no-audit', '--no-fund', '--ignore-scripts', '--legacy-peer-deps'])
    writeFileSync(
      join(root, 'tsconfig.json'),
      JSON.stringify({
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'bundler',
          strict: true,
          // the declarations themselves are what is under test
          skipLibCheck: false,
          noEmit: true,
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
          ...compilerOptions,
        },
        include: Object.keys(files),
      }),
    )
    for (const [file, source] of Object.entries(files)) writeFileSync(join(root, file), source)
    const result = spawnSync(join(root, 'node_modules/.bin/tsc'), ['-p', '.'], { cwd: root, encoding: 'utf8' })
    return compilerOutput(result)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}
