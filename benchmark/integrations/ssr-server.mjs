// The SSR server of the framework playgrounds, run from a playground folder. Dev with Vite in middleware mode;
// NODE_ENV=production serves `dist/client` and renders with `dist/server/entry-server.js`.
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { extname, join, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'

const cwd = process.cwd()
const production = process.env.NODE_ENV === 'production'
const port = Number(process.env.PORT ?? 5173)
const types = { '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' }

const entry = ['entry-server.ts', 'entry-server.tsx'].find((name) => existsSync(join(cwd, 'src', name)))

let vite
if (!production) {
  const { createServer: createVite } = await import(pathToFileURL(createRequire(join(cwd, 'x.js')).resolve('vite')).href)
  vite = await createVite({ server: { middlewareMode: true }, appType: 'custom' })
}

const client = resolve(cwd, 'dist/client')

const decoded = (path) => {
  try {
    return decodeURIComponent(path)
  } catch {
    return null
  }
}

/** The file of a URL inside `dist/client`, or null: a malformed escape or a path out of the folder is left to `page()`. */
const file = (url) => {
  const name = decoded(url.split('?')[0])
  if (name === null) return null
  const path = join(client, name)
  return path.startsWith(client + sep) && existsSync(path) && statSync(path).isFile() ? path : null
}

async function page(req, res) {
  const url = req.url
  try {
    const template = production
      ? readFileSync(join(cwd, 'dist/client/index.html'), 'utf8')
      : await vite.transformIndexHtml(url, readFileSync(join(cwd, 'index.html'), 'utf8'))
    const { render } = production
      ? await import(pathToFileURL(join(cwd, 'dist/server/entry-server.js')).href)
      : await vite.ssrLoadModule(`/src/${entry}`)
    const { html, state } = await render(url)
    const body = template
      .replace('<html lang="en">', `<html lang="${state.locale}" dir="${state.dir}">`)
      .replace(/<div id="(app|root)"><\/div>|<div id="(app|root)"><!--ssr-outlet--><\/div>/, (m, a, b) => `<div id="${a ?? b}">${html}</div>`)
      .replace('</body>', () => `<script>window.__INITIAL_STATE__ = ${JSON.stringify(state).replace(/</g, '\\u003c')}</script></body>`)
    res.writeHead(200, { 'content-type': 'text/html' }).end(body)
  } catch (error) {
    vite?.ssrFixStacktrace(error)
    console.error('[server]', error)
    res.writeHead(500).end(String(error.stack))
  }
}

createServer((req, res) => {
  if (!production) return vite.middlewares(req, res, () => page(req, res))
  const path = req.url === '/' ? null : file(req.url)
  if (!path) return page(req, res)
  res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' })
  createReadStream(path).pipe(res)
}).listen(port, '127.0.0.1', () => console.log(`ssr on ${port}`))
