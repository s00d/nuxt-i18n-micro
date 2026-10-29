import { execSync } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { describe, expect, it } from 'vitest'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

interface NpmPackEntry {
  filename: string
  files: Array<{ path: string }>
}

function isNpmPackEntry(value: unknown): value is NpmPackEntry {
  return Boolean(value && typeof value === 'object' && 'filename' in value && 'files' in value)
}

/** npm 11-: array; npm 12+: `{ "@scope/pkg": { filename, files } }`; older 12 betas: flat object. */
function parseNpmPackJson(output: string): NpmPackEntry {
  const parsed = JSON.parse(output.trim()) as unknown
  if (Array.isArray(parsed)) {
    const first = parsed[0]
    if (!isNpmPackEntry(first)) throw new Error('npm pack returned empty or invalid array')
    return first
  }
  if (isNpmPackEntry(parsed)) return parsed
  if (parsed && typeof parsed === 'object') {
    for (const value of Object.values(parsed)) {
      if (isNpmPackEntry(value)) return value
    }
  }
  throw new Error('Unexpected npm pack --json shape')
}

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
    const { filename, files } = parseNpmPackJson(output)
    const tarballPath = join(packDir, filename)
    expect(existsSync(tarballPath)).toBe(true)

    const packedPaths = new Set(files.map((f: { path: string }) => f.path.replace(/\\/g, '/')))
    const required = ['package.json', 'dist/index.mjs', 'dist/index.cjs', 'dist/index.d.ts', 'dist/index.d.cts', 'dist/types.d.ts']
    for (const file of required) {
      expect(packedPaths.has(file), `missing in tarball: ${file}`).toBe(true)
    }

    const extractDir = mkdtempSync(join(tmpdir(), 'path-strategy-extract-'))
    execSync(`tar -xzf ${JSON.stringify(tarballPath)} -C ${JSON.stringify(extractDir)}`, { encoding: 'utf8' })
    const packageDir = join(extractDir, 'package')
    const routes = [
      { name: 'about', path: '/about', meta: { i18n: { name: 'about', locales: ['en'] } } },
      { name: 'localized-about', path: '/:locale(zh)/about', meta: { i18n: { name: 'about', locales: ['zh'] } } },
      { name: 'pricing', path: '/pricing' },
    ]
    const ctx = {
      strategy: 'prefix_except_default',
      defaultLocale: 'en',
      locales: [{ code: 'en' }, { code: 'zh' }],
      router: {
        hasRoute: (name: string) => routes.some((r) => r.name === name),
        resolve: (to: string | { path?: string }) => {
          const path = typeof to === 'string' ? to : (to.path ?? '/')
          const name = path === '/pricing' ? 'pricing' : path === '/about' ? 'about' : null
          return { name, path, fullPath: path, params: {}, query: {}, hash: '' }
        },
        getRoutes: () => routes,
      },
    }
    const esm = await import(pathToFileURL(join(packageDir, 'dist/index.mjs')).href)
    expect(esm.createPathStrategy(ctx).shouldReturn404('/zh/pricing')).toBe('Unlocalized route cannot have locale prefix')
    expect(new esm.Strategy(ctx).getRouteBaseName({ name: 'localized-about' })).toBe('about')

    const cjs = createRequire(import.meta.url)(join(packageDir, 'dist/index.cjs'))
    expect(cjs.createPathStrategy(ctx).getRouteBaseName({ name: 'localized-about' })).toBe('about')
    expect(readdirSync(join(packageDir, 'dist')).filter((n) => /\.(?:mjs|cjs|js)$/.test(n))).toEqual([
      'index.cjs',
      'index.mjs',
      'types.cjs',
      'types.mjs',
    ])
  })
})
