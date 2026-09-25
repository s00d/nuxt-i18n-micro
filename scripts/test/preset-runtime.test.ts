import { createServer } from 'node:http'
import { describe, expect, it } from 'vitest'
import { waitForUrl } from '../src/utils/preset-runtime'

describe('preset-runtime waitForUrl', () => {
  it('resolves when the URL answers', async () => {
    const httpServer = createServer((_req, res) => {
      res.writeHead(200)
      res.end('ok')
    })
    await new Promise<void>((resolve) => httpServer.listen(0, '127.0.0.1', () => resolve()))
    const { port } = httpServer.address() as { port: number }
    try {
      await waitForUrl(`http://127.0.0.1:${port}`, 5_000)
    } finally {
      await new Promise<void>((resolve, reject) => httpServer.close((err) => (err ? reject(err) : resolve())))
    }
  })

  it('times out when nothing listens', async () => {
    await expect(waitForUrl('http://127.0.0.1:1', 800)).rejects.toThrow(/Timed out/)
  })
})
