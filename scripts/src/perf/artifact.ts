import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { repoRoot } from '../utils/workspace'

/** Packages whose `src` affects the Nuxt module under test. */
export const MODULE_PACKAGE_SRC_DIRS = [
  'packages/core/src',
  'packages/utils/src',
  'packages/types/src',
  'packages/path-strategy/src',
  'packages/route-strategy/src',
  'packages/hmr/src',
] as const

const MODULE_DIST = join(repoRoot, 'dist/module.mjs')
const SERVER_ENTRY = '.output/server/index.mjs'

/** True when `dist/module.mjs` is a jiti stub that re-imports `src/module.ts`. */
export function isJitiModuleStub(content: string): boolean {
  return (
    /createJiti\s*\(/.test(content) &&
    (/src\/module\.ts/.test(content) || /jiti\.import\(/.test(content))
  )
}

export function readModuleDist(): string | null {
  if (!existsSync(MODULE_DIST)) return null
  return readFileSync(MODULE_DIST, 'utf8')
}

/** Fail if root module entry is missing or still a prepare stub. */
export function assertRealModuleDist(): void {
  const content = readModuleDist()
  if (content == null) {
    throw new Error(
      `[perf] missing ${MODULE_DIST}. Run packages build + \`nuxt-module-build build\` (not --stub) before measuring.`,
    )
  }
  if (isJitiModuleStub(content)) {
    throw new Error(
      `[perf] ${MODULE_DIST} is a jiti stub (dev:prepare). Perf measures consumer dist — run \`nuxt-module-build build\` without --stub.`,
    )
  }
}

export function assertServerEntry(fixtureRoot: string): void {
  const entry = join(fixtureRoot, SERVER_ENTRY)
  if (!existsSync(entry)) {
    throw new Error(`[perf] missing Nitro server entry after build: ${entry}`)
  }
}

/** hashInputs: fixture tree + module src + workspace packages the module imports. */
export function buildHashInputs(fixtureRoot: string): string[] {
  return [fixtureRoot, join(repoRoot, 'src'), ...MODULE_PACKAGE_SRC_DIRS.map((d) => join(repoRoot, d))]
}

function runOrThrow(command: string, args: string[], label: string): void {
  console.log(`[perf] ${label}: ${command} ${args.join(' ')}`)
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env,
  })
  if (result.status !== 0) {
    throw new Error(`[perf] ${label} failed with exit ${result.status ?? 'null'}`)
  }
}

/**
 * Ensure `@i18n-micro/*` dist + real root module dist exist (consumer path).
 * Rebuilds when missing or when the module entry is still a jiti stub.
 */
export function ensureConsumerModuleDist(): void {
  const content = readModuleDist()
  const needsModuleBuild = content == null || isJitiModuleStub(content)
  const needsPackages =
    !existsSync(join(repoRoot, 'packages/core/dist')) ||
    !existsSync(join(repoRoot, 'packages/utils/dist')) ||
    !existsSync(join(repoRoot, 'packages/types/dist'))

  if (needsPackages) {
    runOrThrow(
      'pnpm',
      [
        '--filter',
        './packages/**',
        '--filter',
        '!./packages/v8/playground',
        '--filter',
        '!./packages/routing/playground',
        '--filter',
        '!./packages/vue-i18n/playground',
        'run',
        '--if-present',
        'build',
      ],
      'build @i18n-micro packages',
    )
  }

  if (needsModuleBuild) {
    runOrThrow('pnpm', ['exec', 'nuxt-module-build', 'build'], 'build nuxt-i18n-micro dist')
  }

  assertRealModuleDist()
  console.log('[perf] consumer module dist OK (not a jiti stub)')
}

/** Relative path used in start.args — keep in sync with suite. */
export const NITRO_SERVER_ENTRY = SERVER_ENTRY
