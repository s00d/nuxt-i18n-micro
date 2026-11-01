import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineCommand } from 'citty'
import { inc } from 'semver'
import { listWorkspacePackages, type WorkspacePackage } from '../utils/git-baseline'
import { BUMP_LEVELS, isBumpLevel } from './release'

function select(packages: WorkspacePackage[], wanted: string): { found: WorkspacePackage[]; unknown: string[] } {
  if (wanted === 'all') return { found: packages, unknown: [] }

  const found: WorkspacePackage[] = []
  const unknown: string[] = []
  for (const name of wanted.split(',').filter(Boolean)) {
    const pkg = packages.find((p) => p.name === name || p.name === `@i18n-micro/${name}`)
    if (pkg) found.push(pkg)
    else unknown.push(name)
  }
  return { found, unknown }
}

export const bumpCommand = defineCommand({
  meta: {
    name: 'bump',
    description: [
      'Bump the version of the named packages under `packages/*`, at the level you pick.',
      '',
      'It only edits `version` in each package.json: no commit, no tag, no publish. A package',
      'that depends on a bumped one needs a bump too, so publish rewrites its pin; run',
      '`pnpm run check:versions` to list them. The root version moves only through `release`.',
      '',
      'Examples:',
      '  pnpm -C scripts cli bump --level patch --packages core,vue',
      '  pnpm -C scripts cli bump --level minor --packages @i18n-micro/react',
      '  pnpm -C scripts cli bump --level major --packages all',
    ].join('\n'),
  },
  args: {
    level: { type: 'string', description: `Version bump, required: ${BUMP_LEVELS.join(' | ')}` },
    packages: { type: 'string', description: 'Comma-separated package names (short or scoped), or "all"' },
  },
  setup({ args }) {
    const level = args.level
    if (!isBumpLevel(level)) {
      console.error(`Unknown level "${level ?? ''}". Pass --level ${BUMP_LEVELS.join(' | ')}`)
      process.exit(1)
    }

    const { found, unknown } = select(listWorkspacePackages(), args.packages ?? '')
    if (unknown.length > 0 || found.length === 0) {
      console.error(`Pass --packages with workspace package names or "all"${unknown.length > 0 ? `. Unknown: ${unknown.join(', ')}` : ''}`)
      process.exit(1)
    }

    for (const { name, dir, localVersion } of found) {
      const file = join(dir, 'package.json')
      const next = inc(localVersion, level)
      // Text replace: rewriting the JSON would reflow whatever formatting the manifest has.
      writeFileSync(file, readFileSync(file, 'utf8').replace(`"version": "${localVersion}"`, `"version": "${next}"`))
      console.log(`${name}: ${localVersion} → ${next}`)
    }
  },
})
