import * as fs from 'node:fs'
import path, { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Resolver } from '@nuxt/kit'
import { useNuxt } from '@nuxt/kit'
import { extendServerRpc, onDevToolsInitialized } from '@nuxt/devtools-kit'
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

  type ViteConfigMutable = { server?: { proxy?: Record<string, unknown> } }
  if (clientDirExists) {
    nuxt.hook('vite:extendConfig', (config) => {
      const c = config as ViteConfigMutable
      c.server = c.server || {}
      c.server.proxy = c.server.proxy || {}

      // Proxy for client dev server assets and WebSocket HMR
      // Client dev server runs on port 3030 (configured in playground/nuxt.config.ts)
      // Client has baseURL: '/__nuxt-i18n-micro/client', so we proxy to the same path
      const proxyConfig = {
        target: `http://localhost:${DEVTOOLS_UI_PORT}`,
        changeOrigin: true,
        ws: true, // Enable WebSocket proxying for HMR
        // Don't rewrite - keep the full path since client server expects /__nuxt-i18n-micro/client/*
        rewrite: (path: string) => path,
      }

      // Proxy all client routes - use the full ROUTE_CLIENT path
      // This will match /__nuxt-i18n-micro/client/** and proxy to localhost:3030/__nuxt-i18n-micro/client/**
      c.server.proxy![`${ROUTE_CLIENT}`] = proxyConfig
      c.server.proxy![`${ROUTE_CLIENT}/`] = proxyConfig
      c.server.proxy![`${ROUTE_CLIENT}/*`] = proxyConfig
    })
  }
  else {
    nuxt.hook('vite:extendConfig', (config) => {
      const c = config as ViteConfigMutable
      c.server = c.server || {}
      c.server.proxy = c.server.proxy || {}
      c.server.proxy![DEVTOOLS_UI_ROUTE] = {
        target: `http://localhost:${DEVTOOLS_UI_PORT}${DEVTOOLS_UI_ROUTE}`,
        changeOrigin: true,
        followRedirects: true,
        rewrite: (path: string) => path.replace(DEVTOOLS_UI_ROUTE, ''),
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
          const candidatePath = path.join(localesDir, file)
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
