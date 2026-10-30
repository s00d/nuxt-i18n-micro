import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { nameOfPath, routeKey } from '@i18n-micro/route-strategy'
import type { DefineI18nRouteConfig, GlobalLocaleRoutes } from '@i18n-micro/types'
import { createUnplugin } from 'unplugin'
import { extractDefineI18nRouteData, pageFilePathToRoutePath } from './utils'

export interface DefineI18nRouteMeta {
  routePath: string
  config: DefineI18nRouteConfig
}

export interface DefineI18nRoutePluginOptions {
  buildDir: string
  rootDirs: string[]
  onMetaUpdate?: (entries: DefineI18nRouteMeta[]) => void
}

export interface PageRouteConfig {
  routeLocales: Record<string, string[]>
  globalLocaleRoutes: NonNullable<GlobalLocaleRoutes>
  routeDisableMeta: Record<string, boolean | string[]>
}

/**
 * Adds the `$defineI18nRoute` calls of the pages to the config. A page's `locales` and `disableMeta`
 * replace the config's; for custom paths the config entry of that page wins, as a whole.
 */
export function mergeDefineI18nRouteMeta(
  entries: DefineI18nRouteMeta[],
  config: Partial<Omit<PageRouteConfig, 'globalLocaleRoutes'>> & { globalLocaleRoutes?: GlobalLocaleRoutes },
): PageRouteConfig {
  const routeLocales = { ...config.routeLocales }
  const routeDisableMeta = { ...config.routeDisableMeta }
  const fromPages: PageRouteConfig['globalLocaleRoutes'] = {}
  for (const { routePath, config: page } of entries) {
    if (Array.isArray(page.locales)) routeLocales[routePath] = page.locales
    else if (page.locales) routeLocales[routePath] = Object.keys(page.locales)
    if (page.localeRoutes) fromPages[routePath] = page.localeRoutes
    if (page.disableMeta !== undefined) routeDisableMeta[routePath] = page.disableMeta
  }
  // `blog/[slug]` (a page), `/blog/:slug` and `blog-slug` (the config: path or route name) are one page
  const configured = config.globalLocaleRoutes ?? {}
  const configuredKeys = new Set(Object.keys(configured).map(routeKey))
  for (const key of Object.keys(fromPages)) if (configuredKeys.has(routeKey(key)) || configuredKeys.has(nameOfPath(key))) delete fromPages[key]
  return { routeLocales, globalLocaleRoutes: { ...fromPages, ...configured }, routeDisableMeta }
}

function resolveRootDir(filePath: string, rootDirs: string[]): string | undefined {
  const sorted = [...rootDirs].sort((a, b) => b.length - a.length)
  return sorted.find((root) => filePath.startsWith(root))
}

export function createDefineI18nRoutePlugin(options: DefineI18nRoutePluginOptions) {
  const metaByFile = new Map<string, DefineI18nRouteMeta | null>()

  const writeMetaFile = () => {
    const entries = [...metaByFile.values()].filter((entry): entry is DefineI18nRouteMeta => entry !== null)
    options.onMetaUpdate?.(entries)

    const metaPath = join(options.buildDir, 'i18n-route-meta.json')
    mkdirSync(dirname(metaPath), { recursive: true })
    writeFileSync(metaPath, JSON.stringify(entries, null, 2))
  }

  return createUnplugin(() => ({
    name: 'nuxt-i18n-micro-define-route',
    enforce: 'pre',
    transformInclude(id) {
      return id.endsWith('.vue') && !id.includes('node_modules')
    },
    transform(code, id) {
      const rootDir = resolveRootDir(id, options.rootDirs)
      if (!rootDir) return null

      const config = extractDefineI18nRouteData(code, id)
      if (!config) {
        metaByFile.delete(id)
      } else {
        metaByFile.set(id, {
          routePath: pageFilePathToRoutePath(id, rootDir),
          config,
        })
      }

      writeMetaFile()
      return null
    },
    buildEnd() {
      writeMetaFile()
    },
  }))
}

export function collectDefineI18nRouteMetaFromFiles(pageFiles: string[], rootDirs: string[]): DefineI18nRouteMeta[] {
  const entries: DefineI18nRouteMeta[] = []

  for (const pageFile of pageFiles) {
    const rootDir = resolveRootDir(pageFile, rootDirs)
    if (!rootDir) continue

    try {
      const config = extractDefineI18nRouteData(readFileSync(pageFile, 'utf-8'), pageFile)
      if (!config) continue
      entries.push({
        routePath: pageFilePathToRoutePath(pageFile, rootDir),
        config,
      })
    } catch (error) {
      console.debug('[nuxt-i18n-micro] Failed to read defineI18nRoute from page file:', pageFile, error)
    }
  }

  return entries
}
