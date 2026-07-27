import { describe, expect, it } from 'vitest'
import { packageOfSpecifier } from '../src/commands/deps-audit'
import { aliasTarget, catalogRef, isNonRegistrySpec, isWorkspaceProtocol } from '../src/utils/catalog'

describe('packageOfSpecifier', () => {
  it('reduces a subpath to its package', () => {
    expect(packageOfSpecifier('h3/utils')).toBe('h3')
    expect(packageOfSpecifier('@nuxt/kit')).toBe('@nuxt/kit')
    expect(packageOfSpecifier('@nuxt/kit/dist/index.mjs')).toBe('@nuxt/kit')
  })

  it.each(['./local', '../up', '/abs', '#internal', 'virtual:nuxt', 'node:fs', 'fs', 'path', ''])('returns null for %s', (specifier) => {
    expect(packageOfSpecifier(specifier)).toBeNull()
  })
})

describe('catalogRef', () => {
  it('recognises the default catalog', () => {
    expect(catalogRef('catalog:')).toEqual({ isCatalog: true, name: null })
    expect(catalogRef('catalog:default')).toEqual({ isCatalog: true, name: null })
  })

  it('recognises a named catalog', () => {
    expect(catalogRef('catalog:react17')).toEqual({ isCatalog: true, name: 'react17' })
  })

  it('leaves a plain version alone', () => {
    expect(catalogRef('^1.2.3')).toEqual({ isCatalog: false, name: null })
  })
})

describe('aliasTarget', () => {
  it('reads the aliased package name', () => {
    expect(aliasTarget('npm:other@1.0.0')).toBe('other')
    expect(aliasTarget('npm:@scope/other@^2')).toBe('@scope/other')
    expect(aliasTarget('npm:other')).toBe('other')
  })

  it('returns null for anything that is not an alias', () => {
    expect(aliasTarget('^1.0.0')).toBeNull()
    expect(aliasTarget('catalog:')).toBeNull()
  })
})

describe('spec protocols', () => {
  it('recognises the workspace protocol', () => {
    expect(isWorkspaceProtocol('workspace:*')).toBe(true)
    expect(isWorkspaceProtocol('^1.0.0')).toBe(false)
  })

  it.each(['catalog:', 'workspace:*', 'file:../x.tgz', 'link:../x', 'git+https://e.dev/x.git', 'https://e.dev/x.tgz', 'github:user/repo', 'gitlab:org/repo', 'user/repo#main'])(
    'treats %s as naming no registry version',
    (spec) => {
      expect(isNonRegistrySpec(spec)).toBe(true)
    },
  )

  // `npm:other@1.0.0` does name a registry version, just under another package name —
  // skipping it let a pin drift from the catalog.
  it.each(['^1.2.3', '1.2.3', '~1.2', '>=1 <2', '*', 'npm:other@1.0.0'])('treats %s as a registry version', (spec) => {
    expect(isNonRegistrySpec(spec)).toBe(false)
  })
})
