import { mkdirSync, mkdtempSync, writeFileSync, symlinkSync, existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { repairNosticsFormatters } from '../src/perf/repair-nostics-formatters'

const temporary: string[] = []
afterEach(() => {
  for (const dir of temporary.splice(0)) rmSync(dir, { recursive: true, force: true })
})

function fixtureRoot(): string {
  const dir = mkdtempSync(join(tmpdir(), 'nostics-'))
  temporary.push(dir)
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'fixture', type: 'module' }))
  return dir
}

describe('repairNosticsFormatters', () => {
  it('no-ops when nostics is missing from the Nitro trace', () => {
    const root = fixtureRoot()
    mkdirSync(join(root, '.output/server/node_modules'), { recursive: true })
    expect(repairNosticsFormatters(root)).toBe(false)
  })

  it('no-ops when ansi formatter already exists', () => {
    const root = fixtureRoot()
    const pkg = join(root, '.output/server/node_modules/nostics')
    mkdirSync(join(pkg, 'dist/formatters'), { recursive: true })
    writeFileSync(join(pkg, 'dist/formatters/ansi.mjs'), 'export {}\n')
    expect(repairNosticsFormatters(root)).toBe(false)
  })

  it('resolves relative symlink targets via resolve(dirname(link), …)', () => {
    const root = fixtureRoot()
    const serverNm = join(root, '.output/server/node_modules')
    const realPkg = join(serverNm, '.real-nostics')
    mkdirSync(join(realPkg, 'dist'), { recursive: true })
    writeFileSync(join(realPkg, 'dist/index.mjs'), 'export {}\n')
    // Missing formatters in the traced package.
    mkdirSync(serverNm, { recursive: true })
    symlinkSync('.real-nostics', join(serverNm, 'nostics'))

    // Fixture cannot resolve nuxt/nostics — expect graceful false, not a join()-misplaced write.
    expect(repairNosticsFormatters(root)).toBe(false)
    expect(existsSync(join(realPkg, 'dist/formatters'))).toBe(false)
  })

  it('copies missing formatters when nostics resolves via nuxt', () => {
    const root = fixtureRoot()
    const serverNm = join(root, '.output/server/node_modules')
    const traced = join(serverNm, 'nostics')
    mkdirSync(join(traced, 'dist'), { recursive: true })
    writeFileSync(join(traced, 'dist/index.mjs'), 'export {}\n')

    // Fake nuxt → nostics tree under fixture node_modules for createRequire.
    const nuxtDir = join(root, 'node_modules/nuxt')
    const srcNostics = join(root, 'node_modules/nostics')
    mkdirSync(nuxtDir, { recursive: true })
    mkdirSync(join(srcNostics, 'dist/formatters'), { recursive: true })
    writeFileSync(join(nuxtDir, 'package.json'), JSON.stringify({ name: 'nuxt', dependencies: { nostics: '1.0.0' } }))
    writeFileSync(join(srcNostics, 'package.json'), JSON.stringify({ name: 'nostics' }))
    writeFileSync(join(srcNostics, 'dist/formatters/ansi.mjs'), 'export const ansi = 1\n')
    writeFileSync(join(srcNostics, 'dist/formatters/plain.mjs'), 'export const plain = 1\n')

    expect(repairNosticsFormatters(root)).toBe(true)
    expect(existsSync(join(traced, 'dist/formatters/ansi.mjs'))).toBe(true)
    expect(existsSync(join(traced, 'dist/formatters/plain.mjs'))).toBe(true)
  })
})
