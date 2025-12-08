import * as fs from 'node:fs'
import path, { resolve } from 'node:path'
import type { ServerResponse } from 'node:http'
import { fileURLToPath } from 'node:url'
import type { Resolver } from '@nuxt/kit'
import { useNuxt } from '@nuxt/kit'
import { extendServerRpc, onDevToolsInitialized } from '@nuxt/devtools-kit'
import sirv from 'sirv'
import type { ModuleOptions, ModulePrivateOptionsExtend } from '@i18n-micro/types'

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
  // Check for client directory first (legacy), then devtools-ui package
  const clientPath = resolve('./client')
  const devtoolsUiDistPath = resolve('./packages/devtools-ui/dist')
  const clientDirExists = fs.existsSync(clientPath) || fs.existsSync(devtoolsUiDistPath)

  const ROUTE_PATH = `${nuxt.options.app.baseURL || '/'}/__nuxt-i18n-micro`.replace(/\/+/g, '/')
  const ROUTE_CLIENT = `${ROUTE_PATH}/client`

  if (clientDirExists) {
    nuxt.hook('vite:serverCreated', (server) => {
      // Try client directory first (legacy), then devtools-ui package
      const actualClientDir = fs.existsSync(clientDir) ? clientDir : devtoolsUiDistPath
      const indexHtmlPath = path.join(actualClientDir, 'index.html')
      if (!fs.existsSync(indexHtmlPath)) {
        return
      }
      const indexContent = fs.readFileSync(indexHtmlPath)
      const handleStatic = sirv(actualClientDir, {
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

    // Setup Vite proxy for client dev server and WebSocket
    nuxt.hook('vite:extendConfig', (config) => {
      config.server = config.server || {}
      config.server.proxy = config.server.proxy || {}

      // Proxy for client dev server assets and WebSocket HMR
      const proxyConfig = {
        target: 'http://localhost:5173',
        changeOrigin: true,
        ws: true, // Enable WebSocket proxying for HMR
        rewrite: (path: string) => {
          // Remove the route prefix to proxy to client dev server
          return path.replace(ROUTE_CLIENT, '')
        },
      }

      // Proxy all client routes including _nuxt for assets and HMR
      // Match both with and without trailing slash
      const proxyPath = `${ROUTE_CLIENT}/_nuxt`
      config.server.proxy[proxyPath] = proxyConfig
      config.server.proxy[`${proxyPath}/`] = proxyConfig
      // Also proxy WebSocket upgrade requests
      config.server.proxy[`${proxyPath}/*`] = proxyConfig
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
        // Convert relative path back to absolute path
        const rootDirs = (nuxt.options.runtimeConfig.i18nConfig as ModulePrivateOptionsExtend)?.rootDirs || [nuxt.options.rootDir]
        let filePath: string | null = null

        for (const rootDir of rootDirs) {
          const localesDir = path.join(rootDir, options.translationDir || 'locales')
          const candidatePath = path.resolve(localesDir, file)
          if (fs.existsSync(candidatePath)) {
            filePath = candidatePath
            break
          }
        }

        // If file not found in any rootDir, try resolving as absolute path (fallback)
        if (!filePath) {
          filePath = path.resolve(file)
        }

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
          const processDirectory = (dir: string, baseDir: string = localesDir) => {
            if (!fs.existsSync(dir)) return

            fs.readdirSync(dir).forEach((file) => {
              const filePath = path.join(dir, file)
              const stat = fs.lstatSync(filePath)

              if (stat.isDirectory()) {
                processDirectory(filePath, baseDir) // Recursive traversal of subdirectories
              }
              else if (file.endsWith('.json')) {
                try {
                  // Use relative path from localesDir for proper tree display
                  const relativePath = path.relative(baseDir, filePath)
                  // Normalize path separators to forward slashes for consistency
                  const normalizedPath = relativePath.replace(/\\/g, '/')
                  filesList[normalizedPath] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
                }
                catch (e) {
                  console.error(`Error parsing locale file ${filePath}:`, e)
                }
              }
            })
          }

          // Process main directory and pages (both relative to localesDir)
          processDirectory(localesDir, localesDir)
          processDirectory(pagesDir, localesDir)
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
