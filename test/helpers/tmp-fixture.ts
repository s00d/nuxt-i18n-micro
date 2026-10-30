import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const fixturesDir = fileURLToPath(new URL('../fixtures', import.meta.url))
const repoNodeModules = fileURLToPath(new URL('../../node_modules', import.meta.url))
const SKIP = new Set(['node_modules', '.nuxt', '.output', '.nuxt-test'])

/** Env key that carries the copy's path from the vitest main process to its forks (they inherit env). */
export function tmpFixtureEnvKey(name: string): string {
  return `I18N_TMP_FIXTURE_${name.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`
}

/**
 * Copy `test/fixtures/<name>` to a fresh temp dir so a spec can edit files without
 * touching the repo tree. The first call in a process tree creates the copy and
 * stores its path in env; later calls (vitest forks re-import test/recipes.ts) reuse it.
 * The creating process removes the copy on exit.
 */
export function tmpFixture(name: string): string {
  const key = tmpFixtureEnvKey(name)
  const existing = process.env[key]
  if (existing && existsSync(existing)) return existing

  const source = resolve(fixturesDir, name)
  const root = mkdtempSync(join(tmpdir(), `i18n-fixture-${name}-`))
  // dereference: translation-watcher-source/pages is a relative symlink that would dangle in the copy
  cpSync(source, root, { recursive: true, dereference: true, filter: (path) => !SKIP.has(basename(path)) })
  absolutizeConfigImports(source, root)
  linkNodeModules(source, root)

  process.env[key] = root
  process.on('exit', () => rmSync(root, { recursive: true, force: true }))
  return root
}

/** Fixture configs import `../../../src/module`; point relative specifiers at the original dir. */
function absolutizeConfigImports(source: string, root: string): void {
  const config = join(root, 'nuxt.config.ts')
  if (!existsSync(config)) return
  const text = readFileSync(config, 'utf-8')
  writeFileSync(
    config,
    text.replace(/(['"])(\.\.?\/[^'"]+)\1/g, (_m, q: string, spec: string) => `${q}${resolve(source, spec)}${q}`),
  )
}

/**
 * A fixture's own node_modules only holds a cache; packages resolve from the repo root by
 * walking up, which a temp dir cannot do. So the copy gets a real node_modules whose
 * entries are symlinks: the repo root's packages, then the fixture's own (they win).
 * ponytail: per-entry link farm, not a single symlink, so `.cache` stays private to the copy.
 */
function linkNodeModules(source: string, root: string): void {
  const target = join(root, 'node_modules')
  mkdirSync(target)
  const own = join(source, 'node_modules')
  const ownEntries = existsSync(own) ? readdirSync(own).filter((entry) => entry !== '.cache') : []
  for (const entry of readdirSync(repoNodeModules)) {
    if (entry === '.cache' || ownEntries.includes(entry)) continue
    symlinkSync(join(repoNodeModules, entry), join(target, entry))
  }
  for (const entry of ownEntries) symlinkSync(join(own, entry), join(target, entry))
}
