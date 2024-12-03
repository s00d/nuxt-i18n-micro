import * as fs from 'node:fs'
import path, { resolve } from 'node:path'
import type { ServerResponse } from 'node:http'
import { fileURLToPath } from 'node:url'
import { useNuxt } from '@nuxt/kit'
import { extendServerRpc, onDevToolsInitialized } from '@nuxt/devtools-kit'
import type { Resolver } from '@nuxt/kit'
import { join } from 'pathe'
import sirv from 'sirv'
import type { ViteDevServer } from 'vite'
import type { ModuleOptions, ModulePrivateOptionsExtend } from './types'

export const DEVTOOLS_UI_PORT = 3030
export const DEVTOOLS_UI_ROUTE = '/__nuxt-i18n-micro'

export const distDir = resolve(fileURLToPath(import.meta.url), '..')
export const clientDir = resolve(distDir, 'client')

export interface ServerFunctions {
  getLocalesAndTranslations: () => Promise<{ locale: string, files: string[], content: Record<string, unknown> }[]>
  saveTranslationContent: (locale: string, file: string, content: Record<string, unknown>) => Promise<void>
}

export interface ClientFunctions {
  showNotification: (message: string) => void
}

export function setupDevToolsUI(options: ModuleOptions, resolve: Resolver['resolve']) {
  const nuxt = useNuxt()
  const clientPath = resolve('./client')
  const clientDirExists = fs.existsSync(clientPath)

  const ROUTE_PATH = `${nuxt.options.app.baseURL || '/'}/__nuxt-i18n-micro`.replace(/\/+/g, '/')
  const ROUTE_CLIENT = `${ROUTE_PATH}/client`

  if (clientDirExists) {
    nuxt.hook('vite:serverCreated', (server: ViteDevServer) => {
      const indexHtmlPath = join(clientDir, 'index.html')
      const indexContent = fs.readFileSync(indexHtmlPath)
      const handleStatic = sirv(clientDir, {
        dev: true,
        single: false,
      })
      // We replace the base URL in the index.html based on user's settings
      const handleIndex = async (res: ServerResponse) => {
        res.setHeader('Content-Type', 'text/html')
        res.statusCode = 200
        res.write((await indexContent).toString().replace(/\/__NUXT_DEVTOOLS_I18N_BASE__\//g, `${ROUTE_CLIENT}/`))
        res.end()
      }
      server.middlewares.use(ROUTE_CLIENT, (req, res) => {
        if (req.url === '/')
          return handleIndex(res)
        return handleStatic(req, res, () => handleIndex(res))
      })
    })
  }
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
          src: ROUTE_CLIENT,
        },
      })
    })
  })
}
