import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = resolve(rootDir, 'dist')

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

function createContext() {
  return {
    strategy: 'prefix_except_default',
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
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}

function verifyRuntime(strategyModule, label) {
  const Strategy = strategyModule.PrefixExceptDefaultPathStrategy ?? strategyModule.Strategy
  const strategy = new Strategy(createContext())

  assertEqual(strategy.shouldReturn404('/zh/pricing'), 'Unlocalized route cannot have locale prefix', `${label} checks localized unlocalized route`)
  assertEqual(strategy.shouldReturn404('/zh/account'), 'Locale not allowed for this route', `${label} checks route locale restrictions`)
}

const esmPrefixExceptDefault = await import(pathToFileURL(resolve(distDir, 'prefix-except-default-strategy.mjs')).href)
verifyRuntime(esmPrefixExceptDefault, 'esm')

const require = createRequire(import.meta.url)
const cjsPrefixExceptDefault = require(resolve(distDir, 'prefix-except-default-strategy.cjs'))
verifyRuntime(cjsPrefixExceptDefault, 'cjs')
