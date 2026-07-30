import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { relinkWorkspaceDeps } from '../src/commands/smoke-pack'
import type { PackageManifest } from '../src/utils/manifest'

/**
 * Rewriting a packed tarball is the part of `smoke-pack` that has no visible failure
 * mode: get it wrong and the install simply goes to the registry for a version that was
 * never published, with an error that says nothing about this code. So these tests build
 * real tarballs and read back what the install would see.
 */

let work: string

const tarballFor = (manifest: PackageManifest): string => {
  const dir = join(work, `src-${Math.random().toString(36).slice(2)}`, 'package')
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'package.json'), JSON.stringify(manifest, null, 2))
  writeFileSync(join(dir, 'index.mjs'), 'export default 1\n')
  const tarball = join(work, `${String(manifest.name).replace(/[@/]/g, '-')}.tgz`)
  execFileSync('tar', ['-czf', tarball, '-C', join(dir, '..'), 'package'])
  return tarball
}

const manifestIn = (tarball: string): PackageManifest => {
  const out = join(work, `read-${Math.random().toString(36).slice(2)}`)
  mkdirSync(out, { recursive: true })
  execFileSync('tar', ['-xzf', tarball, '-C', out])
  return JSON.parse(readFileSync(join(out, 'package', 'package.json'), 'utf8')) as PackageManifest
}

const entriesIn = (tarball: string): string[] => execFileSync('tar', ['-tzf', tarball], { encoding: 'utf8' }).trim().split('\n').sort()

beforeEach(() => {
  work = mkdtempSync(join(tmpdir(), 'relink-test-'))
})
afterEach(() => rmSync(work, { recursive: true, force: true }))

describe('relinkWorkspaceDeps', () => {
  it('points a workspace dependency at its sibling tarball', () => {
    // `pnpm pack` resolves `workspace:*` to the local version, which is exactly the one
    // not on npm yet — pnpm would go to the registry for it and fail.
    const core = join(work, 'core.tgz')
    const root = tarballFor({ name: 'nuxt-i18n-micro', version: '3.21.4', dependencies: { '@i18n-micro/core': '1.0.8', vue: '^3.4.0' } })

    relinkWorkspaceDeps(root, new Map([['@i18n-micro/core', core]]))

    const pkg = manifestIn(root)
    expect(pkg.dependencies!['@i18n-micro/core']).toBe(`file:${core}`)
    expect(pkg.dependencies!.vue).toBe('^3.4.0')
  })

  it('rewrites peer and optional dependencies too', () => {
    const core = join(work, 'core.tgz')
    const tarball = tarballFor({
      name: '@i18n-micro/vue',
      version: '1.3.5',
      peerDependencies: { '@i18n-micro/core': '1.0.8' },
      optionalDependencies: { '@i18n-micro/core': '1.0.8' },
    })

    relinkWorkspaceDeps(tarball, new Map([['@i18n-micro/core', core]]))

    const pkg = manifestIn(tarball)
    expect(pkg.peerDependencies!['@i18n-micro/core']).toBe(`file:${core}`)
    expect(pkg.optionalDependencies!['@i18n-micro/core']).toBe(`file:${core}`)
  })

  it('leaves devDependencies alone — they are not installed from a tarball', () => {
    const core = join(work, 'core.tgz')
    const tarball = tarballFor({ name: 'x', version: '1.0.0', devDependencies: { '@i18n-micro/core': '1.0.8' } })

    relinkWorkspaceDeps(tarball, new Map([['@i18n-micro/core', core]]))

    expect(manifestIn(tarball).devDependencies!['@i18n-micro/core']).toBe('1.0.8')
  })

  it('leaves a tarball with nothing to rewrite byte-identical', () => {
    const tarball = tarballFor({ name: 'standalone', version: '1.0.0', dependencies: { vue: '^3.4.0' } })
    const before = readFileSync(tarball)

    relinkWorkspaceDeps(tarball, new Map([['@i18n-micro/core', '/tmp/core.tgz']]))

    expect(readFileSync(tarball).equals(before)).toBe(true)
  })

  it('keeps the rest of the tarball contents when it does rewrite', () => {
    const core = join(work, 'core.tgz')
    const tarball = tarballFor({ name: 'x', version: '1.0.0', dependencies: { '@i18n-micro/core': '1.0.8' } })
    const before = entriesIn(tarball)

    relinkWorkspaceDeps(tarball, new Map([['@i18n-micro/core', core]]))

    expect(entriesIn(tarball)).toEqual(before)
  })

  it('handles a manifest with no dependency fields at all', () => {
    const tarball = tarballFor({ name: 'bare', version: '1.0.0' })
    expect(() => relinkWorkspaceDeps(tarball, new Map([['@i18n-micro/core', '/tmp/core.tgz']]))).not.toThrow()
    expect(manifestIn(tarball).name).toBe('bare')
  })
})
