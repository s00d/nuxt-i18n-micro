import * as fs from 'node:fs'
import path from 'node:path'
import { useNuxt } from '@nuxt/kit'
import { extendServerRpc, onDevToolsInitialized } from '@nuxt/devtools-kit'
import type { Resolver } from '@nuxt/kit'
import type { ModuleOptions, ModulePrivateOptionsExtend } from './types'

export interface ServerFunctions {
  getLocalesAndTranslations: () => Promise<{ locale: string, files: string[], content: Record<string, unknown> }[]>
  saveTranslationContent: (locale: string, file: string, content: Record<string, unknown>) => Promise<void>
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
      async saveTranslationContent(locale, file, content) {
        const filePath = path.resolve(file)
        if (fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8')
        }
        else {
          throw new Error(`File not found: ${filePath}`)
        }
      },
      async getLocalesAndTranslations() {
        const rootDirs = (nuxt.options.runtimeConfig.i18nConfig as ModulePrivateOptionsExtend)?.rootDirs || [nuxt.options.rootDir]
        const localesData: { locale: string, files: string[], content: Record<string, unknown> }[] = []

        for (const rootDir of rootDirs) {
          const localesDir = path.join(rootDir, options.translationDir || 'locales')
          const pagesDir = path.join(rootDir, options.translationDir || 'locales', 'pages')

          if (!fs.existsSync(localesDir)) continue

          const localeFiles = fs.readdirSync(localesDir)
          const pageDirs = fs.existsSync(pagesDir) ? fs.readdirSync(pagesDir).filter(file => fs.lstatSync(path.join(pagesDir, file)).isDirectory()) : []
          const locales = options.locales?.map(locale => locale.code) || []

          locales.forEach((locale) => {
            const localeData = localesData.find(data => data.locale === locale)
            const files = localeFiles
              .filter(file => file.startsWith(locale))
              .map(file => path.join(localesDir, file))
            const content: Record<string, unknown> = localeData?.content || {}

            files.forEach((filePath) => {
              content[filePath] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
            })

            pageDirs.forEach((dir) => {
              const pageLocaleFilePath = path.join(pagesDir, dir, `${locale}.json`)
              if (fs.existsSync(pageLocaleFilePath)) {
                content[pageLocaleFilePath] = JSON.parse(fs.readFileSync(pageLocaleFilePath, 'utf-8'))
                files.push(pageLocaleFilePath)
              }
            })

            if (localeData) {
              localeData.files.push(...files)
              localeData.content = { ...localeData.content, ...content }
            }
            else {
              localesData.push({ locale, files, content })
            }
          })
        }

        return localesData
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
