// The script-driven server of the `runtime` and `node` playgrounds: a page is a function from the query to rows.
import { createServer } from 'node:http'
import { type Row, row } from './catalogue'

export type Page = (query: URLSearchParams) => Row[] | Promise<Row[]>

const ENTITY: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }
const escapeHtml = (text: string): string => text.replace(/[&<>"]/g, (char) => ENTITY[char]!)

export const pageHtml = (name: string, rows: Row[]): string =>
  `<!doctype html><title>${name}</title><ul data-testid="page-${name}">${rows.map(({ id, value }) => `<li data-testid="${id}">${escapeHtml(value)}</li>`).join('')}</ul>`

/** `[id, () => value]` to rows, each guarded on its own. */
export const rowsOf = (list: ReadonlyArray<readonly [string, () => unknown]>): Row[] => list.map(([id, run]) => ({ id, value: row(run) }))

export function serve(pages: Record<string, Page>, json: (path: string) => unknown = () => undefined): void {
  const port = Number(process.env.PORT ?? 5900)
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost')
    const name = url.pathname.slice(1)
    const data = json(url.pathname)
    if (data !== undefined) {
      response.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify(data))
      return
    }
    const page = pages[name]
    if (!page) {
      response.writeHead(404).end(`no page ${name}; pages: ${Object.keys(pages).join(' ')}`)
      return
    }
    try {
      const html = pageHtml(name, await page(url.searchParams))
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(html)
    } catch (error) {
      response.writeHead(500).end(String((error as Error).stack))
    }
  })
  server.listen(port, '127.0.0.1', () => console.log(`bench server on ${port}`))
}
