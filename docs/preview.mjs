// Serves the `nuxt generate` output the way GitHub Pages does: under the site base, `/x` from
// `x.html` or `x/index.html` (with the 301 to `/x/`), and `404.html` with status 404.
// `nuxt preview` cannot: it starts a node-server build that `nuxt generate` does not produce.
import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = fileURLToPath(new URL('.output/public/', import.meta.url))
const base = process.env.NUXT_APP_BASE_URL || '/nuxt-i18n-micro/'
const port = Number(process.env.PORT || 3000)
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.wasm': 'application/wasm',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
}

if (!existsSync(dir)) {
  console.error('No .output/public: run `pnpm run build` first.')
  process.exit(1)
}

const send = (res, file, status = 200) => {
  res.writeHead(status, { 'content-type': types[extname(file)] || 'application/octet-stream' })
  createReadStream(file).pipe(res)
}

createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://localhost')
  if (url.pathname === '/' || url.pathname === base.slice(0, -1)) {
    res.writeHead(302, { location: base })
    return res.end()
  }
  if (!url.pathname.startsWith(base)) return send(res, join(dir, '404.html'), 404)
  const file = normalize(join(dir, decodeURIComponent(url.pathname.slice(base.length))))
  if (!file.startsWith(dir.slice(0, -1))) return send(res, join(dir, '404.html'), 404)
  // GitHub Pages' order: the file, then `x.html` (even next to an `x/` folder), then `x/index.html`.
  if (existsSync(file) && !statSync(file).isDirectory()) return send(res, file)
  if (!url.pathname.endsWith('/') && existsSync(`${file}.html`)) return send(res, `${file}.html`)
  if (existsSync(join(file, 'index.html'))) {
    if (url.pathname.endsWith('/')) return send(res, join(file, 'index.html'))
    res.writeHead(301, { location: `${url.pathname}/${url.search}` })
    return res.end()
  }
  send(res, join(dir, '404.html'), 404)
}).listen(port, () => console.log(`Docs preview: http://localhost:${port}${base}`))
