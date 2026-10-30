import * as fs from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import * as path from 'node:path'
import { listTranslationFiles, parseTranslationFile } from '@i18n-micro/utils/load-dir'
import { resolveTranslationFile } from '../src/safe-path'
import type { IndexHtmlTransformResult, PluginOption, ViteDevServer } from 'vite'

export interface DevToolsPluginOptions {
  base?: string
  translationDir?: string
  /** Reported by `/config`. Default: the first locale file in `translationDir`. */
  defaultLocale?: string
  /** Reported by `/config`. Default: `defaultLocale`. */
  fallbackLocale?: string
  injectButton?: boolean
}

const PAGE_ROUTE = '/__i18n_devtools.html'
const APP_MODULE = '/@vite-plugin-i18n-devtools/app.js'
const TOOLBAR_MODULE = '/@vite-plugin-i18n-devtools/toolbar.js'
const UPDATE_EVENT = 'i18n-micro:locales-updated'
const DEBOUNCE_MS = 100

const ICON =
  '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'

const FRAME_STYLE = 'width: 100%; height: 100%; border: none; background: white;'

/** Bottom-right button; a click opens the devtools page in a modal, a click on the backdrop closes it. */
const BUTTON_SCRIPT = `
(function () {
  if (document.getElementById('i18n-devtools-button')) return
  var button = document.createElement('button')
  button.id = 'i18n-devtools-button'
  button.type = 'button'
  button.innerHTML = ${JSON.stringify(`${ICON} i18n`)}
  button.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 99999; cursor: pointer; display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: 1px solid #333; border-radius: 9999px; background: #1e1e1e; color: white; font: 600 14px system-ui, sans-serif;'
  button.addEventListener('click', function () {
    var modal = document.createElement('div')
    modal.id = 'i18n-devtools-modal'
    modal.style.cssText = 'position: fixed; inset: 0; z-index: 999999; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.2);'
    modal.addEventListener('click', function () { modal.remove() })
    var frame = document.createElement('iframe')
    frame.src = ${JSON.stringify(PAGE_ROUTE)}
    frame.style.cssText = 'width: 90vw; max-width: 1200px; height: 85vh; border: none; border-radius: 12px; background: white;'
    modal.appendChild(frame)
    document.body.appendChild(modal)
  })
  document.body.appendChild(button)
})()
`

const page = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>i18n DevTools</title>
  <style>* { margin: 0; box-sizing: border-box; } body { overflow: hidden; height: 100vh; font-family: system-ui, sans-serif; } #app { height: 100%; }</style>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="${APP_MODULE}"></script>
</body>
</html>`

/** The devtools app in the page. Served through Vite, so `import.meta.hot` carries the update event. */
function appModule(apiBase: string): string {
  return `
import { register } from '@i18n-micro/devtools-ui'

const API = ${JSON.stringify(apiBase)}
const getJson = (route) => fetch(API + route).then((response) => response.json())
const bridge = {
  getLocalesAndTranslations: () => getJson('/translations'),
  getConfigs: () => getJson('/config'),
  async saveTranslation(file, content) {
    const response = await fetch(API + '/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, content }),
    })
    if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error || 'Failed to save')
  },
  onLocalesUpdate(callback) {
    const update = () => bridge.getLocalesAndTranslations().then(callback)
    import.meta.hot.on(${JSON.stringify(UPDATE_EVENT)}, update)
    return () => import.meta.hot.off(${JSON.stringify(UPDATE_EVENT)}, update)
  },
}

