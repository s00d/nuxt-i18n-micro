import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 5173
const base = process.env.BASE || '/'

// Create http server
const app = express()

// Add Vite or respective production middlewares
let vite
if (!isProduction) {
  const { createServer } = await import('vite')
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  })
  app.use(vite.middlewares)
}
else {
  const compression = (await import('compression')).default
  const sirv = (await import('sirv')).default
  app.use(compression())
  app.use(base, sirv('./dist/client', { extensions: [] }))
}

// Serve HTML
app.use('*', async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '')
    console.log('[server] Request for URL:', url)

    let template
    let render
    if (!isProduction) {
      // Always read fresh template in dev
      template = fs.readFileSync(
        path.resolve(__dirname, 'index.html'),
        'utf-8',
      )
      template = await vite.transformIndexHtml(url, template)
      console.log('[server] Template loaded and transformed')
      const entryServer = await vite.ssrLoadModule('/src/entry-server.ts')
      console.log('[server] Entry server module loaded')
      render = entryServer.render
      if (!render) {
        throw new Error('render function not found in entry-server.ts')
      }
    }
    else {
      template = fs.readFileSync(
        path.resolve(__dirname, 'dist/client/index.html'),
        'utf-8',
      )
      const entryServer = await import('./dist/server/entry-server.js')
      render = entryServer.render
    }

    console.log('[server] Calling render()...')
    const { html: appHtml, state } = await render(url)
    console.log('[server] Render complete, appHtml length:', appHtml?.length || 0)
    console.log('[server] State:', state)

    if (!appHtml) {
      throw new Error('render() returned empty HTML')
    }

    // Inject state into HTML
    const html = template
      .replace(`<!--ssr-outlet-->`, appHtml)
      .replace(
        '<!--ssr-state-->',
        `<script>window.__INITIAL_STATE__ = ${JSON.stringify(state)}</script>`,
      )

    console.log('[server] HTML prepared, length:', html.length)
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  }
  catch (e) {
    vite?.ssrFixStacktrace(e)
    console.error('[server] Error:', e)
    console.error('[server] Stack:', e.stack)
    res.status(500).end(e.stack)
  }
})

// Start http server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`)
})
