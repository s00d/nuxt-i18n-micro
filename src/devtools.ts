import * as fs from 'node:fs'
import path, { resolve } from 'node:path'
import type { ServerResponse } from 'node:http'
import { fileURLToPath } from 'node:url'
import type { Resolver } from '@nuxt/kit'
import { useNuxt } from '@nuxt/kit'
import { extendServerRpc, onDevToolsInitialized } from '@nuxt/devtools-kit'
import sirv from 'sirv'
import type { ModuleOptions, ModulePrivateOptionsExtend } from 'nuxt-i18n-micro-types'

export const DEVTOOLS_UI_PORT = 3030
export const DEVTOOLS_UI_ROUTE = '/__nuxt-i18n-micro'

export const distDir = resolve(fileURLToPath(import.meta.url), '..')
export const clientDir = resolve(distDir, 'client')

export interface ServerFunctions {
  getConfigs: () => Promise<ModuleOptions>
  getLocalesAndTranslations: () => Promise<Record<string, string>>
  saveTranslationContent: (file: string, content: Record<string, unknown>) => Promise<void>
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
    nuxt.hook('vite:serverCreated', (server) => {
      const indexHtmlPath = path.join(clientDir, 'index.html')
      if (!fs.existsSync(indexHtmlPath)) {
        return
      }
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
      async saveTranslationContent(file, content) {
        const filePath = path.resolve(file)
        if (fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8')
        }
        else {
          throw new Error(`File not found: ${filePath}`)
        }
      },
      async getConfigs() {
        return Promise.resolve(options)
      },
      async getLocalesAndTranslations() {
        const rootDirs = (nuxt.options.runtimeConfig.i18nConfig as ModulePrivateOptionsExtend)?.rootDirs || [nuxt.options.rootDir]
        const filesList: Record<string, string> = {}

        for (const rootDir of rootDirs) {
          const localesDir = path.join(rootDir, options.translationDir || 'locales')
          const pagesDir = path.join(localesDir, 'pages')

          // Recursive function for processing nested directories
          const processDirectory = (dir: string) => {
            if (!fs.existsSync(dir)) return

            fs.readdirSync(dir).forEach((file) => {
              const filePath = path.join(dir, file)
              const stat = fs.lstatSync(filePath)

              if (stat.isDirectory()) {
                processDirectory(filePath) // Recursive traversal of subdirectories
              }
              else if (file.endsWith('.json')) {
                try {
                  filesList[filePath] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
                }
                catch (e) {
                  console.error(`Error parsing locale file ${filePath}:`, e)
                }
              }
            })
          }

          // Process main directory and pages
          processDirectory(localesDir)
          processDirectory(pagesDir)
        }

        return filesList
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
