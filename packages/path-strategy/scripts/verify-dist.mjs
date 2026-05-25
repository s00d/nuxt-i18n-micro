import { execSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = resolve(rootDir, 'dist')
const packageJson = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf8'))

if (!existsSync(distDir)) {
  throw new Error('dist directory is missing. Run `pnpm run build` first.')
}

const localeCodes = ['en', 'zh']
const locales = localeCodes.map((code) => ({ code }))
const router = {
  hasRoute: () => false,
  resolve: (to) => {
    if (typeof to === 'string') {
      return { path: to, fullPath: to, params: {}, query: {}, hash: '' }
    }

    const path = to.path ?? '/'
    return {
      name: to.name ?? null,
      path,
      fullPath: to.fullPath ?? path,
      params: to.params ?? {},
      query: to.query ?? {},
      hash: to.hash ?? '',
    }
  },
}

function baseContext(overrides = {}) {
  return {
    defaultLocale: 'en',
    locales,
    localeCodes,
    localizedRouteNamePrefix: 'localized-',
    router,
    globalLocaleRoutes: {
      pricing: false,
    },
    routeLocales: {
      account: ['en'],
    },
    ...overrides,
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}

function loadStrategyClass(strategyModule, exportName) {
  const Strategy = strategyModule[exportName] ?? strategyModule.Strategy
  if (!Strategy) {
    throw new Error(`Missing export ${exportName} (or Strategy) in dist entry`)
  }
  return Strategy
}

const STRATEGY_CHECKS = [
  {
    entry: 'prefix-except-default-strategy',
    exportName: 'PrefixExceptDefaultPathStrategy',
    context: baseContext({ strategy: 'prefix_except_default' }),
    verify(strategy, label) {
      assertEqual(strategy.shouldReturn404('/zh/pricing'), 'Unlocalized route cannot have locale prefix', `${label} unlocalized globalLocaleRoutes`)
      assertEqual(strategy.shouldReturn404('/zh/account'), 'Locale not allowed for this route', `${label} routeLocales restriction`)
    },
  },
  {
    entry: 'prefix-strategy',
    exportName: 'PrefixPathStrategy',
    context: baseContext({ strategy: 'prefix' }),
    verify(strategy, label) {
      assertEqual(strategy.shouldReturn404('/zh/pricing'), 'Unlocalized route cannot have locale prefix', `${label} unlocalized globalLocaleRoutes`)
      const ctx = baseContext({ strategy: 'prefix', globalLocaleRoutes: {}, routeLocales: {} })
      const redirectStrategy = new strategy.constructor(ctx)
      assertEqual(redirectStrategy.getClientRedirect('/about', 'zh'), '/zh/about', `${label} client redirect`)
    },
  },
  {
    entry: 'no-prefix-strategy',
    exportName: 'NoPrefixPathStrategy',
    context: baseContext({ strategy: 'no_prefix' }),
    verify(strategy, label) {
      assertEqual(strategy.buildLocalizedPath('/about', 'zh', false), '/about', `${label} buildLocalizedPath`)
      assertEqual(strategy.shouldReturn404('/zh/about'), null, `${label} shouldReturn404`)
    },
  },
  {
    entry: 'prefix-and-default-strategy',
    exportName: 'PrefixAndDefaultPathStrategy',
    context: baseContext({ strategy: 'prefix_and_default' }),
    verify(strategy, label) {
      assertEqual(strategy.shouldReturn404('/zh/pricing'), 'Unlocalized route cannot have locale prefix', `${label} unlocalized globalLocaleRoutes`)
      assertEqual(strategy.buildLocalizedPath('/about', 'zh', false), '/zh/about', `${label} buildLocalizedPath`)
    },
  },
]

const relativeImportRe = /(?:from\s+|import\s*\(\s*)["'](\.\/[^"']+)["']|require\s*\(\s*["'](\.\/[^"']+)["']\s*\)/g

function resolveRelativeImport(fromFile, specifier) {
  const base = resolve(dirname(fromFile), specifier)
  if (existsSync(base)) return base
  for (const ext of ['.mjs', '.js', '.cjs']) {
    const candidate = `${base}${ext}`
    if (existsSync(candidate)) return candidate
  }
  throw new Error(`Cannot resolve "${specifier}" from ${fromFile}`)
}

function collectRelativeDeps(entryFile, collected = new Set()) {
  if (collected.has(entryFile)) return collected
  collected.add(entryFile)

  const content = readFileSync(entryFile, 'utf8')
  relativeImportRe.lastIndex = 0
  let match = relativeImportRe.exec(content)
  while (match !== null) {
    const specifier = match[1] ?? match[2]
    const resolved = resolveRelativeImport(entryFile, specifier)
    collectRelativeDeps(resolved, collected)
    match = relativeImportRe.exec(content)
  }

  return collected
}

function listDistRuntimeFiles() {
  const runtimeExt = /\.(?:mjs|cjs|js)$/
  return readdirSync(distDir)
    .filter((name) => runtimeExt.test(name))
    .map((name) => join(distDir, name))
}

function getPackFilePaths() {
  const output = execSync('npm pack --dry-run --json', {
    cwd: rootDir,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  const parsed = JSON.parse(output)
  const tarball = parsed[0]
  if (!tarball?.files?.length) {
    throw new Error('npm pack --dry-run --json returned no files')
  }
  return new Set(tarball.files.map((file) => file.path.replace(/\\/g, '/')))
}

function verifyPublishFiles(packPaths) {
  const publishRoots = packageJson.files ?? []
  if (!publishRoots.includes('dist')) {
    throw new Error('package.json files must include "dist" so hashed chunks are published')
  }

  const missing = []
  for (const filePath of listDistRuntimeFiles()) {
    const relative = `dist/${basename(filePath)}`
    if (!packPaths.has(relative)) {
      missing.push(relative)
    }
  }

  if (missing.length > 0) {
    throw new Error(`npm pack tarball is missing dist runtime files: ${missing.join(', ')}`)
  }
}

function verifyChunkGraph(packPaths) {
  const entryBasenames = ['index.mjs', 'index.cjs', ...STRATEGY_CHECKS.flatMap(({ entry }) => [`${entry}.mjs`, `${entry}.cjs`])]

  const requiredChunks = new Set()
  for (const basename of entryBasenames) {
    const entryPath = resolve(distDir, basename)
    if (!existsSync(entryPath)) {
      throw new Error(`Missing dist entry: ${basename}`)
    }
    for (const dep of collectRelativeDeps(entryPath)) {
      requiredChunks.add(dep)
    }
  }

  const missingInTarball = []
  for (const chunkPath of requiredChunks) {
    const relative = `dist/${chunkPath.split('/').pop()}`
    if (!packPaths.has(relative)) {
      missingInTarball.push(relative)
    }
  }

  if (missingInTarball.length > 0) {
    throw new Error(`npm pack tarball is missing dist chunks required by entries: ${missingInTarball.join(', ')}`)
  }

  return requiredChunks.size
}

const packageRequire = createRequire(import.meta.url)

async function verifyStrategyEntry(entry, exportName, context, verify, format) {
  const ext = format === 'esm' ? 'mjs' : 'cjs'
  const entryPath = resolve(distDir, `${entry}.${ext}`)
  const label = `${format} ${entry}`

  const strategyModule = format === 'esm' ? await import(pathToFileURL(entryPath).href) : packageRequire(entryPath)

  const Strategy = loadStrategyClass(strategyModule, exportName)
  const strategy = new Strategy(context)
  verify(strategy, label)
}

const packPaths = getPackFilePaths()
const chunkCount = verifyChunkGraph(packPaths)
verifyPublishFiles(packPaths)

for (const { entry, exportName, context, verify } of STRATEGY_CHECKS) {
  await verifyStrategyEntry(entry, exportName, context, verify, 'esm')
  await verifyStrategyEntry(entry, exportName, context, verify, 'cjs')
}

const indexEsm = await import(pathToFileURL(resolve(distDir, 'index.mjs')).href)
const indexCtx = baseContext({ strategy: 'prefix_except_default' })
const fromFactory = indexEsm.createPathStrategy(indexCtx)
assertEqual(fromFactory.shouldReturn404('/zh/pricing'), 'Unlocalized route cannot have locale prefix', 'esm index createPathStrategy')

const indexCjs = packageRequire(resolve(distDir, 'index.cjs'))
const fromFactoryCjs = indexCjs.createPathStrategy(indexCtx)
assertEqual(fromFactoryCjs.shouldReturn404('/zh/pricing'), 'Unlocalized route cannot have locale prefix', 'cjs index createPathStrategy')

console.log(`verify-dist: ok (${STRATEGY_CHECKS.length} strategies × 2 formats, index bundle, ${chunkCount} dist chunks in tarball)`)
