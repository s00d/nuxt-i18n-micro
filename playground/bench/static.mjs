// A dumb static host for `generate` output: what a CDN does, with none of Nitro's headers.
// node bench/static.mjs <dir> <port> [baseURL]
import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'

const [dir, port, base = '/'] = process.argv.slice(2)
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.xml': 'application/xml',
}
const isFile = (file) => existsSync(file) && statSync(file).isFile()

createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  const path = normalize(pathname.startsWith(base) ? `/${pathname.slice(base.length)}` : pathname)
  const hit = [join(dir, path), join(dir, path, 'index.html'), `${join(dir, path)}.html`].find(isFile)
  // 200.html is the SPA fallback, 404.html the error page
  const file = hit ?? [join(dir, '200.html'), join(dir, '404.html')].find(isFile)
  if (!file) return res.writeHead(404).end('not found')
  const status = hit || file.endsWith('200.html') ? 200 : 404
  // a CDN that serves another origin has to allow it: `cdn` fetches from here
  res.writeHead(status, { 'content-type': types[extname(file)] ?? 'application/octet-stream', 'access-control-allow-origin': '*' })
  createReadStream(file).pipe(res)
}).listen(Number(port), '127.0.0.1', () => console.log(`static ${dir} on http://127.0.0.1:${port}${base}`))
