import * as fs from 'node:fs'
import sirv from 'sirv'
import path, { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ModuleOptions } from '@i18n-micro/types'
import { addCustomTab, extendServerRpc, onDevToolsInitialized, startSubprocess } from '@nuxt/devtools-kit'
import { addDevServerHandler, useNuxt } from '@nuxt/kit'
import { defineEventHandler, fromNodeMiddleware, proxyRequest } from 'h3'
import { joinURL } from 'ufo'

/** Port the client's own dev server listens on while this module is being developed. */
export const DEVTOOLS_UI_PORT = 3030
export const DEVTOOLS_UI_ROUTE = '/__nuxt-i18n-micro'
export const DEVTOOLS_RPC_NAMESPACE = 'nuxt-i18n-micro'

const thisDir = dirname(fileURLToPath(import.meta.url))
/** Repo / package root whether this file lives in `src/` or `dist/`. */
const packageRoot = resolve(thisDir, '..')

/**
 * Directory that contains this file after resolve:
 * - published / `nuxt-module-build`: `dist/`
 * - playground (`modules: ['../src/module']`): `src/`
 */
export const distDir = thisDir

/**
 * Prebuilt DevTools UI (`index.html` + `_nuxt/`).
 *
 * Must work for both layouts above — `src/client` does not exist when the playground
 * loads the module from source, so we also check `../dist/client`.
 */
export const clientDir = resolveClientDir()

function resolveClientDir(): string {
  const candidates = [
    resolve(thisDir, 'client'), // dist/client next to dist/module.mjs
    resolve(thisDir, '../dist/client'), // src/devtools.ts → repo dist/client
    resolve(thisDir, '../client/dist'), // client/dist symlink used in-repo
  ]
  return candidates.find((dir) => fs.existsSync(path.join(dir, 'index.html'))) ?? candidates[0]!
}

function resolveClientPackageDir(): string {
  return resolve(packageRoot, 'client')
}

/** Force the client `nuxi dev` proxy even when a prebuilt UI exists (HMR for client work). */
function useLiveClientDevServer(): boolean {
  return process.env.I18N_DEVTOOLS_CLIENT_DEV === '1' || process.env.I18N_DEVTOOLS_CLIENT_DEV === 'true'
}

export interface ServerFunctions {
  getConfigs: () => Promise<ModuleOptions>
  getLocalesAndTranslations: () => Promise<Record<string, string>>
  saveTranslationContent: (file: string, content: Record<string, unknown>) => Promise<void>
}

export interface ClientFunctions {
  showNotification: (message: string) => void
}

/**
 * Wire the DevTools tab to the client UI.
 *
 * Two situations, and they are distinguished by whether the prebuilt client shipped
 * with the package:
 *
 * - **Installed / playground with prebuild** — `dist/client` exists, serve it as static
 *   files via sirv. Playground loads `src/module`, so resolution must find `../dist/client`
 *   (not the non-existent `src/client`).
 * - **Live client UI work** — set `I18N_DEVTOOLS_CLIENT_DEV=1` to spawn `client/` `nuxi
 *   dev` and proxy to it for HMR.
 *
 * Only called when DevTools are enabled — nothing here should run for an app that
 * has them switched off, least of all the client's dev server.
 *
 * Both go through `addDevServerHandler`, i.e. Nitro. A Vite middleware or Vite proxy
 * never sees these requests: in dev Nitro owns page URLs and only hands `/_nuxt/*` to
 * Vite, so the app's own catch-all route answered instead. The previous version proxied
 * in both branches *and* did it through Vite, so the tab was broken for everyone —
 * installed users pointed at a dev server that was never running.
 */
export function setupDevToolsUI(options: ModuleOptions, rootDirs: string[]) {
  const nuxt = useNuxt()
  const hasPrebuiltClient = fs.existsSync(path.join(clientDir, 'index.html'))
  const liveClient = useLiveClientDevServer()

  if (hasPrebuiltClient && !liveClient) {
    addDevServerHandler({
      route: DEVTOOLS_UI_ROUTE,
      handler: fromNodeMiddleware(sirv(clientDir, { dev: true, single: true })),
    })
  } else {
    // Live client UI: run its dev server and forward, which keeps HMR while the UI is edited.
    startSubprocess(
      {
        command: 'npx',
        args: ['nuxi', 'dev', '--port', String(DEVTOOLS_UI_PORT)],
        cwd: resolveClientPackageDir(),
      },
      { id: 'nuxt-i18n-micro:client', name: 'i18n Micro DevTools UI' },
    )

    addDevServerHandler({
      route: DEVTOOLS_UI_ROUTE,
      // `addDevServerHandler` strips the mount prefix, so `event.path` arrives as `/`
      // or `/_nuxt/...` and the route has to be put back on for the client dev server,
      // which serves itself under that same base.
      handler: defineEventHandler((event) =>
        proxyRequest(event, `http://localhost:${DEVTOOLS_UI_PORT}${joinURL(DEVTOOLS_UI_ROUTE, event.path || '/')}`),
      ),
    })
  }

  addCustomTab({
    name: 'nuxt-i18n-micro',
    title: 'i18n Micro',
    icon: 'carbon:language',
    view: {
      type: 'iframe',
      src: joinURL(nuxt.options.app?.baseURL || '/', DEVTOOLS_UI_ROUTE),
    },
  })

  onDevToolsInitialized(() => {
    const dirs = rootDirs.length > 0 ? rootDirs : [nuxt.options.rootDir]

    extendServerRpc<ClientFunctions, ServerFunctions>(DEVTOOLS_RPC_NAMESPACE, {
      async saveTranslationContent(file, content) {
        let filePath: string | null = null

        for (const rootDir of dirs) {
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
        } else {
          throw new Error(`File not found: ${filePath}`)
        }
      },
      async getConfigs() {
        return Promise.resolve(options)
      },
      async getLocalesAndTranslations() {
        const filesList: Record<string, string> = {}

        for (const rootDir of dirs) {
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
              } else if (file.endsWith('.json')) {
                try {
                  // Use relative path from localesDir for proper tree display
                  const relativePath = path.relative(baseDir, filePath)
                  // Normalize path separators to forward slashes for consistency
                  const normalizedPath = relativePath.replace(/\\/g, '/')
                  filesList[normalizedPath] = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
                } catch (e) {
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
  })
}
