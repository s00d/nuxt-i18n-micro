import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getLoadedModule, packageRootFromImportMeta, smokeLoadExports } from '../../../test-utils/src/publish-smoke'

const packageRoot = packageRootFromImportMeta(import.meta.url)
const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'))

/** Runs a module script the way a React Server Components runtime resolves packages. */
function underReactServer(script: string) {
  const run = spawnSync(process.execPath, ['--conditions=react-server', '--input-type=module', '-e', script], { cwd: packageRoot, encoding: 'utf8' })
  return { ok: run.status === 0, out: run.stdout.trim(), err: run.stderr }
}

describe('@i18n-micro/react dist publish smoke', () => {
  it('loads root, client and server entries (esm + cjs)', async () => {
    const mods = await smokeLoadExports(packageRoot, pkg, [
      { subpath: '.', formats: ['esm', 'cjs'] },
      { subpath: './client', formats: ['esm', 'cjs'] },
      { subpath: './server', formats: ['esm', 'cjs'] },
    ])
    expect(getLoadedModule(mods, '.:import').useI18n).toBeTypeOf('function')
    expect(getLoadedModule(mods, './client:require').I18nProvider).toBeTypeOf('function')
    expect(getLoadedModule(mods, './server:import').I18nT).toBeTypeOf('function')
    expect(getLoadedModule(mods, './server:require').createI18n).toBeTypeOf('function')
  })

  it('loads ./router with the adapter, without react-router in the main entry', async () => {
    expect(readFileSync(join(packageRoot, 'dist/react/index.mjs'), 'utf8')).not.toMatch(/react-router/)
    const mods = await smokeLoadExports(packageRoot, pkg, [{ subpath: './router', formats: ['esm', 'cjs'] }])
    expect(getLoadedModule(mods, './router:import').createReactRouterAdapter).toBeTypeOf('function')
  })

  it("marks the client boundary, and only it, with 'use client'", () => {
    const first = (file: string) => readFileSync(join(packageRoot, 'dist/react', file), 'utf8').slice(0, 13)
    for (const file of ['index.mjs', 'index.cjs', 'router.mjs', 'router.cjs']) expect(first(file)).toBe('"use client";')
    for (const file of ['server.mjs', 'server.cjs']) expect(first(file)).not.toContain('use client')
  })

  it('the root entry resolves to the server one under react-server, and I18nT renders with no hooks', () => {
    const { ok, out, err } = underReactServer(`
      import { createElement } from 'react'
      import { createI18n, I18nT, ReactI18n } from '@i18n-micro/react'
      import * as server from '@i18n-micro/react/server'
      const i18n = createI18n({ locale: 'en', messages: { en: { hi: 'Hi {who}' } } })
      const element = I18nT({ i18n, keypath: 'hi', params: { who: 'RSC' } })
      console.log(JSON.stringify([element.type, element.props.children, I18nT === server.I18nT, i18n instanceof ReactI18n, 'useI18n' in server]))
    `)
    expect(err).toBe('')
    expect(ok).toBe(true)
    expect(JSON.parse(out)).toEqual(['span', 'Hi RSC', true, true, false])
  })

  it('every declared entry has its types', () => {
    const missing = Object.values(pkg.exports)
      .flatMap((entry) => (typeof entry === 'string' ? [] : [entry]))
      .flatMap((entry: any) => [entry.import.types, entry.require.types])
      .filter((path) => !readFileSync(join(packageRoot, path), 'utf8').includes('export'))
    expect(missing).toEqual([])
  })
})
