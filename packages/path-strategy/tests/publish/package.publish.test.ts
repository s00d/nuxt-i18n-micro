import { execSync } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

describe('package publish checks', () => {
  it('passes publint', () => {
    execSync('publint', { cwd: packageRoot, stdio: 'pipe', encoding: 'utf8' })
  })

  it('npm pack tarball contains self-contained dist entrypoints', async () => {
    const packDir = mkdtempSync(join(tmpdir(), 'path-strategy-pack-'))
    const output = execSync(`npm pack --json --pack-destination ${JSON.stringify(packDir)}`, {
      cwd: packageRoot,
      encoding: 'utf8',
    })
    const packed = JSON.parse(output) as Array<{
      filename: string
      files: Array<{ path: string }>
    }>
    const first = packed[0]
    expect(first).toBeDefined()
    const { filename, files } = first!
    const tarballPath = join(packDir, filename)
    expect(existsSync(tarballPath)).toBe(true)

    const packedPaths = new Set(files.map((f: { path: string }) => f.path.replace(/\\/g, '/')))
    const required = [
      'package.json',
      'dist/index.mjs',
      'dist/index.cjs',
      'dist/prefix-except-default-strategy.mjs',
      'dist/prefix-except-default-strategy.cjs',
    ]
    for (const file of required) {
      expect(packedPaths.has(file), `missing in tarball: ${file}`).toBe(true)
    }

    const extractDir = mkdtempSync(join(tmpdir(), 'path-strategy-extract-'))
    execSync(`tar -xzf ${JSON.stringify(tarballPath)} -C ${JSON.stringify(extractDir)}`, {
      encoding: 'utf8',
    })
    const packageDir = join(extractDir, 'package')
    const esm = await import(pathToFileURL(join(packageDir, 'dist/prefix-except-default-strategy.mjs')).href)
    const PrefixExceptDefaultPathStrategy = esm.PrefixExceptDefaultPathStrategy as new (ctx: {
      defaultLocale: string
      locales: { code: string }[]
      localeCodes: string[]
      localizedRouteNamePrefix: string
      router: { hasRoute: () => boolean; resolve: (to: string) => { path: string; fullPath: string; params: object; query: object; hash: string } }
      globalLocaleRoutes: Record<string, false>
      routeLocales: Record<string, string[]>
      strategy: string
    }) => { shouldReturn404(path: string): string | null }

    const strategy = new PrefixExceptDefaultPathStrategy({
      strategy: 'prefix_except_default',
      defaultLocale: 'en',
      locales: [{ code: 'en' }, { code: 'zh' }],
      localeCodes: ['en', 'zh'],
      localizedRouteNamePrefix: 'localized-',
      router: {
        hasRoute: () => false,
        resolve: (to) => ({ path: to, fullPath: to, params: {}, query: {}, hash: '' }),
      },
      globalLocaleRoutes: { pricing: false },
      routeLocales: { account: ['en'] },
    })

    expect(strategy.shouldReturn404('/zh/pricing')).toBe('Unlocalized route cannot have locale prefix')

    const packedDist = readdirSync(join(packageDir, 'dist')).filter((n) => /\.(?:mjs|cjs|js)$/.test(n))
    const hashedChunks = packedDist.filter((n) => /^base-strategy-[A-Za-z0-9_-]+\./.test(n))
    expect(hashedChunks).toEqual([])

    const cjs = createRequire(import.meta.url)(join(packageDir, 'dist/prefix-except-default-strategy.cjs'))
    expect(cjs.PrefixExceptDefaultPathStrategy).toBeTypeOf('function')
  })
})
