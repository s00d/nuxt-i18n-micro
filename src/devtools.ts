// devtools.ts
import * as fs from 'node:fs'
import path from 'node:path'
import { useNuxt } from '@nuxt/kit'
import { extendServerRpc, onDevToolsInitialized } from '@nuxt/devtools-kit'
import type { Resolver } from '@nuxt/kit'
import type { ModuleOptions } from './module'

export interface ServerFunctions {
  getLocalesAndTranslations: () => Promise<{ locale: string, files: string[], content: Record<string, unknown> }[]>
}

export interface ClientFunctions {
  showNotification: (message: string) => void
}

export const DEVTOOLS_UI_PORT = 3030
export const DEVTOOLS_UI_ROUTE = '/__nuxt-i18n-micro'

export function setupDevToolsUI(options: ModuleOptions, resolve: Resolver['resolve']) {
  const nuxt = useNuxt()
  const clientPath = resolve('./client')
  const isProductionBuild = fs.existsSync(clientPath)

  // Serve the built client UI in production
  if (isProductionBuild) {
    nuxt.hook('vite:serverCreated', async (server) => {
      const sirv = await import('sirv').then(r => r.default || r)
      server.middlewares.use(DEVTOOLS_UI_ROUTE, sirv(clientPath, { dev: true, single: true }))
    })
  }
  // Proxy to a separate development server during development
  else {
    nuxt.hook('vite:extendConfig', (config) => {
      config.server = config.server || {}
      config.server.proxy = config.server.proxy || {}
      config.server.proxy[DEVTOOLS_UI_ROUTE] = {
        target: `http://localhost:${DEVTOOLS_UI_PORT}${DEVTOOLS_UI_ROUTE}`,
        changeOrigin: true,
        followRedirects: true,
        rewrite: path => path.replace(DEVTOOLS_UI_ROUTE, ''),
      }
    })
  }

  // Setup DevTools integration
  onDevToolsInitialized(async () => {
    extendServerRpc<ClientFunctions, ServerFunctions>('nuxt-i18n-micro', {
      async getLocalesAndTranslations() {
        const localesDir = path.join(nuxt.options.rootDir, options.translationDir || 'locales')
        const pagesDir = path.join(nuxt.options.rootDir, options.translationDir || 'locales', 'pages')

        const localeFiles = fs.readdirSync(localesDir)
        const pageDirs = fs.readdirSync(pagesDir).filter(file => fs.lstatSync(path.join(pagesDir, file)).isDirectory())
        const locales = options.locales?.map(locale => locale.code) || []

        return locales.map((locale) => {
          // Get main locale files
          const files = localeFiles.filter(file => file.startsWith(locale))
          const content = files.reduce((acc, file) => {
            const filePath = path.join(localesDir, file)
            acc[file] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
            return acc
          }, {} as Record<string, unknown>)

          // Get page-specific locale files
          pageDirs.forEach((dir) => {
            const pageLocaleFilePath = path.join(pagesDir, dir, `${locale}.json`)
            if (fs.existsSync(pageLocaleFilePath)) {
              const fileKey = path.join(dir, `${locale}.json`)
              content[fileKey] = JSON.parse(fs.readFileSync(pageLocaleFilePath, 'utf-8'))
              files.push(fileKey)
            }
          })

          return { locale, files, content }
        })
      },
    })

    nuxt.hook('devtools:customTabs', (tabs) => {
      tabs.push({
        name: 'nuxt-i18n-micro',
        title: 'i18n Micro',
        icon: 'carbon:language',
        view: {
          type: 'iframe',
          src: DEVTOOLS_UI_ROUTE,
        },
      })
    })
  })
}
