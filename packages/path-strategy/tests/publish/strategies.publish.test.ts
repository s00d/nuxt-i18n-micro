import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'
import { baseContext } from './test-context'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const distDir = resolve(packageRoot, 'dist')
const packageRequire = createRequire(import.meta.url)

function distEntry(name: string, format: 'esm' | 'cjs') {
  return resolve(distDir, `${name}.${format === 'esm' ? 'mjs' : 'cjs'}`)
}

async function loadEntry(name: string, format: 'esm' | 'cjs') {
  const entryPath = distEntry(name, format)
  expect(existsSync(entryPath), `${entryPath} exists`).toBe(true)
  return format === 'esm' ? import(pathToFileURL(entryPath).href) : packageRequire(entryPath)
}

function strategyClass(module: Record<string, unknown>, exportName: string) {
  const Strategy = (module[exportName] ?? module.Strategy) as new (ctx: ReturnType<typeof baseContext>) => {
    shouldReturn404(path: string): string | null
    buildLocalizedPath?(path: string, locale: string, isCustom: boolean): string
    getClientRedirect?(path: string, locale: string): string | null
  }
  expect(Strategy, `export ${exportName}`).toBeTypeOf('function')
  return Strategy
}

describe('dist strategy entrypoints', () => {
  it.each(['esm', 'cjs'] as const)('prefix-except-default (%s)', async (format) => {
    const mod = await loadEntry('prefix-except-default-strategy', format)
    const Strategy = strategyClass(mod, 'PrefixExceptDefaultPathStrategy')
    const strategy = new Strategy(baseContext({ strategy: 'prefix_except_default' }))

    expect(strategy.shouldReturn404('/zh/pricing')).toBe('Unlocalized route cannot have locale prefix')
    expect(strategy.shouldReturn404('/zh/account')).toBe('Locale not allowed for this route')
  })

  it.each(['esm', 'cjs'] as const)('prefix (%s)', async (format) => {
    const mod = await loadEntry('prefix-strategy', format)
    const Strategy = strategyClass(mod, 'PrefixPathStrategy')
    const strategy = new Strategy(baseContext({ strategy: 'prefix' }))

    expect(strategy.shouldReturn404('/zh/pricing')).toBe('Unlocalized route cannot have locale prefix')

    const redirectStrategy = new Strategy(baseContext({ strategy: 'prefix', globalLocaleRoutes: {}, routeLocales: {} }))
    expect(redirectStrategy.getClientRedirect?.('/about', 'zh')).toBe('/zh/about')
  })

  it.each(['esm', 'cjs'] as const)('no-prefix (%s)', async (format) => {
    const mod = await loadEntry('no-prefix-strategy', format)
    const Strategy = strategyClass(mod, 'NoPrefixPathStrategy')
    const strategy = new Strategy(baseContext({ strategy: 'no_prefix' }))

    expect(strategy.buildLocalizedPath?.('/about', 'zh', false)).toBe('/about')
    expect(strategy.shouldReturn404('/zh/about')).toBeNull()
  })

  it.each(['esm', 'cjs'] as const)('prefix-and-default (%s)', async (format) => {
    const mod = await loadEntry('prefix-and-default-strategy', format)
    const Strategy = strategyClass(mod, 'PrefixAndDefaultPathStrategy')
    const strategy = new Strategy(baseContext({ strategy: 'prefix_and_default' }))

    expect(strategy.shouldReturn404('/zh/pricing')).toBe('Unlocalized route cannot have locale prefix')
    expect(strategy.buildLocalizedPath?.('/about', 'zh', false)).toBe('/zh/about')
  })

  it.each(['esm', 'cjs'] as const)('index createPathStrategy (%s)', async (format) => {
    const mod = await loadEntry('index', format)
    const createPathStrategy = mod.createPathStrategy as (ctx: ReturnType<typeof baseContext>) => {
      shouldReturn404(path: string): string | null
    }
    expect(createPathStrategy).toBeTypeOf('function')

    const strategy = createPathStrategy(baseContext({ strategy: 'prefix_except_default' }))
    expect(strategy.shouldReturn404('/zh/pricing')).toBe('Unlocalized route cannot have locale prefix')
  })
})

describe('dist bundle shape', () => {
  it('has no hashed shared chunk files', () => {
    const runtimeFiles = readdirSync(distDir).filter((name) => /\.(?:mjs|cjs|js)$/.test(name))
    const hashedChunks = runtimeFiles.filter((name) => /^base-strategy-[A-Za-z0-9_-]+\.(?:js|cjs|mjs)$/.test(name))
    expect(hashedChunks, `unexpected shared chunks: ${hashedChunks.join(', ')}`).toEqual([])
  })

  it('entry files do not import hashed shared chunk names', () => {
    const entryNames = ['index', 'prefix-strategy', 'no-prefix-strategy', 'prefix-except-default-strategy', 'prefix-and-default-strategy']
    const hashedChunk = /^\.\/(?:base-strategy|common)-[A-Za-z0-9_-]+\.(?:js|cjs|mjs)$/

    for (const name of entryNames) {
      for (const ext of ['mjs', 'cjs'] as const) {
        const source = readFileSync(resolve(distDir, `${name}.${ext}`), 'utf8')
        const relativeImports = [...source.matchAll(/(?:from\s+|require\s*\(\s*)['"](\.\/[^'"]+)['"]/g)].map((m) => m[1])
        for (const imp of relativeImports) {
          expect(imp, `${name}.${ext} → ${imp}`).not.toMatch(hashedChunk)
        }
      }
    }
  })
})