register()
const element = document.createElement('i18n-devtools-ui')
element.bridge = bridge
element.style.cssText = 'width: 100%; height: 100%; display: block;'
document.getElementById('app').appendChild(element)
`
}

/** The Astro dev toolbar app: the devtools page in the toolbar's window. */
const toolbarModule = `
export default {
  init(canvas) {
    const frame = document.createElement('iframe')
    frame.src = ${JSON.stringify(PAGE_ROUTE)}
    frame.style.cssText = ${JSON.stringify(`position: fixed; left: 5vw; right: 5vw; bottom: 70px; width: 90vw; height: 75vh; border-radius: 12px; z-index: 999999; ${FRAME_STYLE}`)}
    canvas.appendChild(frame)
  },
}
`

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

/**
 * The API is for the devtools page only. Any website can send a `text/plain` POST to localhost
 * without a preflight, and CORS only hides the answer: the request itself has to be refused. A
 * rebinding host never gets here: Vite's `server.allowedHosts` answers it first.
 */
function isFromDevtools(req: IncomingMessage): boolean {
  const { origin, host, 'sec-fetch-site': site } = req.headers
  if (site && site !== 'same-origin' && site !== 'none') return false
  if (!origin) return true
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

type RouteHandler = (req: IncomingMessage, res: ServerResponse) => unknown

/** `handler` for one method: the rest goes on, a foreign request is refused, an error is an answer. */
function route(method: string, handler: RouteHandler) {
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (req.method !== method) return next()
    if (!isFromDevtools(req)) return sendJson(res, 403, { success: false, error: 'Forbidden' })
    try {
      await handler(req, res)
    } catch (e) {
      console.error('[i18n-devtools] Request failed:', e)
      sendJson(res, 500, { success: false, error: e instanceof Error ? e.message : String(e) })
    }
  }
}

async function readBody(req: IncomingMessage): Promise<string> {
  const buffers: Buffer[] = []
  for await (const chunk of req) buffers.push(chunk)
  return Buffer.concat(buffers).toString()
}

export function i18nDevToolsPlugin(options: DevToolsPluginOptions = {}): PluginOption {
  // no trailing slash: `/` + `/files` would be `//files`, a protocol-relative URL
  const apiBase = (options.base || '/__i18n_api').replace(/\/+$/, '')
  const translationDir = options.translationDir || 'src/locales'
  const injectButton = options.injectButton !== false // Default is true

  return {
    name: 'i18n-micro-devtools-plugin',
    apply: 'serve', // Works only in dev server

    resolveId(id: string) {
      return id === APP_MODULE || id === TOOLBAR_MODULE ? id : null
    },

    load(id: string) {
      if (id === APP_MODULE) return appModule(apiBase)
      return id === TOOLBAR_MODULE ? toolbarModule : null
    },

    transformIndexHtml(html: string): IndexHtmlTransformResult {
      if (!injectButton) return html
      const script = `<script>${BUTTON_SCRIPT}</script>`
      return html.includes('</body>') ? html.replace('</body>', `${script}</body>`) : html + script
    },

    configureServer(server: ViteDevServer) {
      const projectRoot = server.config.root
      const localesPath = path.resolve(projectRoot, translationDir)
      const files = () => (fs.existsSync(localesPath) ? listTranslationFiles(localesPath) : [])

      server.middlewares.use(PAGE_ROUTE, (_req: IncomingMessage, res: ServerResponse) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(page)
      })

      server.middlewares.use(
        `${apiBase}/config`,
        route('GET', (_req, res) => {
          // A root file is one locale: `<translationDir>/<code>.json`
          const codes = files()
            .map((file) => /^([^/]+)\.json$/.exec(file.relativePath)?.[1])
            .filter((code): code is string => code !== undefined)
          const defaultLocale = options.defaultLocale || codes[0] || 'en'
          sendJson(res, 200, {
            defaultLocale,
            fallbackLocale: options.fallbackLocale || defaultLocale,
            locales: codes.map((code) => ({ code })),
            translationDir,
          })
        }),
      )

      // Every dictionary by its path: one request, whatever the number of files
      server.middlewares.use(
        `${apiBase}/translations`,
        route('GET', (_req, res) => {
          const result: Record<string, unknown> = {}
          for (const { relativePath } of files()) {
            // a symlink out of the folder is listed by the reader, but it is no translation file of this project
            const file = resolveTranslationFile(projectRoot, translationDir, relativePath)
            const content = file ? parseTranslationFile(fs.readFileSync(file, 'utf-8'), file) : null
            if (content) result[relativePath] = content
          }
          sendJson(res, 200, result)
        }),
      )

      server.middlewares.use(
        `${apiBase}/save`,
        route('POST', async (req, res) => {
          if (!req.headers['content-type']?.startsWith('application/json')) {
            return sendJson(res, 415, { success: false, error: 'Expected application/json' })
          }
          const { file, content } = JSON.parse(await readBody(req)) as { file?: unknown; content?: unknown }
          if (!file || content === null || typeof content !== 'object' || Array.isArray(content)) {
            throw new Error('Invalid data: file and content are required')
          }

          // Only an existing translation file inside translationDir can be written
          const filePath = typeof file === 'string' ? resolveTranslationFile(projectRoot, translationDir, file) : null
          if (!filePath) return sendJson(res, 403, { success: false, error: `Not a translation file: ${String(file)}` })

          fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8')
          sendJson(res, 200, { success: true })
        }),
      )

      let timer: ReturnType<typeof setTimeout> | undefined
      const onFile = (file: string) => {
        if (!file.endsWith('.json') || !file.startsWith(localesPath)) return
        clearTimeout(timer)
        timer = setTimeout(() => server.ws.send({ type: 'custom', event: UPDATE_EVENT }), DEBOUNCE_MS)
      }
      server.watcher.add(localesPath)
      server.watcher.on('add', onFile).on('change', onFile).on('unlink', onFile)
      server.httpServer?.once('close', () => clearTimeout(timer))
    },
  } as PluginOption
}

interface ToolbarSetup {
  command: string
  updateConfig: (config: { vite: { plugins: PluginOption[] } }) => unknown
  addDevToolbarApp: (app: { id: string; name: string; icon: string; entrypoint: string }) => void
}

/** The devtools as an Astro integration: an app in the dev toolbar (Astro has no `transformIndexHtml`, so the plugin's button never shows there). */
export function i18nDevToolsIntegration(options: Omit<DevToolsPluginOptions, 'injectButton'> = {}) {
  return {
    name: '@i18n-micro/devtools-ui',
    hooks: {
      'astro:config:setup': ({ command, updateConfig, addDevToolbarApp }: ToolbarSetup) => {
        if (command !== 'dev') return
        updateConfig({ vite: { plugins: [i18nDevToolsPlugin({ ...options, injectButton: false })] } })
        addDevToolbarApp({ id: 'i18n-micro', name: 'i18n', icon: ICON, entrypoint: TOOLBAR_MODULE })
      },
    },
  }
}
